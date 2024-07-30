const mongoose =require('mongoose');
const dotenv =require('dotenv');
dotenv.config();
const connectDataBase = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  };
module.exports=connectDataBase;