const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const userModel = require('../models/user.model')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { body, validationResult } = require('express-validator');   //to validate form data, accessed by req.body in post route
const authValidator = require('../middlewares/authValidator');
const userControllers = require('../controllers/userControllers')

router.use(express.json())
router.use(express.urlencoded({extended:true}))

// router.get('/', authValidator, async(req, res)=>{
//     if(!req.user) return res.status(401).json({message:"Unauthorized" , success:false})
    
//     try {
//     const user = req.user

//     if(!user) return res.status(404).json({message:"User not found!", success:false})

//     res.json({user: user})

        
//     } catch (error) {
//         console.log("Error fetching user: ", error)
//         res.status(500)
//             .json({
//                 message: "Internal server error",
//                 success: false
//             })
//     }


// })

// router.get('/register', (req, res)=>{
//     res.render('register')
// })

// router.post('/register',
//     body('email').trim().isEmail().isLength({min:13}),   //trim() to remove whitespaces
//     body('password').trim().isLength({min:5}),
//     body('username').trim().isLength({min:3}),

//     async (req, res)=>{
//     try{
//     const errors= validationResult(req)    //if above set validation failed, errors returned
    
//     if(!errors.isEmpty()){
        
//         return res.status(400).json({  //status = 200(when success), 400(error)
//             errors:errors.array(),
//             message:'Invalid Data',
//             success: false
//         })

//     }
    
//     const {username, email, password} = req.body
//     const existingUser = await userModel.findOne({
//         $or: [{ username }, { email }]
//       });

//     if(existingUser){
//         return res.status(409)
//             .json({message: "User already exist, login", success: false})
//     }
    

//     // NOTE ****** But the password should not be as plain text un database, it may leak
//     //thus we put it in hash format using package = ****** bcryptjs ******
//     const hashpassword = await bcryptjs.hash(password, 10)

//     const newUser = await userModel.create({
//         username,
//         email,
//         password: hashpassword
//     })


//     res.status(201)
//         .json({
//             message: "Signup Successful",
//             success: true
//         })

//     }
//     catch(error){
//       console.error('Register Error:', error);

//       // Handle duplicate key error if it somehow slips in
//       if (error.code === 11000) {
//         return res.status(409).json({
//           message: 'Duplicate key error: Email or Username already exists.',
//           success: false
//         });
//       }

//         res.status(500)
//             .json({
//                 message: "Internal server error",
//                 success: false
//             })
//     }
// })

// router.get('/login', (req,res)=>{
//     res.render('login')
// })

// router.post('/login', 
   
//     body('password').trim().isLength({min:5}),  //trim() to remove whitespaces
//     body('username').trim().isLength({min:3}),

//     async (req, res)=>{
    
    
//         const {username, password} = req.body
    
//         if(!username || !password){
//             return res.status(400).json({
//                 message: 'All fields are required'
//             })
//         }

//     const errors= validationResult(req)    //if above set validation failed, errors returned
    
//     if(!errors.isEmpty()){
//         // console.log(req.body)
        
//         return res.status(400).json({  //status = 200(when success), 400(error)
//             errors:errors.array(),
            
//             message:'Invalid Data'
//         })

//     }
    
    
//     // find username in databse
//     const user = await userModel.findOne({
//         username:username
//     })

    

//     if(!user){
//         return res.status(403).json({
//             message:"username or password is incorrect", success: false
//         })
//     }

//     // if user found compare its password from database to inputted password
//     const isMatched = await bcryptjs.compare(password, user.password)

    

//     if(!isMatched){
//         return res.status(403).json({
//             message:"username or password is incorrect", success: false
//         })
//     }

//     // If user logged in successfully, to keep user logged in and keep user authorized, we generate token by jwt
//     // 2 parameters = 1)Pass User Info data, 2)Secret key stored in .env

//     // const token = jwt.sign({
//     //     userId: user._id,
//     //     username: user.username,
//     //     email: user.email
//     // }, process.env.JWT_SECRET)

//     //access token- only for 1 session, send to frontend, stored in state in frontend, expires when website closed
//     const accessToken = jwt.sign({
//         userId: user._id,
//         username: user.username,
//         email: user.email
//     }, process.env.ACCESS_TOKEN_SECRET,
//        {expiresIn: '1m'} )

//     //refresh token- used to request new access token, stored in cookie, only accessed by server, not send to frotned, expiry time set to longer period (days)
//     const refreshToken = jwt.sign({
        
//         username: user.username,
        
//     }, process.env.REFRESH_TOKEN_SECRET,
//        {expiresIn: '1d'} )

//     //now we send the token generated from above to frontend through cookie-parser (cookies) = used to save token, session management etc (below is not rigt but kaam chalau)
//     // import cookie-parser in server.js, and app.use(cookieParser())
//     // REASON = token saved in cookies, so whenever browser req to our server, this token goes with every req
//     console.log("Logged in: ", accessToken)
    

//     res.cookie('jwt', refreshToken,  {
//   httpOnly: true,  //accessible only by web server
//   sameSite: 'lax',      // 'None' if you're on different domains, cross site cookie
//   secure: false,        // set to true if using HTTPS
//   maxAge: 7*24*60*60*1000  //cookie expiry set to match refreshToken expiry
// })   

// //send access token containing username , email, id, roles (if any) to authorize and get data in frontend
//     res.json({accessToken})

// }
// )

// router.get('/refresh', (req,res)=>{
//     const cookies = req.cookies
//     console.log("cookies refreshtoken: ", cookies)
//     if(!cookies?.jwt){
//         return res.status(401).json({message:'Unauthorized, token not found'})
//     }

//     const refreshToken = cookies.jwt

//     jwt.verify(
//         refreshToken,
//         process.env.REFRESH_TOKEN_SECRET,
//         (async (err,decoded)=>{
//             if(err) return res.status(403).json({message: 'Forbidden'})
            
//             const foundUser= await userModel.findOne({username: decoded.username})
//             console.log("User found after RT verified: ", foundUser)
//             if(!foundUser) return res.status(401).json({message: 'Unauthorized, user not found'})

//             const accessToken = jwt.sign({
//                 userId: foundUser._id,
//                 username: foundUser.username,
//                 email: foundUser.email
//             },
//             process.env.ACCESS_TOKEN_SECRET,
//             {expiresIn: '1m'}
//             )

//             res.status(200).json({
//                 accessToken
//             })
//         })
//     )
// })


// router.post('/logout', (req, res)=>{
//     const cookies = req.cookies
//     if(!cookies?.jwt) return res.sendStatus(204).json({message:"No content to send for this request except headers"})    //req succesful, no content
//     res.clearCookie('jwt', {
//         httpOnly:true,
//         sameSite: 'None',
//         secure:false
//     })

//     res.json({message:"User Logged Out"})
// })




// module.exports = router


router.get('/', authValidator, userControllers.fetchUser)

router.post('/register',
    [
    body('email').trim().isEmail().isLength({min:13}),   //trim() to remove whitespaces
    body('password').trim().isLength({min:5}),
    body('username').trim().isLength({min:3}),
    ],

    async (req, res, next)=>{
        const errors= validationResult(req)    //if above set validation failed, errors returned
            
            if(!errors.isEmpty()){
                
                return res.status(400).json({  //status = 200(when success), 400(error)
                    errors:errors.array(),
                    message:'Invalid Data',
                    success: false
                })
        
            }
            next()
    }
    ,
    userControllers.register
)


router.post('/login', 
//     [
//     body('password').trim().isLength({min:5}),  //trim() to remove whitespaces
//     body('username').trim().isLength({min:3}),
// ],

// async (req, res, next)=>{ const errors= validationResult(req)    //if above set validation failed, errors returned
    
//     if(!errors.isEmpty()){
//         // console.log(req.body)
        
//         return res.status(400).json({  //status = 200(when success), 400(error)
//             errors:errors.array(),
            
//             message:'Invalid Data'
//         })

//     }
// },

userControllers.login
)

router.get('/refresh', userControllers.refresh)

router.post('/logout', userControllers.logout)

module.exports = router