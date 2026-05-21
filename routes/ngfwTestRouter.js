'use strict';

const express = require('express');
const router = express.Router();

// ============================================
// 30 TEST CASES FROM REAL SURICATA RULES
// Source: et-virus_protection.rules & et-malware_protection.rules.txt
// ============================================

const TEST_CASES = [
    // ========== EICAR MALWARE TESTS (from et-malware_protection.rules.txt) ==========
    {
        id: 1,
        sid: '5900006',
        name: 'EICAR Test File - HTTP Download',
        category: 'MALWARE',
        rule: 'drop http $EXTERNAL_NET any -> $HOME_NET any (msg:"MALWARE EICAR Test File - HTTP Download Blocked"; flow:established,to_client; file_data; content:"X5O!P%@AP[4|5C|PZX54(P^)7CC)7}|24|EICAR"; nocase; fast_pattern; classtype:trojan-activity; sid:5900006; rev:1;)',
        endpoint: '/test/5900006',
        severity: 'HIGH'
    },
    {
        id: 2,
        sid: '5900012',
        name: 'Suspicious EXE Download',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"MALWARE Suspicious EXE Download"; flow:established,to_client; file_data; content:"MZ"; depth:2; classtype:trojan-activity; sid:5900012; rev:2;)',
        endpoint: '/test/5900012',
        severity: 'HIGH'
    },
    {
        id: 3,
        sid: '5900014',
        name: 'Macro-Enabled Document Download',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"MALWARE Macro-Enabled Document Download"; flow:established,to_client; file_data; content:"PK"; depth:2; classtype:trojan-activity; sid:5900014; rev:2;)',
        endpoint: '/test/5900014',
        severity: 'HIGH'
    },
    {
        id: 4,
        sid: '5900015',
        name: 'Windows Script File Download',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"MALWARE Windows Script File Download"; flow:established,to_client; file_data; content:"WScript"; nocase; classtype:trojan-activity; sid:5900015; rev:2;)',
        endpoint: '/test/5900015',
        severity: 'HIGH'
    },
    {
        id: 5,
        sid: '5900016',
        name: 'PE Executable Downloaded',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"MALWARE PE Executable Downloaded"; flow:established,to_client; file_data; content:"MZ"; depth:2; content:"PE|00 00|"; distance:0; within:200; classtype:trojan-activity; sid:5900016; rev:1;)',
        endpoint: '/test/5900016',
        severity: 'CRITICAL'
    },
    {
        id: 6,
        sid: '5900029',
        name: 'Coinhive Cryptominer',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"MALWARE Coinhive Cryptominer"; flow:established; content:"coinhive"; nocase; classtype:trojan-activity; sid:5900029; rev:1;)',
        endpoint: '/test/5900029',
        severity: 'MEDIUM'
    },
    {
        id: 7,
        sid: '5900032',
        name: 'CryptoLoot Miner',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"MALWARE CryptoLoot Miner"; flow:established; content:"crypto-loot"; nocase; classtype:trojan-activity; sid:5900032; rev:1;)',
        endpoint: '/test/5900032',
        severity: 'MEDIUM'
    },
    {
        id: 8,
        sid: '5900035',
        name: 'JSECoin Miner',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"MALWARE JSECoin Miner"; flow:established; content:"jsecoin"; nocase; classtype:trojan-activity; sid:5900035; rev:1;)',
        endpoint: '/test/5900035',
        severity: 'MEDIUM'
    },
    {
        id: 9,
        sid: '5900044',
        name: 'RIG Exploit Kit Landing Page',
        category: 'EXPLOIT-KIT',
        rule: 'drop http any any -> any any (msg:"MALWARE RIG Exploit Kit Landing Page"; flow:established; http.uri; pcre:"/\\/[a-z]{8}\\.html$/"; file_data; content:"iframe"; nocase; classtype:trojan-activity; sid:5900044; rev:1;)',
        endpoint: '/test/5900044',
        severity: 'HIGH'
    },
    {
        id: 10,
        sid: '5900045',
        name: 'Fallout Exploit Kit',
        category: 'EXPLOIT-KIT',
        rule: 'drop http any any -> any any (msg:"MALWARE Fallout Exploit Kit"; flow:established; file_data; content:"FWS"; depth:3; classtype:trojan-activity; sid:5900045; rev:2;)',
        endpoint: '/test/5900045',
        severity: 'HIGH'
    },
    {
        id: 11,
        sid: '5900048',
        name: 'Suspicious ZIP with EXE',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"MALWARE Suspicious ZIP Download"; flow:established,to_client; file_data; content:"PK|03 04|"; depth:4; content:".exe"; nocase; distance:0; classtype:trojan-activity; sid:5900048; rev:1;)',
        endpoint: '/test/5900048',
        severity: 'HIGH'
    },
    {
        id: 12,
        sid: '5900049',
        name: 'HTML Smuggling Base64 Payload',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"MALWARE HTML Smuggling - Base64 Encoded Payload"; flow:established,to_client; file_data; content:"data|3a|application/octet-stream|3b|base64"; nocase; classtype:trojan-activity; sid:5900049; rev:2;)',
        endpoint: '/test/5900049',
        severity: 'CRITICAL'
    },
    {
        id: 13,
        sid: '5900063',
        name: 'VirtualBox Detection Query',
        category: 'ANTI-SANDBOX',
        rule: 'drop http any any -> any any (msg:"MALWARE VirtualBox Detection Query"; flow:established; content:"VBoxService"; nocase; classtype:trojan-activity; sid:5900063; rev:1;)',
        endpoint: '/test/5900063',
        severity: 'MEDIUM'
    },
    {
        id: 14,
        sid: '5900064',
        name: 'VMware Detection Query',
        category: 'ANTI-SANDBOX',
        rule: 'drop http any any -> any any (msg:"MALWARE VMware Detection Query"; flow:established; content:"vmtoolsd"; nocase; classtype:trojan-activity; sid:5900064; rev:1;)',
        endpoint: '/test/5900064',
        severity: 'MEDIUM'
    },
    {
        id: 15,
        sid: '5900070',
        name: 'EICAR Attachment Header',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"EICAR Blocked - Attachment Header (Dual-Stack)"; flow:established,to_client; http.header; content:"Content-Disposition"; nocase; content:"filename"; nocase; distance:0; within:50; content:"eicar"; nocase; distance:0; classtype:trojan-activity; sid:5900070; rev:1;)',
        endpoint: '/test/5900070',
        severity: 'HIGH'
    },
    
    // ========== VIRUS TESTS (from et-virus_protection.rules) ==========
    {
        id: 16,
        sid: '6400000',
        name: 'PE File with Auto-Run',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS Suspicious PE File with Auto-Run"; flow:established,to_client; file_data; content:"MZ"; depth:2; content:"autorun"; nocase; distance:0; classtype:trojan-activity; sid:6400000; rev:1;)',
        endpoint: '/test/6400000',
        severity: 'HIGH'
    },
    {
        id: 17,
        sid: '6400001',
        name: 'Office Macro Shell Execute',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS Office Macro with Shell Execute"; flow:established,to_client; file_data; content:"Shell"; nocase; content:"Execute"; nocase; distance:0; classtype:trojan-activity; sid:6400001; rev:2;)',
        endpoint: '/test/6400001',
        severity: 'HIGH'
    },
    {
        id: 18,
        sid: '6400002',
        name: 'Word Macro AutoOpen',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS Word Macro Auto-Execute"; flow:established,to_client; file_data; content:"AutoOpen"; nocase; classtype:trojan-activity; sid:6400002; rev:2;)',
        endpoint: '/test/6400002',
        severity: 'HIGH'
    },
    {
        id: 19,
        sid: '6400003',
        name: 'Excel Macro Auto_Open',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS Excel Macro Auto-Execute"; flow:established,to_client; file_data; content:"Auto_Open"; nocase; classtype:trojan-activity; sid:6400003; rev:2;)',
        endpoint: '/test/6400003',
        severity: 'HIGH'
    },
    {
        id: 20,
        sid: '6400007',
        name: 'Macro CreateObject',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS Macro-Enabled Document with Suspicious Content"; flow:established,to_client; file_data; content:"CreateObject"; nocase; classtype:trojan-activity; sid:6400007; rev:2;)',
        endpoint: '/test/6400007',
        severity: 'HIGH'
    },
    {
        id: 21,
        sid: '6400011',
        name: 'VBScript Self-Replication',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS VBScript Self-Replication"; flow:established,to_client; file_data; content:"WScript.Shell"; nocase; content:"CopyFile"; nocase; distance:0; classtype:trojan-activity; sid:6400011; rev:2;)',
        endpoint: '/test/6400011',
        severity: 'CRITICAL'
    },
    {
        id: 22,
        sid: '6400012',
        name: 'JavaScript FileSystem Access',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS JavaScript File System Access"; flow:established,to_client; file_data; content:"ActiveXObject"; nocase; content:"Scripting.FileSystemObject"; nocase; distance:0; classtype:trojan-activity; sid:6400012; rev:2;)',
        endpoint: '/test/6400012',
        severity: 'CRITICAL'
    },
    {
        id: 23,
        sid: '6400013',
        name: 'Batch File Self-Replication',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS Batch File Self-Replication"; flow:established,to_client; file_data; content:"copy"; nocase; content:"%0"; nocase; distance:0; classtype:trojan-activity; sid:6400013; rev:2;)',
        endpoint: '/test/6400013',
        severity: 'HIGH'
    },
    {
        id: 24,
        sid: '6400020',
        name: 'Java Malicious Class File',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS Java Malicious Class File"; flow:established,to_client; file_data; content:"|CA FE BA BE|"; depth:4; classtype:trojan-activity; sid:6400020; rev:2;)',
        endpoint: '/test/6400020',
        severity: 'HIGH'
    },
    {
        id: 25,
        sid: '6400021',
        name: 'PDF with Malicious JavaScript',
        category: 'VIRUS',
        rule: 'drop http any any -> any any (msg:"VIRUS PDF with Malicious JavaScript"; flow:established,to_client; file_data; content:"/JS"; nocase; content:"/JavaScript"; nocase; distance:0; classtype:trojan-activity; sid:6400021; rev:2;)',
        endpoint: '/test/6400021',
        severity: 'CRITICAL'
    },
    {
        id: 26,
        sid: '6400026',
        name: 'SQL Injection SELECT',
        category: 'WEB-ATTACK',
        rule: 'drop http any any -> $HTTP_SERVERS any (msg:"ET WEB_SPECIFIC_APPS SQL Injection Attempt -- SELECT"; flow:established,to_server; http.uri; content:"currentpage="; nocase; content:"SELECT"; nocase; content:"FROM"; nocase; distance:0; classtype:web-application-attack; sid:6400026; rev:9;)',
        endpoint: '/test/6400026',
        severity: 'HIGH'
    },
    {
        id: 27,
        sid: '6400027',
        name: 'SQL Injection UNION SELECT',
        category: 'WEB-ATTACK',
        rule: 'drop http any any -> $HTTP_SERVERS any (msg:"ET WEB_SPECIFIC_APPS SQL Injection Attempt -- UNION SELECT"; flow:established,to_server; http.uri; content:"currentpage="; nocase; content:"UNION"; nocase; content:"SELECT"; nocase; distance:0; classtype:web-application-attack; sid:6400027; rev:9;)',
        endpoint: '/test/6400027',
        severity: 'HIGH'
    },
    {
        id: 28,
        sid: '6400028',
        name: 'SQL Injection INSERT',
        category: 'WEB-ATTACK',
        rule: 'drop http any any -> $HTTP_SERVERS any (msg:"ET WEB_SPECIFIC_APPS SQL Injection Attempt -- INSERT"; flow:established,to_server; http.uri; content:"currentpage="; nocase; content:"INSERT"; nocase; content:"INTO"; nocase; distance:0; classtype:web-application-attack; sid:6400028; rev:8;)',
        endpoint: '/test/6400028',
        severity: 'HIGH'
    },
    {
        id: 29,
        sid: '6400032',
        name: 'Cool Java Exploit Kit',
        category: 'EXPLOIT-KIT',
        rule: 'drop http any any -> any any (msg:"ET EXPLOIT_KIT Cool Java Exploit Recent Jar (1)"; flow:established,to_client; flowbits:set,et.exploitkitlanding; file.data; content:"PK"; within:2; content:"SunJCE.class"; classtype:exploit-kit; sid:6400032; rev:5;)',
        endpoint: '/test/6400032',
        severity: 'CRITICAL'
    },
    {
        id: 30,
        sid: '6400033',
        name: 'Suspicious EXE from File Share',
        category: 'MALWARE',
        rule: 'drop http any any -> any any (msg:"ET HUNTING SUSPICIOUS EXE Download from specific file share site"; flow:established,to_server; http.uri; content:".exe"; http.host; bsize:10; content:"a.pomf.cat"; fast_pattern; classtype:trojan-activity; sid:6400033; rev:6;)',
        endpoint: '/test/6400033',
        severity: 'HIGH'
    }
];

// ============================================
// EICAR TEST STRING
// ============================================
const EICAR_STRING = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

// ============================================
// API: Get all test cases
// ============================================
router.get('/api/test-cases', (req, res) => {
    res.json({
        total: TEST_CASES.length,
        source: 'et-virus_protection.rules & et-malware_protection.rules.txt',
        testCases: TEST_CASES
    });
});

// ============================================
// TEST ENDPOINTS
// ============================================

// SID 5900006 - EICAR Test File
router.get('/test/5900006', (req, res) => {
    res.set({ 'Content-Type': 'application/octet-stream', 'X-Test-SID': '5900006' });
    res.send(EICAR_STRING);
});

// SID 5900012 - Suspicious EXE (MZ header)
router.get('/test/5900012', (req, res) => {
    const mzHeader = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00]);
    res.set({ 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="test.exe"', 'X-Test-SID': '5900012' });
    res.send(Buffer.concat([mzHeader, Buffer.from('NGFW Test EXE Download')]));
});

// SID 5900014 - Macro-Enabled Document (PK header = ZIP/DOCX)
router.get('/test/5900014', (req, res) => {
    const pkHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    res.set({ 'Content-Type': 'application/vnd.ms-excel.sheet.macroEnabled.12', 'Content-Disposition': 'attachment; filename="test.xlsm"', 'X-Test-SID': '5900014' });
    res.send(Buffer.concat([pkHeader, Buffer.from('Macro Document Test')]));
});

// SID 5900015 - Windows Script File
router.get('/test/5900015', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="test.vbs"', 'X-Test-SID': '5900015' });
    res.send('Set objShell = WScript.CreateObject("WScript.Shell")\nobjShell.Run "cmd.exe"');
});

// SID 5900016 - PE Executable (MZ + PE header)
router.get('/test/5900016', (req, res) => {
    const mzHeader = Buffer.from([0x4D, 0x5A]);
    const padding = Buffer.alloc(58, 0x00);
    const peHeader = Buffer.from([0x50, 0x45, 0x00, 0x00]);
    res.set({ 'Content-Type': 'application/x-msdownload', 'Content-Disposition': 'attachment; filename="malware.exe"', 'X-Test-SID': '5900016' });
    res.send(Buffer.concat([mzHeader, padding, peHeader, Buffer.from('PE Executable Test')]));
});

// SID 5900029 - Coinhive Cryptominer
router.get('/test/5900029', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900029' });
    res.send('<html><script src="https://coinhive.com/lib/coinhive.min.js"></script><script>var miner = new CoinHive.Anonymous("site-key");</script></html>');
});

// SID 5900032 - CryptoLoot Miner
router.get('/test/5900032', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900032' });
    res.send('<html><script src="https://crypto-loot.com/lib/miner.min.js"></script></html>');
});

// SID 5900035 - JSECoin Miner
router.get('/test/5900035', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900035' });
    res.send('<html><script src="https://jsecoin.com/api/jsecoin.min.js"></script></html>');
});

// SID 5900044 - RIG Exploit Kit Landing Page
router.get('/test/5900044', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900044' });
    res.send('<html><iframe src="exploit.html" style="display:none"></iframe><iframe src="payload.jar"></iframe></html>');
});

// SID 5900045 - Fallout Exploit Kit (FWS = Flash header)
router.get('/test/5900045', (req, res) => {
    const fwsHeader = Buffer.from([0x46, 0x57, 0x53]); // FWS
    res.set({ 'Content-Type': 'application/x-shockwave-flash', 'Content-Disposition': 'attachment; filename="exploit.swf"', 'X-Test-SID': '5900045' });
    res.send(Buffer.concat([fwsHeader, Buffer.from(' Fallout Exploit Kit')]));
});

// SID 5900048 - Suspicious ZIP with EXE
router.get('/test/5900048', (req, res) => {
    const pkHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    res.set({ 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="malware.zip"', 'X-Test-SID': '5900048' });
    res.send(Buffer.concat([pkHeader, Buffer.from('filename.exe inside this archive')]));
});

// SID 5900049 - HTML Smuggling Base64
router.get('/test/5900049', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900049' });
    res.send('<html><a download="payload.exe" href="data:application/octet-stream;base64,TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAA">Download</a></html>');
});

// SID 5900063 - VirtualBox Detection
router.get('/test/5900063', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '5900063' });
    res.send('Checking for VBoxService.exe process...\nVBoxService detected - VM environment');
});

// SID 5900064 - VMware Detection
router.get('/test/5900064', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '5900064' });
    res.send('Checking for vmtoolsd.exe process...\nvmtoolsd detected - VMware environment');
});

// SID 5900070 - EICAR Attachment Header
router.get('/test/5900070', (req, res) => {
    res.set({ 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="eicar.com"', 'X-Test-SID': '5900070' });
    res.send(EICAR_STRING);
});

// SID 6400000 - PE File with Auto-Run
router.get('/test/6400000', (req, res) => {
    const mzHeader = Buffer.from([0x4D, 0x5A]);
    res.set({ 'Content-Type': 'application/octet-stream', 'X-Test-SID': '6400000' });
    res.send(Buffer.concat([mzHeader, Buffer.from(' autorun=setup.exe')]));
});

// SID 6400001 - Office Macro Shell Execute
router.get('/test/6400001', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400001' });
    res.send('Sub Macro1()\n  Shell "cmd.exe", vbNormalFocus\n  Execute "calc.exe"\nEnd Sub');
});

// SID 6400002 - Word Macro AutoOpen
router.get('/test/6400002', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400002' });
    res.send('Sub AutoOpen()\n  MsgBox "Macro executed!"\nEnd Sub');
});

// SID 6400003 - Excel Macro Auto_Open
router.get('/test/6400003', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400003' });
    res.send('Sub Auto_Open()\n  Application.Run "Malicious"\nEnd Sub');
});

// SID 6400007 - Macro CreateObject
router.get('/test/6400007', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400007' });
    res.send('Set obj = CreateObject("WScript.Shell")\nobj.Run "powershell.exe"');
});

// SID 6400011 - VBScript Self-Replication
router.get('/test/6400011', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="virus.vbs"', 'X-Test-SID': '6400011' });
    res.send('Set fso = WScript.CreateObject("Scripting.FileSystemObject")\nfso.CopyFile WScript.ScriptFullName, "C:\\virus.vbs"');
});

// SID 6400012 - JavaScript FileSystem Access
router.get('/test/6400012', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '6400012' });
    res.send('<script>var fso = new ActiveXObject("Scripting.FileSystemObject");\nvar file = fso.CreateTextFile("C:\\\\malware.txt");</script>');
});

// SID 6400013 - Batch File Self-Replication
router.get('/test/6400013', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="virus.bat"', 'X-Test-SID': '6400013' });
    res.send('@echo off\ncopy %0 C:\\Windows\\virus.bat\nstart C:\\Windows\\virus.bat');
});

// SID 6400020 - Java Malicious Class File
router.get('/test/6400020', (req, res) => {
    const javaHeader = Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]); // Java class magic bytes
    res.set({ 'Content-Type': 'application/java-archive', 'Content-Disposition': 'attachment; filename="Exploit.class"', 'X-Test-SID': '6400020' });
    res.send(Buffer.concat([javaHeader, Buffer.from(' Malicious Java Class')]));
});

// SID 6400021 - PDF with Malicious JavaScript
router.get('/test/6400021', (req, res) => {
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="malicious.pdf"', 'X-Test-SID': '6400021' });
    res.send('%PDF-1.4\n/JS (app.alert("Hacked!"))\n/JavaScript /S /JavaScript\n%%EOF');
});

// SID 6400026 - SQL Injection SELECT
router.get('/test/6400026', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400026' });
    res.send('SQL Query: /view_recent.asp?currentpage=1 UNION SELECT username, password FROM users');
});

// SID 6400027 - SQL Injection UNION SELECT
router.get('/test/6400027', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400027' });
    res.send('Payload: currentpage=1 UNION SELECT * FROM admin WHERE 1=1');
});

// SID 6400028 - SQL Injection INSERT
router.get('/test/6400028', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400028' });
    res.send('Payload: currentpage=1; INSERT INTO users VALUES (999, "hacker", "owned")');
});

// SID 6400032 - Cool Java Exploit Kit
router.get('/test/6400032', (req, res) => {
    const pkHeader = Buffer.from([0x50, 0x4B]);
    res.set({ 'Content-Type': 'application/java-archive', 'Content-Disposition': 'attachment; filename="exploit.jar"', 'X-Test-SID': '6400032' });
    res.send(Buffer.concat([pkHeader, Buffer.from(' SunJCE.class exploit code')]));
});

// SID 6400033 - Suspicious EXE from File Share
router.get('/test/6400033', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400033' });
    res.send('Download from: https://a.pomf.cat/malware.exe\nFile hash: d41d8cd98f00b204e9800998ecf8427e');
});

// ============================================
// Legacy endpoints
// ============================================
router.get('/eicar.com', (req, res) => {
    res.set({ 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="eicar.com"' });
    res.send(EICAR_STRING);
});

router.get('/api/eicar', (req, res) => {
    res.json({
        name: 'EICAR-STANDARD-ANTIVIRUS-TEST-FILE',
        size: EICAR_STRING.length,
        string: EICAR_STRING,
        md5: '44d88612fea8a8f36de82e1278abb02f'
    });
});

module.exports = router;
