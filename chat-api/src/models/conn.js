const mongoose = require("mongoose");
require('dotenv');
mongoose.connect(process.env.MONGO_URL,  {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
})