import {jwtDecode} from 'jwt-decode'

const isTokenExpired = (token)=>{

    if(!token) return true

    try {
        const decoded = jwtDecode(token)
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime; // true if expired
    } catch (error) {
        return true; // Treat malformed token as expired
    }
}

export default isTokenExpired