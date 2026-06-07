'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const RECON_ROOT = path.join(__dirname, '..', 'securityPuplic', 'pentest-recon');
const UPLOADS_DIR = path.join(RECON_ROOT, 'uploads');

/** RECON-05: Verbose server / technology headers on recon responses */
function reconHeaders(req, res, next) {
    res.setHeader('Server', 'HiPV-Express/1.0.0 (Node.js 18; Ubuntu 22.04)');
    res.setHeader('X-Powered-By', 'Express/4.18.2 Sequelize/6.37.1 Handlebars/7.1.2');
    res.setHeader('X-Backend-Server', 'hipv-internal-api-01');
    res.setHeader('X-Framework', 'Express');
    res.setHeader('X-Runtime', 'Node.js v18.19.0');
    res.setHeader('X-Debug-Mode', 'enabled');
    next();
}

router.use(reconHeaders);

/** RECON-08: Exposed Swagger / OpenAPI (no authentication) */
router.get('/api/swagger.json', (req, res) => {
    res.sendFile(path.join(RECON_ROOT, 'api-docs', 'swagger.json'));
});

router.get('/api/docs', (req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>HiPV API Docs</title></head>
<body>
<h1>HiPV Internal API Documentation</h1>
<p>Swagger spec: <a href="/api/swagger.json">/api/swagger.json</a></p>
<p>Hidden admin: <a href="/pentest-recon/admin/">/pentest-recon/admin/</a></p>
<p>Debug endpoint: <a href="/api/debug">/api/debug</a></p>
</body></html>`);
});

/** RECON-09: Health / status endpoints leaking system info */
router.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'hipv_53cur1ty',
        version: '1.0.0',
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime_seconds: Math.floor(process.uptime()),
        env: process.env.NODE_ENV || 'development',
        database: 'postgresql (supabase pooler)',
        session_store: 'memory',
        internal_paths: {
            admin: '/pentest-recon/admin/',
            backup: '/pentest-recon/backup/',
            staging: '/pentest-recon/staging/',
            git: '/.git/HEAD'
        }
    });
});

router.get('/api/status', (req, res) => {
    res.json({
        server: 'hipv-internal-api-01',
        region: 'ap-northeast-2',
        maintenance_window: 'Sunday 02:00-04:00 UTC',
        endpoints: ['/api/health', '/api/debug', '/api/users/check', '/api/server-info']
    });
});

/** RECON-09: Debug endpoint — paths, env hints */
router.get('/api/debug', (req, res) => {
    res.json({
        debug: true,
        cwd: process.cwd(),
        dirname: __dirname,
        node_modules: path.join(process.cwd(), 'node_modules'),
        views: path.join(process.cwd(), 'views'),
        config_files: [
            '/config/config.json',
            '/.env.example',
            '/pentest-recon/backup/site-config.old'
        ],
        default_admin_hint: 'admin / Admin@2024!',
        session_secret_hint: 'check .env.example or /pentest-recon/private/credentials-hint.txt',
        createUser_endpoint: '/createUser'
    });
});

router.get('/api/server-info', (req, res) => {
    res.json({
        express: '4.18.2',
        sequelize: '6.37.1',
        handlebars: '7.1.2',
        bcryptjs: '2.4.3',
        helmet: '7.1.0',
        database_dialect: 'postgres',
        deployment: 'render-compatible',
        pentest_lab: '/pentest-recon/'
    });
});

/** RECON-10: User enumeration — different responses for existing vs non-existing users */
router.get('/api/users/check', async (req, res) => {
    const username = (req.query.username || '').trim();
    if (!username) {
        return res.status(400).json({ error: 'username parameter required', example: '/api/users/check?username=admin' });
    }

    try {
        const { User } = require('../models');
        const user = await User.findOne({ where: { username }, attributes: ['id', 'username', 'createdAt'] });
        if (user) {
            return res.json({
                exists: true,
                username: user.username,
                user_id: user.id,
                registered_at: user.createdAt,
                message: 'User found in database'
            });
        }
        return res.json({ exists: false, username, message: 'Username is available for registration' });
    } catch (err) {
        return res.status(500).json({ error: err.message, stack: err.stack });
    }
});

/** RECON-14: Verbose error messages with stack trace */
router.get('/api/error', (req, res) => {
    const type = req.query.type || 'generic';
    if (type === 'stack') {
        const err = new Error('Simulated database connection failure at Sequelize.authenticate()');
        err.code = 'ECONNREFUSED';
        return res.status(500).json({
            error: err.message,
            stack: err.stack,
            path: '/config/database.js',
            query: 'SELECT * FROM users WHERE username = $1',
            host: process.env.DB_HOST || 'aws-1-ap-northeast-2.pooler.supabase.com',
            port: process.env.DB_PORT || '5432'
        });
    }
    if (type === 'path') {
        return res.status(404).json({
            error: 'ENOENT: no such file or directory',
            path: req.query.file || '/var/www/hipv/config/.env',
            syscall: 'open',
            errno: -2
        });
    }
    res.status(500).json({ error: 'Internal Server Error', detail: 'Unhandled exception in userController.login' });
});

/** RECON-04: Directory listing on uploads folder */
router.get('/pentest-recon/uploads/', (req, res) => {
    fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) {
            return res.status(500).send(`<pre>Cannot read directory: ${UPLOADS_DIR}\n${err.message}</pre>`);
        }
        const links = files.map((f) => {
            const stat = fs.statSync(path.join(UPLOADS_DIR, f));
            const size = stat.isFile() ? `${stat.size} bytes` : 'dir';
            return `<li><a href="/pentest-recon/uploads/${f}">${f}</a> (${size})</li>`;
        }).join('\n');

        res.type('html').send(`<!DOCTYPE html>
<html><head><title>Index of /pentest-recon/uploads/</title></head>
<body>
<h1>Index of /pentest-recon/uploads/</h1>
<hr>
<ul>${links}</ul>
<hr>
<address>HiPV-Express/1.0.0 Server at ${req.hostname}</address>
</body></html>`);
    });
});

/** RECON-17: OPTIONS method — allowed methods disclosure */
router.options(/^\/api(\/.*)?$/, (req, res) => {
    res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Debug-Token');
    res.status(204).end();
});

/** RECON-13: Config / env leak at predictable paths */
router.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'config', 'config.json'));
});

router.get('/.env.example', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '.env.example'));
});

/** Wordlist for directory brute-force validation */
router.get('/pentest-recon/wordlist.txt', (req, res) => {
    res.type('text').sendFile(path.join(RECON_ROOT, 'wordlist.txt'));
});

/** RECON landing page */
router.get('/pentest-recon', (req, res) => {
    res.redirect('/pentest-recon/');
});

module.exports = router;
