'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controller/commentController');

router.get('/', controller.showComment);
router.post('/comments', controller.postComment);
router.delete('/deleteComment', controller.deleteComment);

module.exports = router;
