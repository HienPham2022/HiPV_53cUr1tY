/**
 * HiPV Internal Frontend Config — NOT FOR PRODUCTION
 * RECON-16: Sensitive endpoints embedded in client-side JavaScript
 */
(function () {
    'use strict';

    window.HIPV_INTERNAL = {
        apiBase: '/api',
        apiV1: '/api/v1/users',
        apiV2: '/api/v2/users',
        actuator: '/actuator/env',
        graphql: '/graphql',
        metrics: '/metrics',
        adminPanel: '/pentest-recon/admin/',
        backupPath: '/pentest-recon/backup/database.sql.bak',
        stagingUrl: '/pentest-recon/staging/',
        debugEndpoint: '/api/debug',
        userEnumEndpoint: '/api/users/check?username=',
        emailEnumEndpoint: '/api/users/check-email?email=',
        swaggerUrl: '/api/swagger.json',
        manifestUrl: '/pentest-recon/manifest.json',
        dnsRecords: '/pentest-recon/dns/dns-records.txt',
        apiKey: 'hipv_recon_demo_key_2024',
        defaultCredentials: { user: 'admin', pass: 'Admin@2024!' },
        vhosts: ['admin.hipv-demo.local', 'api.hipv-demo.local', 'staging.hipv-demo.local', 'dev.hipv-demo.local'],
        securityLead: { name: 'Pham Hien', email: 'hienpham@gmail.com', profile: '/pentest-recon/osint/hien-pham-profile.html' }
    };

    // Legacy endpoints:
    // POST /api/internal/report  (no auth)
    // GET  /pentest-recon/private/credentials-hint.txt
    // GET  /pentest-recon/secrets/ftp-credentials.txt
    // PROPFIND /webdav
})();

// sourceMappingURL=recon-hints.js.map
