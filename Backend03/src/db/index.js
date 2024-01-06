import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        // We are logging this information because databases for production, development and testing is different. So by loggingg this value we get to know that which database we are being connected.
    } catch (error) {
        console.log("MONGODB connection error ", error);
        process.exit(1);
    }
};
export default connectDB;

    

    