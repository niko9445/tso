const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// Получение всех логов
router.get('/', async (req, res) => {
  try {
    const logs = await Log.findAll({
      order: [['timestamp', 'DESC']], // Сортировка по дате (новые сверху)
      limit: 100 // Ограничиваем количество записей
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получение логов по сущности
router.get('/:entity', async (req, res) => {
  try {
    const logs = await Log.findAll({
      where: { entity: req.params.entity },
      order: [['timestamp', 'DESC']]
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;