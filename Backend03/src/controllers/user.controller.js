import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


/***NOTE: Come to this part in while making "loginUser" method ***/
// This is a utility method we have made to generate access and refresh token. We will use this method in Step4) of login user.
// Now, let's understand this method:-
// 1) This method accept a paramter which is "userId". Now question is how do we know we have id or not? 
// ---> The answer is since this method is used in Step4) and in earlier steps we have validated that we will have a user, thats why we are using userId.
// 2) First we have to find the user based on "id".
// 3) Then we will generate an access token and refresh token by using methods that we created in user.model.js file.
// 4) We know that once refresh token is generared we need to save it in database. So first we create a field in database in user model using "user.refreshToken" and assign "refreshToken" to it.
// 5) To save we will use ".save()" method of mongoose and since it can be time consuming process so using "await". Now, what is "{ validateBeforeSave: false }"? Since , the ".save()" method re-validate the whole model before saving it to database. Re-validation means it will check all the required fields are given or not, but here we are only adding a new field which is "refreshToken" so saving will give error. Hence { validateBeforeSave: false } is used to save without any revalidation.
// 6) Then at last, we need to send the access token and refresh token with the cookies to user so we need to have them. Therefore, we will return them, from this method.
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()

        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}
/******/

// const registerUser = asyncHandler( async (req, res) => {
//     res.status(200).json({
//         message: "chai aur code"
//     })
// } );
// This was the dummy code to test the API. Actual logic to register user we will write now.

// Since we are dealing with industry grade backend and till now we have made quite a no. of utility and middlewares so registering user is not as simple as just taking data from frontend and saving it to database.
// So, we will follow some steps to register user:
// 1) Get user details from frontend(or postman if no frontend is there).
// 2) Validation- Checking for the fields should be non empty, email should be in proper format, any other validation.
// 3) Checking if user already exists by checking username and email.
// 4) Checking if images are uploaded and check for avatar(Because we have in our database).
// 5) Upload images to cloudinary, for which we have cloudinary utility.
// 6) Create a user object because mongoDb is nosql database and stores data in form of object, create entry in db(.create() method is used).
// 7) When we create an entry in database it returns all the fields which are saved in database as it is. Even passwords are encrypted but we don't want it to see by user again. So we will remove password and other neccessary fields like refresh tokens from response.
// 8) Check for user creation.
// 9) Return response. 

const registerUser = asyncHandler(async (req, res) => {

    // Step1) All the details we get from req.body
    const { fullName, email, username, password } = req.body;
    console.log(req.body);

    // Now here, we are expecting some images but we have not configured anything to accept files except a "multer middleware" which is only neccessary. Till now we are only dealing with data.
    // Since, multer is configured as middleware and middleware works just after the routes and before final functionality. So, we can't use apply multer here because this is just a method.
    // To implement multer we will go the route where this method is being used. So we will jump to "user.routes.js".

    // Step2) We will here only validate that no field should be empty.
    // To validate, the brute force approach is to use multiple "if" statement for each field and if any field will be empty then we will throw an error.
    // WHAT ERROR WE SHOULD THROW? Since this is an API and we have a utility which "apiErrors.js" to handle errors so we will use that utility and throw an error.

    // if(fullName === ''){
    //     throw new ApiError(400, "Full Name is required.")
    // }

    // First let us understand about "ApiError".
    // If we look into "ApiError.js" file and we see the constructor then we can observe that except "statusCode" all other fields have same default value. So, "statusCode" is expected from other source. So it becomes very important to pass "statusCode" value as 1st parameter in "ApiError" method wherever we use it. The other thing is rest of fields have default values so it is not neccessary to pass other fields but to make the error more specific we will pass the value for "message" field also as second parameter.
    // So, above "400" is "statusCode" and "Full Name is required." is "message". import { User } from './../models/user.model';
  


    // Now checking for each field using differnet "if" statement is a lenthy procedure. So we will use another approach.
    // In another approach we will use array of all the fields we want to validate for and use ".some()" method to check for empty fields. 
    /*** NOTE: To know about ".some()" method refer to "Notes.txt" ***/

    if (
        [fullName, email, username, password].some((field) => (
            field.trim() === ""
        ))
    ) {
        throw new ApiError(400, "All fields are required.")
    }

    // Step3) Now we check for existing user using username or email.
    // To do this we need to talk to database and, in whole code base the thing which can directly talk to database is "model". Since, we need to check for "user" so we will use "User" model and then use ".findOne()" method of mongoose to check for existence.
    // Since we need to check for "username" or "email" (because none of them should be already used) we will use operators provided by mongoose which returns boolean value.
    // We will use "or" operator.
    // We can use operator by using "$ + operator_name" as an array of object. Since we have to check for two values therefore there will be 2 objects in array of objects.
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }

    // Step4) To check image is uploaded and get it's path we have multer.
    // To get the access of data we use "req.body" similarly to get access of files we have "req.files". "files" is not provided by express it is added on "request(req)" object by middleware(multer).
    // ".files" will respond us with many options but we need one option which has name same as our file name(here image name). Since, we want "avatar" image so it will have an option with name "avatar". By the way this is the same name which we have given in "user.routes.js" while configuring multer by name "upload".
    // This "avatar" has many arrays inside it. We need first one so we will use "avatar[0]" and we need "path" property from it. We will use "avatar[0].path".

    // const avatarLocalPath = req.files.avatar[0].path;

    // This is good, but one corner case is missing which is suppose if we don't have ".avatar" option, it can happen because ".avatar" is the name which we have configured in other file which is in routes file and here we can have a typo in writing name, or suppose if we don't have ".path" property on our ".avatar".
    // So, to handle this corner case we will use "conditional chaining(?.)" means before chaining we will check if that property exists or not.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // Here is a little bug, let's understand this: First we are checking do we have "req.files" then we are checking do we have "coverImage" array or not then we are checking for "path". And, later on in code where we are creating entry of data in database checking that, if we have "coverImage.url" then save it, or if we don't have url then leave it empty. But the point to think here is that: SINCE COVERIMAGE IS NOT AN MANDATORY FIELD, SO WE CAN LEAVE IT EMPTY AND EMPTY MEANS "UNDEFINED" AND THE DATABASE WILL THROW AN ERROR "Cannot read properties of undefined" because in database we are checking for "coverImage.url" and the value of "coverImage" is "undefined" so database will go for checking the "url" value for an undefined which will make database to throw error. To solve this error we can use classical "if" statement or there is an addvanced JS solution using "conditional chaining".
    // In "if" statement we will check for each condition. 1) check for do we have "req.files"  2) check for "coverImage" is an array by using "isArray() method which accepts name of array return boolean value. True if passed argument is array and flase if not".  3) check for length of "coverImage" array because it can happen that we might not have any element inside array.
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    // Adavnced "conditional chaining" method:
    // const coverImageLocalPath = req.files?.coverImage?.[0].path; // Here we are checking that do we have "coverImage" array or not by placing "?" just after "coverImage".


    // Now for us, avatar is mandatory so we will check if we got path of avatar or not.
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.")
    }

    // Step5) Upload file on cloudinary. To do that we already have utility and we just have to use it.
    // Uploding a file to cloudinary is time consuming process so we will use await.
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // Since avatar is required field so we will again check that avatar is uploaded or not.

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Step6) Creating object and saving it to database using ".create()" method which accepts objects of fields which we have to same to database.

    const user = await User.create({
        fullName,
        avatar: avatar.url, // Now we see in cloudinary.js file when file successfully uploaded then it sends whole respond but we don't want to store whole response we only need to have "url" of the file. Therefore, avatar.url
        // coverImage: coverImage.url, // This is a big mistake done by freshers which is since we have not checked above that whether we do have any url for coverImage or not. And without a solid confirmation we are saving url to database. So, if url will not be present then database will throw an error.
        // We have used same syntax for avatar because we have prior checks for url of avatar.
        // To solve this mistake we do "conditional chaining with or operator". In or part we give if no url is present then leave that field empty.
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // Step7) To remove password and other fields from response. For this first we need to make sure that the user is created and then using mongoose ".select()" we will remove the fields by passing "the name of non-required fields with a negative sign and a space between each field inside a string".
    // To get full proof that user has been create d or not, we will search the user by it's id if we got then congratulations otherwise error.

    const createdUser = await User.findById(user._id).select("-password -refreshToken");


    // Step8 and 9) Checking user creation by analysing "createdUser".
    // If user is not created we will throw an error.
    // Sending response is a task of responsibility. So we will send response in particular format hence we will use "ApiResponse.js" utility.
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );

});


// Once the user is registered successfully, then have to make user logged in.
// Again, for production grade backend we have to follow for some steps which are: 
// 1) Get the login data from forntend. Login can be based on "username" or "email".
// 2) Find the user in database.
// 3) Check the password
// 4) If the data is correct, then generate a access token and refresh token for user.
// 5) Send the access and refresh tokens in the form of secure cookie to user.

const loginUser = asyncHandler(async (req, res) => {

    // Step1) 
    const { username, email, password } = req.body;
    // Here we need to make a check that user should have entered username or email
    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required");
    }

    // Step2) Now, since we accepting username or email from user so we have to find in database on the basis of username or email hence we will use mongodb operators(Here we will use "or" operator).

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });
    // If user is not present
    if (!user) {
        throw new ApiError(404, "User does not exist.")
    }

    // Step3) To check password we have already made a method in user.model.js file which uses bcrypt and accepts the user entered password and returns a boolean value.

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    };

    // Step4) We will use above defined method to generate tokens and save refresh token to database.
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // console.log(user);

    // Now, we have a "user"(which we have found on the basis of username or email above in the code) which has all the fields including some unwanted fileds such as "password" and "refreshToken" which we don't want to send to user.
    // To remove these unwanted fields we will make a database call using ".select()" method which allows us to exclude the other non-required fields.
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // console.log("logged in user: ", loggedInUser);

    // Step5) To send cookies using "cookie-parser package"  we need to design some options.
    const options = {
        // By default, we don't give options then in frontend anybody can modify the cookies but using these options we set that the cookies are modifiable only on server.
        httpOnly: true,
        secure: true
    }
    // Now we will send cookies as a respons using ".cookie()" method provided by "cookie-parser" which accepts three paramters 1) "Key: Name of the cookie"  2) "Value: Value of cookie"  3) "options".
    // For each cookie we need to have a separate ".cookie()" method.

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, // statusCode
                // Below given whole object is "data". We can check the structure of "ApiResponse.js" file in utility folder to understand it.
                {
                    // The data we need to send is given by name "user" and the fields we need to send are "loggedInUser", "accessToken", "refreshToken".

                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully" // message
            )
        )
});

// Now after logging in user successfully we have to logout the user.
// To logout user we have to do two things only:
// 1) Clear all the cookies.
// 2) Clear refreshToken for it. Because when user will again login next time new tokens will be generated.

// BIG PROBLEM: We know the strategy how to make a user logout. But to make a logout we need to have it's email or username or _id so we can query database and clear all the above mentioned things. But here, in "logoutUser()" method we don't have access to any of these. Earlier in above method we had a form where user submits details and on the basis of that detail we can find the user. But here we don't have the leverage. The problem is "HOW WE CAN GET THE ID OF USER TO BE LOGGED OUT?"
// ANSWER: If we have something in "request" through which we can access the currently logged in user details then we can do. Now by default express does not provide any thing to do this. We know that if express does not provide required things in "request or response object" then we can use a middleware to do so. Like we did earlier when we don't have access to "files" we used to "multer" which added a files field in "req and res", similarly for cookies we used "cokie-parser". So, inject something in "req and res object" we have to use a middleware. But there are no predefined middleware, So, we will design our own middleware by name "auth.middleware.js" in "middlewares" folder.
const logoutUser = asyncHandler(async (req, res) => {
    // Now we can make a database call to clear the refreshToken by using "_id" getting from "req.user".
    await User.findByIdAndUpdate(
        req.user._id,
        {
            // Here we are clearing the value of "refreshToken" by using "$set" operator by setting the value of that field to undefind. This is not a good approach to follow thatswhy we are using "$unset" operator to unset some fileds value.  
            // $set: {
            //     refreshToken: undefined
            // },
            // In mongoose we have an operator "$unset" which is used to clear the value inside the given field. We need to set the value of that field to 1.
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true // Using this so that we get new updated value of user in response object.
        }
    )

    // Now we have to clear cookies. To clear them we have "clearCookies()" method given by "cookie-parser".
    const options = {
        // By default, we don't give options then in frontend anybody can modify the cookies but using these options we set that the cookies are modifiable only on server.
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )

})


// Now we know that "accessTokens" are short lived and "refreshTokens" are long lived. So, the strategy is to make user hit an endpoint when "accessToken" has expired and then by using that endpoint we can know that user we want to generate new access token for is validated or not because we have user's information in cookies. Once, user is validated then we can generate a new "accessToken" and for more security a new "refreshToken" also.
// Here we are making a controller which will handle that endpoint. The endpoint is defined in "user.routes.js" file

const refreshAccessToken = asyncHandler(async (req, res) => {
    // First we need to get the old refresh token which will be inside cookies.
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        // Now we need to have the decoded information so we will use jwt ".verify()" method.
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // In this decoded token we will have an "_id" of the user. With that "_id" we can find user in database.
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        // Now we have two tokens:  1) incomingRefreshToken - which was stored in cookies   2) user.refreshToken - which is stored in database.
        // If both the tokens are same then we can grant premission to update the access token otherwise we will throw an error.
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        // Since now user is validated so we can generate new "access and refresh tokens"
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        // Then we can send the newly generated tokens to cookies as a response.
        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


// Next controller is for "updating password". This controller has logic to update password of logged in user.
// To update password we need to follow some steps: 
// 1) For updating password first we need to validate user by making him to enter "old password". /***QUESTION: If user is already logged in then why we need to validate him by making him enter his old password? ***/ 
/***ANSWER: In real world, it can happen that any other person from our family is using our id, so to confirm that actual user is changing password, we do this check.***/
// 2) We also need to have "new password". So, we will "req.body" to get new and old passwords.
// 3) We need to get the "user details" whose password is being modified to validate "old password".
// 4) Then we need to validate that the old password is correct or not. If not then throw error
// 5) We can set the "user.password" to "new password".
// 6) Then "save" the password in database.

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // Step1 and 2)
    const { oldPassword, newPassword } = req.body;

    // Step3) Again, to get the user details we need to have something like "username or id or email" to find user from database. So, to solve this problem we have made an middleware "auth.middleware.js" which will inject "user" details in "req and res objects". So, we will grab "_id" from there and search for user in database.
    const user = await User.findById(req.user?._id);

    // Step4) To validate "oldPassword" with the one saved in database we already have a method "isPasswordCorrect()" which will return a boolean value. This method is in "user.model.js" which accepts a "password" as an argument.
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    // Step5) 
    user.password = newPassword;
    // At this point, the "pre" hook defined in "user.model.js" will work and the new passowrd will be hasheed because we have defined logic for hashing in there.

    // Step6) 
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

})


// Next controller is getting current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched successfully")
        )
});


// Next controller is for updating accout details of user. These includes text based details not the deatils which uses files like "avatar or coverImage".
/************GOOD PRACTICE: It is advisable to make seperate controller for updating new text based details and files based details. *************/
const updateAccountDetails = asyncHandler(async (req, res) => {
    // Suppose I need to update fullName and email
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    // To update details we need to get the user and update it.
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        // To update the required details we can use "$set" operator provided by mongoose
        {
            $set: {
                fullName,  // Using shortform here, it actually means "fullName: fullName" but we know that in ES6 when "key" and "value" have name then we can write any one of them.
                email  // "email: email"
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Account details updated successfully"
            )
        )
})


// Next controller is for updating files based details.

// First we will update "avatar"
const updateUserAvatar = asyncHandler(async (req, res) => {
    // To update an image we need to get the image. We can get the image by using "multer middleware" which has injected "files" properties in "req and res" objects.
    // "files" is used because earlier we are getting more than one file("avatar", "coverImage"), but this time we are getting only one file which is "avatar" image so we will use "req.file" not "req.files".
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // Now after getting avatar file we have to upload it to "cloudinary". To do so we will use "uploadOnCloudinary()" utility.
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Error while uploading avatar on cloud")
    }

    // "uploadOnCloudinary()" will give us a object which is stored in "avatar". So, we need to extract the "url" from "avatar" object and update it in database.
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, user, "Avatar updated successfully"
        )
    )
})


// Now we will update "coverImage"
const updateUserCoverImage = asyncHandler(async (req, res) => {
    
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

   
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage) {
        throw new ApiError(400, "Error while uploading Cover image on cloud")
    }

 
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, user, "Cover image updated successfully"
        )
    )
})


// Now in this controller we will work with mongoDB aggregation pipeline. This controller is for getting channel profile.

const getUserChannelProfile = asyncHandler(async(req, res) => {
    // As we know that in youtube when we go to any channel it's is available on url, so we can get username from url using "req.params".
    const {username} = req.params;
    if(!username?.trim()){
        throw new ApiError(400, "username is missing");
    }

    // Now we will use aggregation to get the subscriber count and count of channels users has subscribed to.
    const channel = await User.aggregate([
        // First pipeline which is to filter the data. So we will use "$match" operator which will -give us all the documents which will have same conditions as mentioned in "$match" operator. Since, at first we need to the document of the user for which we need to calculate subscriber count and count of channel user has subscribed to. We can get that on basis of "username" which we got from url.
        {
            $match: {
                username: username?.toLowerCase()
            }
        },

        // In second stage we will tell the database that in which model it should look for the data of the channel's subscribers. To implement this we will use "$lookup" operator.
        {
            $lookup: {
                // 1) from: It is used to tell the mongoDB that from which model we have to look to.
                from: "subscriptions", // Actually the model name we have given in "subscriptions.model.js" file is "Subscription" but we know that mongo internally converts the name so we are using "subscriptions".

                // 2) localField: It is used to tell the data we are extracting from another model, by what name it should be visible in our current model. For eg: Currently we are in "User" model and we are extracting data from "Subscription" model. So, in local field we will give that name by which the extracted data is visible in "User" model.
                localField: "_id",

                // 3) foreignField: It is used to tell the data we are extracting by name it is in the model from where data is being extracted. For eg: Currently we are in "User" model and getting data from "Subscription" model, so by what name the required data is in "Subscription" model.
                foreignField: "channel",

                // 4) as: We know that each operator in each stage returns an array. So here we give then name of array by which it should be showed in our document.
                as: "subscribers"
            }
            // Summary is: The database will look in "subscriptions" model and will create a field "_id" or modify it if already exist in "User" model and assign it the value which will be inside "channel" field in "subscriptions" model, and we know that an array will bew returned so the name of the array returned will be "subscribers" in which each element will behave as set of objects of the data being extracted.
        },

        // In third stage we will tell the database in which model it should look for the data of the channels user have subscribed to. To implement this we will use "$lookup" operator.
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },

        // Till now, we have only collected the data from differnet models, but now we have to add the data to our current model("User") so will use "$addFields" operator to add.
        // What data we need to add to the user model? We need to add the actual number of subscribers taht user has and number of channels users has subscribed to.
        // How to get the actual numbers? Since we know that the above each stage will return an array. We have two arrays:-    1) "subscribers": which has the documents of all the subscribers of that user.   2) "sunscriberTo": which has the documents of the channels that users have subscribed to. 
        // Now to get the count we can simply get the size of both the arrays.
        /***REMEMBER: "subscribers array and subscribedTo array" are now new fields in so we will treat them like a field in next stage. Treating them like a field means we will use "$" sign before accessing them. */
        {
            $addFields: {
                // "subscriberCount" is the name of the field which will tell us the count of subscribers
                subscribersCount: {
                    // "$size" is the operator used to calculate the size of the array
                    $size: "$subscribers"  // "subscribers" is the array whose size needs to be calculated and since it's a field so we are using "$" as a prefix.
                },
                // "channelsSubscribedTo" is the name of the field which will tell us the count of channels user has subscribed to.
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                // Now the another thing which we commonly see in youtube is when a user is subscribed to a channel then the "subscribe button becomes greyish and the text says 'subscribed'" and when user is not subscribed to channel then "subscribe button becomes red and the text says 'subscribe'". So, the high level thing is that we need to have a field which accepts a boolean value for whether that is subscribed or not by the user.
                /****REMEMBER: A channel is also a user which can get subscribed and can sunscribe to another chanel(user).****/
                // Let's say the field is "isSubscribed" and the field will be in "User" model.
                // Since we are in "$addField" stage so we can create a new field here and it will get added to our model.
                isSubscribed: {
                    // To decide it's boolean value we need to have a condition. The condition in mongoDb is defined by "$cond" operator.
                    $cond: {
                        // What conditon we need to have? If we talk about a user which is a "channel", the data of it's all subscribers will be in "subscribers" array which is also a field in "User" model and each element in that array will be the data of each subscriber. Now if we talk about a user which is a normal user if he is subscribed to a channel then the, "subscribers" array for that channel should have his data. So we can make a check that "if the subscribers array has the data for that particular user then 'isSubscribed' will be true otherwise it will be false". 
                        // Now to make a check we need to understand more about "subscribers" array. As we know that each element in "subscribers" array is the data of each "subscriber" which refers to "subscriber" model defined in "subscriber.model.js" file. So we can conclude that we can access the "subscriber" model by using "subscribers.subscriber".

                        // In mongoDB to define a condition we use "if-then-else" statement where "if contains the condition to check on", "then contains the operation to be performed when condition is true", and "else contains the operation to be performed when condition is false".

                        // Inside "if" we need to check that normal user or just user is there in subscribers array or not. So to check something in an array or object we use "$in" operator.
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        // In this condition we are getting the "_id" of the normal user or just user and checking that the "_id" is there in "subscriber model which is inside subscribers array".
                        // If _id is there,
                        then: true, // isSubscribed => true
                        // If _id is not there,
                        else: false, // isSubscribed => false
                    } 
                }

               
            }
        },
        
         // Now in the fifth stage we have to do is that we have send the selected data means I don't have to send all data inside "User" model but some selected fields. To do this we use "$project" operator and we will write the names of all the fields which we want to send and mark them 1.
         {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            } 
         }


    ]);


    // If channel is not there then we have throw an error. We can check the length because "aggregate" returns us an array and so is channel.
    if(!channel?.length){
        throw new ApiError(404, "Channel does not exists");
    };

 
    // After printing the "channel" array we will find out that only first element is usefull which is an object for us so we can send that as a response.
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
})


// Next route is for getting watch history of user. This is a complex one where we will use nested pipelines.
// To get watch history we need to understand our two schemas 1) "user" schema     2) "video" schema
// 1) user schema:- In user schema we have a field "watchHistory" which is an array for storing all the videos which has been watched by that user. So, to store videos we will store "id" of each video through which we can refer to it's video model.
// 2) video schema:- In video schema we have a field "owner" which tells which the creator of that video which is also a user.
// So, the thing here is, both the schemas are cross connecting means "user" schema needs "video" schema and each video in "video" schema needs "user" data.
// So how will we proceed to implement this? 
// ANSWER: 1) first we will get the "id" of the user whose watch history we need to get. Using "id".
// 2) Using "id" we will look up for the videos in "videos" model.
// 3) Using nested pipeline we will look up for "owner" in "user" model.

const getWatchHistory = asyncHandler(async(req, res)=> {
    /****NOTE: When we write "req.user._id" what do we get? The answer to this what most people give is we get "mongoDB id" but actually the mongoDB id is in form "ObjectID('824852632$dfiyw2121451')" and by using "req.user._id" we only get ('824852632$dfiyw2121451') which is a string. So when we write "req.user._id" we get a "string" not a mongoDB id. MongoDB id is whole "ObjectID('824852632$dfiyw2121451')".While using mongoose, it behind the scenes convert it to mongoDB id automatically.****/
    // While using mongoDB aggregation pipeline which is a core concept of mongoDB, mongoose has no role so we need to convert the string which we get from "req.user._id" to mongoDB id manually by using a method which is provided by mongoose. 
    /**REMEMBER: Mongoose has no role in aggregation pipeline means no behind the scenes working of mongoose works here. We have to define everything. Thatswhy for conerting "string" to "mongoDB id" we are using mongoose method.****/
    const user = await User.aggregate([
        {
            // Using "$match" operator to filter the "User" model based on "id" that is currently logged in.
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id) // This is how we can generate "mongoDB id" from the "string".
            }
        },
        {
            // After getting filtered data we need to look for videos in "videos" model so we will use "$lookup" at stage 2.
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                // Now the database is desingned in such a form that each user has a watch history and each video in watch history will have a onwer(user).
                // So, till now we have got the all videos watched by user but each video's "owner" field is empty. To get the "owner" field we need to integrate another pipeline inside this pipeline only. We are using nested pipeline because "owner" is inside "videos" model.
                // To implement nested pipeline we use "pipeline" as a key and pass array of other pipelines.
                pipeline: [
                    {
                        // Now to get "owner" we are looking for "users" model, but actually we are in "videos" model, in videos model "localField" will be "owner" and "foreignField" will be "_id" because we only need the id of that user and we will display the owner data under "owner" field only. We can make a new field and display there, modifying "owner" field is good approach.
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner", 
                            // Now when we are getting "owner" which is a "user" we will get all the data of the "owner" but we need only 2-3 things so we will use "$project" operator inside another nested pipeline to get neccessary data only.
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }, 

                    // Till now code is enough. But for frontend developer it will be difficult to get the data because we know tat aggregate returns an array and only the first value is useful in that array. So frontend developer has to use loops to get thet data.
                    // To make good response what we can do is we can add a field "owner" or modify it if it already exists. That "owner" field will contain the data from the first element of returned array.
                    {
                        $addFields: {
                            // Since, we need to get the first value so we can directly use "$first" operator. We will apply it to "owner" field which is an array.
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    console.log(user);


    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
    )
})


export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};