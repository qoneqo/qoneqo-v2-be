var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var filterRouter = require('./routes/filter');
var appsRouter = require('./routes/app/apps');
var usersRouter = require('./routes/app/users');
var rolesRouter = require('./routes/app/roles');
var modulesRouter = require('./routes/app/modules');
var userRoleRouter = require('./routes/app/user-role');
var testingRouter = require('./routes/testing');

var appService = require('./services/app/apps');

var app = express();

const jwt = require('jsonwebtoken');
const corsOption = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true,
};

// check _token
const authMiddleware = async (req, res, next) => {
  if (!req.cookies._token) return res.sendStatus(401);
  jwt.verify(req.cookies._token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.clearCookie('_token').clearCookie('_token_reset').clearCookie('_filter').sendStatus(403);
    }
    req.userId = decoded.id;
    // req.appId = decoded.app_id;
    req.appId = (await appService.index({userId: decoded.id})).map((val) => val.id);
    next();
  })
}

// check_filter
const checkFilterMiddleware = (req, res, next) => {  
  req.filter = req.cookies._filter || 0;
  next();
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors(corsOption))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/filter', authMiddleware, filterRouter);
app.use('/apps', authMiddleware, checkFilterMiddleware, appsRouter);
app.use('/users', authMiddleware, checkFilterMiddleware, usersRouter);
app.use('/roles', authMiddleware, checkFilterMiddleware, rolesRouter);
app.use('/modules', authMiddleware, checkFilterMiddleware, modulesRouter);
app.use('/user-role', authMiddleware, checkFilterMiddleware, userRoleRouter);
app.use('/testing', testingRouter);
 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
