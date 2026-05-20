'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const { getSequelizeOptions } = require('../config/database');

const basename = path.basename(__filename);
const db = {};

const dbConfig = getSequelizeOptions();

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        dialectOptions: dbConfig.dialectOptions,
        logging: dbConfig.logging
    }
);

fs.readdirSync(__dirname)
    .filter(file =>
        !file.startsWith('.') &&
        file !== basename &&
        file.endsWith('.js') &&
        !file.endsWith('.test.js')
    )
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.values(db).forEach(model => {
    if (model.associate) model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
