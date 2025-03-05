require("../models/conn.js")
const users = require("../models/users");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Conversation = require("../models/conversation.js");


const conversationController = () => {
    return {
    
        async getConversationById(req, res) {
            try {
                const  userId = req.params.id;
                const search = req.query.search;
                console.log('serch', search);
                const conversation = await Conversation.find({members:{$in:userId}});
                res.status(200).json({conversation:conversation});
            }
            catch (error){
                console.log(error);
                
                res.status(500).json({error:error});
            }
        },

        async createConversation(req, res) {
            const {sender_id, reciever_id} = req.body.body;
            try {
                const conversation = new Conversation({
                    members:[sender_id,  reciever_id]
                })
                const data = await conversation.save()
                res.status(200).json({data:data});
                
            } catch (error) {
                res.status(500).json({error:error});
                
            }
        }
    }
}
module.exports = conversationController;
