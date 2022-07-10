const express = require('express');
const connectDB = require('./config/db');
const dotenv=require('dotenv');
const userRoutes = require("./routes/userRoutes");

const app=express();
dotenv.config();
connectDB();

app.use(express.json());

app.use('/api/user',userRoutes);

app.get('/',(req,res)=>{
    res.send("API is running");
});

app.listen(3000,console.log(`Server running on : http://localhost:3000/`));