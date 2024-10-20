const express = require('express');
const {check} = require('express-validator');

const HttpError = require('../models/http-error');
const productController = require('../controller/product-controller');
const authenticate = require('../middleware/authentication');
const checkAdmin = require('../middleware/check-admin');

const imageUpload = require('../middleware/image-upload');

const router = express.Router();
//not logged in
router.get('/',productController.getAllProduct);
router.get('/:pid',productController.getProductById);
//customer

router.use(authenticate);
router.post(
	'/addToCart/:pid',
	[
		check('quantity').not().isEmpty(),
		check('color').not().isEmpty(),
		check('size').not().isEmpty(),
		],
	productController.addToCart);

//admin
router.use(checkAdmin);
router.post(
	'/addProduct',
	imageUpload.single('image'),
	[
		check('name').not().isEmpty(),
		check('description').isLength({min:6}),
		check('price').not().isEmpty(),
		check('colors').not().isEmpty(),
		check('sizes').not().isEmpty(),

		],
	productController.addProduct
	);
router.patch(
	'/:pid',
	[
		check('name').not().isEmpty(),
		check('description').isLength({min:6}),
		check('price').not().isEmpty(),
		check('colors').not().isEmpty(),
		check('size').not().isEmpty(),

		],
	productController.editProduct
	);
router.delete('/:pid',productController.deleteProduct);

module.exports = router;