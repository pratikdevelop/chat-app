const Message = require("../models/Message.js");
const Conversation = require("../models/conversation.js");

const messageController = (io) => {
  return {
    async getMessageByID(req, res) {
      try {
        const conversationId = req.params.id;
        const { limit = 20, skip = 0 } = req.query;

        const messages = await Message.find({ conversationId })
          .populate('senderId', 'name username profile_image')
          .sort({ createdAt: -1 })
          .skip(parseInt(skip))
          .limit(parseInt(limit));

        res.status(200).json({ messages });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    async postMessage(req, res) {
      const { conversationId, senderId, message } = req.body.body || {};
      if (!conversationId || !senderId || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      try {
        const newMessage = new Message({ conversationId, senderId, message });
        const data = await newMessage.save();

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        // Find recipient and broadcast
        const conversation = await Conversation.findById(conversationId);
        const recipientId = conversation.members.find((id) => id !== senderId);
        io.to(recipientId).emit('newMessage', data);

        res.status(200).json({ data });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    async postFileData(req, res) {
      const { conversationId, senderId } = req.body;
      if (!conversationId || !senderId || !req.file) {
        return res.status(400).json({ error: 'Missing required fields or file' });
      }
      try {
        const message = new Message({
          conversationId,
          senderId,
          message: req.file.path,
          message_type: req.file.mimetype,
        });
        const data = await message.save();

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        // Broadcast to recipient
        const conversation = await Conversation.findById(conversationId);
        const recipientId = conversation.members.find((id) => id !== senderId);
        io.to(recipientId).emit('newMessage', data);

        res.status(200).json({ data });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },
  };
};

module.exports = messageController;