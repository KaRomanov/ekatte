const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool();

const query = async (text, params) => {
    try {
        //const start = Date.now();
        const res = await pool.query(text, params);
        // const duration = Date.now() - start;
        // console.log('executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (err) {
        console.error('Query failed:', err);
    }
}

const end = async () => {
    await pool.end();
}

module.exports = { query, end };