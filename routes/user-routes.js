const express = require('express');
const {check} = require('express-validator');

const HttpError = require('../models/http-error');
const userController = require('../controller/user-controller');
const authenticate = require('../middleware/authentication');


const router = express.Router();

router.post(
	'/signup',
	[
		check('name').not().isEmpty(),
		check('password').isLength({min:6})
	],
	userController.signup
	);
router.post('/login',userController.login);

router.use(authenticate);
router.get('/:uid/viewCart',userController.viewCart);
router.delete('/:uid',userController.removeFromCart);


module.exports = router;