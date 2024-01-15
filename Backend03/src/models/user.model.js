import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';

// We are using bcrypt package to encrypt our passwords.
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    }, {
    timestamps: true
}
);

// To encrypt passwords we need a middleware providede by mongoose which is "pre".
// This middleware is used to perform some function just before perfoming some functionalti (like saving, updating, etc) related to database.
// We use "pre" middleware as a plugin.

// In "pre" middleware the first argument it accepts is the operation name before which we have to perform something.
// The operation names are predefined in mongoose and we have use them only.
// For eg: Here we have given 'save' because we want to perform something before saving the data to database.
// The second argument it accepts is the task we have to perform, inside a callback.
/***NOTE: As we listen to word callback we direclty jump to "arrow functions" but here we can't use arrow functions because they don't have access to "this" keyword. Since we have to encrypt our password so we need to have a reference to the password inside this middleware. That's why we will use normal function not arrow functions. "this" keyword will allow us to take the reference from the created schema.
*/
// The callback function is need to be async because encryption is a little long process.
// The callback should have access to next flag because once the password encryption is done then we have to pass to next middleware.

// userSchema.pre("save", async function (next) {
//     this.password = bcrypt.hash(this.password, 10);
//     next();
// });

// The above code for using "pre" is correct but we have a problem here.
/****PROBLEM: By observing code we can see that, pre middleware will work everytime the database try to execute "save" operation. Database can try to execute "save" operation whenever we change any of the field in schema like email, avatar, coverImage. Saving everytime will implement encyrption of password again and again, and we will loose the original password because, for eg: Password is --> "qwerty" ===> 1st time encyption --> "32#t@1", now suppose we changed email, then "pre" will again get executed and our password will encrypted for second time and this time our original password will not get encrypted instead encrypted password will get encrypted because it is saved in database. So, it's a problem.*/
/****SOLUTION: The solution is before executing encryption we should make a check for updation of password means if password field is modified then we have to implement encryption otherwise we have to return from the method. */

// To implement the solution we will use "isModified("field to check in string")" method of mongoose that takes field which we want to check that is modified or not, as parameter and returns a boolean value. So we will make a check if "isModified()" returns false we will pass the functionality to next middleware otherwise do the encryption and pass teh functionality to next middleware.

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()   
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});




// Now before creating a model we need to validate that the password entered by user matches with the one saved in database or not.
// This might be little confusing that why are we validating passwords here before creating model. We can do this thing in the place where we will take input from user.
// The answer to this is it totally depends but it's a good practice because this makes our code more modular as all the operations related to one schema are in one place.

// Now what is ".methods" here? ".methods" is a property which is used to add instance methods to a schema.
// What are instance? Generally, in OOPS instance means object but in mongoose instance refers to each "document" extracted from database.
// Instance methods are those which are applied on a particular instance of a model.
// They are user-defined methods. For eg: we have "isPasswordCorrect" is an instance method.
// "isPasswordCorrect" is a method which is used to check whether password entered by user matches with password saved in database.
// To do this first we pass user entered password (password) to the isPasswordCorrect() method as an argument and second we use bcrypt compare method which takes two arguments 1) user entered password(password)  2) password saved in database(this.password).
// This .compare() returns boolean value which we will return from the method.
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


// Now we will write instance methods to genreate access tokens and refresh tokens for JWT.

// 1) generateAccessToken: This will be a instance method which is used to create access token. We actually create access tokens by using jwt's ".sign()" method. It takes objects which has payloads(data) which we need to access from database, a access token secret and again an object whic has access token expiry.

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
            // Value for all the keys will be taken from database that's why we have used this keyword to take reference from database.
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expriresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};

// 2) generateRefreshToken: This token is also generated in same way.

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expriresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);

