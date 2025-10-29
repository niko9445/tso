const { Invoice, InvoiceItem, Inventory } = require('../models');
const { sequelize } = require('../models'); // Импортируем sequelize из моделей
const { Op } = require('sequelize');
const logAction = require('../middlewares/logAction.js');  // функция логирования

exports.getAll = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      attributes: [
        'id',
        'invoice_number',
        'invoice_type',
        'invoice_date',
        'sdal',
        'prinyal',
        'display_id',
        'created_at'
      ],
      order: [['invoice_date', 'DESC']],
      include: [
        {
          model: InvoiceItem,
          as: 'items',
          attributes: ['id', 'name', 'serial_number', 'quantity', 'unit', 'display_id']
        }
      ]
    });

    console.log(JSON.stringify(invoices, null, 2));


    res.json(invoices);
  } catch (err) {
    console.error('Ошибка в getAll:', err);
    res.status(500).json({ 
      error: 'Ошибка сервера', 
      details: err.message 
    });
  }
};



exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // 1. Подготовка данных
    const { invoice_number, invoice_type, invoice_date, items } = req.body;
    
    // Валидация
    if (!invoice_number || !invoice_date || !invoice_type) {
      throw new Error('Необходимо указать номер, дату и тип накладной');
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Накладная должна содержать минимум один элемент');
    }

    // 2. Создаем накладную
    const invoice = await Invoice.create({
      invoiceNumber: invoice_number,
      invoiceType: invoice_type,
      invoiceDate: invoice_date,
      sdal: req.body.sdal || null,
      prinyal: req.body.prinyal || null,
      displayId: req.body.display_id || null
    }, { transaction });

    // 3. Отключаем триггер перед обработкой элементов
    //await sequelize.query('ALTER TABLE invoice_items DISABLE TRIGGER trg_sync_manual_inventory', { transaction });

    const createdItems = [];
    
    // 4. Обрабатываем элементы
    for (const [index, item] of items.entries()) {
      if (!item.name || item.quantity == null || item.quantity <= 0) {
        throw new Error(`Элемент ${index + 1}: неверные данные`);
      }

      // Создаем элемент накладной
      const invoiceItem = await InvoiceItem.create({
        name: item.name,
        serialNumber: item.serial_number || null,
        unit: item.unit || null,
        quantity: parseFloat(item.quantity),
        invoiceNumber: invoice_number,
        invoiceType: invoice_type,
        displayID: index + 1,
        invoiceId: invoice.id,
        itemsNumber: `inv-${invoice.id}-${index+1}`
      }, { transaction });

      createdItems.push(invoiceItem);

      // 5. Ручная синхронизация с инвентарем
      const where = {
        name: item.name,
      };

      if (item.serial_number) {
        where.serial_number = item.serial_number;
      } else {
        where.serial_number = { [Op.is]: null };
      }

      if (invoice_type === 'приход') {
        const [inventoryItem, created] = await Inventory.findOrCreate({
          where: where,
          defaults: {
            quantity: 0,
            unit: item.unit || null,
            items_number: `inv-${invoice.id}-${index+1}`,
            display_id: index + 1,
            serial_number: item.serial_number || null
          },
          transaction
        });

        // Явно приводим quantity к числу
        const currentQty = parseFloat(inventoryItem.quantity);
        const addQty     = parseFloat(item.quantity);

        await inventoryItem.update({
          quantity: currentQty + addQty,
          serial_number: item.serial_number || inventoryItem.serial_number,
          items_number:  `inv-${invoice.id}-${index+1}`
        }, { transaction });


        // Логируем изменение инвентаря
        await logAction(
          'inventory',
          created ? 'create' : 'update',
          created ? null : { 
            name: item.name,
            serial_number: item.serial_number,
            quantity: inventoryItem.quantity - parseFloat(item.quantity)
          },
          {
            name: item.name,
            serial_number: item.serial_number,
            quantity: inventoryItem.quantity + parseFloat(item.quantity)
          },
          { transaction }
        );

      } else if (invoice_type === 'расход') {
        // Чётко ищем по serial_number, если он есть, иначе по null
        const where = { name: item.name };
        if (item.serial_number) {
          where.serial_number = item.serial_number;
        } else {
          where.serial_number = { [Op.is]: null };
        }

        const inventoryItem = await Inventory.findOne({
          where,
          transaction,
          lock: true
        });

        if (!inventoryItem) {
          throw new Error(`Товар "${item.name}" с серийным номером "${item.serial_number || 'нет'}" не найден в инвентаре`);
        }

        if (inventoryItem.quantity < parseFloat(item.quantity)) {
          throw new Error(`Недостаточно "${item.name}". Доступно: ${inventoryItem.quantity}`);
        }

        const oldQuantity = inventoryItem.quantity;
        const newQuantity = oldQuantity - parseFloat(item.quantity);

        await inventoryItem.update({
          quantity: newQuantity,
          serial_number: item.serial_number || inventoryItem.serial_number
        }, { transaction });

        // Если количество стало 0, можно удалить эту строку из inventorie, если надо
        if (newQuantity === 0) {
          await inventoryItem.destroy({ transaction });
        }

        // Логируем изменение инвентаря
        await logAction(
          'inventory',
          'update',
          {
            name: item.name,
            serial_number: item.serial_number,
            quantity: oldQuantity
          },
          {
            name: item.name,
            serial_number: item.serial_number,
            quantity: newQuantity
          },
          { transaction }
        );
      }

    }

    // 6. Включаем триггер обратно
    //await sequelize.query('ALTER TABLE invoice_items ENABLE TRIGGER trg_sync_manual_inventory', { transaction });

    // 7. Логируем создание накладной
    await logAction(
      'invoice',
      'create',
      null,
      {
        id: invoice.id,
        invoice_number: invoice.invoiceNumber,
        invoice_type: invoice.invoiceType,
        items_count: createdItems.length
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      data: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        items: createdItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          serialNumber: item.serialNumber,
          itemsNumber: item.itemsNumber
        }))
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Ошибка создания накладной:', error);
    
    return res.status(400).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.stack
      })
    });
  }
};


exports.update = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const allowedFields = ['invoice_date', 'sdal', 'prinyal'];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new Error('Нет полей для обновления');
    }

    const oldInvoice = await Invoice.findByPk(req.params.id, { transaction });

    if (!oldInvoice) {
      throw new Error('Накладная не найдена');
    }

    const [updated] = await Invoice.update(updateData, {
      where: { id: req.params.id },
      transaction
    });

    if (!updated) {
      throw new Error('Обновление не выполнено');
    }

    const updatedInvoice = await Invoice.findByPk(req.params.id, {
      attributes: ['id', 'invoice_number', 'invoice_type', 'invoice_date', 'sdal', 'prinyal'],
      transaction
    });

    await logAction(
      'invoices',
      'update',
      oldInvoice.get({ plain: true }), 
      updatedInvoice.get({ plain: true }), 
     { transaction }
    );


    await transaction.commit();
    res.json(updatedInvoice);
  } catch (err) {
    await transaction.rollback();
    console.error('Ошибка в update:', err);
    const statusCode = err.message.includes('не найдена') ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Ошибка при обновлении',
      details: err.message 
    });
  }
};

exports.delete = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{
        model: InvoiceItem,
        as: 'items'
      }],
      transaction
    });

    if (!invoice) {
      throw new Error('Накладная не найдена');
    }

    // Сохраняем данные для лога перед удалением
    const invoiceData = invoice.get({ plain: true });

    if (invoice.invoice_type === 'расход') {
      for (const item of invoice.items) {
        const inventoryItem = await Inventory.findOne({
          where: {
            name: item.name,
            serial_number: item.serial_number
          },
          transaction
        });

        if (inventoryItem) {
          await inventoryItem.update({
            quantity: inventoryItem.quantity + item.quantity
          }, { transaction });
        } else {
          await Inventory.create({
            name: item.name,
            serial_number: item.serial_number,
            unit: item.unit,
            quantity: item.quantity
          }, { transaction });
        }
      }
    }

    await invoice.destroy({ transaction });

    // Исправленный вызов logAction
    await logAction(
      'invoices',
      'delete',
      invoiceData,  // Используем сохраненные данные
      null,
      { transaction }
    );

    await transaction.commit();
    
    res.json({ 
      success: true,
      message: 'Накладная удалена' 
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Ошибка в delete:', err);
    const statusCode = err.message.includes('не найдена') ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Ошибка при удалении',
      details: err.message 
    });
  }
};

exports.getDetails = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      attributes: [
        'id',
        'invoice_number',
        'invoice_type',
        'invoice_date',
        'sdal',
        'prinyal',
        'display_id',
        'created_at'
      ],
      include: [
        {
          model: InvoiceItem,
          as: 'items',
          attributes: ['id', 'name', 'serial_number', 'quantity', 'unit', 'display_id']
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Накладная не найдена' });
    }

    res.json(invoice);
  } catch (err) {
    console.error('Ошибка в getDetails:', err);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: err.message 
    });
  }
};
