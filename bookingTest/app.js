const express = require('express');
const { sequelize } = require('./models');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
});

// Инициализация базы данных и запуск сервера
async function startServer() {
  try {
    // Синхронизация с базой данных
    await sequelize.authenticate();
    console.log('Подключение к базе данных установлено');
    
    await sequelize.sync({ force: false }); // Используйте { force: true } только для разработки
    console.log('База данных синхронизирована');

    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;