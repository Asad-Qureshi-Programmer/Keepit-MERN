import { Link } from 'react-router-dom'

const LandingPage = () => {
  
  return (
    <>
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <ul className="flex space-x-6 justify-center items-center">
        <li>
          <Link to="/" className="hover:underline">Home</Link>
        </li>
        <li>
          <Link to="/" className="hover:underline">About</Link>
        </li>
        <li>
          <Link to="/" className="hover:underline">Contact</Link>
        </li>
      </ul>

      <Link to='/login' className='px-2 py-1 rounded-md bg-blue-800 text-white active:bg-blue-900'
      >Login</Link>
    </nav>
      <div className='bg-blue-300 h-[720px] w-1vw text-center'>
      <h3 className='text-3xl '>Landing Page</h3>
      </div>
    </>
  )
}

export default LandingPage
