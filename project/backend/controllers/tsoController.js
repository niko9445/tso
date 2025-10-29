const Inventory = require('../models/Inventory');
const sequelize = require('../config');
const logAction = require('../middlewares/logAction.js'); // если middleware, а не utils/logger.js

exports.getAll = async (req, res) => {
  try {
    const items = await Inventory.findAll({
      attributes: [
        'id',
        [sequelize.col('display_id'), 'displayId'],
        'category',
        'name',
        [sequelize.col('serial_number'), 'serialNumber'],
        'unit',
        'quantity',
        [sequelize.col('date_added'), 'dateAdded'],
        'location',
        'notes',
        [sequelize.col('created_at'), 'createdAt'],
        [sequelize.col('updated_at'), 'updatedAt']
      ],
      order: [['display_id', 'ASC']],
      raw: true
    });

    res.json(items);
  } catch (err) {
    console.error('Полная ошибка:', {
      message: err.message,
      sql: err.sql,
      stack: err.stack
    });
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.create = async (req, res) => {
  const transaction = await sequelize.transaction(); // Добавляем транзакцию
  try {
    const newItem = await Inventory.create(req.body, {
      fields: [
        'category', 'name', 'serialNumber', 'unit', 
        'quantity', 'dateAdded', 'location', 'notes', 'displayId'
      ],
      transaction // Передаём транзакцию
    });

    // Логирование с проверкой данных
    const logData = newItem.get({ plain: true }); // Альтернатива toJSON()
    await logAction('inventory', 'create', null, logData, { transaction });

    await transaction.commit();
    res.status(201).json(newItem);
  } catch (err) {
    await transaction.rollback();
    console.error('Ошибка:', err);
    res.status(500).json({ 
      error: 'Ошибка при создании',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.update = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const oldItem = await Inventory.findByPk(req.params.id, { transaction });
    if (!oldItem) throw new Error('Запись не найдена');

    const [updated] = await Inventory.update(req.body, {
      where: { id: req.params.id },
      fields: [
        'category', 'name', 'serialNumber', 'unit',
        'quantity', 'dateAdded', 'location', 'notes', 'displayId'
      ],
      transaction
    });

    if (!updated) throw new Error('Обновление не выполнено');

    const newItem = await Inventory.findByPk(req.params.id, { transaction });
    await logAction(
      'inventory', 
      'update', 
      oldItem.get({ plain: true }), 
      newItem.get({ plain: true }),
      { transaction }
    );

    await transaction.commit();
    res.json(newItem);
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ 
      error: 'Ошибка при обновлении',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.delete = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const oldItem = await Inventory.findByPk(req.params.id, { transaction });
    if (!oldItem) throw new Error('Запись не найдена');

    const deleted = await Inventory.destroy({ 
      where: { id: req.params.id },
      transaction
    });

    if (!deleted) throw new Error('Удаление не выполнено');

    await logAction(
      'inventory',
      'delete',
      oldItem.get({ plain: true }),
      null,
      { transaction }
    );

    await transaction.commit();
    res.json({ message: 'Запись удалена' });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ 
      error: 'Ошибка при удалении',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};