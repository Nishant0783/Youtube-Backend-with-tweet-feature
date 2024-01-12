import {Router} from 'express';
import { registerUser } from '../controllers/user.controller.js';

const router = Router();

// When user will go to "/users" route then controll of program will come here and here we will define the functionality.

router.route("/register").post(registerUser);

// Now the confusion is, in app.js we have defined when user go to "/users" then the flow of program will jump to "userRouter" file and here we have defined a new route which is "/register" and when user go to this route then POST method is activated and flow jumps to "registerUser()" method. So, the confusion is where we will finally land and what will be the url of the webpage.
// The answer is the route we have defined in app.js acts as a prefix to the routes we are defining here.
// For eg: In app.js we have "/users" and here we have "/register". The url will be: "http://localhost3000/users/register". We will land to "registerUser()" method.
// For eg: In app.js we have "/users" and here we have another route which is "/login". The url will be: "http://localhost3000/users/login".

// Since we updated "/user" route so final url will be: 
// "http://localhost3000/ap/v1/users/register" or "http://localhost3000/ap/v1/users/login"





export default router;