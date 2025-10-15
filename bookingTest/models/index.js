const sequelize = require('../config/database');
const Event = require('./event');
const Booking = require('./booking');

// Связи между таблицами
Booking.belongsTo(Event, { foreignKey: 'event_id' });
Event.hasMany(Booking, { foreignKey: 'event_id' });

module.exports = {
  sequelize,
  Event,
  Booking,
};