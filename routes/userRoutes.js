const express = require('express');

const {registerUser,authUser,verifyUser}= require('../controllers/userControllers');

const router = express.Router();

router.route('/').post(registerUser);
router.route('/login').post(authUser);
router.route('/:id/verify/:token').get(verifyUser);

module.exports = router;