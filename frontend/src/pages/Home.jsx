import React, { useContext, useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { handleError, handleSuccess } from "../utils/utils";
import { UserContext } from "../contexts/UserContext";
import { FileContext } from "../contexts/FileContext";
import FolderPopup from "../components/FolderPopup";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import FilePreview from "../components/FilePreview";
import FullView from "../components/FullView";

export const handleDownloadFile = async (fileId, filename, e) => {
    e.stopPropagation();
    const mimeToExt = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "application/pdf": "pdf",
      "image/webp": "webp",
      "image/avif": "avif",
      "application/zip": "zip",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "xlsx",
      "text/csv": "csv",
      "application/json": "json",
      "text/plain": "txt",
    };

    try {
      const res = await api.get(`/api/download/${fileId}`, {
        responseType: "blob",
      });
      // console.log("Download response = ", res)
      console.log("Content-Type from server:", res.headers["content-type"]);

      const contentType = res.headers["content-type"];
      const ext = mimeToExt[contentType];

      console.log("extension: ", ext);
      console.log("res of download: ", res);

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      console.log("Blob: ", blob);
      console.log("temp url: ", url);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename + `.${ext}`;
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

  // const [files, setFiles] = useState([]);
  const [filesError, setFilesError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileUploadingPopup, setfileUploadingPopup] = useState(false)
  const [fileUploadedPopup, setfileUploadedPopup] = useState(false)

  // const [folders, setFolders] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [foldersError, setFoldersError] = useState("")

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
    const file = e.target.files[0]
    setSelectedFileName(file.name)
    if (!file) {
      // alert("Please select a file first.");
      handleError("Please select a file first.")
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    console.log("Formdata: ", formData);
    try {
      setfileUploadingPopup(true);
      const res = await api.post("/api/upload", formData);
      console.log("Upload success:", res.data);
      handleSuccess("File Uploaded Successfullly!");
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

    try {
      const newFolder = await api.post('/api/folder/create', {folderName} )
      console.log("NewFOlder created: ", newFolder)
      fetchFolders()
      setCreateFolder(false)
    } catch (error) {
      console.log("Error creating folder in frontend: ", error)
    }
  }

  return (
    <>
      <main className="  h-fit p-5 primetext-color ">
        {
        fileUploadingPopup && (
          <div className='z-50 absolute right-10 bottom-10 bg-white w-[400px] rounded-2xl shadow-2xl px-8 py-6 border border-color flex flex-col gap-3'>
            <div className='flex justify-between'>
            <p className='text-xl font-medium'>{fileUploadedPopup?"Uploaded 1 File":"Uploading 1 File"}</p>
            <button
            onClick={()=>setfileUploadingPopup(false)}>
            X</button>
            </div>
            <p className='text-xl w-full whitespace-nowrap overflow-ellipsis truncate' >{selectedFileName}</p>
          </div>
        )
      }
        <input ref={fileInput} type="file" name="fileinfolder" id="fileinfolder" onChange={(e)=>handleFileUpload(e)} className='hidden' />
        <div className=" flex flex-col justify-center items-start gap-5 m-3">
          <h2 className=" text-2xl font-semibold text-start w-full  ">
            Uploaded files
          </h2>
          <div>
            <select name="filter" id="filter">
              <option value="image">image</option>
              <option value="video">video</option>
            </select>
          </div>
          <div className="absolute bottom-0 top-60 right-0 left-80 rounded-2xl flex flex-wrap gap-12 mb-5 overflow-y-auto">
            <div className="flex flex-wrap gap-2 w-full  py-5">
              {/* <div className="relative secondary-color rounded-xl py-4 w-[300px] h-[80px] px-4">

              <p className="text-xl">Folder Name</p>
              <p>In Home</p>
              <PiDotsThreeVerticalBold size={25} className="absolute top-3 right-2" />
            </div> */}

              {createFolder && (
                <form
                  className="relative flex flex-col justify-center align-middle items-center px-5 py-3 rounded-xl hover:bg-[#f0f2f6] "
                  // onDoubleClick={() => navigate("folder/1234")}
                  onSubmit={(e)=>handleCreateFolder(e)}
                  
                >
                  <img
                    src="/assets/folderimg.svg"
                    alt="folder"
                    width="150px"
                    className=""
                  />
                  <input
                    type="text"
                    id="name"
                    className=" text-lg -mt-3 w-[60%] px-2"
                    placeholder="Folder Name"
                    value={folderName}
                    onChange={(e)=>setFolderName(e.target.value)}
                    onBlur={(e)=>handleCreateFolder(e)}
                    autoFocus
                  />
                </form>
              )}

              {!foldersError && folders.length>0 &&
              folders.map((folder, i)=>(

              <div
                key={i}
                className="relative flex flex-col justify-center align-middle items-center px-5 py-3 rounded-xl hover:bg-[#f0f2f6] "
                onDoubleClick={() => navigate(`folder/${folder._id}`, {state: folder})}
              >
                <img
                  src="/assets/folderimg.svg"
                  alt="folder"
                  width="150px"
                  className=""
                />
                <p className="text-lg -mt-3">{folder.name}</p>
              </div>
              ))
              }

            </div>

            {!filesError && files.length > 0 ? (
              files.map((file, i) => {
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
                        // onClick={()=>setShowFullView((prev)=>({...prev, [file.path]:true }))}
                        className="h-[180px] w-full overflow-hidden"
                      >
                        <FilePreview filepath={file.path} />
                      </div>
                    </div>

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
              })
            ) : (
              <p>No Files to view</p>
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
