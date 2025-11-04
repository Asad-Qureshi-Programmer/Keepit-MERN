import React, {useContext, useEffect, useRef, useState} from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { FileContext } from '../contexts/FileContext'
import api from '../api/axios'
import { handleDownloadFile } from './Home'
import FilePreview from '../components/FilePreview'
import FullView from '../components/FullView'
import { UserContext } from '../contexts/UserContext'
import { handleError, handleSuccess } from '../utils/utils'

const FolderPage = () => {
  const {folderid} = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const folderDataVar = location.state //folder document object
  // const [folderData, setFolderData] = useState(folderDataVar || null)
  const [folderData, setFolderData] = useState({})
  const [showFullView, setShowFullView] = useState({});
  

  // const [folderFiles, setFolderFiles] = useState([])

  const {fileUploadInFolder, setFileUploadInFolder, folderFiles, setFolderFiles} = useContext(FileContext)
  const {userData} = useContext(UserContext)

  const [fileUploadingPopup, setfileUploadingPopup] = useState(false)
  const [fileUploadedPopup, setfileUploadedPopup] = useState(false)

  const [selectedFileName, setSelectedFileName] = useState("")

  const fileInput = useRef(null)
  
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
    
  
  
  const handleFileChange = async (e)=>{
    const file = e.target.files[0]
    setSelectedFileName(file.name)
    
    
    const formData = new FormData()
    formData.append("file", file)
    console.log("File Uploaded in folder: ",folderData.name, " file: ", formData.get("file"))

    try {
      setfileUploadingPopup(true)
      const res = await api.post(`/api/upload?folderId=${folderid}`, formData)
      console.log("File Uploaded in folder, file: ",res.data )
      setfileUploadingPopup(false)
      fetchFolderFiles()
    } catch (error) {
      console.log("Error Uploading FIle to folder, Error: ", error)
      setfileUploadingPopup(false)
    }
    
  }

  return (
    <>
      <p onClick={()=>navigate(-1)} >back</p>
      <h2 className='text-3xl m-8 mx-12'>{folderData.name}</h2>
      <input ref={fileInput} type="file" name="fileinfolder" id="fileinfolder" onChange={(e)=>handleFileChange(e)} className='hidden' />

      {
        fileUploadingPopup && (
          <div className='absolute right-10 bottom-10 bg-white w-[400px] rounded-2xl shadow-2xl px-8 py-6 border border-color flex flex-col gap-3'>
            <div className='flex justify-between'>
            <p className='text-xl font-medium'>Uploading 1 File</p>
            <button
            onClick={()=>setfileUploadingPopup(false)}>
            X</button>
            </div>
            <p className='text-xl w-full whitespace-nowrap overflow-ellipsis truncate' >{selectedFileName}</p>
          </div>
        )
      }

      <div className='flex flex-wrap gap-8 m-8'>
      { folderFiles[folderid]?.length >0 &&
        folderFiles[folderid]?.map((file, i)=>{
                        let filename =
                          file.originalname + "." + file.path.split(".")[3];
                        return (
                          <React.Fragment key={i}>
                            <div
                              onClick={() =>
                                setShowFullView((prev) => ({
                                  ...prev,
                                  [file.path]: true,
                                }))
                              }
                              className=" rounded-xl border border-color  hover:bg-[#f0f2f6] p-5 flex-col w-[350px] h-[260px] justify-between items-center text-lg  "
                            >
                              <div className="flex justify-between mb-3">
                                <h2 className=" w-[220px]  truncate "> {filename} </h2>
                                <button
                                  onClick={(e) =>
                                    handleDownloadFile(file._id, file.originalname, e)
                                  }
                                  className=""
                                >
                                  <img
                                    src="/assets/downloadFileIcon.png"
                                    width="20px"
                                    alt="download"
                                  />
                                </button>
                              </div>
                              <div
                                onClick={()=>setShowFullView((prev)=>({...prev, [file.path]:true }))}
                                className="h-[180px] w-full overflow-hidden"
                              >
                                <FilePreview filepath={file.path} />
                              </div>
                            </div>
        
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
                      }
      )
      }
      </div>
    </>
  )
}

export default FolderPage
