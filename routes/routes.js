//js
const express = require('express');
const {registerView, loginView ,submitProjectView, projectDetailsView,  registerPost, loginPost, logoutview, uploads} = require('../controllers/projectionController');
const router = express.Router();

const store = require('../middleware/multer')

router.post('/uploadmultiple', store.single('image') , uploads)

router.get('/register', registerView);
router.get('/login', loginView);
router.get('/submitProject', submitProjectView);
router.get('/projectDetails', projectDetailsView);
router.post('/register', registerPost)
router.post('/login', loginPost )
router.get('/logout', logoutview)


module.exports = router;