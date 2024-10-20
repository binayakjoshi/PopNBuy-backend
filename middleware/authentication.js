const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');


const authenticate = (req,res,next)=> {
	try{
		const token = req.headers.authorization.split(' ')[1];
		if(!token){
			return next(new HttpError('you are not permitted to this route',401));
		}
		const decodedToken = jwt.verify(token,'top_secret');
		req.userData = {userId: decodedToken.userId};
		next();

	}catch(error){
		return next(new HttpError('Please Login First.',401));
	}
	
}
module.exports = authenticate;