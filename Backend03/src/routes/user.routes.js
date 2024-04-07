import {Router} from 'express';
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from '../controllers/user.controller.js';
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
// "http://localhost3000/api/v1/users/register" or "http://localhost3000/api/v1/users/login"


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
router.route("/refresh-token").post(refreshAccessToken);

// This route is responsible for changing password. To change password it is neccessary that user should be logged in so we will use "verifyJWT" middleware.
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// This route is responsible for getting current user. To get current user it is neccessary that user should be logged in so we will use "verifyJWT" middleware.
router.route("/current-user").get(verifyJWT, getCurrentUser);

// This route is responsible for updating account details. To update current user details it is neccessary that user should be logged in so we will use "verifyJWT" middleware.
// Since, we are updating a field so we will use "patch" method so that we can update the required part only not whole document.
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// This route is responsible for updating avatar. To update avatar it is neccessary that user should be logged in so we will use "verifyJWT" middleware and since to update avatar we need a file so we will also use multer middleware. The sequence of middlewares is important because we to update avatar first we need to check that user is logged in or not so the first middleware will be verifyJWT.
// Since we are expecting only one file which is avatar image so we will use "single" with "upload".
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// This route is responsible for updating cover image. To update cover image it is neccessary that user should be logged in so we will use "verifyJWT" middleware and also we will use multer middleware.
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);


// This route is responsible for getting channel profile. To get channel profile it is neccessary that user should be logged in so we will use "verifyJWT" middleware. Also for channel "username"  is required and we are taking "username" from "url" so it is neccessary to make "url" such that it can handle the "parameters".
// "/c" means "channels" just using shortform here. URL will also have "/c".
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

// This route is responsible for getting watch history. To get watch history it is neccessary that user should be logged in so we will use "verifyJWT" middleware.
router.route("/history").get(verifyJWT, getWatchHistory);


// secured routes end
export default router;
