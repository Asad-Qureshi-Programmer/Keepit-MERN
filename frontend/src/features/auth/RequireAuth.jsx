import { useSelector, useDispatch } from "react-redux"

import refreshAccessToken from "./authAPI"
import  isTokenExpired  from "../../utils/checkTokenExpiry"
import { useEffect, useState } from "react"
import {Navigate, useLocation} from 'react-router-dom'


const RequireAuth = ({children}) => {


const [isAuthorized, setIsAuthorized] = useState(false)
const [loading, setLoading] = useState(true)

const token = localStorage.getItem('accessToken')
// console.log("Token from requireAuth: ",token)

useEffect(() => {

    async function verifyToken(){
    if(token && !isTokenExpired(token)){
    setIsAuthorized(true)
    setLoading(false)
}
else{
    if(token){
        localStorage.removeItem('accessToken')
    }
    try {
        
        const accessToken = await refreshAccessToken()
        console.log("refresh result: ",accessToken)
        if(accessToken){
            setIsAuthorized(true)
            localStorage.setItem('accessToken', accessToken)
        }
        else{
            setIsAuthorized(false)
        }
        
        
    } catch (error) {
        
        setIsAuthorized(false)
    }

    setLoading(false)
}}

verifyToken()}, [token])


if(loading) return <p>Loading...</p>

if(!isAuthorized) return <Navigate to="/login" />

  return children
}

export default RequireAuth