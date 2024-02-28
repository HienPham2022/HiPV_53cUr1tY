let controller = {};
const models = require('../models');

controller.showComment = async (req,res) =>{
    let comments = await models.Comment.findAll();
    res.locals.comments = comments;
    res.render('single');

};

//add comment
controller.postComment = async (req, res) => {
    const { name, email, urlPath, content } = req.body;
    try {
        const newComment = await models.Comment.create({
            name: name,
            email: email,
            urlweb: urlPath,
            content: content,
            timeStemp: Sequelize.literal('NOW()') // Sử dụng Sequelize.literal để chèn giá trị hiện tại của timestamp
        });
        res.status(201).json({ success: true, comment: newComment });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports = controller;