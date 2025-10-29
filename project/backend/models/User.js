const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('password', bcrypt.hashSync(value, 10));
    }
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    allowNull: false
  }
}, {
  tableName: 'Users', // Явно указываем имя таблицы
  freezeTableName: true, // Отключаем автоматическое преобразование имен
  timestamps: false // Отключаем автоматические поля createdAt/updatedAt
});

module.exports = User;