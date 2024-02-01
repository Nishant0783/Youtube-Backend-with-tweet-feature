import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { getCurrentUser } from "./user.controller.js"

// To create a playlist follow the given steps:
// 1) Get the name and description of the playlist from req.body
// 2) Get the userId from req.user
// 3) Create new playlist object and save it to database.
// 4) Return created playlist otherwise an error.
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user?._id
    //TODO: create playlist
    try {
        const playlist = await Playlist.create(
            {
                name,
                description,
                owner: new mongoose.Types.ObjectId(userId)
            }
        )
        if (!playlist) throw new ApiError(400, "Playlist can't be created")

        return res
            .status(200)
            .json(
                new ApiResponse(200, playlist, "Playlist created successfully")
            )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error creating playlist")
    }

})


// To get user playlists we need to follow some steps:
// 1) Get user id from params.
// 2) Search in Playlist model in the owner field for the userId.
// 3) Get all the playlist related to that userId and return it as response otherwise throw an error.
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    try {
        const user = await Playlist.find({ owner: userId });
        if (!user) throw new ApiError(400, "User not found")

        const playlist = await Playlist.find({ owner: userId })
        if (!playlist || playlist.length == 0) throw new ApiError(400, "No playlist found")

        return res
            .status(200)
            .json(
                new ApiResponse(200, playlist, "Playlist fetched successfully")
            )

    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error getting your playlist")
    }
})


// To get playlist by id we need to follow some steps:
// 1) Get the id of playlist from params
// 2) Search in database for playlist id.
// 3) If playlist found return it as response otherwise throw an error.
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    try {
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) throw new ApiError(400, "Playlist not found")

        return res
            .status(200)
            .json(
                new ApiResponse(200, playlist, "Playlist fetched successfully")
            )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error getting playlist")
    }
})


// To add videos to playlist we need to follow some steps:
// 1) Get the id of playlist and id of video to be added from params
// 2) Search for the playlist based on playlist id and add id of video in videos field.
// 3) Return the updated playlist as response otherwise throw an error.
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    try {
        const foundPlaylist = await Playlist.findById(playlistId)
        if (!foundPlaylist) throw new ApiError(400, "Playlist not found")


        const playlist = await Playlist.updateOne(
            {
                _id: new mongoose.Types.ObjectId(playlistId)
            },
            {
                $push: {
                    videos: videoId
                }
            }
        )


        if (!playlist) throw new ApiError(400, "Video can't be added to playlist")

        return res
            .status(200)
            .json(
                new ApiResponse(200, playlist, "Video added successfully")
            )
    } catch (error) {
        console.log(error.messsage)
        throw new ApiError(400, "Error adding video to playlist")
    }
})


// To delete a video from a palylist we need to follow some steps:
// 1) Get the id of playlist and video from params.
// 2) Find the palyist by it's id in database and pull the video from the videos field using video id.
// 3) Return the updated playlist as response otherwise throw an error.
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    try {
        const playlist = await Playlist.updateOne(
            {
                _id: new mongoose.Types.ObjectId(playlistId)
            },
            {
                $pull: {
                    videos: new mongoose.Types.ObjectId(videoId)
                }
            },

        )
        if (!playlist) throw new ApiError(400, "Video can't be deleted")

        return res
            .status(200)
            .json(
                new ApiResponse(200, playlist, "Video rmeoved successfully")
            )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error removing video from playlist")
    }

})


// To delete a playlist follwo the given steps:
// 1) Get the id of the playlist from req.params.
// 2) Find that playlist in database and delete that playlist
// 3) Return the deleted playlist as response otherwise throw an error.
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    try {
        const playlist = await Playlist.findByIdAndDelete(playlistId)
        if (!playlist) throw new ApiError(400, "Error deleting playlist")

        return res
            .status(200)
            .json(
                new ApiResponse(200, playlist, "Playlist deleted successfully")
            )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error deleting playlist")
    }
})


// To update an playlist follow the given steps:
// 1) Get the id of playlist to updated from params.
// 2) Get the name or description to be updated from body.
// 3) Find playlist in database and updated the required fields.
// 4) Return updated playlist as resposne otherwise throw an error.
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!(name || description)) throw new ApiError(400, "Name or Description is required")
    //TODO: update playlist
    try {
        const playlist = await Playlist.findByIdAndUpdate(playlistId,
            {
                name,
                description
            },
            {
                new: true
            }
        )
        if(!playlist) throw new ApiError(400, "Playlist can't be updated")

        return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist updated successfully")
        )
    } catch (error) {
        console.timeLog(error.message)
        throw new ApiError(400, "Error updating playlist")
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}