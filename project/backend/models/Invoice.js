const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'invoice_number' // Но указываем соответствие с snake_case в БД
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'invoice_date'
  },
  sdal: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  prinyal: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  invoiceType: {
    type: DataTypes.ENUM('приход', 'расход'),
    allowNull: false,
    field: 'invoice_type'
  },
  displayId: {
    type: DataTypes.INTEGER,
    field: 'display_id',
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

// 👇 Хук для автоматической генерации displayId
Invoice.beforeCreate(async (invoice, options) => {
  const maxDisplayId = await Invoice.max('displayId') || 0;
  invoice.displayId = maxDisplayId + 1;
});

Invoice.associate = function(models) {
  Invoice.hasMany(models.InvoiceItem, {
    foreignKey: 'invoice_id',
    as: 'items',
    onDelete: 'CASCADE'
  });
};

module.exports = Invoice;