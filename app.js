var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// name entered to the sign in page
var username;
// a dictionary which stores the name and their socket.id (socket.id, realname)
var namelist = {};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/login.html');
});

app.get('/chatroom', function(req, res) {
  res.sendFile(__dirname + '/views/chatroom.html');
});

app.post('/', function (req, res) {
  username = req.body.name;
  res.redirect('/chatroom');
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

var MongoClient = require('mongodb').MongoClient;
// Connection URL
var DB_URL = 'mongodb://localhost:27017/chat'; 

// use connect method to connect to the server
MongoClient.connect(DB_URL, function(err, db) {
  // Error handling
  if (err) {
    console.log('Error:' + err);
  }

  io.on('connection', function(socket) {
    console.log(username + ' connected to server.');

    io.emit('user online', username + ' is online.');

    var collection = db.collection('records');
    collection.find().toArray(function(err, result) {
      if (err) {
        console.log('error:' + err);
      } else {
        socket.emit('chat history', result);
      }
    });

    socket.on('chat message', function(msg) {
      if (namelist[socket.id] == null) {
        namelist[socket.id] = username;
      }
      io.emit('chat message', namelist[socket.id] + msg);

      var collection = db.collection('records');
      collection.insert({
        msg : namelist[socket.id] + msg
      }, function(err, result) {
        if (err) {
          console.log('Error:' + err);
        } else {
          console.log('Insert to database successfully!');
        }
      });
    });

    socket.on('disconnect', function() {
      console.log(namelist[socket.id] + ' offline');
      io.emit('user offline', namelist[socket.id] + ' is offline.');
    });

  });
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
