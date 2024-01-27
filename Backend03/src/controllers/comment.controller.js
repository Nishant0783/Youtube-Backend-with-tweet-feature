import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// To get comments on a video we need to follow some steps:
// 1) Get the id of the video from params.
// 2) Find the video in Comment model by it's videoId using aggregation.
// 3) Add the required pagination stages.
// 4) Return thje extracted result as response
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    try {
        const comments = await Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            }, 
            {
                $skip: (page - 1) * limit
            }, 
            {
                $limit: parseInt(limit)            
            }
        ])
        if(!comments) throw new ApiError(400, "No comments")
        console.log(comments);

        return res
        .status(200)
        .json(
            new ApiResponse(200, comments, "Comments Fetched Successfully")
        )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Cannot fetch comments")
    }


})


// To add comments we need to follow some steps:
// 1) Get the id video on which we would like to add comment from params and the id of the user who is commenting from req.user.
// 2) Get the comment from frontend.
// 3) Create a new commnet document and save it to database.
const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    try {
        // Step 1)
        const { videoId } = req.params
        const userId = req.user._id
        // console.log(req.user)


        // Step 2)
        const { comment } = req.body
        if (!comment || (comment == "")) throw new ApiError(400, "Comment is required")


        // Step 3) 
        const newComment = await Comment.create({
            content: comment,
            video: videoId,
            owner: userId
        })
        if (!newComment) throw new ApiError(400, "Error uploading comment")

        return res
            .status(200)
            .json(
                new ApiResponse(200, newComment, "Comment added succesfully")
            )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error in commenting")
    }


})

// To update a comment we need to follow some steps:
// 1) Get the id of the comment from params and new comment from req.body.
// 2) Find the comment from database using id and then update it and save the updated version to database.
// 3) Return the updated document.
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    try {
        const { commentId } = req.params
        const { comment } = req.body
     

        const newComment = await Comment.findByIdAndUpdate(commentId, {
            content: comment
        },
        {
            new: true
        })

        if(!newComment) throw new ApiError(400, "Internal server Error")
        return res
        .status(200)
        .json(
            new ApiResponse(200, newComment, "Comment Updated successfully")
        )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error in editing comment")
    }
})


// To delete a comment we need to follow some steps:
// 1) Get the comment id from params.
// 2) Search for the id in database and delete that comment document.
// 3) Return the deleted comment.
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    try {
        const {commentId} = req.params
        const deletedComment = await Comment.findByIdAndDelete(commentId)
        if(!deletedComment) throw new ApiError(400, "Internal server error")

        return res
        .status(200)
        .json(
            new ApiResponse(200, deletedComment, "Comment deleted successfully")
        )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Cannot delete comment")
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}