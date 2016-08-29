$(document).ready(function() {

  var socket = io.connect();

  $('form').submit(function() {
    socket.emit('chat message', ' said: ' + $('#m').val() + '-----' + showTime());
    $('#m').val('');
    return false;
  });

  // listent to 'chat history' event. Once the event is emitted, it will display message on html
  socket.on('chat history', function(result) {
    for (i = 0; i < result.length; i++) {
      showMsg(result[i].msg);
    }
  });

  // listent to 'user online' event. Once the event is emitted, it will display message on html
  socket.on('user online', function(msg){
    $('#messages').append($('<li class="list-group-item list-group-item-success">').text(msg));
  });

  // listent to 'chat message' event. Once the event is emitted, it will display message on html
  socket.on('chat message', function(msg) {
    showMsg(msg);
  });

  // listent to 'user offline' event. Once the event is emitted, it will display message on html
  socket.on('user offline', function(msg){
    $('#messages').append($('<li class="list-group-item list-group-item-danger">').text(msg));
  });

  function showMsg(msg) {
    // $('#messages').append($('<li class="list-group-item list-group-item-info">').text(msg));
    var divider = msg.indexOf('-----');
    var content = msg.substring(0, divider);
    var time = msg.slice(divider + 5);
    $('#messages').append('<li class="list-group-item list-group-item-info"><span class="badge">' + time + '</span>' + content + '</li>');
  }

  // get the timestamp
  function showTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? ('0' + month) : month);
    var day = (date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate());
    var hour = (date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours());
    var min = (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes());
    var sec = (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());

    var time = month + '/' + day + '/' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
  }

});
