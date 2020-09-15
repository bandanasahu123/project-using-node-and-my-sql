const privateRoutes = require('./routes/privateRoutes');
const publicRoutes = require('./routes/publicRoutes');
const renderRoutes = require('./routes/renderRoutes');

const config = {
  migrate: false,
  privateRoutes,
  publicRoutes,
  renderRoutes,
  port: process.env.PORT || '3001',
};

module.exports = config;