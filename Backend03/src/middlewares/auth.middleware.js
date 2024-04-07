// The strategy we will follow is we will verify the "accessToken" user has is same as stored in database, then we will add a "user" object in "req and res" and then we can use it anywhere.
// Now, how can we get "accessToken". If you remember we had "cookies" and in "cookies" we have sent "accessToken" as a response so we can use that.
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        // Here we are trying to get token either from "cookies" or from "headers". We are using headers because in mobile application we have "headers not cookies" and "token" is stored under the value "Authorization". We have used ".replace()" method to replace "Bearer " with an empty string because every token comes with a "Bearer " prefix with it in mobile apps as we have discussed in Notes.txt.

        // console.log("Access Token: ", accessToken);
        
        // If we don't get token we will throw an error.
        if(!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        // Now if we have token then we need to decode it because token is in coded form(set of random characters).
        // To decode it we will use ".verify" method by jwt. It accepts two arguments 1) token to be decoded  2) secert Key
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // This decoded token will have all the information which we have sent through it while generating it.
        // We can see all the fields which we have sent through token in "user.model.js" file under "generateAccessToken()".
        // console.log("decoded token: ", decodedToken);
        

        // Now we can use "_id" from the decoded token to search user in database and log out.
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        // console.log("User in middleware", user);
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }
    
        // Now we know we have "user" with the required details. So we can add new "user" object to "req".
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token")
    }
})

