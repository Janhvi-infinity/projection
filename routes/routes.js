//js
const express = require('express');
const passport = require("passport");
/**All router */
const { projectDetailsView,  googleauthS, Home, addPS, addPSpost, PSView,PSDetailView, problemstatmentinfo, postcomment, SearchPS, Projects, postProblemStatment, FF180, Myproject, userData} = require('../controllers/projectionController');


/**Group Router */
const {Mygroup,  } = require('../controllers/Group');


/**User Router */
const {registerView, loginView, registerPost, loginPost, logoutview } = require('../controllers/UserControllers');


/**Student Portal Router */
const { submitProjectView, uploads,} = require('../controllers/StudentPortal');

/**Subjects Router */
const router = express.Router();

const store = require('../middleware/multer')
const proController = require('../controllers/ProjectCon')

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
router.post('/ps/:id/comment', postcomment);
//problem statment view page
router.get('/ps',PSView );
router.get('/PSDetails', PSDetailView);
/// Individual projects 
router.get("/Projects", Projects);
//search post
router.post('/search', SearchPS);

// Problem statment details
router.get('/ps/:id', problemstatmentinfo);
router.get("/auth/google", passport.authenticate('google', { scope: ["profile"] }));
router.get("/auth/google/secrets",passport.authenticate('google', { failureRedirect: "/login" }),googleauthS);

/*******routes for individual projects  */
router.post('/Problem_Statment', postProblemStatment )

router.post('/FF180', store.single('FF180'), FF180 )


router.get('/group', Mygroup);
router.get('/:groupID/:subject', Myproject);
router.post('/userdata',userData );

module.exports = router;