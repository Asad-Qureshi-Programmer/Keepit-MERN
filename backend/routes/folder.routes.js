const express = require('express')
const authValidator = require('../middlewares/authValidator')
const router = express.Router()
const folderControllers = require('../controllers/folderControllers')

router.use(express.json())
router.use(express.urlencoded({extended:true}))

// create folder
router.post('/create', authValidator, folderControllers.create)

router.get('/user-folders',authValidator ,folderControllers.getFolders)

router.get('/:folderId/share-access', authValidator, folderControllers.addSharedUser)
router.get('/shared', authValidator, folderControllers.getSharedFolders)
router.get('/:folderId', authValidator, folderControllers.getFolderById)
router.get('/:folderId/shared-files', folderControllers.getFolderSharedFiles)
router.post('/delete',authValidator, folderControllers.deleteFolders)

module.exports = router
