const { DataTypes } = require('sequelize');
const sequelize = require('../config');



const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: DataTypes.STRING,
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serialNumber: {
    type: DataTypes.STRING,
    field: 'serial_number'
  },
  unit: DataTypes.STRING(50),
  quantity: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0
  },
  dateAdded: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'date_added'
  },
  location: DataTypes.STRING,
  notes: DataTypes.TEXT,
  itemsNumber: {
    type: DataTypes.STRING,
    field: 'items_number'
  },
  displayId: {
    type: DataTypes.INTEGER,
    field: 'display_id'
  }
}, {
  tableName: 'inventories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'serial_number'],
    }
  ]
});

Inventory.associate = function(models) {
  Inventory.hasMany(models.InvoiceItem, {
    foreignKey: 'items_number',
    as: 'invoiceItems'
  });
};

module.exports = Inventory;