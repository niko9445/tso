const express = require('express');
const router = express.Router();
const tsoController = require('../controllers/tsoController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Основные CRUD-операции
router.get('/', verifyToken, tsoController.getAll);
router.post('/', verifyToken, tsoController.create);
router.put('/:id', verifyToken, tsoController.update);
router.delete('/:id', verifyToken, tsoController.delete);

module.exports = router;