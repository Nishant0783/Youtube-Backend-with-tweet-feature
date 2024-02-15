import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// This controller is ultimate work of aggreagtion pipeline
const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user?._id
  
  try {
    const videoData = await Video.aggregate(
      [
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "owner",
            foreignField: "channel",
            as: "totalSubscribers"
          }
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "totalLikes"
          }
        },
        {
          $group: {
            _id: null,
            TotalViews: {
              $sum: "$views"
            },
            TotalSubscribers: {
              $first: {$size: "$totalSubscribers"}
            },
            TotalVideos: {
              $sum: 1
            },
            TotalLikes: {
              $first: {$size: "$totalLikes"}
            }
          }
        },
        {
          $project: {
            _id: 0,
            TotalViews: 1,
            TotalSubscribers: 1,
            TotalVideos: 1,
            TotalLikes: 1
          }
        }
      ]
    )
        
    if (!videoData) throw new ApiError(400, "No data available")


    return res
      .status(200)
      .json(
        new ApiResponse(200, videoData, "data fetched successfully")
      )
  } catch (error) {
    console.log(error.message)
    throw new ApiError(400, "Error getting channel stats")
  }
})

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user?._id
  try {
    const allVideos = await Video.find({
      owner: new mongoose.Types.ObjectId(userId)
    }).count()

    if(!allVideos) throw new ApiError(400, "Channel not found")
    console.log(allVideos)
      
    return res
    .status(200)
    .json(
      new ApiResponse(200, allVideos, "Successfully fetched all videos")
    )
  } catch (error) {
    console.log(error.message)
    throw new ApiError(400, "Error getting channel videos")
  }
})

export {
  getChannelStats,
  getChannelVideos
}