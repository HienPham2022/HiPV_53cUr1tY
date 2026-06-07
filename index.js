'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const engineHandleBars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const sessionMiddleware = require('./middlewares/sessionMiddleware');

const app = express();
const port = process.env.PORT || 5555;
const pentestReconEnabled = process.env.PENTEST_RECON !== 'false';

// Security headers (relaxed for pentest recon lab)
app.use(helmet({
    contentSecurityPolicy: false,
    hidePoweredBy: !pentestReconEnabled
}));

// RECON-05: Global verbose headers when pentest lab is enabled
if (pentestReconEnabled) {
    app.use((req, res, next) => {
        res.setHeader('X-Application', 'hipv_53cur1ty/1.0.0');
        res.setHeader('X-Pentest-Lab', 'recon-enabled');
        next();
    });
}

// Static folder
app.use(express.static(`${__dirname}/securityPuplic`));

// RECON-12: Exposed .git repository (intentional — pentest lab only)
if (pentestReconEnabled) {
    app.use('/.git', express.static(path.join(__dirname, 'securityPuplic', '.git-pentest'), {
        dotfiles: 'allow',
        index: false
    }));
}

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

// Pentest Recon routes (information gathering lab)
if (pentestReconEnabled) {
    app.use('/', require('./routes/reconRouter'));
}

// Routes
app.use('/', require('./routes/indexRouter'));
app.use('/single', require('./routes/commentsRouter'));
app.use('/users', require('./routes/userRouter'));
app.use('/ngfw-test', require('./routes/ngfwTestRouter'));

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
const { getSequelizeOptions } = require('./config/database');

// Debug: hiển thị thông tin kết nối (ẩn password)
const dbConfig = getSequelizeOptions();
console.log('=== DB Config ===');
console.log('Host:', dbConfig.host);
console.log('Port:', dbConfig.port);
console.log('Database:', dbConfig.database);
console.log('Username:', dbConfig.username);
console.log('Password:', dbConfig.password ? '***SET***' : '***MISSING***');
console.log('=================');

sequelize.authenticate()
    .then(() => {
        console.log('Kết nối Supabase thành công!');
        // Auto sync tables (tạo bảng nếu chưa có)
        return sequelize.sync({ alter: false });
    })
    .then(() => {
        console.log('Database tables synced!');
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
            console.log(`NGFW Test UI: http://localhost:${port}/ngfw-test/`);
            if (pentestReconEnabled) {
                console.log(`Pentest Recon Lab: http://localhost:${port}/pentest-recon/`);
                console.log(`  robots.txt: http://localhost:${port}/robots.txt`);
                console.log(`  API docs:   http://localhost:${port}/api/docs`);
            }
            startNgfwHttpServer();
        });
    })
    .catch((err) => {
        console.error('Kết nối Supabase thất bại:', err.message);
        process.exit(1);
    });

/** Optional plain-HTTP server for Suricata (port 80). Set NGFW_HTTP_PORT=80 */
function startNgfwHttpServer() {
    const httpPort = process.env.NGFW_HTTP_PORT;
    if (!httpPort) return;

    const httpApp = express();
    httpApp.use(express.static(path.join(__dirname, 'securityPuplic')));
    httpApp.use('/ngfw-test', require('./routes/ngfwTestRouter'));
    httpApp.get('/', (req, res) => res.redirect('/ngfw-test/'));

    httpApp.listen(Number(httpPort), '0.0.0.0', () => {
        console.log('');
        console.log('╔══════════════════════════════════════════════════╗');
        console.log('║  NGFW HTTP Test (plaintext) — Suricata inspection  ║');
        console.log('╠══════════════════════════════════════════════════╣');
        console.log(`║  http://localhost:${httpPort}/ngfw-test/`.padEnd(51) + '║');
        console.log('║  Tunnel: pinggy / ngrok http ' + String(httpPort).padEnd(18) + '║');
        console.log('╚══════════════════════════════════════════════════╝');
        console.log('');
    });
}
