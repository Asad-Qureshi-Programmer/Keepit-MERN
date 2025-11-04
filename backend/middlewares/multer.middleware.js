const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {  //cb= callback to determine nameof uploaded file, first param) is null, second) destination where fileuploads 
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })

  module.exports = upload