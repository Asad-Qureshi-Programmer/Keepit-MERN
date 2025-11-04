import { useNavigate , Navigate} from "react-router-dom"
import isTokenExpired from "../../utils/checkTokenExpiry"
import { useEffect } from "react"
import refreshAccessToken from "./authAPI"

const RedirectIfAuthenticated = ({children}) => {
    const navigate = useNavigate()
    
    useEffect(() => {

        const checkAuth = async()=>{
            const accessToken = localStorage.getItem('accessToken')
            if(!accessToken){
                return 
            }

            if(isTokenExpired(accessToken)){

                const newToken = await refreshAccessToken()
                if(newToken){
                    navigate('/home' , { replace: true })
                }
                else{
                    return
                }

            }else {
                navigate('/home' , { replace: true })
            }
        }
    
        checkAuth()
    }, [navigate])

  return children
}

export default RedirectIfAuthenticated
