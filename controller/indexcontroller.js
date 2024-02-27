'use stric'

const controller ={};
const models =require('../models');

//show home page
controller.showHomePage =  (req,res)=>{
    res.render('index');
};



module.exports =controller;