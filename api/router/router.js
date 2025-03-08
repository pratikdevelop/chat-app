const conversationController = require('../controllers/conversationController'); // Fixed typo in 'conversationCntroller'
const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming this exists for authentication

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log(file); // Keep your logging for debugging
        if (file.mimetype.includes('image')) {
            cb(null, path.join(__dirname, '../../public/images'));
        } else if (file.mimetype.includes('video')) {
            cb(null, path.join(__dirname, '../../public/video'));
        } else if (file.mimetype.includes('audio')) {
            cb(null, path.join(__dirname, '../../public/audio'));
        } else {
            cb(new Error('Invalid file type'), false); // Handle unsupported file types
        }
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

// API Routes
const apiRoutes = (app) => {
    // Public routes (no authentication required)
    // app.get("/", userController().index);
    app.post("/signup", userController().signup);
    app.post("/signin", userController().login);
    app.post("/forget-password", userController().forgetPassword); // Renamed from reset-password for clarity
    app.post("/verify-otp", userController().verifyOtp);
    app.post("/reset-password", userController().resetPassword); // Added as a public route

    // Protected routes (require authentication)
    app.get("/user/:id", authMiddleware, userController().getUserById);
    app.get("/users", authMiddleware, userController().getUsers);
    app.put("/profile", authMiddleware, upload.single('file'), userController().updateProfile); // Changed to PUT, removed :id
    app.put("/change-password", authMiddleware, userController().changePassword); // Changed to PUT, removed :id
    app.post("/conversation", authMiddleware, conversationController().createConversation);
    app.post("/message", authMiddleware, messageController().postMessage);
    app.post("/message/file", authMiddleware, upload.single('file'), messageController().postFileData);
    app.get("/messages/:id", authMiddleware, messageController().getMessageByID);
    app.get("/conversations/:id", authMiddleware, conversationController().getConversationById); // Fixed typo in 'converstions'
};

module.exports = apiRoutes;