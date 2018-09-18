var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require("multer");
var bodyParser = require("body-parser");
var mysql = require('mysql');
var mmsql = require("./mysql/mysql.js");
var session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('art', require('express-art-template'));
app.set('view options', {
  debug: process.env.NODE_ENV !== 'production'
});
app.set('view engine','art');

var upload = multer({
  dest: '/'
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
////session 需要重新设置
app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true
}));


var pool = mysql.createPool({
  connectionLimit: 100,
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'rootroot',
  database: 'user',
  multipleStatements: true
});
var connection = mmsql(pool);



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

var index = require("./routes/index.js");
index = index(connection);
app.use("/", index);

var user = require("./routes/user.js");
user = user(connection);
app.use("/user", user);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;