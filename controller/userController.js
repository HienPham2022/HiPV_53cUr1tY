'use strict';

const { User } = require('../models');
const bcrypt = require('bcryptjs');

const userController = {};
const SESSION_DURATION = 24 * 60 * 60 * 1000;

userController.loginPage = (req, res) => {
    if (req.session.user) return res.redirect('/single');
    res.render('login');
};

userController.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', {
            message: 'Vui lòng nhập đầy đủ thông tin!',
            type: 'alert-warning'
        });
    }

    try {
        const user = await userController.getUserByUsername(username);
        if (user && userController.comparePassword(password, user.password)) {
            req.session.cookie.maxAge = SESSION_DURATION;
            req.session.user = user;
            return res.redirect('/single');
        }
        res.render('login', {
            message: 'Sai tên đăng nhập hoặc mật khẩu!',
            type: 'alert-danger'
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).render('error', { code: 500, message: 'Lỗi đăng nhập' });
    }
};

userController.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/users/login');
    });
};

userController.registerPage = (req, res) => {
    if (req.session.user) return res.redirect('/single');
    res.render('register');
};

userController.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('register', {
            message: 'Vui lòng nhập đầy đủ thông tin!',
            type: 'alert-warning'
        });
    }

    try {
        const existing = await userController.getUserByUsername(username);
        if (existing) {
            return res.render('register', {
                message: 'Tên đăng nhập đã tồn tại!',
                type: 'alert-danger'
            });
        }
        const newUser = await userController.createUser({ username, password });
        req.session.cookie.maxAge = SESSION_DURATION;
        req.session.user = newUser;
        res.redirect('/single');
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).render('error', { code: 500, message: 'Đăng ký thất bại' });
    }
};

userController.deleteAllUsers = async (req, res) => {
    try {
        await User.destroy({ where: {}, truncate: true });
        req.session.destroy(() => {
            res.status(200).json({ success: true, message: 'All users deleted' });
        });
    } catch (err) {
        console.error('Delete users error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete all users' });
    }
};

userController.getUserByUsername = (username) => {
    return User.findOne({ where: { username } });
};

userController.createUser = (user) => {
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, salt);
    return User.create(user);
};

userController.comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

module.exports = userController;
