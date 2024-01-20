import {Router} from 'express';
import { loginUser, logoutUser, registerUser, refreshAccessToken } from '../controllers/user.controller.js';
import { upload } from './../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router = Router();

// When user will go to "/users" route then controll of program will come here and here we will define the functionality.

// router.route("/register").post(registerUser);

// Now the confusion is, in app.js we have defined when user go to "/users" then the flow of program will jump to "userRouter" file and here we have defined a new route which is "/register" and when user go to this route then POST method is activated and flow jumps to "registerUser()" method. So, the confusion is where we will finally land and what will be the url of the webpage.
// The answer is the route we have defined in app.js acts as a prefix to the routes we are defining here.
// For eg: In app.js we have "/users" and here we have "/register". The url will be: "http://localhost3000/users/register". We will land to "registerUser()" method.
// For eg: In app.js we have "/users" and here we have another route which is "/login". The url will be: "http://localhost3000/users/login".

// Since we updated "/user" route so final url will be: 
// "http://localhost3000/ap/v1/users/register" or "http://localhost3000/ap/v1/users/login"


// Code to apply multer so that "registerUser" can work with files.
router.route("/register").post(
    // "upload" is the multer middleware which we have configured in middlewares folder.
    // ".fields()" is one of the method which we will use to upload the files.
    // ".fields()" accept an array as parameter. We will give array of objects. I have two objects because we are expecting two images one for "avatar" and other for "coverImage".
    upload.fields([
        {
            name: "avatar", // Value of name field should be in consistency with the frontend means the name we have to given to input box for taking image we have to give same name here also.
            maxCount: 1 // This is the number of files we are expecting. So for "avatar" we are expecting 1 image.
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

// Login route
router.route("/login").post(loginUser)


// secured routes start

// Now in this "logout" route we need to execute our middleware "auth.middleware.js" which has a function "verifyJwt". To execute a middleware we just need to write the name of the method of middleware which we want to execute just before we execute main "logoutUser" method.
router.route("/logout").post(verifyJWT ,logoutUser);

// This is actual endpoint where user will hit to get the new access and refresh token.
router.route("/refresh-token").post(refreshToken);

// secured routes end
export default router;
