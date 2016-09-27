var Message = function(message) {
  this.username = message.username;
  this.message = this.text = message.message || message.text;
  this.roomname = message.roomname;
  this.createdAt = new Date();
  this.updatedAt = new Date();
}

module.exports = Message;
