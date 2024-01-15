// Multer is a middleware which is used to get the file from user and save it to localstorage or where ever we need.

// To save file to local storage we will use "diskStorage()" method of multer which will save it to HDD. We have another method which is "memoryStorage()" which is used to file to RAM but this method is not advisable because if a large file comes then memory will get full.
// "diskStorage()" accpet object in which:-
//  1. destination - function to determine the storage path for storing the file. We have 3 paramters there which are "request(req)" which has the json data which can be handled by express, then we have "file(file)" which gives us access to file which is why multer is used and last is "callback(cb)" function which accepts two arguments which are "error" and second one is "path to file" where we will keep uploaded files.
// 2. filename - function to determine the name of the uploaded file. Here also we get "req, file, cb" as paramteres. "cb" is used to actually save the file name. We can give anything as file name but industries prefer to give some uuid's or nanoid's. Here "uniqueSuffix" is use to generate a suffix for the file name and add it to the file name. In "cb" we have a "file" which has different options through we can access all the information about the file and actually we can log this "file" to get the data about the file. But in our project we will go for simpler appraoch of naming file, so I have commented the code given by multer and will use our own.
/***This whole code is taken from multer's github page under "diskStorage" section. */

import multer from 'multer';


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // In this cb we are passing 1st argument as null because we are not dealing with errors initially.
        // When we will need we will modify it.
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
    /* Code given by multer.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    */
        cb(null, file.originalname);
        // We are currently storing files with original name. It might have a problem that 1 or more files have same name and new file can override the old file.
        // But we have a margin of error which is time. For very-very minute time we have files on our server so we can play with this. In industry we will folow industrial approach.
    }


})

export const upload = multer(
    { 
        // storage: storage 
        storage, 
        // Since we are in ES6, we have this leverage that if the key and value have same name then we can write any one of them.
    }
)