const express = require('express')
const router = express.Router();
const cloudinary = require('cloudinary').v2
const upload = require('../middlewares/multer.middleware')
const uploadOnCloudinary = require('../utils/cloudinary').uploadOnCloudinary
const deleteMultipleAssets = require('../utils/cloudinary').deleteMultipleAssets
const fileModel = require('../models/files.model')
const authMiddleware = require('../middlewares/authValidator')
const axios = require('axios');
const folderModel = require('../models/folder.model');

router.use(express.json())
router.use(express.urlencoded({extended:true}))

// router.get('/test', authMiddleware, (req,res)=>{
//     res.send('Test done')
// })

exports.getFiles = async(req,res)=>{

    if(!req.user?.userId) return res.status(401).json({message:'UnAuthorized'})
    
    const folderId= req.query.folderId || null

    
    // now getting all the file urls uploaded by this particular userId which is logged in, got by authMiddleware
    const userFiles = await fileModel.find({
        user : req.user.userId,
        folderId
    }).sort({createdAt:-1})

    
    res.status(200).json({files: userFiles});
}

exports.upload = async (req,res)=>{
    try{

    if(!req.files || req.files.length==0){
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const files = req.files

    const folderId = req.query.folderId || null

    if(folderId){
        const folder = await folderModel.findById(folderId)
        const isOwner = folder.ownerId.toString()===req.user.userId
        const isSharedUser = folder.sharedWith.includes(req.user.userId)

        if(!isOwner && !isSharedUser){
            return res.status(403).json({success:false, message:"Not authorized to upload here"})
        }
    }
    const uploadingFiles= []
    for(const file of files){
    
    // console.log("name of file: ", file)
    const customName = `${file.originalname.split(".")[0] + Date.now()}`
    console.log("Customname: ",customName)
    const response = await uploadOnCloudinary(file.path, req.user.username, customName)
    
    // console.log(response)
  

    const newFile = {
        path: response.url,
        originalname: response.original_filename,
        user: req.user.userId ,
        //this is important as, you must be logged in to upload anything, thus it checks token through authMiddleware, only then req.user get userId

        //customName is given as public_id to cloudinary.uploader.upload
        publicId: (response.public_id.split('.').length>0)? response.public_id.split('.')[0] : response.public_id,

        folderId
    }

    uploadingFiles.push(newFile)
    }
    // console.log("Uploading Files:  ",uploadingFiles)
    
    const uploadedFiles = await fileModel.insertMany(uploadingFiles)

    console.log("Uploaded Files:  ",uploadedFiles)

    res.status(201).json({data:uploadedFiles, success:true})
}
catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ message: 'Error Uploading File' });
  }
    
    
}

// exports.uploadFileToFolder = async (req,res)=>{
//     try {
//         const {folderId} = req.params

//         if(!req.file) return res.status(404).json({success:false, message:'No file uploaded'})
//         const customName = req.file.originalname.split('.')[0] + Date.now()

//         const response = await uploadOnCloudinary(req.file.path, req.user.username, customName)
//         const newFile = await fileModel.create({
//             path: response.url,
//             originalname: response.original_filename,
//             user: req.user.userId,
//             folderId
//         })

//         res.status(201).json({success:true, data:newFile})

//     } catch (error) {
//         res.status(500).json({success:false, message:'Error Uploading file to folder'})
//     }
// }


exports.download = async(req,res)=>{
    // now we need to make sure, file downloaded by user who uploaded this
    // NOTE = authMiddleware only checks if user logged in
    
    const loggedInUserId = req.user.userId;
    const fileId = req.params.fileId

    console.log("loggedInUserId:", loggedInUserId);
console.log("fileId:", fileId);

    const file = await fileModel.findOne({
        user: loggedInUserId,
        _id: fileId
    })

    if(!file){
        return res.status(403).json({
            message:"Forbidden"
        })
    }

    if(file.path.startsWith('http')){
    // Always stream if it's a remote (Cloudinary) URL
  const response = await axios.get(file.path, { responseType: 'stream' });

  // Set filename and stream to client
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
  res.setHeader('Content-Type', response.headers['content-type'])
  response.data.pipe(res);
    }
    else {
    // ---- LOCAL FILE ----
    // If it's stored locally, just download directly
    const absolutePath = path.resolve(file.path); // ensure correct absolute path
    res.download(absolutePath);
  }
}


exports.deleteFile = async (req, res)=>{
    
    try {

    const {fileId} = req.params
    const loggedInUserId = req.user.userId

    const file = await fileModel.findById(fileId)
    if(!file) return res.status(404).json({success:false ,message:'file not found'})
    console.log("File being deleted: ", file)
    const publicId= file.publicId
    // const ext= file.path.split(".")[3]
    
    const isOwner = file.folderId?.ownerId?.toString() === loggedInUserId
    const isUploader = file.user.toString() === loggedInUserId

    if(!isOwner && !isUploader) return res.status(403).json({success:false, message:'Unauthorized to delete this file'})
    
    await fileModel.findByIdAndDelete(fileId)
    // console.log("Extension to delete:",ext)
    console.log("Deleted from database  !!!")
    console.log("Public id for delete: ",publicId)
    
    // await cloudinary.uploader.destroy(publicId, {invalidate:true})

    let cloudDeleteRes

    if(/\.(png|jpg|jpeg|avif|webp)$/i.test(file.path)){

         cloudDeleteRes= await cloudinary.uploader.destroy(publicId, {invalidate:true})
    }
    else if(/\.(mp4|webm)$/i.test(file.path)){
         cloudDeleteRes= await cloudinary.uploader.destroy(publicId, {resource_type:'video',invalidate:true})
         
        }
    else{
        cloudDelete= await cloudinary.uploader.destroy(publicId, {resource_type:'raw',invalidate:true})
        cloudDeleteRes= (cloudDelete.result=="not found")?"ok":"not deleted"

    }

    console.log("Deleted from cloudinary too  !!! ",cloudDeleteRes)

    res.status(200).json({success:true, message:`File Deleted Successfully: ${cloudDeleteRes.result}`})
        
    } catch (error) {
        res.status(500).json({success:false, message:'Error Deleting this file'})
    }
}

exports.deleteFileMany = async (req, res)=>{
    
    try {

    const files = req.body.files
    const loggedInUserId = req.user.userId

    if(!files || !Array.isArray(files) || files.length==0){
        return res.status(404).json({success:false ,message:'file(s) not found'})
    }

    const folder = await folderModel.findById(files[0].folderId)
    // console.log("File being deleted: ", file)
    
    const isOwner = folder?.ownerId?.toString() === loggedInUserId
    const approvedFiles= []
    const unapprovedFiles= []
    
    for(const file of files ){
        const isUploader = file.user.toString() === loggedInUserId
        if(!isUploader && !isOwner){
            unapprovedFiles.push(file)
        }
        else{
            approvedFiles.push(file)
        }
    }

    if(approvedFiles.length == 0) return res.status(403).json({success:false, message:'Unauthorized to delete these file(s)'})
    
    const fileIdsArray = approvedFiles.map((file)=>file._id)

    const query = { _id: {$in: fileIdsArray}}
    const resDelFromDb = await fileModel.deleteMany(query)

    // console.log("Extension to delete:",ext)
    console.log(`Deleted ${resDelFromDb.deletedCount} files from database  !!!`)

    const publicIdsArray = approvedFiles.map((file)=>file.publicId)
    const imagePublicIds= []
    const videoPublicIds= []
    const rawPublicIds= []

    // for(const file of approvedFiles){

    //     if(/\.(png|jpg|jpeg|avif|webp)$/i.test(file.path)){

    //      imagePublicIds.push(file.publicId)
    //     }
    //     else if(/\.(mp4|webm)$/i.test(file.path)){
    //         videoPublicIds.push(file.publicId)

    //         }
    //     else{
    //         rawPublicIds.push(file.publicId)
    //     }
    // }

    console.log("Public id for delete: ",publicIdsArray)
    let resDelCloudImg
    let resDelCloudVideo
    let resDelCloudRaw

    // if(imagePublicIds.length>0){
    //     resDelCloudImg= await deleteMultipleAssets(imagePublicIds)

    // }
    // if(videoPublicIds.length>0){
    //     resDelCloudVideo = await deleteMultipleAssets(videoPublicIds)
    // }
    // if(rawPublicIds.length>0){
    //     resDelCloudRaw = await deleteMultipleAssets(rawPublicIds)
    // }

    // const resDelCloud= {resDelCloudImg, resDelCloudVideo, resDelCloudRaw}
    
    const resDelCloud= await deleteMultipleAssets(publicIdsArray)
    console.log("Deleted from cloudinary too: ",resDelCloud)    

    res.status(200).json({success:true, deletedFiles:approvedFiles, undeletedFiles:unapprovedFiles})
        
    } catch (error) {
        res.status(500).json({success:false, message:`Error Deleting these file(s): ${error}`})
    }
}
