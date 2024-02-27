'use strict'

const express = require ('express');
const router = express.Router();
const controller = require('../controller/indexcontroller')

//route
router.get('/createUser',(req,res)=>{
    let models = require('../models');
    models.sequelize.sync().then(()=>{
        res.send('create user!!!')
    })
});


router.get('/',controller.showHomePage);

router.get('/:page',controller.showPage);



module.exports = router;