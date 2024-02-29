'use strict'
const express = require('express');
const router = express.Router();
const controller = require('../controller/commentController');
// const { route } = require('./indexRouter');


//route comment
router.get('/',controller.showComment);

//delete

router.delete('/deleteComment', controller.deleteComment);

//post
router.post('/comments', controller.postComment);


module.exports = router;