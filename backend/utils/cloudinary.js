// this will take path of file already uploaded on localserver,
//  first upload on local server ten use this to upload on cloudinary
//  Then remove file (fs.unlink) from local server once its uploaded on cloudinary
const dotenv= require('dotenv')
dotenv.config()

const cloudinary = require('cloudinary').v2
const fs = require('fs')
// fs.unlink(filepath), to delete file, we unlink that from file system

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

exports.uploadOnCloudinary = async (localFilePath, username, customName)=>{
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, 
            {resource_type: 'auto',
             folder: `users/${username}`, // or `username` or any unique value
             public_id: customName,
             use_filename: true,
            unique_filename: false,
            
            tags: ['user-upload', username]
            } 
              //auto detect file type= video audio,etc
        )
        
        console.log("File uploaded on cloudinary: ", response.url)
        fs.unlinkSync(localFilePath)
        return response
    }
    catch(err){
        // since file is already on localserver but now could not upload on cloudinary, we should remove it from local server
        // fs.unlinkSync(localFilePath)   //unlinkSync since we want other operations to run ONLY after this happens
        console.log(err)
        return null
    }
}

exports.deleteMultipleAssets = async (publicIds)=> {
    try {
        const result = await cloudinary.api.delete_resources(publicIds, {
            invalidate: true // Invalidate CDN cached copies (optional, but recommended)
        });
        console.log('Deletion result:', result);
        return result;
    } catch (error) {
        console.error('Error deleting resources:', error);
        throw error;
    }
}

// module.exports = uploadOnCloudinary
