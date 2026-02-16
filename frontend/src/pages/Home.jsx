import React, { useContext, useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { handleError, handleSuccess } from "../utils/utils";
import { UserContext } from "../contexts/UserContext";
import { FileContext } from "../contexts/FileContext";
import FolderPopup from "../components/FolderPopup";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FilePreview from "../components/FilePreview";
import FullView from "../components/FullView";
import { IoClose,IoCheckmark, IoShareSocialOutline, IoCopy } from 'react-icons/io5';
import { FaShareAlt } from "react-icons/fa";
import { useSearch } from "../contexts/SearchContext";
import {getMatchScore}  from "../utils/searchUtils";

export const handleDownloadFile = async (fileId, filename, filepath, e) => {
    e.stopPropagation();
   

    try {
      const res = await api.get(`/api/download/${fileId}`, {
        responseType: "blob",
      });
      // console.log("Download response = ", res)

      

      console.log("res of download: ", res);

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      console.log("Blob: ", blob);
      console.log("temp url: ", url);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename + `.${filepath.split('.')[3]}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
      handleError("Error downloading file");
    }
  };

const Home = () => {
  const { userData, setUserData, userDataError, setUserDataError } =
    useContext(UserContext);
  const {
    createFolder,
    setCreateFolder,
    folders, setFolders, files, setFiles,
    fileUpload, setFileUpload
  } = useContext(FileContext);

  const {query} = useSearch()

  // const [files, setFiles] = useState([]);
  const [filesError, setFilesError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileUploadingPopup, setfileUploadingPopup] = useState(false)
  const [fileUploadedPopup, setfileUploadedPopup] = useState(false)
  const [numFilesUploading, setNumFilesUploading] = useState(0)
  const [filesDeleting, setFilesDeleting] = useState(false)
  const [filesDeleteError, setFilesDeleteError] = useState("")
  const [filesDeleteMessage, setFilesDeleteMessage] = useState("")

  const [deleteFolderConfPopup, setDeleteFolderConfPopup] = useState(false)
  const [deleteConfirmationPopup, setDeleteConfirmationPopup] = useState(false)
 
  const [checkedFiles, setCheckedFiles] = useState([])
  const [checkedFolders, setCheckedFolders] = useState([])

  // const [folders, setFolders] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [foldersError, setFoldersError] = useState("")

    const folderLink= useRef(null)
    const [shareFolderPopup, setShareFolderPopup] = useState(false)
    const [copied, setCopied] = useState(false);
    const [folderShareLinkText, setFolderShareLinkText] = useState("")

  const [showFullView, setShowFullView] = useState({});
  const navigate = useNavigate();
   const fileInput = useRef(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/api/user");
        console.log("user data fetched: ", res.data);
        setUserData({
          userId: res?.data?.user?.userId,
          username: res?.data?.user?.username,
          email: res?.data?.user?.email,
        });

        setUserDataError("");
      } catch (err) {
        // console.log("Error fetching user data: ", err);
        const errormessage =
          err.response?.data?.msg || "failed to fetch user data";
        setUserDataError(errormessage);
        handleError(errormessage);
      }
    };

    if(userData && Object.values(userData).every((value) => value === "")) fetchUserData();
  }, [userData]);
  console.log("userData from context: ", userData);


  useEffect(() => {
    if(files.length === 0) fetchFiles();
    if(folders.length === 0) fetchFolders();
  }, []);

  const fetchFiles = async () => {
    
    try {
      const res = await api.get("/api/getFiles");
      // console.log("Data after /api/getFiles: ", res.data.files);
      setFiles(res.data.files);
      setFilesError("");
    } catch (err) {
      // console.log("Error fetching files: ", err);
      const errormessage =
        err.response?.data?.msg || "failed to fetch user files";
      setFilesError(errormessage);
      handleError(err.response?.data?.msg);
    }
  };

  const fetchFolders = async ()=>{
    try {
      const res = await api.get('/api/folder/user-folders')
      console.log("Folders of user: ", res)
      setFolders(res.data.data)
    } catch (err) {
      const errormsg = err.response?.data.msg || 'Failed to fetch folders'
      setFoldersError(errormsg)
      handleError(err.response?.data?.msg)
    }
  }


  useEffect(() => {
  const handleClick = ()=>{
    fileInput.current.click()
    setFileUpload(false)
  }

  if(fileUpload) handleClick()
      
    }, [fileUpload, setFileUpload])


  // const handleFileChange = (e) => {
  //   setSelectedFile(e.target.files[0]); // pick first file
  // };

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
      const res = await api.post("/api/upload", formData);
      console.log("Upload success:", res.data.data);
      handleSuccess("File(s) Uploaded Successfullly!");
      setfileUploadedPopup(true)
      fetchFiles();
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

  // console.log("Files state: ", files)

  const openPDF = (link) => {
    window.open(`${link}`, "_blank");
  };
  

  if (!userDataError && userData && Object.values(userData).every((value) => value === ""))
    return <p className="text-white text-xl text-center">Loading....</p>;
  if (userDataError)
    return <p className="text-white text-xl text-center">{userDataError}</p>;


  const handleCreateFolder = async (e)=>{
    e.preventDefault()
    if(!folderName){
      setCreateFolder(false)
    }
    try {
      const newFolder = await api.post('/api/folder/create', {folderName} )
      console.log("NewFOlder created: ", newFolder)
      fetchFolders()
      setCreateFolder(false)
    } catch (error) {
      console.log("Error creating folder in frontend: ", error)
    }
  }

  const handleDeleteFile = async (e, fileId)=>{
    e.stopPropagation();

    try {
      const deleted= await api.get(`/api/delete/${fileId}`)

      console.log("file deleted: ", deleted.data?.message)
      fetchFiles()
      
    } catch (error) {
      console.log("Error deleting file: ", error.response?.data?.message)
    }
  }

  const handleCheckedFiles = (e, file)=>{
    e.stopPropagation()
    // setCheckedFiles([])
// // !checkedFiles.includes(file)
//     const isChecked = e.target.checked

    if(!checkedFiles.some(f=>f._id===file._id)){
      setCheckedFiles(prev=>(
        [...prev, file]
      ))
    }
    else{
      setCheckedFiles((prev)=>(prev.filter(each=>each._id!==file._id)))
    }

  }

  const handleCheckedFolders = (e, folder)=>{
    e.stopPropagation()
    // setCheckedFiles([])
// !checkedFiles.includes(file)
    // const isChecked = e.target.checked

    if(!checkedFolders.includes(folder)){
      setCheckedFolders(prev=>(
        [...prev, folder]
      ))
    }
    else{
      setCheckedFolders((prev)=>(prev.filter(each=>each._id!==folder._id)))
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
      fetchFiles()
      setTimeout(() => { 
        setDeleteConfirmationPopup(false)
        setFilesDeleteMessage("")
      }, 3000);
      console.log(`Deleted ${deletedFiles.length} files, not deleted ${undeletedFiles.length} files`)
    } catch (error) {
      console.log("Error deleting many files: ", error)
      setCheckedFiles([])
      setFilesDeleting(false)
      setFilesDeleteError(error.response?.data?.message || "Error deleting file(s)")
      fetchFiles()
    }
  }

  const sortedFiles = ()=>{
  
    return [...files].map(file=>({
      ...file,
      score: getMatchScore(file.originalname + "." + file.path.split(".").pop(), query)
    }))
    .filter(file=>file.score>0)
    .sort((a,b)=>b.score-a.score)
  }

  let displayFiles= query ? sortedFiles() :files

  console.log("Files display: ", displayFiles)
  console.log("CHECKED FILES: ", checkedFiles)

  return (
    <>
      <main className="  h-fit p-5 primetext-color ">


      {
            shareFolderPopup && (
        <div className='z-50 fixed inset-0  bg-opacity-50 backdrop-blur-sm  flex justify-center items-center'>
          <div className="bg-white relative w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-xl mx-4">
            
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
                {
                window.location.href.split('home')[0]+'home' + folderShareLinkText}
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
        {
        fileUploadingPopup && (
          <div className='z-50 absolute right-10 bottom-10 bg-white w-[380px] rounded-2xl shadow-2xl px-8 py-6 border border-color flex flex-col gap-3'>
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
        <input ref={fileInput} type="file" name="fileinfolder" id="fileinfolder" multiple onChange={(e)=>handleFileUpload(e)} className='hidden' />
        <div className=" flex flex-col justify-center items-start gap-5 m-3">
          <div className="flex justify-between items-center w-full">
            <h2 className="ml-8 text-2xl font-semibold text-start w-full  ">
              Uploaded Folders & Files
            </h2>

            { checkedFiles.length>0 &&
            <div className="flex gap-6 mr-3">
              <div className="flex whitespace-nowrap gap-1 justify-center items-center text-md">
              <input type="checkbox" name="selectall" id="selectall" className="w-3 h-3"
            
              onChange={(e)=>{
                if(e.target.checked){
                  setCheckedFiles([])
                  setCheckedFiles([...files])
                }else if(!e.target.checked){
                  setCheckedFiles([])
                }
              }}
              />
              select all files
              </div>

              <button 
              onClick={()=>setDeleteConfirmationPopup(true) 
                } 
              className="bg-red-500 text-md px-3 py-1 rounded-lg font-medium text-white whitespace-nowrap " >Delete File(s)</button>
              </div>
              }


              { checkedFolders.length>0 &&
            <div className="flex gap-6 mr-3">
              <div className="flex whitespace-nowrap gap-1 justify-center items-center text-md">
              <input type="checkbox" name="selectallfolders" id="selectallfolders" className="w-3 h-3"
            
              onChange={(e)=>{
                if(e.target.checked){
                  setCheckedFolders([])
                  setCheckedFolders([...folders])
                }else if(!e.target.checked){
                  setCheckedFolders([])
                }
              }}
              />
              select all folders
              </div>

              <button 
              
              onClick={()=>handleFolderDelete(checkedFiles)} 
              className="bg-red-500 text-md px-3 py-1 rounded-lg font-medium text-white whitespace-nowrap" >
                Delete Folder(s)
              </button>
              </div>
              }


          </div>
          <div className="ml-8">
            <select name="filter" id="filter">
              <option value="image">image</option>
              <option value="video">video</option>
            </select>
          </div>
          <div className="absolute bottom-0 top-50 right-0 left-70 rounded-2xl flex flex-wrap gap-10 mb-5 px-5 overflow-y-auto">
            <div className="flex flex-wrap p-2 gap-6 w-full">
  {/* Create New Folder Form */}
  {createFolder && (
    <form
      className="group relative flex flex-col justify-center items-center px-4 py-3 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all duration-200 w-[140px] animate-fadeIn"
      onSubmit={(e) => handleCreateFolder(e)}
    >
      <div className="relative">
        <img
          src="/assets/folderimg.svg"
          alt="folder"
          width="100px"
          height="auto"
          className="mb-2 opacity-80"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
      <input
        type="text"
        id="name"
        className="text-sm text-center w-full px-2 py-1 rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        placeholder="Folder Name"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        onBlur={(e) => handleCreateFolder(e)}
        autoFocus
      />
    </form>
  )}

  {/* Existing Folders */}
  {!foldersError && folders.length > 0 &&
    folders.map((folder, i) => {
      const isSelected = checkedFolders.includes(folder);
     
      return (
        <div
          key={i}
          className={`group relative flex flex-col justify-center items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 w-[140px]
            ${isSelected 
              ? 'bg-blue-50 ring-2 ring-blue-500 shadow-lg scale-105' 
              : 'bg-white hover:bg-gray-50 hover:shadow-md border border-gray-200 hover:border-gray-300'
            }`}
          onClick={(e) => handleCheckedFolders(e, folder)}
          onDoubleClick={() => navigate(`folder/${folder._id}`, { state: folder })}
        >
          {/* Selection Checkbox Indicator - Top Left */}
          <div className="absolute top-2 left-2 z-10">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
              ${isSelected 
                ? 'bg-blue-500 border-blue-500 shadow-sm' 
                : 'bg-white border-gray-300 opacity-0 group-hover:opacity-100'
              }`}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          <div className="z-40 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all">
            <button
            onClick={(e)=>{
              e.stopPropagation()
              setFolderShareLinkText('/folder/'+folder._id)
              setShareFolderPopup(true)}}
            className=" p-2 text-blue-500 cursor-pointer hover:bg-gray-200  hover:scale-[1.05] rounded-full transition-all  "><FaShareAlt size={18} /></button>
          </div>

         {/* 3 dot tool button */}
          {/* <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Add your folder options handler here (rename, delete, share, etc.)
              }}
              className="p-1 bg-white rounded-md shadow-md hover:bg-gray-100 transition-all"
              title="Folder options"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div> */}

          {/* Folder Image */}
          <div className="relative mb-1">
            <img
              src="/assets/folderimg.svg"
              alt="folder"
              width="100px"
              height="auto"
              className={`transition-all duration-200 ${isSelected ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'}`}
            />
           

           
            {folder.isShared && (
              <div className="absolute -bottom-1 -left-1 bg-green-500 rounded-full p-1 shadow-md border-2 border-white" title="Shared folder">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </div>
            )}
          </div>

          
          <p 
            className="text-sm font-medium text-gray-800 text-center w-full truncate px-1 mb-0.5" 
            title={folder.name}
          >
            {folder.name}
          </p>

         
          {(folder.updatedAt || folder.size) && (
            <p className="text-xs text-gray-500 text-center">
              {folder.updatedAt 
                ? new Date(folder.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : folder.size && `${folder.size} items`
              }
            </p>
          )}

          

          {/* Hidden checkbox for accessibility */}
          <input 
            className="hidden"
            type="checkbox" 
            checked={isSelected}
            onChange={() => {}}
            readOnly
          />
        </div>
      );
    })
  }

  {/* Empty State - Enhanced */}
  {!foldersError && folders.length === 0 && !createFolder && (
    <div className="w-full flex flex-col items-center justify-center py-0 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">No Folders Yet</h3>
      <p className="text-gray-500 text-center max-w-sm mb-4">
        Create your first folder to organize your files and keep everything tidy
      </p>
      <button 
        onClick={() =>setCreateFolder(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
      >
        Create Folder
      </button>
    </div>
  )}
</div>

           

{!filesError && files.length > 0 && displayFiles?.length>0 ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
    {displayFiles.map((file, i) => {
      let filename = file.originalname + "." + file.path.split(".").pop();
      const isSelected = checkedFiles.some(f=>f._id===file._id);
      
      return (
        <React.Fragment key={file.path}>
          <div
            onClick={(e) => handleCheckedFiles(e, file)}
            onDoubleClick={() =>
              setShowFullView((prev) => ({
                ...prev,
                [file.path]: true,
              }))
            }
            className={`group relative rounded-xl border-2 transition-all duration-200 cursor-pointer w-[250px] overflow-hidden
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
          >
            

            {/* Action Buttons - Show on Hover */}
            <div className="absolute top-3 right-3 z-20 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFile(file._id, file.originalname, file.path, e);
                }}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 hover:shadow-lg transition-all"
                title="Download file"
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

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
            </div>

            
            <div className="p-4">
              {/* File Preview */}
              <div className="relative h-40 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-4 shadow-inner">
                <div className="w-full h-full flex items-center justify-center">
                  <FilePreview filepath={file.path} />
                </div>
              </div>

              
              <div className="space-y-2">
                
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

            
            <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs  text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
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
              files={files}
              filepath={file.path}
              filename={filename}
              setShowFullView={setShowFullView}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
) : files.length>0 && displayFiles.length==0? (
  <div className="flex w-full flex-col items-center justify-center py-0 px-4">
    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-2 shadow-inner">
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-gray-700 mb-2">No File's Name Contains <span className='text-blue-700'>{query}</span> Here, Try Searching in Folders</h3>
  </div>
) : (
  <div className="flex w-full flex-col items-center justify-center py-0 px-4">
    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-2 shadow-inner">
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-gray-700 mb-2">No Files Yet</h3>
    <p className="text-gray-500 text-center max-w-md">
      Upload your first file to get started. Your files will appear here.
    </p>
  </div>
)}

            {filesError && <p className="text-white">{filesError}</p>}
            {foldersError && <p className="text-white">{foldersError}</p>}
          </div>
        </div>

      </main>
    </>
  );
};

export default Home;



// export const FullView = ({ files, filepath, filename, setShowFullView }) => {
//   const [buttonClicked, setButtonClicked] = useState({
//     right: false,
//     left: false,
//   });

//   const [currentFileIndex, setCurrentFileIndex] = useState(
//     files.findIndex((file) => file.path === filepath)
//   );
//   const [fileName, setFileName] = useState("");
//   const [filePath, setFilePath] = useState("");
//   const [data, setData] = useState("");

//   console.log("Current file index: ", currentFileIndex);

//   useEffect(() => {
//     if (buttonClicked.right === true) {
//       setCurrentFileIndex((prev) => (prev + 1) % files.length);
//     } else if (buttonClicked.left === true) {
//       setCurrentFileIndex((prev) => (prev - 1 + files.length) % files.length);
//     } else {
//       null;
//     }
//   }, [buttonClicked]) +
//     useEffect(() => {
//       let file_name = files[currentFileIndex]?.originalname;
//       let file_path = files[currentFileIndex]?.path;
//       console.log("File name: ", file_name);
//       console.log("File path: ", file_path);

//       setFileName(file_name);
//       setFilePath(file_path);
//     }, [currentFileIndex]);

//   // text, csv, json

//   useEffect(() => {
//     if (/\.(txt|csv|json)/i.test(filePath)) {
//       fetch(filePath)
//         .then((res) => res.text())
//         .then((data) => setData(data));
//     }
//   }, [filePath]);

//   const jsonTable = () => {
//     try {
//       if (!data || !data.trim()) {
//         return <p className="text-white">Empty JSON file</p>;
//       }
//       const json = JSON.parse(data);

//       if (Array.isArray(json[Object.keys(json)[0]])) {
//         const arraykeys = Object.keys(json);

//         return (
//           <div className="flex flex-col items-center gap-10 ">
//             {arraykeys.map((key, i) => (
//               <table key={i} className="w-5 h-5 border border-white">
//                 <thead>
//                   <tr>
//                     {Object.keys(json[key][0]).map((key, i) => (
//                       <th className="p-2 border" key={i}>
//                         {key}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {json[key].map((obj, i) => (
//                     <tr key={i}>
//                       {Object.values(obj).map((value, i) => (
//                         <td className="p-10 border" key={i}>
//                           {typeof value === "object"
//                             ? JSON.stringify(value)
//                             : value}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ))}
//           </div>
//         );
//       } else {
//         const keys = Object.keys(json);
//         const values = Object.values(json);

//         return (
//           <table className="w-5 h-5 border border-white">
//             <thead>
//               <tr>
//                 {keys.map((key, i) => (
//                   <th className="p-2 border" key={i}>
//                     {key}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 {values.map((value, i) => (
//                   <td className="p-10 border" key={i}>
//                     {typeof value === "object" ? JSON.stringify(value) : value}
//                   </td>
//                 ))}
//               </tr>
//             </tbody>
//           </table>
//         );
//       }
//     } catch (error) {
//       console.log("Text file error: ", error);
//     }
//   };

//   const csvTable = () => {
//     if (!data || !data.trim()) {
//       return <p className="text-white">Empty CSV file</p>;
//     }

//     const rows = data.split("\n").filter((row) => row.trim() !== "");
//     console.log("Rows : ", rows);

//     const heading = rows[0].split(",");
//     // console.log('Row  are : ',rows)
//     return (
//       <table>
//         <thead>
//           <tr>
//             {heading.map((key, i) => (
//               <th key={i} className="p-2 border ">
//                 {key}
//               </th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           {rows.slice(1).map((row, i) => (
//             <tr key={i}>
//               {row.split(",").map((value, i) => (
//                 <td className="p-10 border " key={i}>
//                   {value}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     );
//   };

//   return (
//     <>
//       <div
//         className="fixed z-20 top-0 left-0 right-0 bottom-0 w-full h-full
//        flex flex-col justify-center align-middle items-center "
//       >
//         <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black opacity-80 backdrop-blur-2xl "></div>

//         <div className="absolute top-5 w-full  text-white flex justify-between px-16 z-20 align-middle">
//           <h2 className="text-xl font-medium ">{fileName}</h2>
//           <button
//             onClick={() =>
//               setShowFullView((prev) => ({ ...prev, [filepath]: false }))
//             }
//             className="px-3 py-1 bg-blue-600 "
//           >
//             back
//           </button>
//         </div>

//         <button
//           onClick={() => setButtonClicked({ right: true, left: false })}
//           className="fixed top-[50%] right-10 text-white text-lg bg-blue-800 px-3 py-2 rounded-xl"
//         >
//           Right
//         </button>
//         <button
//           onClick={() => setButtonClicked({ right: false, left: true })}
//           className="fixed top-[50%] left-10 text-white text-lg bg-blue-800 px-3 py-2 rounded-xl"
//         >
//           Left
//         </button>

//         <div className=" text-white w-[50%] h-[70%]  p-10 flex flex-col z-20 justify-center align-middle items-center ">
//           {
//             /\.(png|jpg|avif|webp)$/i.test(filePath) ? (
//               <img
//                 src={filePath}
//                 alt=""
//                 className="w-full h-full object-contain  "
//               />
//             ) : /\.(pdf)$/i.test(filePath) ? (
//               <iframe
//                 src={filePath}
//                 frameborder="0"
//                 title="Pdf"
//                 height="1000px"
//                 width="100%"
//               />
//             ) : /\.(xlsx|docx|pptx)$/i.test(filePath) ? (
//               <div>
//                 <iframe
//                   src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
//                     filePath
//                   )}`}
//                   height="500px"
//                   width="700px"
//                 ></iframe>
//               </div>
//             ) : /\.(mp4|webm)$/i.test(filePath) ? (
//               <video controls src={filePath} width="400" />
//             ) : /\.(mp3|wav)$/i.test(filePath) ? (
//               <audio controls src={filePath} />
//             ) : /\.(txt)$/i.test(filePath) ? (
//               <pre>{data}</pre>
//             ) : /\.(csv)$/i.test(filePath) ? (
//               csvTable()
//             ) : /\.(json)$/i.test(filePath) ? (
//               jsonTable()
//             ) : null

//             /*
//                 else if (/\.(mp4|webm)$/i.test(filepath)) {
//     return <video controls src={filepath} width="400" />;
//   } else if (/\.(mp3|wav)$/i.test(filepath)) {
//     return <audio controls src={filepath} />;
//   } else if (/\.(txt)$/i.test(filepath)) {
//     return <pre>{data}</pre>;
//   }
//   else if (/\.(csv)$/i.test(filepath)){
//     return csvTable()
//   }
//   else if (/\.(json)$/i.test(filepath)){
//     return jsonTable()
//   }
//                 */
//           }
//         </div>
//       </div>
//     </>
//   );
// };
