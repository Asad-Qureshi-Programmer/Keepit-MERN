const express = require('express')
const router = express.Router();
const upload = require('../middlewares/multer.middleware')
const uploadOnCloudinary = require('../utils/cloudinary')
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

    if(!req.file){
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const folderId = req.query.folderId || null

    if(folderId){
        const folder = await folderModel.findById(folderId)
        const isOwner = folder.ownerId.toString()===req.user.userId
        const isSharedUser = folder.sharedWith.includes(req.user.userId)

        if(!isOwner && !isSharedUser){
            return res.status(403).json({success:false, message:"Not authorized to upload here"})
        }
    }

    // console.log("name of file: ", req.file.originalname.split('.')[0])
    const customName = req.file.originalname.split(".")[0] + Date.now()
    const response = await uploadOnCloudinary(req.file.path, req.user.username, customName)
    // console.log(req.file)
    // console.log(response)

    const newFile = await fileModel.create({
        path: response.url,
        originalname: response.original_filename,
        user: req.user.userId ,
        //this is important as, you must be logged in to upload anything, thus it checks token through authMiddleware, only then req.user get userId

        folderId
    })

    res.status(201).json(newFile)
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

    const file = await fileModel.findById(fileId).populate('folderId')
    if(!file) return res.status(404).json({success:false ,message:'file not found'})
    
    const isOwner = file.folderId?.ownerId?.toString() === loggedInUserId
    const isUploader = file.user.toString() === loggedInUserId

    if(!isOwner && !isUploader) return res.status(403).json({success:false, message:'Unauthorized to delete this file'})
    
    await fileModel.findByIdAndDelete(fileId)
    res.status(200).json({success:true, message:'File Deleted Successfully'})
        
    } catch (error) {
        res.status(500).json({success:false, message:'Error Deleting this file'})
    }
}
