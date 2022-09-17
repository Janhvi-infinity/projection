//js
const express = require('express');
const {registerView, loginView ,submitProjectView, projectDetailsView} = require('../controllers/projectionController');
const router = express.Router();
router.get('/register', registerView);
router.get('/login', loginView);
router.get('/submitProject', submitProjectView);
router.get('/projectDetails', projectDetailsView);
module.exports = router;