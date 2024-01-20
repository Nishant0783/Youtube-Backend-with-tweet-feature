import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken';


/***NOTE: Come to this part in while making "loginUser" method ***/
// This is a utility method we have made to generate access and refresh token. We will use this method in Step4) of login user.
// Now, let's understand this method:-
// 1) This method accept a paramter which is "userId". Now question is how do we know we have id or not? 
// ---> The answer is since this method is used in Step4) and in earlier steps we have validated that we will have a user, thats why we are using userId.
// 2) First we have to find the user based on "id".
// 3) Then we will generate an access token and refresh token by using methods that we created in user.model.js file.
// 4) We know that once refresh token is generared  we need to save it in database. So first we create a field in database in user model using "user.refreshToken" and assign "refreshToken" to it.
// 5) To save we will use ".save()" method of mongoose and since it can be time consuming process so using "await". Now, what is "{ validateBeforeSave: false }"? Since , the ".save()" method re-validate the whole model before saving it to database. Re-validation means it will check all the required fields are given or not, but here we are only adding a new field which is "refreshToken" so saving will give error. Hence { validateBeforeSave: false } is used to save without any revalidation.
// 6) Then at last, we need to send the access and token with the cookies to user so we need to have them. Therefore, we will return them, from this method.
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
    console.log(res.body);

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
    import { jwt } from 'jsonwebtoken';


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
    // To get the access of data we use "req.body" similarly to get access of files we have "req.files". "files" is not provided by express it is added on "request(req)" by middleware(multer).
    // ".files" will respond us many options but we need one option which has name same as our file name(here image name). Since, we want "avatar" image so it will have an option with name "avatar". By the way this is the same name which we have given in "user.routes.js" while configuring multer by name "upload".
    // This "avatar" has many arrays inside it. We need first one so we will use "avatar[0]" and we need "path" property from it. We will use "avatar[0].path".

    // const avatarLocalPath = req.files.avatar[0].path;

    // This is good, but one corner case is missing which is suppose if we don't have ".avatar" option, it can happen because ".avatar" is the name which we have configured in other file which is in routes file and here we can have a typo in writing name, or suppose if we don't have ".path" property on our ".avatar".
    // So, to handle this corner case we will use "conditional chaining(?.)" means before chaining we will check if that property exists or not.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // Here is a little bug, let's understand this: First we are checking do we have "req.files" then we are checking do we have "coverImage" array or not then we are checking for "path". And, later on in code where we are creating entry of data in database checking that if we have "coverImage.url" then save it or if we don't have url then leave it empty. But the point to think here is that: SINCE COVERIMAGE IS NOT AN MANDATORY FIELD, SO WE CAN LEAVE IT EMPTY AND EMPTY MEANS "UNDEFINED" AND THE DATABASE WILL THROW AN ERROR "Cannot read properties of undefined" because in we are checking for "coverImage.url" and the vlaue of "coverImage" is "undefined" so database will go for checking the "url" value for an undefined which will make database to throw error. To solve this error we can use classical "if" statement  or there is an addvanced JS solution using "conditional chaining".
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
                    // The data we need to send is given by name "user" and the fields we need to send are "loggedInUser", "accessToke", "refreshToken".

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
// ANSWER: If we have something in "request" through which we can the currently logged in user details then we can do. Now by default express does not provide any thing to do this. We know that if express does not provide required things in "request or response object" then we can use a middleware to do so. Like we did earlier when we don't have access to "files" we used to "multer" which added a files field in "req and res", similarly for cookies we used "cokie-parser". So, inject something in "req and res object" we have to use a middleware. But there areno predefined middleware, So, we will design our own middleware by name "auth.middleware.js" in "middlewares" folder.
const logoutUser = asyncHandler(async (req, res) => {
    // Now we can make a database call to clear the refreshToken by using "_id" getting from "req.user".
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
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
        .json(200, req.user, "current user fetched successfully")
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
                fullName,  // Using shortform here it actually means "fullName: fullName" but we know that in ES6 when "key" and "value" have name then we can write any one of them.
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

   
    const coverImage = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
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


export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage };