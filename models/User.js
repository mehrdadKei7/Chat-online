const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  room: { type: String, required: true },
  socketId: { type: String, required: true },
  isOnline: { type: Boolean, default: true },
 
});


module.exports = mongoose.model("User", UserSchema);
