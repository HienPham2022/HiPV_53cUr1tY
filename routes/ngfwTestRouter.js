'use strict';

const express = require('express');
const router = express.Router();

// EICAR test string (68 bytes) - industry standard for AV/Firewall testing
const EICAR_STRING = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

// Serve EICAR as downloadable file
router.get('/eicar.com', (req, res) => {
    res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="eicar.com"',
        'Content-Length': EICAR_STRING.length
    });
    res.send(EICAR_STRING);
});

// Serve EICAR as text file
router.get('/eicar.com.txt', (req, res) => {
    res.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="eicar.com.txt"',
        'Content-Length': EICAR_STRING.length
    });
    res.send(EICAR_STRING);
});

// Serve EICAR inline (for browser display)
router.get('/eicar-inline', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(EICAR_STRING);
});

// API endpoint returning EICAR info
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
