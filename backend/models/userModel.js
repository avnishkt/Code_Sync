const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    socketId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
})

const User = mongoose.model("coder", userSchema)

module.exports = User