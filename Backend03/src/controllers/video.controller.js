import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


// This is the controller for getting all videos based on the query send by user.
// What does "query" means? "Query" means that a keyword which user will search to get list of all videos.
// There are few steps which we will follow to get all videos:
// 1) First we will get the "query" and search for it in database.
// 2) We will get the "sortBy" from the url and then using "sortBy" we will set the "sortType" so that we can get the sorted values in database.
// 3) We will use aggregation pipeline to get the data based on "query", "sortBy" and other "mongoose aggregate pagination" conditions.

const getAllVideos = asyncHandler(async (req, res) => {
    // Getting all the required values from "req.query" object.
    // console.log("request query object: ",req.query)
    const {
        page = 1, // On which page number we are on. By default value is 1.
        limit = 10, // How many documents to show on a page. By default value is 10.
        query,  // Keyword based on which searching will be started in database.
        sortBy, // Based on what field we need to sort the data. For eg: _id or date(if present).
        sortType, // What should be the sorting order "asc(ascending)" or "dsc(descending)".
        userId // Id of the user on whose video we want to watch.
    } = req.query
    // console.log("user id: ", userId);
    //***TODO: get all videos based on query, sort, pagination***//

    // To find a video based on "query" provided by user. First, we need to build the the logic.
    // The logic says a video has two parts:-  1) title    2) description   and the type of video we want is in "query", so we will give user that video which has the string passed in "query" as a part in "title" or "description". 
    // Initially we have defined an empty object "videoQuery" which will hold the result of searching in database.
    let videoQuery = {}

    // We have to approach this very logically: Here the thing is if user has provided "query" it means user needs a video with specific title or content. For eg: If we type "Javascript" in youtube search box it means we want "Javascript" related videos. Which takes us down to the conclusion that we want all the videos which have "Javascript" keyword in their "title" or "description".

    // So here we are checking that if we have "query" then we are performing an "$or" operation between "title" and "description".
    if (query) {

        videoQuery.$or = [
            {
                title: {
                    $regex: query,  // "$regex" means regular expression which is an operator which allows us to perform search in database with some set of strings. So here we are searching inside "title" field of each video which has same string as provided in "query".
                    $options: "i" // "$options" is used with regex which allows us to perform "case-insensitive" search in database. "i" represents "case-insensitive".
                }
            },
            {
                description: {
                    $regex: query,
                    $options: "i"
                }
            }
        ]
    }
    // console.log("videoQuery::: ", videoQuery)
    // console.log("videoQuery::: ", videoQuery[0].title)
    // console.log("videoQuery::: ", videoQuery[0].description)

    // The other thing we need is how we want to sort our fetched documents.
    // For that we need some options to be defined for sorting. The options are stored in "sortingOptions" object.
    // Again, if "sortBy" is given by user then it means user needs the result to be sorted on the basis of specific field and the order of sorting is defined inside "sortType" which is also given by user.
    const sortingOptions = {}
    if (sortBy) {
        // Since, "sortingOptions" is an empty object and we want a key in "sortingOptions" object which is used to store the sorting type.
        // Means we can assume that final output of "sortingOptions" onject will look like "sortingOptions{ sortType: 1 }" and "sortType" will be replaced by the actual field we want sorting on.
        // For eg: If we want sorting on "createdAt" field then sortingOptions will look like: "sortingOptions{ createdAt: 1 }" where 1 represents we want result in ascendeing order.
        sortingOptions[sortBy] = sortType == "asc" ? 1 : -1;
    }
    // console.log("Sorting Options::: ", sortingOptions)

    // In this route we are getting all the videos based on user's query and other paramteres. The most important parameters are :   
    // 1) query: The keyword user enters to search for a video.
    // 2) userId: If user enters a userId then it means that the user want to have video from a specified creator.
    /***NOTE: As in my view, searching through "userId" is not making sense because if user wants video of a specific creator then user can give creator's name. Giving "userID" is not making sense. In my opinion I think that a far more better way is search on the basis of "user's full name" or "user's username". It can be possible that maybe I am not getting the given todo in right way. But as far as my opinion I think it might be possible.***/

    // Now, first moving with the "userId". So, if we have "userId" then in "$match" stage we have to match conditonally means when "userId" is provided in query object then we have to match it with "onwer" field because data of "user" is stored in "onwer" field of "video" model, along with "videoQuery" object. For eg: If someone gives "query" as "Javascript" and "userId" as "42324#12%3423frwcsd" it means the user wants the video from this("42324#12%3423frwcsd") user about "Javascript". That's why in "$match" stage we need to have both.
    // Another case, if a user does not provide "userId" then he wants video with that specific query.
    // Last case, if user provides "userId" not any query then user wants the video from that specified user.
    // To match these conditions we need to build "if-else" statement with all these three conditons. We know that "$match" stage can accept a object. So, first we will make an empty object inside that object we will store the result from "if-else".
    /*
    let matchOptions;
    if (userId && videoQuery) {
        matchOptions = {
            ...videoQuery,
            owner: new mongoose.Types.ObjectId(userId)
        }
    }
    if (userId && !videoQuery) {
        matchOptions = {
            owner: new mongoose.Types.ObjectId(userId)
        }
    }
    if (!userId && videoQuery) {
        matchOptions = videoQuery
    }
    */
    try {
        const videosResult = await Video.aggregate(
            [
                {
                    // I am just doing a search based on "videQuery" object
                    $match: videoQuery
                    // Use this line and comment above line also uncomment above multiline comment if you want to do searching as defined in the todo
                    // $match: matchOptions
                },
                {
                    $sort: sortingOptions
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: parseInt(limit)
                }
            ]
        )
        console.log("Video result::", videosResult)
        return res
            .status(200)
            .json(
                new ApiResponse(200, videosResult, "All videos are fetched")
            );

    } catch (error) {
        throw new ApiError(500, error.message)
    }


})



// TO publish a video we need to follow some steps:
// 1) Get the data from frontend such as "title", "description", "thumbnail", "video", "userId"
// 2) Upload "video" and "thumbnail" to cloudinary and get the public url.
// 3) After successfully getting public url create a new video object with all the details and save it in database.
// 4) Return the response

const publishAVideo = asyncHandler(async (req, res) => {
    //***TODO: get video, upload to cloudinary, create video***//

    // Step 1)
    const { title, description } = req.body
    const userId = req.user?._id
    const videoFileLocalPath = req.files?.videoFile[0].path
    const thumbnaiLocalPath = req.files?.thumbnail[0].path

    if (!title || !description) {
        throw new ApiError(400, "All fields are required")
    }
    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    if (!thumbnaiLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    // Step 2)
    const videoCloudinaryPath = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnailCloudinaryPath = await uploadOnCloudinary(thumbnaiLocalPath);
    console.log("cloudinary data: ",videoCloudinaryPath)
    const videoPublicId = videoCloudinaryPath.public_id
    const thumbnailPublicId = thumbnailCloudinaryPath.public_id

    if (!videoCloudinaryPath) {
        throw new ApiError(400, "Video file is required")
    }
    if (!thumbnailCloudinaryPath) {
        throw new ApiError(400, "Thumbnail is required")
    }



    // Step 3)

    const video = await Video.create(
        {
            videoFile: videoCloudinaryPath.url,
            thumbnail: thumbnailCloudinaryPath.url,
            title,
            description,
            duration: videoCloudinaryPath.duration,
            owner: userId,
            isPublished: true,
            thumbnailPublicId: thumbnailPublicId,
            videoPublicId: videoPublicId
        },
    );


    if (!video) {
        throw new ApiError(500, "Error while uploading video")
    }


    // console.log(video)

    // Step 4)
    return res
        .status(210)
        .json(
            new ApiResponse(200, video, "Video uploaded successfully")
        )

})




// To get a video by Id we need to follow some steps: 
// 1) Get the id of video from params.
// 2) Search for video based on id in database.
// 3) If you got the video then return a successfull response otherwise an error.
const getVideoById = asyncHandler(async (req, res) => {
    // Step 1)
    const { videoId } = req.params
    //TODO: get video by id

    // Step 2)
    try {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(400, "Error getting video")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, video, "Video fetched successfully!")
            );
    } catch (error) {
        console.log(400, error.message)
        throw new ApiError(400, "Error getting video")
    }
})

// To update video details we need to follow some steps: 
// 1) Get the id of video from params.
// 2) Get the title or description from body.
// 3) If thumbnail needs to be updated get the thumbnail from file and upload it on cloudinary also delete older thumbnail from cloudinary.
// 4) Find the video in database and update the details.
// 5) If updation was successful then dend a sucessfull response otherwise an error.
const updateVideo = asyncHandler(async (req, res) => {
    try {
        // Step 1)
        const { videoId } = req.params
        //TODO: update video details like title, description, thumbnail

        // Step 2)
        const { title, description } = req.body
        const thumbnailLocalPath = req.file?.path
        if (!thumbnailLocalPath) throw new ApiError(400, "New thumbnail not found")


        const cloudinaryRes = await uploadOnCloudinary(thumbnailLocalPath)
        if (!cloudinaryRes) throw new ApiError(400, "Error uploading thumbnail to cloud")
        
        const olderThumbnail = await Video.findById(videoId)
        
       
        const olderThumbnailId = await olderThumbnail.thumbnailPublicId
        

        await deleteFromCloudinary(olderThumbnailId, "image") // Deleting older thumbnail from cloudinary
       
      

        const video = await Video.findByIdAndUpdate(videoId, {
           
                title,
                description,
                thumbnail: cloudinaryRes.url
         
        })
        if (!video) throw new ApiError(400, "Error saving thumbnail to database")
        return res
            .status(200)
            .json(
                new ApiResponse(200, video, "Updated successfully")
            )
    } catch (error) {
        console.log("Error::::", error.message)
        throw new ApiError(400, "Some error occured")
    }
});


// To deleta a video we need to follow some steps:
// 1) Get the id of video to be deleted from params
// 2) Find video in database and then delete thumbnail and video from cloudinary.
// 3) Delete video from database.
// 4) If deletion successfull, then return success response otherwise throw an error.
const deleteVideo = asyncHandler(async (req, res) => {
    // Step 1)
    const { videoId } = req.params

    //TODO: delete video 
   try {
        const video = await Video.findByIdAndDelete(videoId)
        if(!video) throw new ApiError(400, "Error deleteing video")

        const videoPublicId = await video.videoPublicId
        const thumbnailPublicId = await video.thumbnailPublicId
        const videoRes = await deleteFromCloudinary(videoPublicId, "video") // Deleting video from cloudinary
        if(videoRes.result !== 'ok') throw new ApiError(400, "Video not deleted")
        const thumbRes = await deleteFromCloudinary(thumbnailPublicId, "image") // Deleting thumbnail from cloudinary
        console.log(thumbRes)
        if(thumbRes.result !== 'ok') throw new ApiError(400, "Thumbnail not deleted")
        return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video deleted succesfully")
        )
   } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error deleting video")
   }


})

// To toggle publish status we need to follow some steps:
// 1) Get the id of video from params.
// 2) Search for the video and update isPublished status.
// 3) If successfull then return success response otherwise error.
const togglePublishStatus = asyncHandler(async (req, res) => {
    // Step 1)
    const { videoId } = req.params
    if (!videoId) throw new ApiError(400, "Video id is required")

    try {
        // Step 2)
        const video = await Video.findById(videoId)
        if (!video) throw new ApiError(400, "Video not found")
           
        // Toggling the publish status
        video.isPublished = !video.isPublished
        // saving changes to database
        const updatedVideo = await video.save({new: true})
        console.log("Updated Video: ",updatedVideo)
        if(!updatedVideo) throw new ApiError(400, "Cannot update publish status")

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedVideo, "Publish status updated successfully")
            )
    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error updating publish status")
    }


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}