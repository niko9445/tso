const express = require('express');
const router = express.Router();
const actsController = require('../controllers/actsController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Базовые CRUD-операции
router.get('/', verifyToken, actsController.getAll);
router.post('/', verifyToken, actsController.create);
router.put('/:id', verifyToken, actsController.update);
router.delete('/:id', verifyToken, actsController.delete);

// Специфичные для Acts роуты
router.get('/last', verifyToken, actsController.getLastActNumber); // Получение последнего номера акта
router.post('/generate-pdf', verifyToken, actsController.generatePDF); // Генерация PDF

module.exports = router;