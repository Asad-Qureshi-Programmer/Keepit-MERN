import axios from 'axios'
import refreshAccessToken from '../features/auth/authAPI'

export const apiNoAuth = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

api.defaults.withCredentials = true;


api.interceptors.request.use(
  (config) => {
    // Always get the latest token
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config
    // console.log('Before retry headers:', originalRequest.headers)
    if (error.response?.status === 401 || error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Get a fresh token
        const newToken = await refreshAccessToken()
        // console.log('Refreshed token:', newToken)

        if (newToken) {
          // Save new token
          
          localStorage.setItem('accessToken', newToken)

          // Update header and retry
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
