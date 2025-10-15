const express = require('express');
const { Event, Booking } = require('../models');
const router = express.Router();

// POST /api/bookings/reserve
router.post('/reserve', async (req, res) => {
  const { event_id, user_id } = req.body;

  // Валидация входных данных
  if (!event_id || !user_id) {
    return res.status(400).json({
      success: false,
      message: 'event_id и user_id обязательны'
    });
  }

  try {
    // Начинаем транзакцию для обеспечения атомарности
    const result = await Booking.sequelize.transaction(async (t) => {
      // Проверяем существование события
      const event = await Event.findByPk(event_id, { transaction: t });
      if (!event) {
        throw new Error('Событие не найдено');
      }

      // Проверяем, не забронировал ли пользователь уже место на это событие
      const existingBooking = await Booking.findOne({
        where: {
          event_id,
          user_id
        },
        transaction: t
      });

      if (existingBooking) {
        throw new Error('Пользователь уже забронировал место на это событие');
      }

      // Получаем количество уже забронированных мест
      const bookedSeats = await Booking.count({
        where: { event_id },
        transaction: t
      });

      // Проверяем, есть ли свободные места
      if (bookedSeats >= event.total_seats) {
        throw new Error('Нет свободных мест на это событие');
      }

      // Создаем бронирование
      const booking = await Booking.create({
        event_id,
        user_id,
        created_at: new Date()
      }, { transaction: t });

      return booking;
    });

    res.status(201).json({
      success: true,
      message: 'Место успешно забронировано',
      booking: result
    });

  } catch (error) {
    console.error('Ошибка бронирования:', error.message);

    if (error.message === 'Событие не найдено') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Пользователь уже забронировал место на это событие') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Нет свободных мест на это событие') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Дополнительный эндпоинт для получения всех бронирований пользователя
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const bookings = await Booking.findAll({
      where: { user_id },
      include: [{
        model: Event,
        attributes: ['id', 'name', 'total_seats']
      }]
    });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Ошибка получения бронирований:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;