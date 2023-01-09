const multer = require('multer');
  
const storage = multer.diskStorage({
    destination: (cb) => {
        cb(null, 'uploads')
    },
    filename: (file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  
module.exports = store = multer({ storage: storage });