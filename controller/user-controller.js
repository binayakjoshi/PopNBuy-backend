const express = require('express');
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const signup = async(req,res,next) => {

	const error =  validationResult(req);
	if(!error.isEmpty()){
		return(next(new HttpError('Ivalid data passed!!',422)));
	}

	const {name, email, password} = req.body;
	let existingUser;
	try{
		existingUser = await User.findOne({email});
	}catch(err){
		return((new HttpError('sth went wrong!!!',500)));
	}
	if(existingUser){
		return(next(new HttpError("Email already in use",422)));
	}
	let hashedPassword;
	try{
		hashedPassword = await bcrypt.hash(password,12);
	}catch(err){
		return(next(new HttpError('sth went wrong!!',500)));

	}
	const newUser = new User({
		name,
		email,
		password: hashedPassword,
	});
	try{
		await newUser.save();
	}catch(err){
		return(next(new HttpError('sth went wrong!!',500)));
	}
	let token;
	try{
		token = jwt.sign({userId:newUser.id,email:newUser.email},process.env.JWT_KEY,{expiresIn:'6h'});
	}catch(err){
		return(next(new HttpError('sth went wrong!!',500)));

	}
	res.status(201).json(
		{
			userId:newUser.id,
			email:newUser.email,
			token:token,
			role:newUser.role
		}
	);
};

const login = async(req,res,next)=>{

	let existingUser;
	const {email,password} = req.body;

	try{
		existingUser = await User.findOne({email:email});
	}catch(err){
		return(next(new HttpError('Something went wrong. Please try again later.',500)));
	}

	if(!existingUser){
		return(next(new HttpError('user does not exists',403)));
	}

	let validPassword;
	try{
		validPassword = await bcrypt.compare(password,existingUser.password);
	}catch(err){
		return(next(new HttpError('Something went wrong. Please try again later.',500)));
	}

	if(!validPassword){
		return(next(new HttpError('Invalid credentials. Please try again later')));
	}

	let token;
	try{
		token = jwt.sign({userId:existingUser.id,email:existingUser.email},process.env.JWT_KEY,{expiresIn:'6h'});
	}catch(err){
		return(next(new HttpError('Something went wrong. Please try again later.',500)));
	}

	res.status(201).json(
		{
			userId:existingUser.id,
			email:existingUser.email,
			role:existingUser.role,
			token:token
		});
};
const viewCart = async(req,res,next)=>{
	try{
		const role = req.headers.role.split(' ')[1];
		if(role!=='customer'){
			return next(new HttpError('Please log in as a customer to view the cart ',401));
		}
	}catch(err){
		return next(new HttpError('could not get the role',401));
	}
	const userId = req.params.uid;
	let user;
	try{
		user = await User.findById(userId).populate('cart.product');
 
	}catch(error){
		return next(new HttpError('could view the cart for some reason'),500);	
	}
	if(!user){
		return(next(new HttpError('no cart found for this id',404)));
	}
	res.status(201).json({
		cart : user.cart.map(item=>({
			product : item.product.toObject({getters:true}),
			quantity: item.quantity,
			color:item.color,
			size:item.size,
			
		}))
	});
};

const removeFromCart = async(req,res,next)=>{
	try{
		const role = req.headers.role.split(' ')[1];
		if(role!=='customer'){
			return next(new HttpError('Please log in as a customer to add to cart ',401));
		}
	}catch(err){
		return next(new HttpError('could not get the role',401));
	}
	const userId = req.params.uid;
	const {productId} = req.body;
	let user;
	try{
		user = await User.findById(userId);
 
	}catch(error){
		return next(new HttpError('could view the cart for some reason'),500);	
	}
	
	if(!user){
		return(next(new HttpError('no cart found for this id',404)));
	}
	const cartItemIndex = user.cart.findIndex(item=>item.product.toString()===productId);
	user.cart.splice(cartItemIndex,1);

	try{
		await user.save();
	}catch(err){
		return next(new HttpError('could view the cart for some reason'),500);	
	}
	res.status(201).json({
		cart : user.cart.map(item=>({
			product : item.product,
			quantity: item.quantity,
			color:item.color,
			size:item.size,
			
		}))
	});
}
exports.signup = signup;
exports.login = login;
exports.viewCart = viewCart;
exports.removeFromCart =removeFromCart;