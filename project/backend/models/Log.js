// models/Log.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  old_value: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  new_value: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'logs',
  timestamps: false,
  underscored: true
});

module.exports = Log;
