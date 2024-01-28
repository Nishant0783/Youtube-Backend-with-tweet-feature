import mongoose, { isValidObjectId, mongo } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
// import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// To create a tweet we need to follow some steps:
// 1) Get the id of user who wants to create tweet from req.user.
// 2) Get the content of the tweet from req.body.
// 3) Create a new tweet document and save it in database.
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    try {
        const userId = req.user?._id

        const { tweetContent } = req.body

        if (!tweetContent) throw new ApiError(400, "Tweet is required")
        const tweet = await Tweet.create(
            {
                content: tweetContent,
                owner: new mongoose.Types.ObjectId(userId)
            }
        )
        if (!tweet) throw new ApiError(400, "Error creating tweet")
        return res
            .status(200)
            .json(
                new ApiResponse(200, tweet, "Tweet created successfully")
            )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error creating tweet")
    }
})


// To get the tweets by a user we need to follow some steps:
// 1) Get the id of the user from req.user.
// 2) Using aggregation pipeline match the userId with onwer filed and apply pagination stages.
// 3) Return the fetched comments as a succesfull response otherwise throw an error.
const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    try {
        const userId = req.user?._id
        const { page = 1, limit = 10 } = req.query

        const tweets = await Tweet.aggregate(
            [
                {
                    $match: {
                        owner: userId
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: parseInt(limit)
                }
            ]
        )
        if (!tweets) throw new ApiError(400, "Error getting tweets")

        return res
            .status(200)
            .json(
                new ApiResponse(200, tweets, "Tweets fetched successfully")
            )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Cannot fetch comments")
    }
})


// To update a tweet we need to follow some steps:
// 1) Get the id of tweet to be updated from params.
// 2) Get the updated tweet from body.
// 3) Find the tweet based on tweeet id and update it.
// 4) Return the updated tweet otherwise throw error.

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const userId = req.user?._id
    
    const { newTweet } = req.body
    if (!newTweet) throw new ApiError(400, "Tweet is required")

    try {
        const user = await Tweet.find(
            {
                owner: new mongoose.Types.ObjectId(userId)
            }
        );
        if(!user) throw new ApiError(400, "User not found")
        const tweet = await Tweet.findByIdAndUpdate(tweetId,
            {
                content: newTweet
            },
            {
                new: true
            }
        )
      
       
        if(!tweet) throw new ApiError(400, "Cannot find tweet")

        return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "Tweet updated successfully")
        )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error updating tweet")
    }

})


// To delete the tweets we need to follow some steps:
// Get the id of the tweet from params.
// Find the tweet in database and delete the whole document.
// Return the whole deleted document as a result, otherwise throw an error.
const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    try {
        const { tweetId } = req.params
        const userId = req.user?._id
        const user = await Tweet.find(
            {
                owner: new mongoose.Types.ObjectId(userId)
            }
        );
        if(!user) throw new ApiError(400, "User not found")
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
        if (!deletedTweet) throw new ApiError(400, "Tweet cannot be deleted")

        return res
            .status(200)
            .json(
                new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
            )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error deleting tweet")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}