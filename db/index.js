import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool();

export const query = async (text, params) => {
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

export const end = async () => {
    await pool.end();
}
