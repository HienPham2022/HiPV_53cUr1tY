'use stric'

const controller ={};

//show home page
controller.showHomePage = (req,res)=>{
    res.render('index');
};

//show pages
controller.showPage  = (req,res,next) =>{
    const pages = ['single'];
    if(pages.includes(req.params.page))
        return res.render(req.params.page);
    next();
};

module.exports =controller;