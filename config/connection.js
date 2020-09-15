const development = {
  database: 'origami_resourceportal',
  username: 'root',
  password: '',
  host: 'localhost',
  port: process.env.DB_HOST,
  dialect: 'mysql'
}

const testing = {
  database: 'origami_resourceportal',
  username: 'root',
  password: '',
  host: 'localhost',
  dialect: 'mysql'
}

const production = {
  database: process.env.DB_NAME || 'origamiportal',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'OrigamiPort@123',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql'
}

module.exports = {
  development,
  testing,
  production
}
