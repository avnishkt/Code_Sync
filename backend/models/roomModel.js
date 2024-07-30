const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectID,
      ref: 'coder',
    },
  ],
});

const Room = mongoose.model("room", roomSchema);

module.exports = Room;
