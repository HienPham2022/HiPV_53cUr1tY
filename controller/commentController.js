let controller = {};
const models = require('../models');

controller.showComment = async (req,res) =>{
    let comments = await models.Comment.findAll();
    res.locals.comments = comments;
    res.render('single');

};

//postcommnet
controller.postComment = async (req, res) => {
    const { username, email, urlweb, content } = req.body;

    try {
        const comments = await models.Comment.create({
            username,
            email,
            urlweb,
            content,
            timeStemp: new Date(),
        });

        // Sending success response
        res.redirect(req.get('/single'));
    } catch (err) {
        console.log('Error: ', err);
        // Sending error response
        res.status(500).send('Something went wrong, please try again');
    }
};
 


module.exports = controller;