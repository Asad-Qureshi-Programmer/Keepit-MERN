const mongoose = require('mongoose')


const folderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'folder name is required'],
            trim: true
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'owner id is required']
        },
        parentFolderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null
        },
        isPublic: {
            type:Boolean,
            default:false
        },
        isShared: {
            type:Boolean,
            default:false
        },
        sharedWith: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }]
    },
    {timestamps: true}
)

const folderModel = mongoose.model('Folder', folderSchema)

module.exports = folderModel
