'use strict';

const models = require('../models');

const controller = {};

controller.showComment = async (req, res) => {
    try {
        const comments = await models.Comment.findAll({ order: [['createdAt', 'DESC']] });
        res.locals.comments = comments;
        res.render('single');
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).render('error', { code: 500, message: 'Không thể tải bình luận' });
    }
};

controller.postComment = async (req, res) => {
    const { name, email, website, message } = req.body;

    if (!name || !message) {
        return res.status(400).redirect('/single');
    }

    try {
        await models.Comment.create({
            username: name,
            email: email || '',
            urlweb: website || '',
            content: message,
            timeStemp: new Date()
        });
        res.redirect('/single');
    } catch (err) {
        console.error('Error posting comment:', err);
        res.status(500).send('Something went wrong, please try again');
    }
};

controller.deleteComment = async (req, res) => {
    try {
        await models.Comment.destroy({ where: {}, truncate: true });
        res.status(200).json({ success: true, message: 'All comments deleted' });
    } catch (err) {
        console.error('Error deleting comments:', err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

module.exports = controller;
