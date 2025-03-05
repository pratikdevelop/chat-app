const conversationController = require('../controllers/conversationCntroller')
const messageController = require('../controllers/messageController')
const userController = require('../controllers/userController')
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log(file);
        if (file.mimetype.includes('image')) {
            cb(null, path.join(__dirname,'../../public/images'))
        }
        else if(file.mimetype.includes('video')) {
            cb(null, path.join(__dirname,'../../public/video'))
        }
        else if(file.mimetype.includes('audio')) {
        
        cb(null, path.join(__dirname,'../../public/audio'))
        }
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })
const apiRoutes = (app) => {
    app.get("/", userController().index)
    app.post("/signup", userController().signup)
    app.get("/user/:id", userController().getUserById)
    app.get("/users", userController().getUsers)
    app.post("/change-password/:id", userController().changePassword)
    app.post("/profile/:id", upload.single('file'), userController().updateProfile)
    app.post("/signin", userController().login)
    app.post('/verify-otp', userController().verifyOtp)
    app.post("/conversation", conversationController().createConversation)
    app.post("/message", messageController().postMessage)
    app.post("/message/file", upload.single('file'), messageController().postFileData)
    app.get("/messages/:id", messageController().getMessageByID)
    app.get("/converstions/:id", conversationController().getConversationById)
    app.post('/reset-password', userController().forgetPassword)
}
module.exports = apiRoutes;