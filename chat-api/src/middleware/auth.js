const jwt = require("jsonwebtoken");
const users = require("../models/users");
const auth = async(req,res,next)=>{
    try {
        const token = req.headers.authorization;
        const verifyUser =  await jwt.verify(token,"mynamweispratikrautandboy");
        next();
    }
    catch(error){
       return res.status(401).json({"message": "unAuthenticated User", "error":error});
    }
}

module.exports = auth;