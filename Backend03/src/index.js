/*
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import express from 'express';

const app = express();
dotenv.config();

// If we carefully look at the structure of database calling then it is like this: 
// '(() => {})()' This structure is called as Javascript IIFE. In this we execute the function as soon as it is implemented. So round brackets at the end shows that the function is now executing.
( async () => {
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

       // We use "on" listener to listen to events.
       // Here we are saying that it might be possible that our database has been connected but express is not able to talk to it. So, here we are taking care of it.
       app.on("error", (error)=> {
        console.log("ERR: ", error);
        throw error
       });
       app.listen(process.env.PORT, () => {
        console.log('Server is running on port', process.env.PORT);
       })
    }catch (error) {
        console.error("ERROR: ", error);
        throw error
    }
})();
*/






// METHOD 2 : In this we have created mongoDb connection logic in one separate file and then imported that method here and executed it.

import dotenv from 'dotenv';
import connectDB from './db/index.js';
dotenv.config();
connectDB();









