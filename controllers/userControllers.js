const User = require('../models/userModel');
const nodeoutlook = require('nodejs-nodemailer-outlook');
const VerifyToken = require('../models/verifyModel');
const crypto = require('crypto');

const registerUser=async(req,res)=>{
    const {email,password}=req.body;

    if(!email || !password){
        res.status(400);
        throw new Error("Please enter all the fields");
    }

    const userExists = await User .findOne({email});

    if(userExists){
        res.status(400);
        throw new Error("User Alredy Exists");
    }

    const user = await User.create({
        email,password,
    });

    if(user){
        const verifyTokenResult = await VerifyToken.create({
            userId:user._id,
            token:crypto.randomBytes(32).toString('hex'),
        });
        // const verifyTokenResult =new VerifyToken({
        //     userId:user._id,
        //     token:crypto.randomBytes(32).toString('hex'),
        // }).save();

        console.log(verifyTokenResult);

        const url = `http://localhost:3000/api/user/${verifyTokenResult.userId}/verify/${verifyTokenResult.token}`;
        sendMail(user.email,url);
        res.status(201).send({message:"An email sent to your account"});
    }
    else{
        res.status(400);
        throw new Error("Failed to create a new User");
    }
};

const authUser = async(req,res)=>{
    const {email,password} = req.body;

    const user = await User.findOne({email});
    if(user && (await user.matchPassword(password))){
        if(!user.verified){
            // sendMail(email,);
            console.log("Sent a verificiation link on the mail");
        }
        else{
            console.log("logged in successfully");
        }
    }
    else{
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
};

const sendMail = async(recieverMail,url)=>{
    try{
        await nodeoutlook.sendEmail({
            auth:{
                user:process.env.EMAIL,
                pass:process.env.PASS,
            },
            from:process.env.EMAIL,
            to:recieverMail,
            subject:`Please Verify Your Account At ScholarChat`,
            text:`Click this link.\n ${url}`,
        })
        console.log('email sent successfully');
    }
    catch(error){
        console.log('error while sending email');
        console.log(error.message);
    }
};

const verifyUser = async(req,res)=>{
    try{
        const user= await User.findOne({_id:req.params.id});
        if(!user){
            return res.status(400).send({message:"Invalid Link"});
        }
        
        const verifyToken = await VerifyToken.findOne({
            userId:user._id,
            token:req.params.token,
        });
         
        if(!verifyToken){
            return res.status(400).send({message:"Invalid Link"});
        }

        await User.updateOne({_id:user._id,verified:true});
        await verifyToken.remove();

        res.status(200).send({message:"Email verified successfully"});
    }
    catch(error){
        res.status(500).send({message:"Internal server error"});
    }
};

module.exports = {registerUser,authUser,verifyUser};