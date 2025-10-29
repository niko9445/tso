// utils/logger.js

const Log = require('../models/Log');

/**
 * Логирует действия с сущностями в базе данных
 * @param {string} entity - Название сущности (например, 'Invoice')
 * @param {string} action - Действие ('create', 'update', 'delete')
 * @param {Object|null} oldValue - Старое значение (если применимо)
 * @param {Object|null} newValue - Новое значение (если применимо)
 */
async function logAction(entity, action, oldValue = null, newValue = null) {
  try {
    await Log.create({
      entity,
      action,
      old_value: oldValue,
      new_value: newValue
    });
  } catch (error) {
    console.error('Ошибка логирования действия:', error);
  }
}

module.exports = logAction;
