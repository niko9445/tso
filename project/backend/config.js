const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: 'tso',
  username: 'postgres',
  password: '1243345',
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false // Отключаем логи SQL в консоли
});

module.exports = sequelize;