var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
const MongoClient = require('mongodb').MongoClient;

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

const mongodb_url = "mongodb://admin:root@ds131340.mlab.com:31340/all3rgy";
var db;

app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
// app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'index', layoutsDir: __dirname + '/views/'}));
app.engine('hbs', hbs({extname: 'hbs', layoutsDir: __dirname + '/views/'}));
// app.engine('hbs', handlebars.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

//listening on server 3000
// MongoClient.connect(mongodb_url, (err, database) => {
//     if (err) return console.log(err);
//     db = database;
//     app.listen(3000, () => {
// 	console.log('connected to db');
//     });
// });

app.listen(3000, function() {
    console.log('listening on 3000');
    
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
