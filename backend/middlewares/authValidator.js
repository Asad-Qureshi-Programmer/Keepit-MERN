const jwt = require('jsonwebtoken')

function authValidator (req, res, next){
    // if user logged in, token found, we'll find that in Authorixation Header, which we will pass in frontend when req protected routes from frotend
    const authHeader = req.headers.authorization || req.headers.Authorization

    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({message:'Unauthorized, token is required'})

    const token = authHeader.split(' ')[1]   //Only taking token from "Bearer tokenvalue"

    try{
        //checking/verifying token, because it can be hampered, ----jwt.verify, if verified, return data which you provided in jwt.sign while generating token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
            if(err) return res.status(403).json({message: 'Forbidden'})
            req.user = decoded
            return next()
        })

        
    }
    catch(e){
        return res.status(401).json({
            message: "Unauthorized, token wrong or expired"
        })
    }
}

module.exports = authValidator