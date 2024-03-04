const { User } = require('../models');
const bcrypt = require('bcryptjs');

const userController = {};

userController.loginPage = (req, res) => {
    res.render('login');
};

userController.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await userController.getUserByEmail(username);
    if (user && userController.comparePassword(password, user.password)) {
        req.session.user = user;
        res.redirect('/single');
    } else {
        res.redirect('login');
    }
};

userController.logout = (req, res) => {
    req.session.destroy();
    res.redirect('login');
};

userController.registerPage = (req, res) => {
    res.render('register');
};

userController.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = await userController.createUser({ username, password });
        req.session.user = newUser;
        res.redirect('/single');
    } catch (error) {
        res.status(500).send('Registration failed');
    }
};

userController.getUserByEmail = (email) => {
    return User.findOne({
        where: { username: email }
    });
};

userController.createUser = (user) => {
    var salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, salt);
    return User.create(user);
};

userController.comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

module.exports = userController;
