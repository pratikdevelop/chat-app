const users = require("../models/users");
const expires = require("../models/otp");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_SEND, pass: process.env.APP_PASSWORD },
});

const userController = (io) => {
  return {
    async signup(req, res) {
      const { name, email, password, username, confirm_password } = req.body;
      if (!name || !email || !password || !username || !confirm_password) {
        return res.status(400).json({ error: "All fields are required" });
      }
      if (password !== confirm_password) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
      try {
        if (await users.findOne({ email })) {
          return res.status(400).json({ error: "Email already exists" });
        }
        if (await users.findOne({ username })) {
          return res.status(400).json({ error: "Username already taken" });
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = new users({ name, email, username, password: hashedPassword });
        const response = await newUser.save();
        res.status(201).json({ message: "Signup successful", response });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async login(req, res) {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      try {
        const user = await users.findOne({ email });
        if (!user || !(await bcryptjs.compare(password, user.password))) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
        await users.findByIdAndUpdate(user._id, { status: "online" });
        io.emit("userStatus", { userId: user._id, status: "online" });
        res.status(200).json({ message: "Login successful", token, userId: user._id });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async getUsers(req, res) {
      try {
        const data = await users.find().select("name username profile_image status");
        res.status(200).json({ users: data });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async forgetPassword(req, res) {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });
      try {
        const user = await users.findOne({ email });
        if (!user) return res.status(404).json({ error: "Email not found" });

        const otp = otpGenerator.generate(6, { digits: true, specialChars: false });
        const expire = new expires({ user_id: user._id, otp });
        await expire.save();

        const mailOptions = {
          from: process.env.EMAIL_SEND,
          to: email,
          subject: "Password Reset Request",
          html: `<p>Hello ${user.name},</p><p>Your OTP for password reset is <b>${otp}</b>. It’s valid for 10 minutes.</p>`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) return res.status(500).json({ error: "Failed to send OTP" });
          res.status(200).json({ message: "OTP sent", success: true });
        });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async verifyOtp(req, res) {
      const { otp } = req.body;
      if (!otp) return res.status(400).json({ error: "OTP is required" });
      try {
        const expireRecord = await expires.findOne({ otp });
        if (!expireRecord || Date.now() > expireRecord.createdAt.getTime() + 10 * 60 * 1000) {
          return res.status(401).json({ error: "Invalid or expired OTP" });
        }
        const user = await users.findById(expireRecord.user_id);
        if (!user) return res.status(404).json({ error: "User not found" });
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1h" });
        await expires.deleteOne({ _id: expireRecord._id });
        res.status(200).json({ message: "OTP verified", token });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async resetPassword(req, res) {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }
      try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const hashedPassword = await bcryptjs.hash(password, 10);
        await users.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        res.status(200).json({ message: "Password reset successful" });
      } catch (error) {
        res.status(400).json({ error: "Invalid or expired token" });
      }
    },

    async getUserById(req, res) {
      try {
        const user = await users.findById(req.params.id).select("name username profile_image status");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async updateProfile(req, res) {
      try {
        const updates = req.file ? { profile_image: req.file.path } : {};
        const data = await users.findByIdAndUpdate(req.user.id, updates, { new: true });
        if (!data) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ data });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async changePassword(req, res) {
      const { password, confirmPassword } = req.body;
      if (!password || !confirmPassword) {
        return res.status(400).json({ error: "Both password fields are required" });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
      try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const data = await users.findByIdAndUpdate(req.user.id, { password: hashedPassword }, { new: true });
        res.status(200).json({ message: "Password changed successfully", data });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
  };
};

module.exports = userController;