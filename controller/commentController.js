let controller = {};
const e = require('express');
const models = require('../models');

controller.showComment = async (req,res) =>{
    let comments = await models.Comment.findAll();
    res.locals.comments = comments;
    res.render('single');

};

//postcommnet
controller.postComment = async (req, res) => {
    const { name, email, website, message } = req.body;

    try {
        const comments = await models.Comment.create({
            username:name,
            email:email,
            urlweb:website,
            content:message,
            timeStemp: new Date(),
        });

        // Sending success response
        res.redirect('/single');
    } catch (err) {
        console.log('Error: ', err);
        // Sending error response
        res.status(500).send('Something went wrong, please try again');
    }
};

//delete comment
controller.deleteComment = async (req, res) => {
    try {
        // Delete all comments from the database
        await models.Comment.destroy({
            where: {}, // Delete all rows
            truncate: true 
        });

        // Send success response
        // res.status(200).send('All comments deleted successfully');
        res.redirect('/');
    } catch (err) {
        console.log('Error: ', err);
        // Send error response
        res.status(500).send('Something went wrong, please try again');
    }
};

 


module.exports = controller;