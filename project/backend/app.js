const express = require('express');
const cors = require('cors');
const sequelize = require('./config');
const User = require('./models/User');
const Inventory = require('./models/Inventory');
const Log = require('./models/Log');
const authRoutes = require('./routes/authRoutes');
const tsoRoutes = require('./routes/tsoRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const logRoutes = require('./routes/logRoutes');
const { verifyToken } = require('./middlewares/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Проверка подключения к БД
sequelize.authenticate()
  .then(() => console.log('✅ Подключение к PostgreSQL успешно!'))
  .catch(err => console.error('❌ Ошибка подключения:', err));

// Синхронизация моделей
sequelize.sync({ force: false })
  .then(() => console.log('✅ Таблицы созданы!'))
  .catch(err => console.error('❌ Ошибка:', err));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/tso', tsoRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/logs', logRoutes);

// Старт сервера
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

