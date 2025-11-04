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
    <>
      <div className="flex flex-wrap gap-2 w-full  py-5">
asad
        {!sharedFoldersError && sharedFolders.length>0 &&
              sharedFolders.map((folder, i)=>(

              <div
                key={i}
                className="relative flex flex-col justify-center align-middle items-center px-5 py-3 rounded-xl hover:bg-[#f0f2f6] "
                onDoubleClick={() => navigate(`/home/folder/${folder._id}`, {state: folder})}
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
        {sharedFoldersError && (
            <div className='text-center m-10'>
                <p className='text-2xl'>Error fetching shared folders:</p>
                <p className='text-2xl'>{sharedFoldersError}</p>
            </div>
        )}
      </div>
    </>
  )
}

export default SharedFolders
