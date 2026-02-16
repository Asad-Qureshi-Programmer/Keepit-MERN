import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, NavLink, useLocation, useMatch } from "react-router-dom";
import api from "../api/axios";
import { handleSuccess, handleError } from "../utils/utils";
import { UserContext } from "../contexts/UserContext";
import { FileContext } from "../contexts/FileContext";
import {useSearch} from "../contexts/SearchContext";
import {FaHome} from 'react-icons/fa'
import { MdStar } from "react-icons/md";
import { MdCloudUpload } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import {Cloud} from 'lucide-react'

const Layout = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(UserContext);
  const { setShowPopup, setCreateFolder, setFileUploadInFolder, setFileUpload } = useContext(FileContext);
  const {query, setQuery} = useSearch()
  const [openDropdown, setOpenDropdown] = useState(false)
  const location = useLocation()
  // const currentPathName = location.pathname
  const isHome = useMatch("/home");
  const isFolder = useMatch("/home/folder/:folderid");

  const dropdownRef = useRef(null)

  const closeOpenDropdown = useCallback((e)=>{
    if(openDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)){
      setOpenDropdown(false)
      console.log("Close dropdown called")
    }
  },
  [openDropdown]
)

// console.log("Current path: ",currentPathName)

  useEffect(() => {
    document.addEventListener('mousedown', closeOpenDropdown)
          // console.log("Useeffect called")

    return () => {
      document.removeEventListener('mousedown', closeOpenDropdown)
    }
  }, [closeOpenDropdown])
  

  const onLogoutClick = async () => {
    try {
    const res = await api.post("/api/user/logout", {},{withCredentials:true});
    localStorage.removeItem("accessToken");

    api.defaults.headers.common["Authorization"] = "";  // remove old bearer token

    setTimeout(() => {
      setUserData(null)
    }, 1000);

      // navigate("/", {replace:true});
      window.location.href = "/";   //so that all contexts set properly, specially userData
      handleSuccess(res.data.message);
    } catch (error) {
      errormessage = error.response?.data?.message || "Error while loggin out";
      handleError(errormessage);
    }
  };

  return (
    <>
      <div className="flex ">
        <aside className="secback-color p-5 w-[250px] h-full  border border-color flex flex-col justify-between fixed font-semibold text-md ">
          <div>
            <div className="flex gap-2 align-middle items-center m-3 mb-10 text-2xl">
              
              <Cloud className="h-10 w-10 text-blue-600  rounded-full" />
              <span className="text-3xl font-bold text-gray-900">KeepIt</span>
            
            </div>
            <div className="relative " >
            <button
              className="w-[80%] mx-auto primary-color rounded-full text-white text-lg px-5 py-3 m-5 flex justify-center gap-2 items-center mb-8"
              ref={dropdownRef}
              onClick={() => setOpenDropdown(prev=>!prev)}
            >
              <MdCloudUpload size={20} />
              New
            </button>

            {openDropdown &&
              <div ref={dropdownRef} className="absolute top-16 right-0 bg-white w-[200px] border border-gray-300 rounded-lg transition-all duration-150">
              <button className="bg-white rounded-t-lg py-3 w-full hover:bg-gray-100 border-b border-gray-300 transition-all duration-150"
              onClick={()=>{
                 if(isHome) setFileUpload(true)
                 if(isFolder) setFileUploadInFolder(true)
                }}>
              Upload File
              </button>
              <button className="bg-white rounded-lg py-3 w-full  hover:bg-gray-100 transition-all duration-150"
               onClick={()=>setCreateFolder(true)}>
              Create Folder
              </button>
            </div>
            }
            </div>
            <ul className="w-full flex flex-col justify-start align-middle gap-1  primetext-color">
              <NavLink 
                to='/home'
                end
                className={({ isActive }) =>
                  ` hover:bg-gray-200 pl-8 py-2 rounded-3xl transition-all duration-150 flex gap-4 items-center  ${
                    isActive ? "primarytext-color bg-blue-100 " : "bg-none"
                  }`
                }
              >
                <FaHome size={18}/>
                Home
              </NavLink>

              <NavLink
                to='/home/folder/shared'
                className={({ isActive }) =>
                  ` hover:bg-gray-200 pl-8 py-2 rounded-3xl transition-all duration-150 flex gap-4 items-center ${
                    isActive ? "primarytext-color bg-blue-100 " : "bg-none"
                  }`
                }
              >
                <MdStar size={18} />
                Shared
              </NavLink>

              <NavLink
                to='/home/contact'
                className={({ isActive }) =>
                  ` hover:bg-gray-200 pl-8 py-2 rounded-3xl transition-all duration-150 flex gap-4 items-center  ${
                    isActive ? "primarytext-color bg-blue-100 " : "bg-none"
                  }`
                }
              >
                <MdStar size={18}/>
                Starred
              </NavLink>
            </ul>
          </div>

          <div className="flex justify-center">
          <button
            className="w-fit hover:bg-red-600 transition-all text-start rounded-lg py-2 px-4 bg-red-500 text-white  mb-5"
            onClick={() => onLogoutClick()}
          >
            Logout
          </button>
          </div>
        </aside>

        <div className="ml-[250px] overflow-hidden">
          <nav className=" bg-white w-[calc(100vw-250px)] z-10 px-10 flex justify-between border-b border-color p-3 sticky top-0">
            <div className="flex gap-2 items-center w-[50%] px-8 py-4 rounded-4xl secondary-color text-lg primetext-color " >
            <CiSearch size={26} />

            <input
              type="search"
              name="search"
              id="search"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              className="outline-none w-full ml-3 placeholder-gray-900"
              placeholder="Search Files"
            />
            </div>

            <div className="flex items-center gap-2 text-md font-semibold primetext-color ">
              
              <Cloud className="h-10 w-10 text-white bg-blue-600 p-2 rounded-full" />
              
              <div className="flex-col justify-start items-center ">
              <p class="text-md font-semibold">{userData? userData.email : "Loading..."}</p>
              <p className="text-gray-500 text-sm">{userData? userData.username : "Loading..."}</p>
              </div>
            </div>
          </nav>
          <div>
          <Outlet />
            
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
