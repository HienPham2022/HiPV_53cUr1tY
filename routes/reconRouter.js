'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const PROJECT_ROOT = path.join(__dirname, '..');
const RECON_ROOT = path.join(PROJECT_ROOT, 'securityPuplic', 'pentest-recon');
const UPLOADS_DIR = path.join(RECON_ROOT, 'uploads');
const BACKUP_DIR = path.join(RECON_ROOT, 'backup');

function renderDirectoryListing(req, res, dirPath, urlPath) {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            return res.status(500).send(`<pre>Cannot read: ${dirPath}\n${err.message}</pre>`);
        }
        const links = files.map((f) => {
            const stat = fs.statSync(path.join(dirPath, f));
            const size = stat.isFile() ? `${stat.size} bytes` : 'dir';
            return `<li><a href="${urlPath}${f}">${f}</a> (${size})</li>`;
        }).join('\n');
        res.type('html').send(`<!DOCTYPE html>
<html><head><title>Index of ${urlPath}</title></head>
<body><h1>Index of ${urlPath}</h1><hr><ul>${links}</ul>
<hr><address>HiPV-Express/1.0.0 Server at ${req.hostname}</address></body></html>`);
    });
}

/** RECON-05: Verbose server / technology headers */
function reconHeaders(req, res, next) {
    res.setHeader('Server', 'HiPV-Express/1.0.0 (Node.js 18; Ubuntu 22.04)');
    res.setHeader('X-Powered-By', 'Express/4.18.2 Sequelize/6.37.1 Handlebars/7.1.2');
    res.setHeader('X-Backend-Server', 'hipv-internal-api-01');
    res.setHeader('X-Framework', 'Express');
    res.setHeader('X-Runtime', 'Node.js v18.19.0');
    res.setHeader('X-Debug-Mode', 'enabled');
    res.setHeader('X-AspNet-Version', '4.0.30319');
    res.setHeader('X-Generator', 'WordPress 6.4.2');
    res.setHeader('X-Drupal-Cache', 'HIT');
    res.setHeader('X-Request-Id', `hipv-${Date.now()}`);
    if (req.method === 'GET') {
        res.setHeader('ETag', `"hipv-${Buffer.from(req.path).toString('hex').slice(0, 12)}"`);
        res.setHeader('Last-Modified', 'Thu, 15 Nov 2024 08:00:00 GMT');
    }
    next();
}

router.use(reconHeaders);

/** RECON-18: Virtual host discovery — different content per Host header */
router.get('/pentest-recon/vhost-test', (req, res) => {
    const host = (req.headers.host || '').toLowerCase();
    const vhosts = {
        'admin.hipv-demo.local': { role: 'admin-panel', redirect: '/pentest-recon/admin/', secret: 'admin_vhost_key' },
        'api.hipv-demo.local': { role: 'api-gateway', swagger: '/api/swagger.json', internal: '/api/debug' },
        'staging.hipv-demo.local': { role: 'staging', path: '/pentest-recon/staging/' },
        'dev.hipv-demo.local': { role: 'development', notes: '/pentest-recon/dev/notes.txt' },
        'vpn.hipv-demo.local': { role: 'vpn-gateway', ldap: 'ldap://10.0.1.50:389' },
        'mail.hipv-demo.local': { role: 'mail-server', smtp: 'smtp.hipv-demo.local:587' }
    };
    for (const [vh, info] of Object.entries(vhosts)) {
        if (host.startsWith(vh) || host === vh) {
            return res.json({ detected: true, virtual_host: vh, ...info });
        }
    }
    res.json({
        detected: false,
        hint: 'Try Host headers: admin.hipv-demo.local, api.hipv-demo.local, staging.hipv-demo.local',
        known_vhosts: Object.keys(vhosts),
        dns_hints: '/pentest-recon/dns/dns-records.txt'
    });
});

/** RECON-32: TRACE method enabled */
router.use((req, res, next) => {
    if (req.method !== 'TRACE') return next();
    const body = [
        `TRACE ${req.originalUrl} HTTP/1.1`,
        `Host: ${req.headers.host}`,
        `X-Forwarded-For: ${req.headers['x-forwarded-for'] || 'not-set'}`,
        `User-Agent: ${req.headers['user-agent'] || 'not-set'}`,
        `Cookie: ${req.headers.cookie || 'not-set'}`
    ].join('\r\n');
    res.setHeader('Content-Type', 'message/http');
    res.send(body);
});

/** RECON-08: Swagger / OpenAPI */
router.get('/api/swagger.json', (req, res) => {
    res.sendFile(path.join(RECON_ROOT, 'api-docs', 'swagger.json'));
});

router.get('/api/docs', (req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>HiPV API Docs</title></head>
<body>
<h1>HiPV Internal API Documentation</h1>
<p>Swagger: <a href="/api/swagger.json">/api/swagger.json</a> |
   GraphQL: <a href="/graphql">/graphql</a> |
   Actuator: <a href="/actuator">/actuator</a></p>
<p>Hidden: <a href="/pentest-recon/admin/">admin</a> |
   <a href="/api/debug">debug</a> |
   <a href="/metrics">metrics</a></p>
</body></html>`);
});

/** RECON-09: Health / debug / status */
router.get('/api/health', (req, res) => {
    res.json({
        status: 'ok', service: 'hipv_53cur1ty', version: '1.0.0',
        node: process.version, platform: process.platform, arch: process.arch,
        uptime_seconds: Math.floor(process.uptime()),
        env: process.env.NODE_ENV || 'development',
        database: 'postgresql (supabase pooler)', session_store: 'memory',
        internal_paths: {
            admin: '/pentest-recon/admin/', backup: '/pentest-recon/backup/',
            staging: '/pentest-recon/staging/', git: '/.git/HEAD',
            svn: '/.svn/entries', metrics: '/metrics', graphql: '/graphql'
        }
    });
});

router.get('/api/status', (req, res) => {
    res.json({
        server: 'hipv-internal-api-01', region: 'ap-northeast-2',
        maintenance_window: 'Sunday 02:00-04:00 UTC',
        endpoints: ['/api/health', '/api/debug', '/api/users/check', '/api/server-info', '/api/v1/', '/api/v2/']
    });
});

router.get('/api/debug', (req, res) => {
    res.json({
        debug: true, cwd: process.cwd(), dirname: __dirname,
        node_modules: path.join(process.cwd(), 'node_modules'),
        views: path.join(process.cwd(), 'views'),
        config_files: ['/config.json', '/.env.example', '/package.json', '/docker-compose.yml'],
        default_admin_hint: 'admin / Admin@2024!',
        session_secret_hint: '/pentest-recon/private/credentials-hint.txt',
        createUser_endpoint: '/createUser',
        vhosts: ['admin.hipv-demo.local', 'api.hipv-demo.local', 'staging.hipv-demo.local']
    });
});

router.get('/api/server-info', (req, res) => {
    res.json({
        express: '4.18.2', sequelize: '6.37.1', handlebars: '7.1.2',
        bcryptjs: '2.4.3', helmet: '7.1.0', database_dialect: 'postgres',
        deployment: 'render-compatible', pentest_lab: '/pentest-recon/',
        manifest: '/pentest-recon/manifest.json'
    });
});

/** RECON-41: API versioning */
router.get('/api/v1', (req, res) => {
    res.json({
        version: 'v1', status: 'deprecated', sunset: '2025-06-01',
        endpoints: { users: '/api/v1/users', config: '/api/v1/config', reports: '/api/v1/reports' }
    });
});

router.get('/api/v1/users', (req, res) => {
    res.json({
        users: [
            { id: 0, username: 'hienpham', email: 'hienpham@gmail.com', role: 'security_lead' },
            { id: 1, username: 'admin', email: 'admin@hipv-demo.local', role: 'superadmin' },
            { id: 2, username: 'operator', email: 'ops@hipv-demo.local', role: 'operator' }
        ],
        note: 'RECON: Unauthenticated user list'
    });
});

router.get('/api/v1/config', (req, res) => {
    res.json({
        app: 'hipv_53cur1ty', debug: true, api_key: 'hipv_recon_demo_key_2024',
        db_host: 'aws-1-ap-northeast-2.pooler.supabase.com', session_ttl: 86400
    });
});

router.get('/api/v1/reports', (req, res) => {
    res.json({ reports: ['/pentest-recon/uploads/report-Q4-2024.txt'], audit_log: '/pentest-recon/logs/audit.log' });
});

router.get('/api/v2', (req, res) => {
    res.json({
        version: 'v2', status: 'current',
        endpoints: { users: '/api/v2/users', graphql: '/graphql', metrics: '/metrics' }
    });
});

router.get('/api/v2/users', (req, res) => {
    res.json({ total: 5, endpoint: '/api/users/check?username=', format: 'json' });
});

/** RECON-27: Spring Actuator-style endpoints */
router.get('/actuator', (req, res) => {
    res.json({
        _links: {
            self: { href: '/actuator' },
            health: { href: '/actuator/health' },
            env: { href: '/actuator/env' },
            mappings: { href: '/actuator/mappings' },
            beans: { href: '/actuator/beans' },
            heapdump: { href: '/actuator/heapdump' }
        }
    });
});

router.get('/actuator/health', (req, res) => {
    res.json({ status: 'UP', components: { db: { status: 'UP', details: { database: 'PostgreSQL' } }, diskSpace: { status: 'UP' } } });
});

router.get('/actuator/env', (req, res) => {
    res.json({
        activeProfiles: ['development'],
        propertySources: [{
            name: 'systemEnvironment',
            properties: {
                DB_HOST: { value: 'aws-1-ap-northeast-2.pooler.supabase.com' },
                SESSION_SECRET: { value: 'hipv_demo_session_secret_do_not_use_in_prod' },
                INTERNAL_API_KEY: { value: 'hipv_recon_demo_key_2024' }
            }
        }]
    });
});

router.get('/actuator/mappings', (req, res) => {
    res.json({
        contexts: {
            application: {
                mappings: {
                    dispatcherServlets: {
                        dispatcherServlet: [
                            { predicate: '{GET [/api/debug]}', handler: 'reconRouter.debug' },
                            { predicate: '{GET [/pentest-recon/admin/]}', handler: 'static.admin' },
                            { predicate: '{GET [/actuator/env]}', handler: 'reconRouter.actuatorEnv' }
                        ]
                    }
                }
            }
        }
    });
});

router.get('/actuator/beans', (req, res) => {
    res.json({ contexts: { application: { beans: { userController: { scope: 'singleton', type: 'controller' }, sequelize: { scope: 'singleton', type: 'orm' } } } } });
});

router.get('/actuator/heapdump', (req, res) => {
    res.status(503).json({ error: 'Heap dump disabled in demo', hint: 'Endpoint discoverable via /actuator' });
});

/** RECON-28: GraphQL introspection */
router.get('/graphql', (req, res) => {
    if (req.query.query && req.query.query.includes('IntrospectionQuery')) {
        return res.json({
            data: {
                __schema: {
                    types: [
                        { name: 'User', fields: ['id', 'username', 'email', 'password', 'role'] },
                        { name: 'Query', fields: ['users', 'user', 'config', 'secrets'] }
                    ],
                    queryType: { name: 'Query' }
                }
            }
        });
    }
    res.json({
        graphql: true,
        introspection: 'enabled',
        hint: 'POST or GET with query=IntrospectionQuery',
        sample_query: '{ users { id username email password } }',
        endpoint: '/graphql'
    });
});

router.post('/graphql', (req, res) => {
    const query = (req.body && req.body.query) || '';
    if (query.includes('users') || query.includes('IntrospectionQuery')) {
        return res.json({
            data: {
                users: [
                    { id: 0, username: 'hienpham', email: 'hienpham@gmail.com', password: '$2a$10$...', role: 'security_lead' },
                    { id: 1, username: 'admin', email: 'admin@hipv-demo.local', password: '$2a$10$...', role: 'superadmin' }
                ]
            }
        });
    }
    res.json({ errors: [{ message: 'Unknown query', hint: 'Try { users { username email password } }' }] });
});

/** RECON-29: Prometheus / metrics */
router.get('/metrics', (req, res) => {
    res.type('text').send(`# HELP hipv_http_requests_total Total HTTP requests
hipv_http_requests_total{method="GET",path="/api/debug"} 142
hipv_http_requests_total{method="GET",path="/.git/HEAD"} 89
# HELP hipv_active_users Active users
hipv_active_users 3
# HELP hipv_db_connections Database connections
hipv_db_connections{host="aws-1-ap-northeast-2.pooler.supabase.com"} 5
# TYPE hipv_uptime_seconds gauge
hipv_uptime_seconds ${Math.floor(process.uptime())}
`);
});

/** RECON-30: Apache server-status style */
router.get('/server-status', (req, res) => {
    res.type('html').send(`<!DOCTYPE html><html><head><title>Apache Status</title></head>
<body><h1>Apache Server Status for ${req.hostname}</h1>
<p>Server Version: Apache/2.4.57 (Ubuntu) mod_wsgi/4.9.0 — <b>DECOY for recon</b></p>
<table border="1"><tr><th>PID</th><th>Method</th><th>Request</th></tr>
<tr><td>1234</td><td>GET</td><td>/.git/HEAD</td></tr>
<tr><td>1235</td><td>GET</td><td>/pentest-recon/backup/database.sql.bak</td></tr>
</table>
<p>Also try: <a href="/server-info">/server-info</a></p></body></html>`);
});

router.get('/server-info', (req, res) => {
    res.type('html').send(`<html><body><h1>Server Information</h1>
<p>Apache/2.4.57 mod_ssl/2.4.57 OpenSSL/1.1.1w</p>
<p>Server Root: /var/www/hipv</p>
<p>Config: /etc/apache2/apache2.conf</p>
<p>Actual stack: Express.js — this page is a recon decoy</p></body></html>`);
});

/** RECON-10: User enumeration */
router.get('/api/users/check', async (req, res) => {
    const username = (req.query.username || '').trim();
    if (!username) {
        return res.status(400).json({ error: 'username required', example: '/api/users/check?username=admin' });
    }
    try {
        const { User } = require('../models');
        const user = await User.findOne({ where: { username }, attributes: ['id', 'username', 'createdAt'] });
        if (user) {
            return res.json({ exists: true, username: user.username, user_id: user.id, registered_at: user.createdAt });
        }
        return res.json({ exists: false, username, message: 'Username is available' });
    } catch (err) {
        return res.status(500).json({ error: err.message, stack: err.stack });
    }
});

/** RECON-10b: Email enumeration */
router.get('/api/users/check-email', (req, res) => {
    const email = (req.query.email || '').trim().toLowerCase();
    const known = ['hienpham@gmail.com', 'admin@hipv-demo.local', 'ops@hipv-demo.local', 'dev@hipv-demo.local', 'hr@hipv-demo.local'];
    if (!email) return res.status(400).json({ error: 'email required' });
    const exists = known.includes(email);
    res.json({ exists, email, message: exists ? 'Email already registered' : 'Email available' });
});

/** RECON-14: Verbose errors */
router.get('/api/error', (req, res) => {
    const type = req.query.type || 'generic';
    if (type === 'stack') {
        const err = new Error('Simulated Sequelize.authenticate() failure');
        return res.status(500).json({
            error: err.message, stack: err.stack, path: '/config/database.js',
            host: process.env.DB_HOST || 'aws-1-ap-northeast-2.pooler.supabase.com',
            port: process.env.DB_PORT || '5432'
        });
    }
    if (type === 'path') {
        return res.status(404).json({
            error: 'ENOENT', path: req.query.file || '/var/www/hipv/.env', syscall: 'open', errno: -2
        });
    }
    if (type === 'sql') {
        return res.status(500).json({
            error: 'SequelizeDatabaseError', sql: 'SELECT * FROM users WHERE id = 1',
            detail: 'relation "secrets" does not exist', hint: 'Table secrets at /pentest-recon/internal/'
        });
    }
    res.status(500).json({ error: 'Internal Server Error', detail: 'userController.login unhandled' });
});

/** RECON-38: ELMAH / trace error logs */
router.get('/elmah.axd', (req, res) => {
    res.type('xml').send(`<?xml version="1.0"?>
<errors><error type="System.Data.SqlClient.SqlException" message="Login failed for user 'sa'">
<host>db-internal.hipv-demo.local</host><url>/users/login</url></error>
<error type="System.IO.FileNotFoundException" message="Could not find /var/www/.env">
</error></errors>`);
});

router.get('/trace.axd', (req, res) => {
    res.type('html').send(`<html><body><h1>Trace Log</h1><pre>
[14/Nov/2024] GET /.git/HEAD 200
[14/Nov/2024] GET /pentest-recon/backup/database.sql.bak 200
[15/Nov/2024] GET /api/debug 200
Session: admin logged in from 192.168.1.10
</pre></body></html>`);
});

/** RECON-47: Tomcat manager / console decoy */
router.get('/manager/html', (req, res) => {
    res.type('html').send(`<html><body><h1>Tomcat Manager Application</h1>
<p>Decoy — recon target. Try /manager/status, /host-manager/html</p>
<p>Credentials hint: /pentest-recon/private/credentials-hint.txt</p></body></html>`);
});

router.get('/manager/status', (req, res) => {
    res.type('xml').send(`<?xml version="1.0"?><status><jvm>OpenJDK 17</jvm><connector port="8080"/><app path="/hipv" status="running"/></status>`);
});

router.get('/host-manager/html', (req, res) => {
    res.status(401).setHeader('WWW-Authenticate', 'Basic realm="Tomcat Host Manager"')
        .send('401 Unauthorized — recon decoy');
});

router.get('/console', (req, res) => {
    res.type('html').send(`<html><body><h1>JBoss Console</h1><p>Decoy admin console. Real admin: /pentest-recon/admin/</p></body></html>`);
});

/** RECON-48: CI/CD tool paths */
router.get('/jenkins', (req, res) => res.redirect('/pentest-recon/ci/jenkins/'));
router.get('/sonarqube', (req, res) => res.redirect('/pentest-recon/ci/sonarqube/'));

/** RECON-04: Directory listings */
router.get('/pentest-recon/uploads/', (req, res) => {
    renderDirectoryListing(req, res, UPLOADS_DIR, '/pentest-recon/uploads/');
});

router.get('/pentest-recon/backup/', (req, res) => {
    renderDirectoryListing(req, res, BACKUP_DIR, '/pentest-recon/backup/');
});

/** RECON-17: OPTIONS */
router.options(/^\/api(\/.*)?$/, (req, res) => {
    res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, TRACE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, TRACE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Debug-Token');
    res.status(204).end();
});

/** RECON-13: Config leaks */
router.get('/config.json', (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, 'config', 'config.json'));
});

router.get('/.env.example', (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, '.env.example'));
});

router.get('/package.json', (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, 'package.json'));
});

router.get('/docker-compose.yml', (req, res) => {
    res.sendFile(path.join(RECON_ROOT, 'exposed', 'docker-compose.yml'));
});

router.get('/README.md', (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, 'README.md'));
});

router.get('/CHANGELOG.md', (req, res) => {
    res.sendFile(path.join(RECON_ROOT, 'exposed', 'CHANGELOG.md'));
});

/** RECON-44: Cookie disclosure on special endpoint */
router.get('/api/session-probe', (req, res) => {
    res.cookie('HIPV_SESSION', 's%3Aprobe_' + Date.now(), { httpOnly: false });
    res.cookie('HIPV_API_TOKEN', 'hipv_recon_demo_key_2024', { httpOnly: false });
    res.cookie('connect.sid', 's%3Afake_session_for_recon', { httpOnly: true });
    res.json({ message: 'Cookies set — check Set-Cookie headers', insecure_cookies: ['HIPV_API_TOKEN'] });
});

/** RECON-60: WebDAV PROPFIND mock */
router.all('/webdav', (req, res) => {
    if (req.method === 'PROPFIND') {
        res.setHeader('DAV', '1, 2');
        return res.status(207).type('xml').send(`<?xml version="1.0"?>
<multistatus xmlns="DAV:">
<response><href>/webdav/</href><prop><displayname>HiPV WebDAV</displayname></prop></response>
<response><href>/pentest-recon/backup/</href><prop><displayname>backups</displayname></prop></response>
</multistatus>`);
    }
    res.setHeader('DAV', '1, 2');
    res.json({ webdav: true, methods: ['PROPFIND', 'GET', 'PUT'], path: '/webdav' });
});

/** Business Security Snapshot — full report API (dashboard ground truth) */
router.get('/api/snapshot', (req, res) => {
    res.sendFile(path.join(RECON_ROOT, 'snapshot', 'report.json'));
});

router.get('/pentest-recon/snapshot/report.json', (req, res) => {
    res.sendFile(path.join(RECON_ROOT, 'snapshot', 'report.json'));
});

router.get('/api/public/endpoints.json', (req, res) => {
    res.json({
        unauthenticated_endpoints: 12,
        endpoints: [
            { method: 'GET', path: '/api/health', risk: 'low' },
            { method: 'GET', path: '/api/debug', risk: 'high' },
            { method: 'GET', path: '/api/swagger.json', risk: 'moderate' },
            { method: 'GET', path: '/api/v1/users', risk: 'high' },
            { method: 'GET', path: '/api/v1/config', risk: 'high' },
            { method: 'GET', path: '/api/users/check', risk: 'moderate' },
            { method: 'GET', path: '/api/users/check-email', risk: 'moderate' },
            { method: 'GET', path: '/actuator/env', risk: 'high' },
            { method: 'GET', path: '/graphql', risk: 'moderate' },
            { method: 'GET', path: '/metrics', risk: 'low' },
            { method: 'GET', path: '/api/snapshot', risk: 'low' },
            { method: 'GET', path: '/pentest-recon/data-leakage/index.json', risk: 'high' }
        ]
    });
});

/** Category JSON shortcuts */
router.get('/pentest-recon/data-leakage/index.json', (req, res) => {
    res.sendFile(path.join(RECON_ROOT, 'data-leakage', 'index.json'));
});

/** COMP-01: Missing privacy policy (intentional 404) */
router.get('/privacy', (req, res) => {
    res.status(404).json({
        error: 'Privacy policy not found',
        compliance_gap: 'COMP-01',
        gdpr_article: 'Art. 13',
        draft_url: '/pentest-recon/compliance/data-retention.txt',
        dpo_contact: 'hienpham@gmail.com'
    });
});

router.get('/terms', (req, res) => {
    res.status(404).json({ error: 'Terms of service not found', compliance_gap: 'COMP-07' });
});

router.get('/api/gdpr/delete-request', (req, res) => {
    res.status(404).json({
        error: 'GDPR erasure endpoint not implemented',
        compliance_gap: 'COMP-09',
        gdpr_article: 'Art. 17',
        contact: 'hienpham@gmail.com'
    });
});

/** Manifest for tool evaluation */
router.get('/pentest-recon/manifest.json', (req, res) => {
    res.sendFile(path.join(RECON_ROOT, 'manifest.json'));
});

router.get('/pentest-recon/wordlist.txt', (req, res) => {
    res.type('text').sendFile(path.join(RECON_ROOT, 'wordlist.txt'));
});

router.get('/pentest-recon', (req, res) => res.redirect('/pentest-recon/'));

module.exports = router;
