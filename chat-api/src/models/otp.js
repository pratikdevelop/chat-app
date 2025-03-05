const mongoose = require("mongoose");
const expireSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now, expires: '6m' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    otp: { type: String }
});

const expires = mongoose.model('expireMe', expireSchema);

module.exports= expires;