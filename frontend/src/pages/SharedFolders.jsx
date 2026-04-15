import React, { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { handleError, handleSuccess } from '../utils/utils'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { FileContext } from '../contexts/FileContext'
import { IoClose,IoCheckmark, IoShareSocialOutline, IoCopy } from 'react-icons/io5';

const SharedFolders = () => {
    const navigate = useNavigate()
    // const [sharedFolders, setSharedFolders] = useState([])
    const [sharedFoldersError, setSharedFoldersError] = useState()

    const {sharedFolders, setSharedFolders} = useContext(FileContext)
    
    const [folderOwners, setFolderOwners] = useState({})
    const [checkedFolders, setCheckedFolders] = useState([]);
const [folderShareLinkText, setFolderShareLinkText] = useState("");
const [shareFolderPopup, setShareFolderPopup] = useState(false);
const [copied, setCopied] = useState(false);

// Toggle selection logic
const handleCheckedFolders = (e, folder) => {
  if (e) e.stopPropagation();
  
  if (!checkedFolders.some(f => f._id === folder._id)) {
    setCheckedFolders(prev => [...prev, folder]);
  } else {
    setCheckedFolders(prev => prev.filter(each => each._id !== folder._id));
  }
};

// Selection helper for touch events


const isMobile = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const folderLink = useRef()
const pressTimer = useRef(null);
const startPos = useRef({ x: 0, y: 0 });

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

    const handleTouchStart = (e, item) => {
        const touch = e.touches[0];
        startPos.current = { x: touch.clientX, y: touch.clientY };

        pressTimer.current = setTimeout(() => {
            handleCheckedFolders(e, item);
            if (navigator.vibrate) navigator.vibrate(50);
            pressTimer.current = null;
        }, 500); // 500ms for long press
    };

    const handleTouchMove = (e) => {
        if (!pressTimer.current) return;
        const touch = e.touches[0];
        const distanceX = Math.abs(touch.clientX - startPos.current.x);
        const distanceY = Math.abs(touch.clientY - startPos.current.y);

        if (distanceX > 10 || distanceY > 10) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const handleTouchEnd = (e, item) => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;

            const isSelectionMode = checkedFolders.length > 0;

            if (isSelectionMode) {
                if (e.cancelable) e.preventDefault();
                handleCheckedFolders(e, item);
            } else {
                if (e.cancelable) e.preventDefault();
                // Navigate into folder on quick tap
                navigate(`/home/folder/${item._id}`, { state: item });
            }
        }
    };


const handleDeselectAll = () => {
  if ( checkedFolders.length > 0) {
    setCheckedFolders([]);
  }
};

  return (
    < >
      <div className="p-8 h-full flex flex-col">
    <h1 className='font-semibold text-2xl ml-2'>Shared Files</h1>
        
        {shareFolderPopup && (
  /* 1. BACKDROP: z-[200] ensures it's above everything. Click background to close. */
  <div 
    className='z-[200] fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4'
    onClick={() => setShareFolderPopup(false)}
  >
    {/* 2. MODAL CONTAINER: Stop Propagation prevents closing when clicking the white box */}
    <div 
      className="bg-white relative w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-2xl transition-all animate-in fade-in zoom-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* --- CLOSE BUTTON --- */}
      <button 
        onClick={() => setShareFolderPopup(false)} 
        className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90'
      >
        <IoClose size={24} />
      </button>

      {/* --- HEADER --- */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <IoShareSocialOutline size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className='font-bold text-xl text-gray-900'>Share Folder</h3>
            <p className='text-sm text-gray-500'>Generate a link to share this folder</p>
          </div>
        </div>
      </div>

      {/* --- LINK DISPLAY & COPY AREA --- */}
      <div className='flex gap-3 mb-6'>
          <p 
            ref={folderLink} 
            className='w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3.5 text-sm text-gray-700 overflow-x-auto whitespace-nowrap scrollbar-hide font-mono'
          >
            {/* Construct the full URL using window.location.origin */}
            {window.location.origin + folderShareLinkText}
          </p>
          {/* Subtle hint for mobile users that they can scroll the text */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none rounded-r-xl" />
        
        
        <button 
          onClick={() => {
            const textToCopy = folderLink.current?.innerText || (window.location.origin + folderShareLinkText);

            // Logic: Try Clipboard API, fallback to TextArea method for HTTP/Mobile
            if (navigator.clipboard && window.isSecureContext) {
              navigator.clipboard.writeText(textToCopy)
                .then(() => handleCopySuccess())
                .catch(() => fallbackCopy(textToCopy));
            } else {
              fallbackCopy(textToCopy);
            }

            function handleCopySuccess() {
              setCopied(true);
              if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
              setTimeout(() => setCopied(false), 2000);
              
              // Select text visually
              const range = document.createRange();
              range.selectNodeContents(folderLink.current);
              const selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
              setTimeout(() => selection.removeAllRanges(), 1500);
            }

            function fallbackCopy(text) {
              const textArea = document.createElement("textarea");
              textArea.value = text;
              textArea.style.position = "fixed"; // Avoid scrolling to bottom
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              try {
                document.execCommand('copy');
                handleCopySuccess();
              } catch (err) {
                console.error('Copy failed', err);
              }
              document.body.removeChild(textArea);
            }
          }}
          className={`flex-1 px-6 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 min-w-[120px] active:scale-95 ${
            copied 
              ? 'bg-green-500 text-white shadow-green-200' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }`}
        >
          {copied ? (
            <>
              <IoCheckmark size={20} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <IoCopy size={18} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* --- INFO BOX --- */}
      <div className='bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3'>
        <div className="text-amber-600 mt-0.5">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-4a1 1 0 112 0 1 1 0 01-2 0zm1 3a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className='text-xs leading-relaxed text-amber-800'>
          <strong>Important:</strong> Anyone with this link will be able to view and download files within this folder. Share it only with people you trust.
        </p>
      </div>

    </div>
  </div>
)}

        {!sharedFoldersError && sharedFolders.length > 0 && (
  <div className="flex-1 flex flex-wrap gap-8 w-full px-2 py-5 overflow-y-auto" onClick={() => setCheckedFolders([])}>
    {sharedFolders.map((folder, i) => {
      const isSelected = checkedFolders.some(f => f._id === folder._id);

      return (
        <div
          key={folder._id || i}
          className={`group h-fit border transition-all duration-200 relative flex flex-col justify-center items-center px-2 py-3 w-[150px] rounded-xl cursor-pointer
            ${isSelected 
              ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
              : 'border-gray-200 bg-white hover:shadow-md hover:bg-gray-50 hover:border-gray-300'
            }`}
          
          // Mobile Handlers
          onTouchStart={(e) => handleTouchStart(e, folder, false)}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => handleTouchEnd(e, folder, false)}
          onContextMenu={(e) => e.preventDefault()}

          // Desktop Handlers
          onClick={(e) => {
            if (!isMobile()) handleCheckedFolders(e, folder);
          }}
          onDoubleClick={() => {
            if (!isMobile()) navigate(`/home/folder/${folder._id}`, { state: folder });
          }}
        >
          {/* 1. Selection Indicator (Checkmark) */}
          {(checkedFolders.length > 0) && (
            <div className="absolute top-2 left-2 z-10">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white/50 border-gray-300'}`}>
                {isSelected && <IoCheckmark className="text-white" size={12} />}
              </div>
            </div>
          )}

          {/* 2. Share Button (Visible on selection or hover) */}
          <div className={`z-40 absolute top-1 right-1 transition-all duration-200
            ${isSelected 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
            }`}>
            <button
              onTouchEnd={(e) => {
                e.preventDefault()
                e.stopPropagation();
                setFolderShareLinkText('/folder/' + folder._id);
                setShareFolderPopup(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isMobile()) {
                  setFolderShareLinkText('/folder/' + folder._id);
                  setShareFolderPopup(true);
                }
              }}
              className="p-2 text-blue-500 hover:bg-gray-200 rounded-full transition-all active:scale-90 bg-gray-200"
            >
              <IoShareSocialOutline size={18} />
            </button>
          </div>

          <img
            src="/assets/folderimg.svg"
            alt="folder"
            width="100px"
            height="auto"
            className={`transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
          />
          
          <div className="text-center mt-2 w-full px-2">
            <p className="text-sm font-semibold text-gray-900 truncate" title={folder.name}>
              {folder.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {folder.ownerId?.username || 'Owner'}
            </p>
          </div>
        </div>
      );
    })}
  </div>
)}
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
