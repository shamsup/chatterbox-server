var app = (function() {
  var url = 'http://127.0.0.1:3000/classes/messages';
  var data = {
    username: 'testuserlol',
    lastReceived: '',
    currentRoom: '',
    rooms: {},
    messages: {},
    friends: {},
  };

  var send = function send(message) {
    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(message)
    });
  };

  var fetch = function fetch(params, callback) {
    $.ajax({
      url: url,
      type: 'GET',
      data: params,
      success: callback
    });
  };

  var clearMessages = function clearMessages() {
    $('#chats').empty();
  };

  var renderMessage = function renderMessage(message) {
    var $li = $(`<li class="collection-item${data.friends[message.username] ? ' friended' : ''}"></li>`);
    var $row = $('<div class="row"></div>');
    var $username = $('<div class="username col s3"></span>');
    $username.text(message.username);
    $username.data('username', message.username);
    $friendIcon = $('<i class="material-icons">assignment_ind</i>');
    $username.prepend($friendIcon);
    var $message = $('<div class="message"></div>');
    $message.text(message.text);
    $row.append($username, $message);
    $li.append($row);
    $('#chats').append($li);

    // always have chat box scrolled to bottom
    $('#chats').scrollTop($('#chats')[0].scrollHeight);
  };

  var renderRoom = function renderRoom(roomName) {
    var $li = $('<li></li>');
    var $room = $('<a href="#"></a>');
    $room.text(roomName).prop('roomName', roomName);
    $li.append($room);
    $('#roomSelect').append($li );
  };

  var handleUsernameClick = function handleUsernameClick(e) {
    var username = $(this).data('username');
    data.friends[username] = !data.friends[username];
    $(this).parent().parent().toggleClass('friended');
  };

  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    var message = $('#message').val();
    if (message.length) {
      this.send({username: data.username, text: message, roomname: data.currentRoom});
    }
    e.target.reset();
  };

  var setRoom = function setRoom(roomName) {
    if (roomName !== data.currentRoom) {
      data.currentRoom = roomName;
      $('#room-name').text(data.currentRoom);
      $('#chats').empty();
      data.rooms[data.currentRoom].forEach(renderMessage);
      $('#roomSelect li').each(function() {
        if ($('a', this).prop('roomName') === roomName) {
          $(this).addClass('selected');
          return;
        }
        $(this).removeClass('selected');
      });
    }
  };

  var update = function update() {
    var params = {
      order: 'createdAt',
      where: `{"createdAt": {"$gt": "${data.lastReceived}"}}`
    };

    fetch(params, ({results}) => {
      results.forEach(message => {
        data.rooms[message.roomname] = data.rooms[message.roomname] || (renderRoom[message.roomName], []);
        data.rooms[message.roomname].push(message);
        data.messages[message.objectId] = message;
        if (message.roomname === data.currentRoom) {
          renderMessage(message);
        }
      });
      if (results.length) {
        data.lastReceived = results[results.length - 1].createdAt;
      }
      setTimeout(update, 1000);
    });
  };

  var init = function init() {
    // gather the username
    data.username = prompt('What is your username?') || 'holydiver666';
    $('#main').on('click', '.username', this.handleUsernameClick);
    $('#send').on('submit', this.handleSubmit.bind(this));
    $('#roomSelect').on('click', 'a', function(e) {
      e.preventDefault();
      this.setRoom($(e.target).prop('roomName'));
    }.bind(this));
    this.fetch({ order: '-createdAt', limit: 1000}, ({results}) => {
      results.forEach(message => {
        data.messages[message.objectId] = message;
        data.rooms[message.roomname] = data.rooms[message.roomname] || [];
        data.rooms[message.roomname].push(message);
        if (message.roomname = data.currentRoom) {
          renderMessage(message);
        }
      });

      data.lastReceived = results[0].createdAt;
      for (var key in data.rooms) {
        this.renderRoom(key);
      }
      setRoom('lobby');
      setTimeout(update, 1000);
    });
  };

  // our public api
  return {
    init: init,
    send: send,
    fetch: fetch,
    server: url,
    clearMessages: clearMessages,
    renderMessage: renderMessage,
    renderRoom: renderRoom,
    handleUsernameClick: handleUsernameClick,
    handleSubmit: handleSubmit,
    setRoom: setRoom
  };

}());
