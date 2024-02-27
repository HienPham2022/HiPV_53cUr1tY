let controller = {};
const models = require('../models');

controller.showComment = async (req,res) =>{
    let comments = await models.Comment.findAll();
    res.locals.comments = comments;
    res.render('single');

};

module.exports = controller;