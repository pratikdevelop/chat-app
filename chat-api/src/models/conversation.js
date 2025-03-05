const mongoose = require("mongoose");
const converstionSchema = new mongoose.Schema({
  members:{
      type:Array,
      required:true
  }
},{timestamps:true});

const Conversation = new mongoose.model("Conversation", converstionSchema)
module.exports = Conversation;