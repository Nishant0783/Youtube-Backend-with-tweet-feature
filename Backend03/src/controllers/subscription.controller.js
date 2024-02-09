import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// To toggle subscription we need to follow same steps as we have done in toggle like:
// 1) First we will find in subscription model that is there any document with thgat channelId and userId. If found then we will delete that document from the database otherwise we will add a new document.
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user?._id
    // TODO: toggle subscription
    try {
        const query = {
            subscriber: userId,
            channel: channelId
        }
        const foundChannel = await Subscription.findOne(query)

        if (!foundChannel) {
            const createSubscription = await Subscription.create(query)
            if (!createSubscription) throw new ApiError(400, "Error in subscribing channel")

            return res
                .status(200)
                .json(
                    new ApiResponse(200, createSubscription, "Channel Subscribed successfully")
                )
        } else {
            const removeSubscription = await Subscription.findOneAndDelete(query)
            if (!removeSubscription) throw new ApiError(400, "Error in cancelling subscription")

            return res
                .status(200)
                .json(
                    new ApiResponse(200, removeSubscription, "Channel Unsubscribed successfully")
                )
        }

    } catch (error) {
        console.log(error.message);
        throw new ApiError(400, "Error in managing subscription")
    }
})

// controller to return subscriber list of a channel
// The logic to get the subscriber list is same as the logic to get liked videos of a user.
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { subscriberId } = req.params
    try {
        const allSubscribers = await Subscription.find({
            channel: new mongoose.Types.ObjectId(subscriberId)
        })
        if (!allSubscribers || allSubscribers.length == 0) throw new ApiError(400, "No subscriber found")
        console.log("All Subscribers:  ", allSubscribers)
        return res
            .status(200)
            .json(
                new ApiResponse(200, allSubscribers, "Subscribers fetched successfully")
            )

    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error getting subscribers")
    }
})

// controller to return channel list to w) hich user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res=> {
    const { subscriberId } = req.params
    const { channelId } = req.params
    try {
        const subscribedChannels = await Subscription.find(
            {
                subscriber: new mongoose.Types.ObjectId(channelId)
            }
        )
        if(!subscribedChannels || subscribedChannels.length == 0) throw new ApiError(400, "No channels are subscribed")

        return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
        )
        
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error getting subscribed channels")
    }

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}