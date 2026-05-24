'use strict';

const express = require('express');
const router = express.Router();

const EICAR_STRING = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

const TEST_CASES = [
    { id: 1, sid: '5900006', name: 'EICAR Test File - HTTP Download', cat: 'MALWARE', severity: 'HIGH' },
    { id: 2, sid: '5900012', name: 'Suspicious EXE Download', cat: 'MALWARE', severity: 'HIGH' },
    { id: 3, sid: '5900014', name: 'Macro-Enabled Document Download', cat: 'MALWARE', severity: 'HIGH' },
    { id: 4, sid: '5900015', name: 'Windows Script File Download', cat: 'MALWARE', severity: 'HIGH' },
    { id: 5, sid: '5900016', name: 'PE Executable Downloaded', cat: 'MALWARE', severity: 'CRITICAL' },
    { id: 6, sid: '5900029', name: 'Coinhive Cryptominer', cat: 'MALWARE', severity: 'MEDIUM' },
    { id: 7, sid: '5900032', name: 'CryptoLoot Miner', cat: 'MALWARE', severity: 'MEDIUM' },
    { id: 8, sid: '5900035', name: 'JSECoin Miner', cat: 'MALWARE', severity: 'MEDIUM' },
    { id: 9, sid: '5900044', name: 'RIG Exploit Kit Landing Page', cat: 'EXPLOIT-KIT', severity: 'HIGH' },
    { id: 10, sid: '5900045', name: 'Fallout Exploit Kit', cat: 'EXPLOIT-KIT', severity: 'HIGH' },
    { id: 11, sid: '5900048', name: 'Suspicious ZIP with EXE', cat: 'MALWARE', severity: 'HIGH' },
    { id: 12, sid: '5900049', name: 'HTML Smuggling Base64', cat: 'MALWARE', severity: 'CRITICAL' },
    { id: 13, sid: '5900063', name: 'VirtualBox Detection', cat: 'ANTI-SANDBOX', severity: 'MEDIUM' },
    { id: 14, sid: '5900064', name: 'VMware Detection', cat: 'ANTI-SANDBOX', severity: 'MEDIUM' },
    { id: 15, sid: '5900070', name: 'EICAR Attachment Header', cat: 'MALWARE', severity: 'HIGH' },
    { id: 16, sid: '6400000', name: 'PE File with Auto-Run', cat: 'VIRUS', severity: 'HIGH' },
    { id: 17, sid: '6400001', name: 'Office Macro Shell Execute', cat: 'VIRUS', severity: 'HIGH' },
    { id: 18, sid: '6400002', name: 'Word Macro AutoOpen', cat: 'VIRUS', severity: 'HIGH' },
    { id: 19, sid: '6400003', name: 'Excel Macro Auto_Open', cat: 'VIRUS', severity: 'HIGH' },
    { id: 20, sid: '6400007', name: 'Macro CreateObject', cat: 'VIRUS', severity: 'HIGH' },
    { id: 21, sid: '6400011', name: 'VBScript Self-Replication', cat: 'VIRUS', severity: 'CRITICAL' },
    { id: 22, sid: '6400012', name: 'JavaScript FileSystem Access', cat: 'VIRUS', severity: 'CRITICAL' },
    { id: 23, sid: '6400013', name: 'Batch File Self-Replication', cat: 'VIRUS', severity: 'HIGH' },
    { id: 24, sid: '6400020', name: 'Java Malicious Class File', cat: 'VIRUS', severity: 'HIGH' },
    { id: 25, sid: '6400021', name: 'PDF with Malicious JavaScript', cat: 'VIRUS', severity: 'CRITICAL' },
    { id: 26, sid: '6400026', name: 'SQL Injection SELECT', cat: 'WEB-ATTACK', severity: 'HIGH' },
    { id: 27, sid: '6400027', name: 'SQL Injection UNION SELECT', cat: 'WEB-ATTACK', severity: 'HIGH' },
    { id: 28, sid: '6400028', name: 'SQL Injection INSERT', cat: 'WEB-ATTACK', severity: 'HIGH' },
    { id: 29, sid: '6400032', name: 'Cool Java Exploit Kit', cat: 'EXPLOIT-KIT', severity: 'CRITICAL' },
    { id: 30, sid: '6400009', name: 'PE File Infector Pattern', cat: 'VIRUS', severity: 'CRITICAL' }
];

router.get('/api/test-cases', (req, res) => {
    res.json({ total: TEST_CASES.length, testCases: TEST_CASES });
});

router.get('/test/5900006', (req, res) => {
    res.set({ 'Content-Type': 'application/octet-stream', 'X-Test-SID': '5900006' });
    res.send(EICAR_STRING);
});

router.get('/test/5900012', (req, res) => {
    const mzHeader = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00]);
    res.set({ 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="test.exe"', 'X-Test-SID': '5900012' });
    res.send(Buffer.concat([mzHeader, Buffer.from('NGFW Test EXE Download')]));
});

router.get('/test/5900014', (req, res) => {
    const pkHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    res.set({ 'Content-Type': 'application/vnd.ms-excel.sheet.macroEnabled.12', 'Content-Disposition': 'attachment; filename="test.xlsm"', 'X-Test-SID': '5900014' });
    res.send(Buffer.concat([pkHeader, Buffer.from('Macro Document Test')]));
});

router.get('/test/5900015', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="test.vbs"', 'X-Test-SID': '5900015' });
    res.send('Set objShell = WScript.CreateObject("WScript.Shell")\nobjShell.Run "cmd.exe"');
});

router.get('/test/5900016', (req, res) => {
    const mzHeader = Buffer.from([0x4D, 0x5A]);
    const padding = Buffer.alloc(58, 0x00);
    const peHeader = Buffer.from([0x50, 0x45, 0x00, 0x00]);
    res.set({ 'Content-Type': 'application/x-msdownload', 'Content-Disposition': 'attachment; filename="malware.exe"', 'X-Test-SID': '5900016' });
    res.send(Buffer.concat([mzHeader, padding, peHeader, Buffer.from('PE Executable Test')]));
});

router.get('/test/5900029', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900029' });
    res.send('<html><script src="https://coinhive.com/lib/coinhive.min.js"></script><script>var miner = new CoinHive.Anonymous("site-key");</script></html>');
});

router.get('/test/5900032', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900032' });
    res.send('<html><script src="https://crypto-loot.com/lib/miner.min.js"></script></html>');
});

router.get('/test/5900035', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900035' });
    res.send('<html><script src="https://jsecoin.com/api/jsecoin.min.js"></script></html>');
});

router.get('/test/5900044', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900044' });
    res.send('<html><iframe src="exploit.html" style="display:none"></iframe><iframe src="payload.jar"></iframe></html>');
});

router.get('/test/5900045', (req, res) => {
    const fwsHeader = Buffer.from([0x46, 0x57, 0x53]);
    res.set({ 'Content-Type': 'application/x-shockwave-flash', 'Content-Disposition': 'attachment; filename="exploit.swf"', 'X-Test-SID': '5900045' });
    res.send(Buffer.concat([fwsHeader, Buffer.from(' Fallout Exploit Kit')]));
});

router.get('/test/5900048', (req, res) => {
    const pkHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    res.set({ 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="malware.zip"', 'X-Test-SID': '5900048' });
    res.send(Buffer.concat([pkHeader, Buffer.from('filename.exe inside this archive')]));
});

router.get('/test/5900049', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '5900049' });
    res.send('<html><a download="payload.exe" href="data:application/octet-stream;base64,TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAA">Download</a></html>');
});

router.get('/test/5900063', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '5900063' });
    res.send('Checking for VBoxService.exe process...\nVBoxService detected - VM environment');
});

router.get('/test/5900064', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '5900064' });
    res.send('Checking for vmtoolsd.exe process...\nvmtoolsd detected - VMware environment');
});

router.get('/test/5900070', (req, res) => {
    res.set({ 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="eicar.com"', 'X-Test-SID': '5900070' });
    res.send(EICAR_STRING);
});

router.get('/test/6400000', (req, res) => {
    const mzHeader = Buffer.from([0x4D, 0x5A]);
    res.set({ 'Content-Type': 'application/octet-stream', 'X-Test-SID': '6400000' });
    res.send(Buffer.concat([mzHeader, Buffer.from(' autorun=setup.exe')]));
});

router.get('/test/6400001', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400001' });
    res.send('Sub Macro1()\n  Shell "cmd.exe", vbNormalFocus\n  Execute "calc.exe"\nEnd Sub');
});

router.get('/test/6400002', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400002' });
    res.send('Sub AutoOpen()\n  MsgBox "Macro executed!"\nEnd Sub');
});

router.get('/test/6400003', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400003' });
    res.send('Sub Auto_Open()\n  Application.Run "Malicious"\nEnd Sub');
});

router.get('/test/6400007', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400007' });
    res.send('Set obj = CreateObject("WScript.Shell")\nobj.Run "powershell.exe"');
});

router.get('/test/6400011', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="virus.vbs"', 'X-Test-SID': '6400011' });
    res.send('Set fso = WScript.CreateObject("Scripting.FileSystemObject")\nfso.CopyFile WScript.ScriptFullName, "C:\\virus.vbs"');
});

router.get('/test/6400012', (req, res) => {
    res.set({ 'Content-Type': 'text/html', 'X-Test-SID': '6400012' });
    res.send('<script>var fso = new ActiveXObject("Scripting.FileSystemObject");\nvar file = fso.CreateTextFile("C:\\\\malware.txt");</script>');
});

router.get('/test/6400013', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="virus.bat"', 'X-Test-SID': '6400013' });
    res.send('@echo off\ncopy %0 C:\\Windows\\virus.bat\nstart C:\\Windows\\virus.bat');
});

router.get('/test/6400020', (req, res) => {
    const javaHeader = Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]);
    res.set({ 'Content-Type': 'application/java-archive', 'Content-Disposition': 'attachment; filename="Exploit.class"', 'X-Test-SID': '6400020' });
    res.send(Buffer.concat([javaHeader, Buffer.from(' Malicious Java Class')]));
});

router.get('/test/6400021', (req, res) => {
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="malicious.pdf"', 'X-Test-SID': '6400021' });
    res.send('%PDF-1.4\n/JS (app.alert("Hacked!"))\n/JavaScript /S /JavaScript\n%%EOF');
});

router.get('/test/6400026', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400026' });
    res.send('SQL Query: /view_recent.asp?currentpage=1 UNION SELECT username, password FROM users');
});

router.get('/test/6400027', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400027' });
    res.send('Payload: currentpage=1 UNION SELECT * FROM admin WHERE 1=1');
});

router.get('/test/6400028', (req, res) => {
    res.set({ 'Content-Type': 'text/plain', 'X-Test-SID': '6400028' });
    res.send('Payload: currentpage=1; INSERT INTO users VALUES (999, "hacker", "owned")');
});

router.get('/test/6400032', (req, res) => {
    const pkHeader = Buffer.from([0x50, 0x4B]);
    res.set({ 'Content-Type': 'application/java-archive', 'Content-Disposition': 'attachment; filename="exploit.jar"', 'X-Test-SID': '6400032' });
    res.send(Buffer.concat([pkHeader, Buffer.from(' SunJCE.class exploit code')]));
});

router.get('/test/6400009', (req, res) => {
    const buf = Buffer.alloc(64, 0x00);
    buf[0] = 0x4D;
    buf[1] = 0x5A;
    buf[59] = 0xE9;
    res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="infected.exe"',
        'X-Test-SID': '6400009'
    });
    res.send(buf);
});

router.get('/eicar.com', (req, res) => {
    res.set({ 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="eicar.com"' });
    res.send(EICAR_STRING);
});

module.exports = router;
