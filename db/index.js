const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'one',
    host: 'localhost',
    port: 5432,
    database: 'ekatte_1',
});


const query = async (text, params) => {
    try {
        //const start = Date.now();
        const res = await pool.query(text, params);
        // const duration = Date.now() - start;
        // console.log('executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (err) {
        console.error('Query failed:', err);
        throw err;
    }

}

const end = async () => {
    await pool.end();
}

module.exports = { query, end };