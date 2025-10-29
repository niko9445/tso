const Log = require('../models/Log');

async function logAction(entity, action, oldValue = null, newValue = null, options = {}) {
  try {
    await Log.create({
      entity,
      action,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      user_id: options.userId || null,
      ip_address: options.ip || null
    }, {
      transaction: options.transaction || null
    });
  } catch (error) {
    console.error('Ошибка логирования действия:', error);
    // Можно добавить fallback-логирование в файл
  }
}

module.exports = logAction;