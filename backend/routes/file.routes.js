const express = require('express')
const router = express.Router();
const upload = require('../middlewares/multer.middleware')
const uploadOnCloudinary = require('../utils/cloudinary')
const fileModel = require('../models/files.model')
const authMiddleware = require('../middlewares/authValidator')
const fileControllers = require('../controllers/fileControllers')
const axios = require('axios')

router.use(express.json())
router.use(express.urlencoded({extended:true}))

// router.get('/test', authMiddleware, (req,res)=>{

//     res.send('Test done')
// })

// router.get('/getFiles', authMiddleware, async(req,res)=>{

//     if(!req.user?.userId) return res.status(401).json({message:'UnAuthorized'})
    
//     // now getting all the file urls uploaded by this particular userId which is logged in, got by authMiddleware
//     const userFiles = await fileModel.find({
//         user : req.user.userId
//     })
    
//     res.json({files: userFiles});
// })

// router.post('/upload',authMiddleware, upload.single('file') /*pass here, the name of input field */ ,async (req,res)=>{
//     try{

//         if(!req.file){
//             return res.status(400).json({ message: 'No file uploaded' });
//         }
//         // console.log("name of file: ", req.file.originalname.split('.')[0])
//     const customName = req.file.originalname.split(".")[0] + Date.now()
//     const response = await uploadOnCloudinary(req.file.path, req.user.username, customName)
//     // console.log(req.file)
//     console.log(response)
//     const cloudurl = response.url

//     const newFile = await fileModel.create({
//         path: cloudurl,
//         originalname: response.original_filename,
//         user: req.user.userId
//         //this is important as, you must be logged in to upload anything, thus it checks token through authMiddleware, only then req.user get userId

//     })

//     res.status(200).json(newFile)
// }
// catch (error) {
//     console.error('Upload Error:', error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
    
    
// })

// router.get('/download/:fileId', authMiddleware, async(req,res)=>{
//     // now we need to make sure, file downloaded by user who uploaded this
//     // NOTE = authMiddleware only checks if user logged in
    
//     const loggedInUserId = req.user.userId;
//     const fileId = req.params.fileId

//     console.log("loggedInUserId:", loggedInUserId);
// console.log("fileId:", fileId);

//     const file = await fileModel.findOne({
//         user: loggedInUserId,
//         _id: fileId
//     })

//     if(!file){
//         return res.status(403).json({
//             message:"Forbidden"
//         })
//     }

//     if(file.path.startsWith('http')){
//     // Always stream if it's a remote (Cloudinary) URL
//   const response = await axios.get(file.path, { responseType: 'stream' });

//   // Set filename and stream to client
//   res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
//   res.setHeader('Content-Type', response.headers['content-type'])
//   response.data.pipe(res);
//     }
//     else {
//     // ---- LOCAL FILE ----
//     // If it's stored locally, just download directly
//     const absolutePath = path.resolve(file.path); // ensure correct absolute path
//     res.download(absolutePath);
//   }
// })

// module.exports = router

router.get('/getFiles', authMiddleware, fileControllers.getFiles)
router.post('/upload',authMiddleware, upload.single('file') /*pass here, the name of input field */ , fileControllers.upload)
router.get('/download/:fileId', authMiddleware, fileControllers.download)
router.get('/delete/:fileId', authMiddleware, fileControllers.deleteFile)

// router.post('/upload/:folderId', authMiddleware, upload.single('file'), fileControllers.uploadFileToFolder)

module.exports = router