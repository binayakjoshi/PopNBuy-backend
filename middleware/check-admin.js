const HttpError = require('../models/http-error');


const checkAdmin = (req,res,next)=>{
	try{
		const role = req.headers.role.split(' ')[1];
		console.log(role);
		if(role!=='admin'){
			return next(new HttpError('As a customer you are not permitted to access this route.',401));
		}
		req.role = {role: role};
		next();

	}catch(err){
		return next(new HttpError('could not get the role',401));

	}
}
module.exports = checkAdmin;