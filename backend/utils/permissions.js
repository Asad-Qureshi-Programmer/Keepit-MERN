const canDeleteFile = (currentUserId, folderOwnerId, fileUploaderId)=>{

    
    return (
        String(currentUserId) === String(folderOwnerId) || String(currentUserId) === String(fileUploaderId)
    )
}

module.exports = {canDeleteFile}