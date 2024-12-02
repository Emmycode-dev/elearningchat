var express = require("express");
var router =express.Router();

const credential={
    email:"admin@gmail.com",
    password:"admin123"
}

//login user
router.post('/login',(req,res)=>{
    if(req.body.email==credential.email&&req.body.password==credential.password){
        req.session.user=req.body.email;
        res.redirect('/route/dashboard');
        //res.end("Login Succesful...!");
    }else{
        res.end("Invalid Username");
    }
})

//route for dashboard
router.get('/dashboard',(req,res)=>{
    if(req.session.user){
        res.render('dashboard',{user:req.session.user})
    }else{
        res.send("Unknown User")
    }
})


//route for register
router.get('/register',(req,res)=>{
    res.render('register')
})

//route for index
router.get('/index',(req,res)=>{
    res.render('index')
})


//route for staffLogin
router.get('/staffLogin',(req,res)=>{
    res.render('staffLogin')
})

//route for join class
router.get('/class',(req,res)=>{
    if(req.session.user){
        res.render('login',{user:req.session.user})
    }else{
        res.render('index');
    }
})


//route for join class
router.get('/startclass',(req,res)=>{
    if(req.session.user){
        res.render('chat',{user:req.session.user})
    }else{
        res.render('index');
    }
})
//route for logout
router.get('/logout',(req,res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Error")
        }else{
            res.render('index',{title:"Express",logout:"Logout Successfully"})
        }
    })
})


module.exports = router;