require("../models/conn.js")
const Message = require("../models/Message.js")

const messageController = () => {
    return {

        async getMessageByID(req, res) {
            try {
                const conversationId = req.params.id;
                const messages = await Message.find({ conversationId: conversationId });
                res.status(200).json({ messages: messages });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ error: error });
            }
        },

        async postMessage(req, res) {
            try {
                const message = new Message({
                    conversationId: req.body.body.conversationId,
                    senderId: req.body.body.senderId,
                    message: req.body.body.message
                })
                const data = await message.save()
                res.status(200).json({ data: data });

            } catch (error) {
                console.log(error);
                res.status(500).json({ error: error });

            }
        },
        async postFileData(req, res) {
            try {
                const message = new Message({
                    conversationId: req.body.conversationId,
                    senderId: req.body.senderId,
                    message: req.file.path,
                    message_type: req.file.mimetype
                })
                const data = await message.save()
                res.status(200).json({ data: data });

            } catch (error) {
                console.log(error);
                res.status(500).json({ error: error });

            }
        }
    }
}
module.exports = messageController;
