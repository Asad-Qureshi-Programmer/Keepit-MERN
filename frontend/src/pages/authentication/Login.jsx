import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'


import { handleError, handleSuccess } from '../../utils/utils'

const Login = () => {
  const navigate = useNavigate()
 
  const [error, setError] = useState()

  const [loginInfo, setLoginInfo] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLoginInfo((prev)=>({
      ...prev,
      [name]:value
    }))

  };


  const handleSubmit = async(e)=>{
    e.preventDefault()
    const {username , password}= loginInfo

    if(!username || !password){
      return handleError("All fields are required")
      
    }
    
    try{
    const res= await api.post('/api/user/login',{
      username:username,
      password:password
    }, {
      withCredentials: true,
    })
    
      console.log("Logged in successfully: ", res.data.accessToken)
      
      handleSuccess(res?.data.message)
      localStorage.setItem('accessToken', res.data.accessToken)
     
      setTimeout(() => {
        navigate('/home')
      }, 1000);

    }
    catch(err){
    console.log("Error in Login: ",err)

    // Handle error message from server (if available)
      const errorMsg =
        err.response?.data?.message ||                // Custom message
        err.response?.data?.errors?.[0]?.msg ||       // Validation errors
        "Something went wrong. Please try again.";    // Fallback

      setError(errorMsg)
      handleError(errorMsg);
      
      }
  }

  return (
    <>
    
    
    <div className="w-screen h-screen flex items-center ">
      <div className='m-auto border border-gray-300 p-8 h-[400px] w-[500px]'>
        <p className='text-3xl mb-6'>Login</p>
    <form className="flex flex-col"
    onSubmit={handleSubmit}
    >
        <div className="mb-5">
            <label htmlFor="username" className="block mb-1  font-medium text-gray-900 ">Name</label>
            <input
            onChange={handleChange}
            value={loginInfo.username}
            type="text" id="username" name="username" className="bg-gray-50 border border-gray-400 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 " placeholder="name" required />
        </div>
        
        <div className="mb-5">
        <label htmlFor="password" className="block mb-1  font-medium text-gray-900">Password</label>
        <input
        onChange={handleChange}
        value={loginInfo.password}
        type="password" id="password" name="password" className="bg-gray-50 border border-gray-400 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 " placeholder='password' required />
        </div>
        {error && <p className='text-red-500'>{error}</p>}
        <button type="submit" className="text-white primary-color hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md  sm:w-auto px-5 py-2 text-center">Submit</button>

        <div className='text-center'>
          Don't have an account?
          <Link to="/register">Register</Link>
        </div>
    </form>
    </div>
    </div>

    </>
  )
}

export default Login