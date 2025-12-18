import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI ||
            'mongodb+srv://khopetejas903:nrRY9qAZrkdSqQ2c@cluster0.w6k88pw.mongodb.net/DB';

        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;