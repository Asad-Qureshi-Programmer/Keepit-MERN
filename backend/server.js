// NOTE = .env file is secret, never upload to github, also nodemodules
//thus add them to gitignore file

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000;
const cors = require('cors')
const userRoute= require('./routes/user.routes')
const fileRoute = require('./routes/file.routes')
const folderRoute = require('./routes/folder.routes')

const dotenv = require('dotenv')
dotenv.config()
const connectToDB = require('./config/db')
connectToDB()
const cookieParser = require('cookie-parser')


//in production, db connected using func, then this func is imported in server.js, and then called in server.js

//in production, uri of databse is not exposed (it is secret),
// Every secret of backend kept in ----  .env   ------ file, in a variable and 
// then we need to download npm package "dotenv" to access that variable, import dotenv in server.js, then run "dotenv.config()" there
// using "process.env.varName"

app.use(cors({
  origin: ['https://keepitapp.vercel.app', 'http://localhost:5173'],
  credentials: true
}));


app.use(cookieParser())    //!!!!!!! IMP !!!!this step must be done above all middlewares and routes 
app.use(express.static('public'));

app.set('view engine', 'ejs')
app.use('/api', fileRoute)
app.use('/api/user', userRoute)
app.use('/api/folder', folderRoute)

app.get('/',(req,res)=>{
    res.json({'server':'index'})
})
app.get('/api/server',(req,res)=>{
    res.json({'server':'index of'})
})


app.listen(PORT, ()=>{
    console.log("Server Started on 3000")
})