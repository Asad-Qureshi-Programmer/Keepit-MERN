import React, { useContext } from 'react'
import { FileContext } from '../contexts/FileContext'

const FolderPopup = () => {
    // const {setShowFolderPopup} = useContext(FileContext)
  return (
    <div className=" w-screen backdrop-blur fixed h-screen top-0 left-0 flex justify-center items-center z-20">
            <div className="relative flex flex-col items-center justify-center  bg-white rounded-3xl border border-color">
              <button
                className="absolute right-3 top-2 text-3xl font-monospace  m-2 ml-auto"
                // onClick={() => setShowFolderPopup(false)}
              >
                X
              </button>

              <form
                // onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="w-full flex flex-col justify-center px-8 py-8"
              >
                <label htmlFor="fname" className='text-lg font-medium ' >Folder Name</label>
                <input type="text" name="fname" id="fname" className='outline-none border border-gray-400 rounded-lg px-3 py-2 text-xl ' />
                
                <button
                  className="primary-color text-lg font-medium rounded-lg text-white px-5 py-2 mt-5  mx-auto"
                //   onClick={handleSubmit}
                  // type="submit"
                >
                  {/* {!isUploading ? "Upload File" : "Uploading...."} */}
                  Create
                </button>
              </form>
            </div>
          </div>
  )
}

export default FolderPopup
