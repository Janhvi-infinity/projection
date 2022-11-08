//js
const express = require('express');
const passport = require("passport");
const {registerView, loginView ,submitProjectView, projectDetailsView,  registerPost, loginPost, logoutview, uploads, googleauthS, Home, addPS, addPSpost, PSView,PSDetailView, problemstatmentinfo, postcomment} = require('../controllers/projectionController');
const router = express.Router();

const store = require('../middleware/multer')

router.post('/uploadmultiple', store.single('image') , uploads)
router.get('/', Home )
router.get('/register', registerView);
router.get('/login', loginView);
router.get('/submitProject', submitProjectView);
router.get('/projectDetails', projectDetailsView);
router.post('/register', registerPost);
router.post('/login', loginPost );
router.get('/logout', logoutview);
router.get('/addProblemS', addPS );
router.post('/addPS',addPSpost);
router.post('/comment', postcomment);
//problem statment view page
router.get('/PSView',PSView );
router.get('/PSDetails', PSDetailView,)
// Problem statment details
router.get('/ps/:id', problemstatmentinfo);
router.get("/auth/google", passport.authenticate('google', { scope: ["profile"] }));
router.get("/auth/google/secrets",passport.authenticate('google', { failureRedirect: "/login" }),googleauthS);

module.exports = router;