const { Archive } = require('../models');
const { Op } = require('sequelize');

exports.getAllArchives = async (req, res) => {
  try {
    const where = {};
    
    // Фильтрация по типу сущности
    if (req.query.entity_type) {
      where.entity_type = req.query.entity_type;
    }
    
    // Фильтрация по действию
    if (req.query.action) {
      where.action = req.query.action;
    }
    
    // Фильтрация по дате
    if (req.query.start_date || req.query.end_date) {
      where.executed_at = {};
      if (req.query.start_date) {
        where.executed_at[Op.gte] = new Date(req.query.start_date);
      }
      if (req.query.end_date) {
        where.executed_at[Op.lte] = new Date(req.query.end_date);
      }
    }

    const archives = await Archive.findAll({
      where,
      order: [['executed_at', 'DESC']],
      limit: 100
    });

    res.json(archives);
  } catch (err) {
    console.error('Error in getAllArchives:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getArchivesByEntity = async (req, res) => {
  try {
    const archives = await Archive.findAll({
      where: {
        entity_type: req.params.entity_type,
        entity_id: req.params.entity_id
      },
      order: [['executed_at', 'DESC']]
    });

    if (!archives.length) {
      return res.status(404).json({ error: 'No archives found' });
    }

    res.json(archives);
  } catch (err) {
    console.error('Error in getArchivesByEntity:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};