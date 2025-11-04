import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleError, handleSuccess } from "../../utils/utils";
import api from "../../api/axios";

const Register = () => {
  const navigate = useNavigate();
  const [signupInfo, setSignupInfo] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSignupInfo((prev)=>({
      ...prev,
      [name]:value
    }))

  };



  const handleSignup = async(e) => {
    e.preventDefault();
    const {username, email, password} = signupInfo

    if(!username || !email || !password){
      return handleError("All fields are required")
      
    }

    try{

    
    const res = await api.post('/api/user/register', {
      username,
      email,
      password
    })
    
      console.log("Response: ",res)
      handleSuccess(res?.data.message)

      setTimeout(() => {
        navigate('/login')
      }, 1000);
    
    
    

  } catch(err){
    console.log("Error in registeration: ",err)

    // Handle error message from server (if available)
  const errorMsg =
    err.response?.data?.message ||                // Custom message
    err.response?.data?.errors?.[0]?.msg ||       // Validation errors
    "Something went wrong. Please try again.";    // Fallback

  handleError(errorMsg);
   
  }
  };

  return (
    <>
      <div className="w-screen h-screen flex items-center ">
        <form className="w-md m-auto " onSubmit={handleSignup}>
          <div className="mb-5">
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              onChange = {handleChange}
              value={signupInfo.username}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name"
              required
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              onChange = {handleChange}
              value={signupInfo.email}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name@flowbite.com"
              required
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              onChange = {handleChange}
              value={signupInfo.password}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>

          <span>
            Already have an account?
            <Link to="/login">Login</Link>
          </span>
        </form>
      </div>
    </>
  );
};

export default Register;
