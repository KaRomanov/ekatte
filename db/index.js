import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool();

pool.on('error', (err) => {
    console.error('PostgreSQL pool error', err);
    process.exit(1);
});

export const getClient = () => pool.connect();

export const query = async (text, params) => {
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

export const end = async () => {
    await pool.end();
}