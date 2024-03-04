'use strict'
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.get('/login', userController.loginPage);


router.post('/login', userController.login);

// router.get('/single', (req, res) => {
//     if (req.session.user) {
//         res.render('single', { user: req.session.user });
//     } else {
//         res.redirect('/users/login');
//     }
// });

router.get('/logout', userController.logout);

router.get('/register', userController.registerPage);

router.post('/register', userController.registerPage);

module.exports = router;
