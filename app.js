/**
 * third party libraries
 */
const bodyParser = require('body-parser')
const express = require('express')
const helmet = require('helmet')
const http = require('http')
const mapRoutes = require('express-routes-mapper')
const path = require('path')
const ejs = require('ejs')
const cors = require('cors')
const multer = require('multer')
var session = require('express-session'),
  cookieParser = require('cookie-parser')
var MemoryStore = require('session-memory-store')(session)

/**
 * server configuration
 */
const config = require('./config')
const dbService = require('./api/services/db.service')
const auth = require('./api/policies/auth.policy')
const checkSession = require('./api/policies/checkSession')
const dashboard = require('./api/controllers/UserController')

// environment: development, staging, testing, production
const environment = process.env.NODE_ENV

/**
 * express application
 */
const app = express()
const server = http.Server(app)
const mappedOpenRoutes = mapRoutes(config.publicRoutes, 'api/controllers/')
const mappedAuthRoutes = mapRoutes(config.privateRoutes, 'api/controllers/')
const mappedRenderRoutes = mapRoutes(config.renderRoutes, 'api/controllers/')
const DB = dbService(environment, config.migrate).start()

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors())

app.use(
  session({
    secret: 'BSH678966',
    resave: true,
    cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
    saveUninitialized: true,
    // store: new MemoryStore({
    //   expires: 8 * 60 * 60 * 1000
    // })
  })
)

// app.set('trust proxy', 1)

// app.use(
//   session({
//     secret: 'secret',
//     cookie: {
//       secure: true,
//       maxAge: 8 * 60 * 60 * 1000
//     },
// store: new MemoryStore({
//   expires: 8 * 60 * 60 * 1000
// }),
//     saveUninitialized: true,
//     resave: false
//   })
// )
app.use(express.static(__dirname + '/public'))

app.set('views', __dirname + '/views')

app.engine('ejs', require('ejs').__express)

app.set('view engine', 'ejs')

// secure express app
app.use(
  helmet({
    dnsPrefetchControl: false,
    frameguard: false,
    ieNoOpen: false
  })
)

// parsing the request bodys
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const storage = multer.diskStorage({
  destination: 'public/images/',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    )
  }
})

const upload = multer({ storage: storage }).any()

// secure your private routes with jwt authentication middleware
app.all('/private/*', (req, res, next) => auth(req, res, next))
app.all('/auth/*', (req, res, next) =>
  checkSession.checkSessionId(req, res, next)
)

app.get('/', function (req, res) {
  dashboard().publicDashboard(req, res)
})

// fill routes for express application
app.use('/public', mappedOpenRoutes)
app.use('/private', mappedAuthRoutes)
app.use('/auth', mappedRenderRoutes)

server.listen(config.port, () => {
  if (
    environment !== 'production' &&
    environment !== 'development' &&
    environment !== 'testing'
  ) {
    console.error(
      `NODE_ENV is set to ${environment}, but only production and development are valid.`
    )
    process.exit(1)
  }
  console.log(`Server connected with ${environment} @ localhost:${config.port}`)
  return DB
})
