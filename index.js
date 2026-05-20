'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const engineHandleBars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const sessionMiddleware = require('./middlewares/sessionMiddleware');

const app = express();
const port = process.env.PORT || 5555;

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Static folder
app.use(express.static(`${__dirname}/securityPuplic`));

// Handlebars engine
const hbs = engineHandleBars.create({
    layoutsDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`,
    extname: 'hbs',
    defaultLayout: 'layout',
    helpers: {
        raw(options) {
            return options.fn(this);
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('vi-VN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
        }
    },
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: null
    }
}));

app.use(sessionMiddleware);

// Routes
app.use('/', require('./routes/indexRouter'));
app.use('/single', require('./routes/commentsRouter'));
app.use('/users', require('./routes/userRouter'));

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { code: 404, message: 'Trang không tồn tại' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { code: 500, message: 'Lỗi máy chủ nội bộ' });
});

// Start server after DB check
const { sequelize } = require('./models');

sequelize.authenticate()
    .then(() => {
        console.log('Kết nối Supabase thành công!');
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Kết nối Supabase thất bại:', err.message);
        process.exit(1);
    });
