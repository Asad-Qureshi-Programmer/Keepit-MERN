import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { handleError, handleSuccess } from '../utils/utils'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { FileContext } from '../contexts/FileContext'

const SharedFolders = () => {
    const navigate = useNavigate()
    // const [sharedFolders, setSharedFolders] = useState([])
    const [sharedFoldersError, setSharedFoldersError] = useState()

    const {sharedFolders, setSharedFolders} = useContext(FileContext)
    const [folderOwners, setFolderOwners] = useState({})


    useEffect(() => {
        const fetchSharedFolders = async ()=>{

            try {
                const res = await api.get('/api/folder/shared')
                setSharedFolders(res.data?.folders)
                console.log("Shared Folders: ", res.data?.folders)
                handleSuccess(res.data?.message || "Fetched Shared Folders")
            } catch (error) {
                const errormsg = error.response?.data.message || "Error fetching shared folders"
                setSharedFoldersError(errormsg)
                handleError(errormsg)
                console.log(errormsg)
            }
        }

       
    
        if(!sharedFolders || sharedFolders.length == 0) fetchSharedFolders()
    }, [])
    console.log("Shared folders: ", sharedFolders)

  return (
    < >
      <div className="p-8">
    <h1 className='font-semibold text-2xl ml-2'>Shared Files</h1>
        
        {!sharedFoldersError && sharedFolders.length>0 &&
      <div className="flex flex-wrap gap-8 w-full px-2  py-5">
              {sharedFolders.map((folder, i)=>(

              <div
                key={i}
                className="group h-fit border border-gray-200 hover:shadow-md hover:bg-gray-50 hover:border-gray-300 bg-white relative flex flex-col justify-center align-middle items-center px-2 py-3 w-[150px] rounded-xl  "
                onDoubleClick={() => navigate(`/home/folder/${folder._id}`, {state: folder})}
              >
                <img
                  src="/assets/folderimg.svg"
                  alt="folder"
                  width="100px"
                  height="auto"
                  className="group-hover:scale-105 transition-transform"
                />
                <p className="text-center text-sm font-semibold mt-2 mb-3">{folder.name}</p>
                <p className="text-center text-xs text-gray-500 -mt-3">{folder.ownerId?.username}</p>
              </div>
              ))
            }
              </div>
              }
        {sharedFoldersError && (
            <div className='text-center m-10'>
                <p className='text-2xl'>Error fetching shared folders:</p>
                <p className='text-2xl'>{sharedFoldersError}</p>
            </div>
        )}

        {
          !sharedFoldersError && sharedFolders.length==0 && (
            <div className="flex w-full flex-col items-center justify-center py-0 px-4">
    <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 shadow-md border-2 border-white" title="Shared folder">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </div>
      </div>
    <h3 className="text-2xl font-bold text-gray-700 mb-2">No Shared Folders Yet</h3>
    <p className="text-gray-500 text-center max-w-md">
      Open Folders Shared By Others To View Them Here
    </p>
  </div>
          )
        }
      </div>
    </>
  )
}

export default SharedFolders
