import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import Login from './pages/authentication/Login'
import Register from './pages/authentication/Register'
import Layout from './components/Layout'
import RequireAuth from './features/auth/RequireAuth'
import About from './pages/About'
import {ToastContainer} from 'react-toastify'
import RedirectIfAuthenticated from './features/auth/RedirectIfAuthenticated'
import FolderPage from './pages/FolderPage'
import SharedFolders from './pages/SharedFolders'


/*
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Get user from your AuthContext
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
*/

const App = () => {
  return (
    <>
      
      <BrowserRouter>
        <Routes>
          <Route path='/' 
          element= {
            <RedirectIfAuthenticated>
            <LandingPage/>
            </RedirectIfAuthenticated>
            } />
          <Route path='/login' 
          element= {
            <RedirectIfAuthenticated>
            <Login/>
            </RedirectIfAuthenticated>
            } />
          <Route path='/register' element= {<Register/>} />
          
          <Route path='/home' element={
            <RequireAuth>
            <Layout/>
            </RequireAuth>
            }>
            <Route index element={<Home/>} />
            <Route path='about' element={<About/>} />
            <Route path='folder/:folderid' element={<FolderPage/>} />
            <Route path='folder/shared' element={<SharedFolders/>} />
            
          </Route>
          
        </Routes>
      </BrowserRouter>
      <ToastContainer/>

    </>
  )
}

export default App
