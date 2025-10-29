const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secretKey = '7922004'; // В продакшене используйте process.env.JWT_SECRET

// controllers/authController.js
exports.register = async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body; // role не обязателен
    
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const newUser = await User.create({ 
      username, 
      password,
      role // Добавляем поддержку роли
    });

    res.status(201).json({ 
      message: 'Пользователь создан!',
      userId: newUser.id,
      role: newUser.role // Возвращаем роль в ответе
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: err.message // Добавляем детали ошибки
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны!' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const token = jwt.sign({ id: user.id, role: user.role}, secretKey, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};