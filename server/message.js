var Message = function(message) {
  this.username = message.username;
  this.text = message.message || message.text;
  this.roomname = message.roomname;
  this.createdAt = new Date();
  this.updatedAt = new Date();
}

Message.prototype.update = function(updates) {
  if (updates.message !== undefined) {
    updates.text = updates.message;
    updates.message = undefined;
  }
  Object.assign(
    this,
    updates,
    {createdAt: this.createdAt, updatedAt: new Date()}
  );
}

module.exports = Message;
