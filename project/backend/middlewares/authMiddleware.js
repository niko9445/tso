const jwt = require('jsonwebtoken');
const secretKey = '7922004'; // Должен совпадать с ключом в authController.js

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Получаем токен из заголовка
  
  if (!token) {
    return res.status(403).json({ error: 'Токен отсутствует' });
  }

  try {
    const decoded = jwt.verify(token, secretKey); // Проверяем токен
    req.user = decoded; // Добавляем данные в запрос
    next(); // Передаём управление следующему middleware
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

// Проверка роли админа (добавьте это)
exports.isAdmin = (req, res, next) => {
    // Проверяем роль из токена
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
  };