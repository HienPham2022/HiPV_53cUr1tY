'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controller/indexcontroller');

router.get('/', controller.showHomePage);

router.get('/createUser', (req, res) => {
    const models = require('../models');
    models.sequelize.sync().then(() => {
        res.send('Database synced!');
    }).catch(err => {
        console.error(err);
        res.status(500).send('Sync failed');
    });
});

module.exports = router;
