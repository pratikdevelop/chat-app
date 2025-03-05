const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    message_type: {
        required: true,
        type: String,
        default: 'text'
    }
}, { timestamps: true });

const Message = new mongoose.model("Message", messageSchema)
module.exports = Message;