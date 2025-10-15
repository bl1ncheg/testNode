const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: 'booking_system',
  username: 'your_username',
  password: 'your_password',
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;