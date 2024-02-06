import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Comment } from './../models/comment.model.js';
import { User } from "../models/user.model.js"


// To toggle video like follow the given steps:
// REMEMBER: This controller is for toggle video like means we have to write functionality for adding a like to a video and removing a like from video.
// 1) Get the id of video to be liked.
// 2) Get the id of user who has to like.
// 3) Search in Like model for videoId and userId. If got, then delete remove like otherwise create a new like with videId and userId.
/***The logic behind this is, user will only click the like button to like or dislike the video. If, user clicks the like button then first we need to search for his like on that video in database because user will click button second time only to dislike a video. So, if we found user like details we have to remove it because user wants to dislike a video. If we didn't found user details in database then it means user has clicked like button first time which means he wants like the video. So we have to create a like in database for that user.***/
// 4) Return created or removed like as response otherwise throw an error.
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    const userId = req.user?._id
    try {
        const query = {
            video: videoId,
            likedBy: userId
        }
        const videoLikeDetails = await Like.findOne(query)
        if (!videoLikeDetails) {
            const createVideoLike = await Like.create(query)
            if (!createVideoLike) throw new ApiError(400, "Error occured while liking this video")

            return res
                .status(200)
                .json(
                    new ApiResponse(200, createVideoLike, "Video liked successfully")
                )
        } else {
            const removeVideoLike = await Like.findOneAndDelete(query)
            if (!removeVideoLike) throw new ApiError(400, "Error occured while disliking this video")

            return res
                .status(200)
                .json(
                    new ApiResponse(200, removeVideoLike, "Video disliked successfully")
                )
        }
    } catch (error) {
        console.log(error.message);
        throw new ApiError(400, "Error in managing video like")
    }
})

// To toggle comments like we need to follow the given steps:
// The steps are same are as above.
// In the place of video we have to use comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user?._id
    //TODO: toggle like on comment
    try {
        const query = {
            comment: commentId,
            likedBy: userId
        }
        const commentLikeDetails = await Like.findOne(query)
        if (!commentLikeDetails) {
            const likeComment = await Like.create(query)
            if (!likeComment) throw new ApiError(400, "Error in liking comment")

            return res
                .status(200)
                .json(
                    new ApiResponse(200, likeComment, "Comment liked successfully")
                )
        } else {
            const removeCommentLike = await Like.findOneAndDelete(query)
            if(!removeCommentLike) throw new ApiError(400, "Error in disliking comment")

            return res
                .status(200)
                .json(
                    new ApiResponse(200, removeCommentLike, "Comment disliked successfully")
                )
        }
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error managing comment like")
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user?._id
    //TODO: toggle like on tweet
    try {
        const query = {
            tweet: tweetId,
            likedBy: userId
        }
        const tweetLikeDetails = await Like.findOne(query)
        if (!tweetLikeDetails) {
            const createTweetLike = await Like.create(query)
            if (!createTweetLike) throw new ApiError(400, "Error in liking tweet")

            return res
                .status(200)
                .json(
                    new ApiResponse(200, createTweetLike, "Tweet liked successfully")
                )
        } else {
            const removeTweetLike = await Like.findOneAndDelete(query)
            if(!removeTweetLike) throw new ApiError(400, "Error in disliking tweet")

            return res
                .status(200)
                .json(
                    new ApiResponse(200, removeTweetLike, "Tweet disliked successfully")
                )
        }
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error managing tweet like")
    }
    
})

// To get all the liked videos follow the given steps:
// 1) First we need to get the userId for which we want to see all liked videos.
// 2) Then using .find() method we can search for userId in owner field of Like model and then we will also check video field exists for the matched document or not because user can like a video, comment and tweet but we want only liked videos.
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id

    try {
        const likedVideos = await Like.find(
            {
                likedBy: userId,
                video: { $exists: true }
            }
        )
        if(!likedVideos) throw new ApiError(400, "No videos are liked by user")

        return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
        )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Cannot find user")
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}