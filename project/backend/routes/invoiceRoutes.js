const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/', invoiceController.create);
router.get('/', invoiceController.getAll);
router.delete('/:id', invoiceController.delete);



module.exports = router;