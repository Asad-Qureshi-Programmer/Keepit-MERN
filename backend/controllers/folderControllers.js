const folderModel = require('../models/folder.model.js')
const fileModel = require('../models/files.model.js')
const userModel = require('../models/user.model.js')
const { deleteMultipleAssets } = require('../utils/cloudinary')

exports.create = async (req , res)=>{

    try {
    const {folderName ,parentFolderId} = req.body

    if(!folderName || !folderName.trim()){
        return res.status(400).json({
            success:false,
            message: 'Folder name required'
        })
    }

    
        const response = await folderModel.create(
            {
                name: folderName.trim(),
                ownerId: req.user.userId,
                parentFolderId: parentFolderId || null
            }
        )
        
        res.status(201).json({
            success:true,
            data: response
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message: 'Error in folder creation'
        })
    }

}

exports.getFolderById = async (req,res)=>{
    try {
        const folderId = req.params.folderId

        const folder = await folderModel.findById(folderId)
        if(!folder) return res.status(404).json({success:false, message:"Folder not found"})
        
        res.status(200).json({success:true, folder})
    } catch (error) {
        res.status(500).json({success:false, message:"Error fetching this folder"})
    }
}

exports.getFolders = async (req, res)=>{
    try {
        const ownerId = req.user.userId

        if(!ownerId) return res.status(401).json({
            success:false,
            message: 'Unauthorized'
        })

        const folders = await folderModel.find({ownerId:ownerId }).sort({createdAt:-1})

        if(!folders) return res.status(200).json({
            success: true,
            message: 'No Folder Found'
        })

        res.status(200).json({
            success: true,
            data: folders
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message: 'Error in fetching folders'
        })
    }
}

// exports.getFolderContents = async (req, res)=>{
//     try {
//         const folderId = req.params
        
//         const folder = await folderModel.findById(folderId)
//         if(!folder) return res.status(404).json({success:false, message:'folder not found'})
        
//         const files = await fileModel.find({folderId}).sort({createdAt:-1})
        
//         res.status(200).json({success:true, folder, files})
//     } catch (error) {
//         console.log('error fetching folder content')
//         res.status(500).json({success:false, message:'error fetching folder content'})
//     }
// }

exports.addSharedUser = async (req,res)=>{
    try {
        const userId = req.user.userId
        const folderId = req.params.folderId

        const folder = await folderModel.findById(folderId)
        if(!folder) return res.status(404).json({success:false, message:"No folder found"})
        
      
        
        if(folder.ownerId.toString()!=userId && !folder.sharedWith.map(id=>id.toString()).includes(userId) ){
            folder.isShared = true
            folder.sharedWith.push(userId)
            await folder.save()
            return res.status(200).json({success:true, message:'Folder access granted', folder})
        }

        res.status(200).json({success:true, message:'Folder access already granted', folder})

    } catch (error) {
        res.status(500).json({success:false, message:"Error Granting Access"})
    }
}

exports.getSharedFolders = async (req,res)=>{
    try {
        const userId = req.user.userId
        
        const sharedFolders = await folderModel.find({sharedWith: userId}).populate("ownerId", "username email")
        

       

        res.status(200).json({success:true, folders:sharedFolders})
    } catch (error) {
        res.status(500).json({success:false, message:"Error fetching shared folders"})
    }
}

exports.getFolderSharedFiles = async(req,res)=>{
    try {
        const folderId = req.params.folderId
        const folder = await folderModel.findById(folderId);
        if (!folder) return res.status(404).json({ message: "Folder not found" });

        const files = await fileModel.find({folderId})
        
        res.status(200).json({success:true, files})
    } catch (error) {
        res.status(500).json({success:false, message:"Error Fetching Folder's Shared Files"})
    }
}

exports.deleteFolders = async(req,res)=>{
    try {
        const folders = req.body.folders
        const loggedInUserId = req.user.userId

        if(!folders || !Array.isArray(folders) || folders.length==0){
            return res.status(404).json({success:false ,message:'folder(s) not found'})
        }

        for(const folder of folders){
            const isOwner = folder?.ownerId?.toString() === loggedInUserId
            if(!isOwner) return res.status(401).json({success:false, message:'Unauthorized folder delete request'})
        }

        const folderIds = folders.map(folder=>folder._id)
        const files = await fileModel.find({folderId: {$in: folderIds}}).select("_id publicId")
        const fileIds = files.map(file=>file._id)
        const filePublicIds = files.map(file=>file.publicId)

        let delFromCloud;
        let delFromDb;
        if(files.length > 0){
            delFromDb = await fileModel.deleteMany({_id: {$in: fileIds}})
            console.log(`Deleted files from database: `, delFromDb)
            
            delFromCloud = await deleteMultipleAssets(filePublicIds)
        }else{
            console.log("No files in folders!")
        }

        const delFolders = await folderModel.deleteMany({_id:{$in: folderIds}})
        console.log(`Deleted folders: `, delFolders)

        res.status(200).json({success:true, deletedFolders:delFolders, deletedFiles:delFromDb, message:'Folders deleted successfully'})

    } catch (error) {
        res.status(500).json({success:false, message:"Error Deleting Folder"})
    }
}
