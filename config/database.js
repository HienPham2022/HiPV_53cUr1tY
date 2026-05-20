'use strict';

require('dotenv').config();

const sslOptions = {
    require: true,
    rejectUnauthorized: false
};

const baseConfig = {
    dialect: 'postgres',
    dialectOptions: {
        ssl: sslOptions
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
};

function getSequelizeOptions() {
    if (process.env.DATABASE_URL) {
        return {
            ...baseConfig,
            connectionString: process.env.DATABASE_URL
        };
    }

    throw new Error(
        'DATABASE_URL is not set. Add it to .env locally or Environment on Render.'
    );
}

module.exports = {
    getSequelizeOptions,
    sslOptions
};
