
import api, { apiNoAuth } from '../../api/axios'
import { handleError } from '../../utils/utils'

 const refreshAccessToken = async()=>{

    try {
      
        const response = await apiNoAuth.get('/api/user/refresh',{
            withCredentials:true,
        })
        
        // console.log('Access token refreshed:', response.data.accessToken)
        return response?.data?.accessToken
        

    } catch (error) {
        if (error.response?.status === 401) {
      console.warn('Refresh token expired or missing')
      handleError('Refresh token expired or missing')
    }
    else {
      console.error('Unexpected refresh error:', error)
      handleError(error.response?.data?.message)
    }
    
    return null  
    }
}

export default refreshAccessToken