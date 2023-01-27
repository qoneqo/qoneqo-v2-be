require('dotenv').config()
const mysql = require('mysql');
const util = require('util');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qoneqo'
})

pool.query = util.promisify(pool.query).bind(pool);

module.exports = pool;