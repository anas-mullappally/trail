const { default: mongoose } = require("mongoose")

const connectDatabase = async ()=>{
    try {
      await mongoose.connect(process.env.MONGO_URI)
      console.log("Database connected successfully");
    } catch (error) {
        console.log("Error while connecting Mongodb:",error.message)
        process.exit(1)          
    }
}

module.exports = connectDatabase