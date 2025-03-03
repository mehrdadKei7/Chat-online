const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  room: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


module.exports=mongoose.model('Messege',messageSchema)
