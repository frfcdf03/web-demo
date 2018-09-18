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
var redis = require('redis');
var RedisStore = require('connect-redis')(session); // RedisStore for Session
var app = express();


var netConfig = {
  domain: "http://zhoudongshen.jnaw.top",
  redis: {
    host: "redis",
    port: "6379"
  },
  wxconfig: {
    appid: "wx7f9ea6014e0c00d5",
    secret: "a524edbf11df1a475600e0b4273d8395"
  }
};

app.use(express.static("./public"));

//设置跨域访问
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1');
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('art', require('express-art-template'));
app.set('view options', {
  debug: process.env.NODE_ENV !== 'production'
});
app.set("view engine", "art");
var redisClient = redis.createClient(netConfig.redis.port, netConfig.redis.host);
var upload = multer({
  dest: '/'
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

////session 需要重新设置
app.use(session({
  store: new RedisStore({
    client: redisClient
  }), //设置Redis数据库for Session
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false, // 取消未请求成功的seesion.id 存入
}));


// var pool = mysql.createPool({
//     connectionLimit: 100,
//     host: 'localhost',
//     port: '3306',
//     user: 'root',
//     password: 'root',
//     database: 'xccloud',
//     multipleStatements: true
// });


var pool = mysql.createPool({
  connectionLimit: 100,
  host: 'mysql',
  port: '3306',
  user: 'root',
  password: 'xccloud',
  database: 'xccloud',
  multipleStatements: true,
  'dateStrings': true
});


var connection = mmsql(pool);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

var index = require("./routes/index.js")(connection,redisClient); //,netConfig, redisClient);
app.use("/", index);

// route middleware to make sure a user is logged in
// app.use(function (req, res, next) {

//   // if user is authenticated in the session, carry on
//   if (!req.session.user)
//     res.send('errr!!!login expired');

//   // if they aren't redirect them to the home page
//   if (req.session.user)
//   return next();
// });

var wechat = require("./routes/wechat.js");
wechat = wechat(connection);
app.use("/web-wechat", wechat);

var news = require("./routes/news.js");
news = news(connection);
app.use("/news", news);

var paintings = require("./routes/paintings.js");
paintings = paintings(connection);
app.use("/paintings", paintings);

var price = require("./routes/price.js");
price = price(connection);
app.use("/price", price);

var editions = require("./routes/editions.js");
editions = editions(connection);
app.use("/editions", editions);

var message = require("./routes/message.js");
message = message(connection);
app.use("/message", message);

var users = require("./routes/users.js");
users = users(connection);
app.use("/users", users);

var upload = require("./routes/upload.js");
upload = upload(connection);
app.use("/upload",upload);

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