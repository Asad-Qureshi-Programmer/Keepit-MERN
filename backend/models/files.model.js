const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema(
    {
        path:{
            type: String,
            required: [true, "Path is required"]
        },
        originalname:{
            type:String,
            required:[true, "Original Name is required"]
        },
        user:{
            type: mongoose.Schema.Types.ObjectId,   //it takes id of a user
            ref: 'users',   //mentioned that id belongs to 'user' collection
            required:[true, "User is required"]
        },
        folderId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'folders',
            default: null
        },
        publicId:{
            type: String,
            default: null
        }
    },
    {timestamps:true}
)

fileSchema.index({folderId: 1, createdAt: -1})
fileSchema.index({user: 1})

const file  = mongoose.model('file', fileSchema)

module.exports = file;