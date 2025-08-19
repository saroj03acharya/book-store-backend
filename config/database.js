const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test connection
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        if (error && error.code === 'ER_BAD_DB_ERROR') {
            console.warn(`Database "${process.env.DB_NAME}" not found. Creating...`);
            try {
                const mysqlPromise = require('mysql2/promise');
                const bootstrapConnection = await mysqlPromise.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    port: process.env.DB_PORT,
                });
                await bootstrapConnection.query(
                    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
                );
                await bootstrapConnection.end();
                // Try again now that DB exists
                const retry = await promisePool.getConnection();
                console.log('Database created and connected successfully');
                retry.release();
            } catch (createErr) {
                console.error('Failed to create database:', createErr.message);
                throw createErr;
            }
        } else {
            console.error('Database connection failed:', error.message);
            throw error;
        }
    }
};

module.exports = { pool: promisePool, testConnection };
