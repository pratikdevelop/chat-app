// models/User.js
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return v ? validator.isMobilePhone(v) : true; // Optional field validation
            },
            message: 'Please enter a valid phone number'
        }
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 160, // Typical bio length limit
        default: ''
    },
    profile_image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'away'],
        default: 'offline'
    }
}, { timestamps: true });

userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model("Users", userSchema);