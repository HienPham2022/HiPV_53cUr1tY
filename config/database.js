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

function fromDiscreteEnv() {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;
    if (!DB_HOST || !DB_USER || !DB_PASSWORD) return null;

    return {
        ...baseConfig,
        host: DB_HOST,
        port: Number(DB_PORT) || 5432,
        database: DB_DATABASE || 'postgres',
        username: DB_USER,
        password: DB_PASSWORD
    };
}

function fromDatabaseUrl() {
    const url = process.env.DATABASE_URL;
    if (!url) return null;

    // Parse URI để tránh lỗi username "postgres" khi có dấu chấm trong user
    const parsed = new URL(url);

    return {
        ...baseConfig,
        host: parsed.hostname,
        port: Number(parsed.port) || 5432,
        database: parsed.pathname.replace(/^\//, '') || 'postgres',
        username: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password)
    };
}

function getSequelizeOptions() {
    const config = fromDiscreteEnv() || fromDatabaseUrl();

    if (!config) {
        throw new Error(
            'Thiếu cấu hình DB. Đặt DB_HOST, DB_USER, DB_PASSWORD trong .env ' +
            'hoặc DATABASE_URL (username phải encode: postgres%2E<project-ref>).'
        );
    }

    return config;
}

module.exports = {
    getSequelizeOptions,
    sslOptions
};
