//js
const express = require('express');
const {registerView, loginView ,submitProjectView, projectDetailsView,  registerPost, loginPost, logoutview} = require('../controllers/projectionController');
const router = express.Router();
router.get('/register', registerView);
router.get('/login', loginView);
router.get('/submitProject', submitProjectView);
router.get('/projectDetails', projectDetailsView);
router.post('/register', registerPost)
router.post('/login', loginPost )
router.get('/logout', logoutview)
module.exports = router;