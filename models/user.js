const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema(
	{
		name: {type: String, required:true},
		email: {type: String, required: true, unique:true},
		password: {type:String,required:true, minlength:6},
		role: {type:String, default: 'customer'},
		cart : [
			{
				product: {type: mongoose.Types.ObjectId, ref:'Product', required:true},
				quantity: {type: Number, required:true},
				size: {type:String,required: true},
				color: {type:String,required: true}		
			}
		]
	}
);
userSchema.plugin(uniqueValidator);
const User = mongoose.model('User', userSchema);

module.exports = User;