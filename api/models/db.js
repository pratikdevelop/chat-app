const mongoose = require("mongoose");
require('dotenv');
console.log(
    "MONGODB_URI: " + process.env.MONGODB_URI
);

mongoose.connect(process.env.MONGO_URL || "mongodb+srv://technoguru242:DHz4MLtSqPzU6LFh@app.wogwa.mongodb.net/?retryWrites=true&w=majority&appName=APP",  {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
})