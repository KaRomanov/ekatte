import * as db from './db/index.js';

export const getTownsByCriteria = async (params) => {
    const query = `SELECT t.id, t.type, t.name_bg as town, th.id as townhall, m.name_bg as municipality,m.id as municipality_id, r.name_bg as region
        FROM towns t LEFT JOIN townhalls th ON t.townhall_id = th.id
	    JOIN municipalities m ON t.municipality_id = m.id
	    JOIN regions r ON r.id = m.region_id
		WHERE ($1 = '' OR t.name_bg ~* $1 OR t.name_en ~* $1)
            AND ($2 = '' OR th.name_bg ~* $2 OR th.name_en ~* $2)
            AND ($3 = '' OR m.name_bg ~* $3 OR m.name_bg ~* $3)
            AND ($4 = '' OR r.name_bg ~* $4 OR r.name_en ~* $4)`;


    const values = [
        params.town || '',
        params.townhall || '',
        params.municipality || '',
        params.region || ''
    ];

    try {
        const res = await db.query(query, values);
        const formattedRes = { rowCount: res.rowCount, rows: res.rows };
        return formattedRes;
    } catch (err) {
        console.error(err);
        throw new Error('DB query failed');
    }
}


const getRowCount = async (table) => {
    try {
        const res = await db.query(`SELECT COUNT(*) FROM ${table}`);
        return res.rows[0].count;
    } catch (err) {
        console.error(err);
        return 0;
    }
};

export const getTablesRowCounts = async () => {
    const tables = ['towns', 'municipalities', 'townhalls', 'regions'];

    const result = {};

    for (const table of tables) {
        const num = await getRowCount(table);
        result[table] = num;
    }

    return result;
};