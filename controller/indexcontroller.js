'use strict';

const models = require('../models');

const controller = {};

controller.showHomePage = (req, res) => {
    res.render('index');
};

module.exports = controller;
