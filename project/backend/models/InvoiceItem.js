const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  serialNumber: {
    type: DataTypes.STRING(255),
    field: 'serial_number'
  },
  unit: DataTypes.STRING(50),
  quantity: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  invoiceNumber: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'invoice_number'
  },
  invoiceType: {
    type: DataTypes.ENUM('приход', 'расход'),
    allowNull: false,
    field: 'invoice_type'
  },
  itemsNumber: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'items_number'
  },
  displayId: {
    type: DataTypes.INTEGER,
    field: 'display_id'
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'invoice_id'
  }
}, {
  tableName: 'invoice_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

InvoiceItem.associate = function(models) {
  InvoiceItem.belongsTo(models.Invoice, {
    foreignKey: 'invoice_id',
    as: 'invoice',
    onDelete: 'CASCADE'
  });

  InvoiceItem.belongsTo(models.Inventory, {
    foreignKey: 'items_number',
    as: 'inventory'
  });
};

module.exports = InvoiceItem;