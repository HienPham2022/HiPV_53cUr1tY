'use strict'
const express = require('express');
const router = express.Router();
const controller = require('../controller/commentController');


//route comment
router.get('/',controller.showComment);

//post
router.post('/comments', controller.postComment);


module.exports = router;