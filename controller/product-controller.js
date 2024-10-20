const express = require('express');
const mongoose = require('mongoose');
const {validationResult} = require('express-validator');


const HttpError = require('../models/http-error');
const Product = require('../models/product');
const User = require('../models/user');

const getAllProduct = async (req,res,next)=>{
	let products;
	try{
		products = await Product.find({});
	}catch(error){
		return next(new HttpError('could not laod products',500));
	}
	res.status(201).json({products: products.map(product=>product.toObject({getters:true})) });

};
	

const getProductById = async(req,res,next)=>{
	const productId = req.params.pid;
	let product;
	try{
		product = await Product.findById(productId);
	}catch(error){
		return next(new HttpError('sth went wrong please try again'),500);
	}
	if(!product){
		return next(new HttpError('could not find the product of that id'),404);
	}
	res.status(201).json({product: product.toObject({getters:true})});


};

const addProduct= async(req,res,next)=>{
	const error = validationResult(req);
	if(!error.isEmpty()){
		return next(new HttpError('Invalid data passed'));
	}

	const {name,price,description,colors,sizes,isAvailable} = req.body;
	const colorsArray = colors.split(',').map(color => color.trim());
  	const sizesArray = sizes.split(',').map(size => size.trim());
	const newProduct = new Product({
		name,
		description,
		price,
		colors:colorsArray,
		sizes:sizesArray,
		image:req.file.path,
		isAvailable: isAvailable||true,
	});
	try{
		await newProduct.save();
	}catch(err){
		console.log(err);
		return next(new HttpError('could not add new product',500));

	}
	res.status(201).json({product: newProduct});
 
};

const addToCart = async(req,res,next)=>{
	try{
		const role = req.headers.role.split(' ')[1];
		if(role!=='customer'){
			return next(new HttpError('Please log in as a customer to add to cart ',401));
		}
		req.role = {role: role};
	}catch(err){
		return next(new HttpError('could not get the role',401));
	}

	const productId = req.params.pid;
	

	const userId = req.userData.userId;
	const {quantity,color,size} = req.body;
	
	let user,product;
	try{
		user = await User.findById(userId);

	}catch(error){
		console.log(error);
		return next(new HttpError('sthh went wrong. Please try again.',500));
	}
	try{
		product = await Product.findById(productId);

	}catch(error){
		console.log(error);
		return next(new HttpError('sthh went wrong. Please try again.',500));
	}

	if(!user){
		return next(new HttpError('could not find the user for the id',404));
	}
	if(!product){
		return next(new HttpError('could not find the product for the id',404));
	}
	user.cart.push({
		product:productId,
		quantity,
		color,
		size
	});
	try{
		await user.save();
	}catch(err){
		console.log(err);
		return next(new HttpError('could not  add to cart.',500));

	}
	
	res.status(201).json({cart: user.cart});

};

const editProduct = async(req,res,next)=>{
	const productId = req.params.pid;
	const {name,price,description,colors,sizes,isAvailable} = req.body;
	try{
		product = await Product.findById(productId);
	}catch(error){
		return next(new HttpError('sth went wrong'),500);
	}
	if(!product){
		return next(new HttpError('could not find product with that id'),404);
	}
	product.name = name;
	product.price = price;
	product.description = description;
	product.colors = colors;
	product.sizes = sizes;
	product.isAvailable = isAvailable;
	try{
		await product.save();
	}catch(error){
		return next(new HttpError('could not update the product',500));

	}
	
	res.status(201).json({product: product});
};
	

const deleteProduct = async(req,res,next)=>{
	let product;
	const productId = req.params.pid;
	try{
		await Product.findByIdAndDelete(productId);
	}catch(e){
		return next('could not find the product with that ID',500);
	}
	res.status(201).json({message:'the product was deleted'});
	
};


exports.getAllProduct = getAllProduct;
exports.getProductById = getProductById;
exports.addProduct = addProduct;
exports.addToCart = addToCart;
exports.editProduct = editProduct;
exports.deleteProduct = deleteProduct;