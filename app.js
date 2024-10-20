const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const userRoutes = require('./routes/user-routes');
const productRoutes = require('./routes/product-routes');
const HttpError = require("./models/http-error");


const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;


app.use(cors({
    origin: 'https://popnbuy.netlify.app', 
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization','role'],
}));

app.use('/files/images',express.static(path.join('files','images')));

app.use('/users',userRoutes);
app.use('/products',productRoutes);

app.use((req, res, next) => {
	const error = new HttpError("couldn't find the route", 404);
	next(error);
});

app.use((error, req, res, next) => {
	if(req.file){
		fs.unlink(req.file.path,()=>{
			console.log(error);
		});
	}
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500).json({ message: error.message || 'an unknown error occured' });
});
mongoose
	.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dfagd0o.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`)
	.then(()=>app.listen(port))
	.catch((err)=>console.log(err));
