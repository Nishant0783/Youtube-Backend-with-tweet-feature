import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';


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


export { registerUser };