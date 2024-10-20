const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
	name: {type: String, required: true	},
	description: {type: String, required : true},
	price: { type: Number, required : true},
	image: {type:String, required: true},
	colors: [{type:String, required:true}],
	sizes: [{type:String, required:true}],
	isAvailable: {type:Boolean, default:true}
});
const Product = mongoose.model('Product',ProductSchema);

module.exports = Product;