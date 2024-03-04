'use strict'

const express = require ('express');
const router = express.Router();
const controller = require('../controller/indexcontroller')

//create data for database
router.get('/createUser',(req,res)=>{
    let models = require('../models');
    models.sequelize.sync().then(()=>{
        res.send('create user!!!')
    })
});

//route
router.get('/',controller.showHomePage);



module.exports = router;