const Conversation = require("../models/conversation.js");

const conversationController = (io) => {
  return {
    async getConversationById(req, res) {
      try {
        const userId = req.user.id; // Use authenticated user's ID
        const { limit = 20, skip = 0 } = req.query;

        const conversations = await Conversation.find({ members: { $in: [userId] } })
          .populate('members', 'name username profile_image')
          .sort({ updatedAt: -1 })
          .skip(parseInt(skip))
          .limit(parseInt(limit));

        res.status(200).json({ conversations });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    async createConversation(req, res) {
      const { sender_id, receiver_id } = req.body.body || {};
      if (!sender_id || !receiver_id) {
        return res.status(400).json({ error: 'Sender and receiver IDs are required' });
      }
      if (sender_id === receiver_id) {
        return res.status(400).json({ error: 'Cannot create conversation with yourself' });
      }
      try {
        const existingConversation = await Conversation.findOne({
          members: { $all: [sender_id, receiver_id] },
        });
        if (existingConversation) {
          return res.status(200).json({ data: existingConversation });
        }

        const conversation = new Conversation({
          members: [sender_id, receiver_id],
        });
        const data = await conversation.save();

        // Notify both users in real-time
        io.to(receiver_id).emit('newConversation', data);
        io.to(sender_id).emit('newConversation', data);

        res.status(200).json({ data });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },
  };
};

module.exports = conversationController;