import { createContext, useState } from "react";

export const FileContext = createContext()


export const FileContextProvider = ({children})=>{

    const [showPopup, setShowPopup] = useState(false)
    const [createFolder, setCreateFolder] = useState(false)
    const [fileUploadInFolder, setFileUploadInFolder] = useState(false)
    const [fileUpload, setFileUpload] = useState(false)

    const [folders, setFolders] = useState([])
    const [files, setFiles] = useState([])
    const [folderFiles, setFolderFiles] = useState({})
    const [sharedFolders, setSharedFolders] = useState([])

    return (
        <FileContext.Provider value={{showPopup, setShowPopup, createFolder, setCreateFolder, folders, setFolders, files, setFiles, fileUploadInFolder, setFileUploadInFolder, folderFiles, setFolderFiles, fileUpload, setFileUpload, sharedFolders, setSharedFolders}} >
        {children}
        </FileContext.Provider>
    )
}
