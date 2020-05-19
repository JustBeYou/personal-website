const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const process = require('process');
const cors = require('cors');

const auth = require('./auth.js');
const database = require('./database.js');
const pageRouter = require('./routes/page.js');
const userRouter = require('./routes/user.js');

database();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(auth.authMiddleware);
app.use(auth.router);
app.use('/admin', auth.adminMiddleware);
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', pageRouter);
app.use('/', userRouter);
app.use('/ip', (req, res) => {
  res.json({
    ip: req.connection.remoteAddress,
  });
});

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
