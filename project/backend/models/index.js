const sequelize = require('../config');

// Импорт моделей
const Inventory = require('./Inventory');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');

// Установка связей
Inventory.associate({ Invoice, InvoiceItem });
Invoice.associate({ Inventory, InvoiceItem });
InvoiceItem.associate({ Inventory, Invoice });

module.exports = {
  sequelize,
  Inventory,
  Invoice,
  InvoiceItem
};