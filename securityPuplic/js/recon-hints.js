/**
 * HiPV Internal Frontend Config — NOT FOR PRODUCTION
 * RECON-16: Sensitive endpoints embedded in client-side JavaScript
 */
(function () {
    'use strict';

    window.HIPV_INTERNAL = {
        apiBase: '/api',
        adminPanel: '/pentest-recon/admin/',
        backupPath: '/pentest-recon/backup/database.sql.bak',
        stagingUrl: '/pentest-recon/staging/',
        debugEndpoint: '/api/debug',
        userEnumEndpoint: '/api/users/check?username=',
        swaggerUrl: '/api/swagger.json',
        apiKey: 'hipv_recon_demo_key_2024',
        defaultCredentials: { user: 'admin', pass: 'Admin@2024!' }
    };

    // Legacy endpoint — remove after migration
    // POST /api/internal/report  (no auth required)
    // GET  /pentest-recon/private/credentials-hint.txt
})();
