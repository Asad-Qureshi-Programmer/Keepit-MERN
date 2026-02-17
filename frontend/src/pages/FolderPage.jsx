import React, {useContext, useEffect, useRef, useState} from 'react'
import {  useParams, useNavigate } from 'react-router-dom'
import { FileContext } from '../contexts/FileContext'
import api from '../api/axios'
import { handleDownloadFile } from './Home'
import FilePreview from '../components/FilePreview'
import FullView from '../components/FullView'
import { UserContext } from '../contexts/UserContext'
import { handleError, handleSuccess } from '../utils/utils'
import { IoClose,IoCheckmark, IoShareSocialOutline, IoCopy } from 'react-icons/io5';
import { useSearch } from "../contexts/SearchContext";
import {getMatchScore}  from "../utils/searchUtils";

const FolderPage = () => {
  const {folderid} = useParams()
  const navigate = useNavigate()
  // const [folderData, setFolderData] = useState(folderDataVar || null)
  const [folderData, setFolderData] = useState({})
  const [showFullView, setShowFullView] = useState({});
  const [numFilesUploading, setNumFilesUploading] = useState()

  // const [folderFiles, setFolderFiles] = useState([])

  const {fileUploadInFolder, setFileUploadInFolder, folderFiles, setFolderFiles} = useContext(FileContext)
  const {userData} = useContext(UserContext)
    const {query} = useSearch()

  const [fileUploadingPopup, setfileUploadingPopup] = useState(false)
  const [fileUploadedPopup, setfileUploadedPopup] = useState(false)

  const [deleteConfirmationPopup, setDeleteConfirmationPopup] = useState(false)
  const [filesDeleting, setFilesDeleting] = useState(false)
  const [filesDeleteError, setFilesDeleteError] = useState("")
    const [filesDeleteMessage, setFilesDeleteMessage] = useState("")

  const [selectedFileName, setSelectedFileName] = useState("")

  const fileInput = useRef(null)
  const [checkedFiles, setCheckedFiles] = useState([])
  
  const folderLink= useRef(null)
  const [shareFolderPopup, setShareFolderPopup] = useState(false)
  const [copied, setCopied] = useState(false);
  
  // console.log("Folder id: ", folderid)
  // console.log("Folder data: ", folderData)

  const fetchFolderFiles = async()=>{
    try {
      // if (!folderData?.ownerId || !userData?.userId) return;

      // const isOwner = String(folderData.ownerId) === String(userData.userId);
      // const isAlreadyShared = folderData.sharedWith?.some(
      //   (id) => String(id) === String(userData.userId)
      // );

      let uri;
      
      // if(isOwner || !folderData.isShared){
      //   uri = `/api/getFiles?folderId=${folderid}`
      // }
      // else if(isAlreadyShared){
      //   uri = `/api/folder/${folderid}/shared-files`
      // }
      // else{
      //   console.warn("User not authorized to view this folder");
      //   return;
      // }
      
      uri =  `/api/folder/${folderid}/shared-files`
      console.log("URI used to fetch folder files: ", uri)
      const folderFilesVar = await api.get(uri)
      setFolderFiles(prev=>({...prev ,[folderid]:folderFilesVar.data.files}))
      console.log("Folder files from state: ", folderFilesVar.data.files)
    } catch (error) {
      console.log("Error Fetching folder files: ", error)
    }
  }

  // const fetchFolderFilesDirectLink = async()=>{
  //   try {
      
  //   } catch (error) {
      
  //   }
  // }

  useEffect(() => {

    const fetchFolderData = async ()=>{
      try {
        const res = await api.get(`/api/folder/${folderid}`)
        setFolderData(res.data.folder)
        handleSuccess(res.data.message)
      } catch (error) {
        errormsg = error.response?.data?.message || "Error fetching folder data: "
        console.log(errormsg)
        handleError(errormsg)
      }
    }

    fetchFolderData()

    // if( !folderFiles[folderid] || folderFiles[folderid]?.length === 0) fetchFolderFiles()
    // fetchFolderFiles()
    

    
  }, [])



  useEffect(() => {
    if (!folderData?.ownerId) return;
   if(!folderFiles[folderid] || folderFiles[folderid]?.length === 0) fetchFolderFiles();

   const isOwner = String(folderData.ownerId) === String(userData.userId);
  const isAlreadyShared = folderData.sharedWith?.some(
    (id) => String(id) === String(userData.userId)
  );

       const grantShareAccess = async ()=>{

      try{
          const res= await api.get(`/api/folder/${folderid}/share-access`)
          console.log("Grant Share Access Message: ", res.data.message)

        //    setFolderData((prev) => ({
        //   ...prev,
        //   sharedWith: [...(prev.sharedWith || []), userData.userId],
        // }));

          handleSuccess(res.data.message)
      // setFolderData(res.data.folder)
    }
      catch(err){
        const errormsg = err.response?.data.message || 'Failed to fGrant Access'
        console.log(errormsg)
        handleError(errormsg)
      }
    }

    if (!isOwner && !isAlreadyShared) { grantShareAccess() }



  }, [folderData, userData])
  

    
  useEffect(() => {
  const handleClick = ()=>{
    fileInput.current.click()
    setFileUploadInFolder(false)
  }

  if(fileUploadInFolder) handleClick()
      
    }, [fileUploadInFolder, setFileUploadInFolder])
    
  
  
  const handleFileUpload = async (e) => {
     e.preventDefault();
     const files = Array.from(e.target.files)
     const filenamearr= files.map((file)=> file.name)
     setSelectedFileName(filenamearr)
     if (!files || files.length==0) {
       // alert("Please select a file first.");
       handleError("Please select a file first.")
       return;
     }
     setNumFilesUploading(files?.length)
     const formData = new FormData();
 
     files.forEach((file)=>{
       formData.append("files", file);
     })
 
     console.log("Formdata: ", formData);
     try {
       setfileUploadingPopup(true);
       const res = await api.post(`/api/upload?folderId=${folderid}`, formData);
       console.log("Upload success:", res.data.data);
       handleSuccess("File(s) Uploaded Successfullly!");
       setfileUploadedPopup(true)
       fetchFolderFiles()
       setTimeout(() => {
         setfileUploadingPopup(false);
         setfileUploadedPopup(false)
       }, 3000);
     } catch (err) {
       console.log("Error uploading file:", err);
       const errormessge = err.response?.data?.message || "Error uploading file";
       handleError(errormessge);
       setfileUploadingPopup(false);
     }
   };

   const handleCheckedFiles = (e, file)=>{
      e.stopPropagation()
      // setCheckedFiles([])
  // !checkedFiles.includes(file)
      // const isChecked = e.target.checked
  
      if(!checkedFiles.some(f=>f._id===file._id)){
        setCheckedFiles(prev=>(
          [...prev, file]
        ))
      }
      else{
        setCheckedFiles((prev)=>(prev.filter(each=>each._id!==file._id)))
      }
  
    }


    // handleDeleteFile
      const handleDeleteFile = async (e, fileId)=>{
        e.stopPropagation();
    
        try {
          const deleted= await api.get(`/api/delete/${fileId}`)
    
          console.log("file deleted: ", deleted.data?.message)
          fetchFolderFiles()
          
        } catch (error) {
          console.log("Error deleting file: ", error.response?.data?.message)
        }
      }

  
    const handleMultipleDelete = async(checkedFiles)=>{
      try {
        setFilesDeleting(true)
        const res= await api.post('/api/delete', {files: checkedFiles} )
        setFilesDeleting(false)
        setFilesDeleteMessage("File(s) Deleted Successfully!")
        const deletedFiles = res.data.deletedFiles
        const undeletedFiles = res.data.undeletedFiles
        setCheckedFiles([])
        
        fetchFolderFiles()
        console.log(`Deleted ${deletedFiles.length} files, not deleted ${undeletedFiles.length} files`)
        setTimeout(() => {
        setDeleteConfirmationPopup(false)
        setFilesDeleteMessage("")
      }, 3000);
      } catch (error) {
        console.log("Error deleting many files: ", error)
        setCheckedFiles([])
        setFilesDeleting(false)
        setFilesDeleteError(error.response?.data?.message || "Error Deleting File(s)!")
        fetchFolderFiles()
        
      }
    }



      const sortedFiles = ()=>{
      
        return [...folderFiles[folderid]].map(file=>({
          ...file,
          score: getMatchScore(file.originalname + "." + file.path.split(".").pop(), query)
        }))
        .filter(file=>file.score>0)
        .sort((a,b)=>b.score-a.score)
      }
    
      let displayFiles= query ? sortedFiles() :folderFiles[folderid]

  return (
    <>

    {
      shareFolderPopup && (
  <div className='z-50 fixed inset-0  bg-opacity-50  flex justify-center items-center'>
    <div className="bg-white relative w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-2xl mx-4">
      
      {/* Close Button */}
      <button 
        onClick={() => setShareFolderPopup(false)} 
        className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-all'
      >
        <IoClose size={20} />
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <IoShareSocialOutline size={20} className="text-blue-600" />
          </div>
          <h3 className='font-bold text-xl text-gray-900'>Share Folder</h3>
        </div>
        <p className='text-sm text-gray-600'>Anyone with this link can access this folder</p>
      </div>

      {/* Link Display and Copy */}
      <div className='flex gap-2 mb-4'>
        <p 
          ref={folderLink} 
          className='flex-1 rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-sm text-gray-700 overflow-x-auto whitespace-nowrap'
        >
          {window.location.href}
        </p>
        
        <button 
          onClick={() => {
            const folderlink = folderLink.current;
            const folderlinkText = folderlink.innerText;
            navigator.clipboard.writeText(folderlinkText);

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            const range = document.createRange();
            range.selectNodeContents(folderlink);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            setTimeout(() => {
              selection.removeAllRanges();
            }, 2000);
          }}
          className={`px-5 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap ${
            copied 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <IoCheckmark size={18} />
              Copied!
            </>
          ) : (
            <>
              <IoCopy size={18} />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Info Footer */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
        <p className='text-xs text-blue-800 text-center'>
          🔒 Share this link to give folder access to others
        </p>
      </div>
    </div>
  </div>
)}

    {deleteConfirmationPopup && (
  <div className="z-50 fixed inset-0  bg-opacity-10 flex justify-center items-center">
    <div className="bg-white h-fit w-fit p-6 rounded-xl border border-gray-200 shadow-2xl max-w-md mx-4">
      {/* Warning Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      {/* Message */}
      <p className="mb-6 text-lg font-semibold text-center text-gray-800">
        Are you sure you want to delete {checkedFiles.length > 1 ? 'these files' : 'this file'}?
      </p>
      <p className="mb-6 text-sm text-center text-gray-600">
        {checkedFiles.length} {checkedFiles.length > 1 ? 'files' : 'file'} will be permanently deleted. This action cannot be undone.
      </p>

      {filesDeleteError && 
      <p className="text-md text-red-500 font-medium my-2 text-center">{filesDeleteError}</p>
      }

      {filesDeleteMessage && 
      <p className="text-md text-green-700 font-medium my-2 text-center">{filesDeleteMessage}</p>
      }

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-3">
        <button
          onClick={() => handleMultipleDelete(checkedFiles)}
          disabled={filesDeleting}
          className={`px-5 py-2.5 rounded-lg font-semibold text-white flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg
            ${filesDeleting 
              ? 'bg-red-400 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 active:scale-95'
            }`}
        >
          {filesDeleting ? (
            <>
              {/* Spinning Loader */}
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Deleting...</span>
            </>
          ) : (
            <>
              {/* Delete Icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </>
          )}
        </button>

        <button 
          onClick={() => {setDeleteConfirmationPopup(false)
            setFilesDeleteError("")
            setFilesDeleteMessage("")
          }}
          disabled={filesDeleting}
          className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg
            ${filesDeleting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95'
            }`}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    
    <div className='px-12 py-5'>
      <div className='flex  justify-between items-center '>
      <h2 className='text-2xl font-semibold my-3'>{folderData.name}</h2>
      <div className='flex gap-3 items-center justify-center'>
        
      { checkedFiles.length>0 &&
      <div className='flex justify-center items-center gap-3'>
        <div className="flex whitespace-nowrap gap-1 justify-center items-center text-md">
              <input type="checkbox" name="selectall" id="selectall" className="w-3 h-3"
            
              onChange={(e)=>{
                if(e.target.checked){
                  setCheckedFiles([])
                  setCheckedFiles([...folderFiles[folderid]])
                }else if(!e.target.checked){
                  setCheckedFiles([])
                }
              }}
              />
              select all files
              </div>


              <button onClick={()=>setDeleteConfirmationPopup(true)} className="bg-red-500 text-lg px-3 py-1 rounded-lg font-medium text-white whitespace-nowrap" >Delete File(s)</button>
      </div>
              }
      
      <button className='bg-blue-600 rounded-lg font-medium text-white py-1 px-4' onClick={()=>setShareFolderPopup(true)} >Share Folder</button>
      <button className='bg-blue-600 rounded-lg font-medium text-white py-1 px-4' onClick={()=>navigate(-1)} >back</button>
      </div>
      </div>
      <input ref={fileInput} type="file" name="fileinfolder" id="fileinfolder" multiple onChange={(e)=>handleFileUpload(e)} className='hidden' />

      {
        fileUploadingPopup && (
          <div className='z-50 absolute right-10 bottom-10 bg-white w-[400px] rounded-2xl shadow-2xl px-8 py-6 border border-color flex flex-col gap-3'>
            <div className='flex justify-between'>
            <p className='text-lg font-medium'>{fileUploadedPopup?`Uploaded ${numFilesUploading} File`:`Uploading ${numFilesUploading} File`}</p>
            <button
            onClick={()=>setfileUploadingPopup(false)}>
            X</button>
            </div>
            <div className="flex flex-col items-start justify-start">

            {selectedFileName.map((filename, key)=>(
              
              <p key={key} className='text-lg w-full whitespace-nowrap overflow-ellipsis truncate' >{filename}</p>
            ))
          }
          </div>
          </div>
        )
      }

<div className='w-full py-5'>
  {folderFiles[folderid]?.length > 0 && displayFiles?.length>0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
      {displayFiles?.map((file, i) => {
        let filename = file.originalname + "." + file.path.split(".").pop();
        const isSelected = checkedFiles.some(f=>f._id===file._id);
        
        return (
          <React.Fragment key={i}>
            <div
              onClick={(e) => handleCheckedFiles(e, file)}
              onDoubleClick={() =>
                setShowFullView((prev) => ({
                  ...prev,
                  [file.path]: true,
                }))
              }
              className={`group relative rounded-xl border-2 transition-all duration-200 w-[250px] h-fit cursor-pointer overflow-hidden
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
            >
              

              {/* Action Buttons - Show on Hover */}
              <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadFile(file._id, file.originalname, e);
                  }}
                  className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 hover:shadow-lg transition-all"
                  title="Download file"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>

                {/* Optional: Add delete button if you have handleDeleteFile function */}
                {typeof handleDeleteFile !== 'undefined' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(e, file._id);
                    }}
                    className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 hover:shadow-lg transition-all"
                    title="Delete file"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* File Preview */}
                <div className="relative h-40 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-4 shadow-inner">
                  <div className="w-full h-full flex items-center justify-center">
                    <FilePreview filepath={file.path} />
                  </div>
                </div>

                {/* File Info */}
                <div className="space-y-2">
                  {/* Filename */}
                  <h3 
                    className="font-semibold text-gray-900 truncate text-sm leading-tight" 
                    title={filename}
                  >
                    {filename}
                  </h3>
                  
                  {/* File Type Badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      {file.path.split('.').pop().toUpperCase()}
                    </span>
                    {file.size && (
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Double-click hint - shows on hover */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                  Double-click to open
                </span>
              </div>

              {/* Hidden checkbox for form compatibility */}
              <input 
                className="hidden"
                type="checkbox" 
                checked={isSelected}
                onChange={() => {}}
                readOnly
              />
            </div>

            {/* Full View Modal */}
            {showFullView[file.path] && (
              <FullView
                files={folderFiles[folderid]}
                filepath={file.path}
                filename={filename}
                setShowFullView={setShowFullView}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  ): folderFiles[folderid]?.length>0 && displayFiles?.length==0 ? (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-2">No File's Name Contains <span className='text-blue-700'>{query}</span> In This Folder</h3>
      
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-2">No Files in This Folder</h3>
      <p className="text-gray-500 text-center max-w-md">
        Upload files to this folder to get started
      </p>
    </div>
  )}
</div>
</div>
    </>
  )
}

export default FolderPage
