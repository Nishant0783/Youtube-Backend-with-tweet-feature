// In this file we will make a utility to upload file to cloudinar.
// The work we have to do is:
//     ---> Get file from local storage, upload it to cloudinary and then remove file from local storage because once it is uploaded to cloud then we don;'t need it in local.

import {v2 as cloudinary} from 'cloudinary';

// fs: fs is fileSystem anda we are using it to remove file from local storage.
// It is provided by nodejs.
import fs from 'fs';

// We will use "unlinkSync()" method to remove file.
// Go tho notes.txt to read more about it.

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        // Check if we don't have local file path the we will return null or a message ("Cannot find path").
        if(!localFilePath) return null

        // upload file on clodinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",  // Using this option we can give the type of resource we are uploding like image, raw. Using "auto" it will automatically detect.
        });
        // file has been uploaded successfully
        // console.log(`file uploaded on Cloudinary successfully: ${response.url}`);
        // response.url will give the public url of the uploaded file.

        // Now, since the file has been uploaded to cloudinary, so we can safely unlink the file from our local storage.
        fs.unlinkSync(localFilePath);

        // console.log(response);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath); // This operation is used to remove the file.
        // In the start of this page I have commented that we will remove file if it get's uploaded on cloud but we are removing file in catch block and the code jumps to catch block only if there is some error in try block and in try block we uploding file on cloud.
        // The question is if file is not uploaded then why are removing it here?
        // This is because there might be high chances that the file is malicious and that's why it is not uploaded to cloud. Keeping malicious file in local is suicide. Therefore, we remove file even if it is not uploaded.
        
        return null;
    }
}

// This is utility for deleting a file from cloudinary.
const deleteFromCloudinary = async (public_id, resourceType) => {
    const response = await cloudinary.uploader.destroy(public_id, {
        resource_type: resourceType
    })

    return response; 
}   

export { uploadOnCloudinary, deleteFromCloudinary };

          