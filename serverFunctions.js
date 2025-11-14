import * as db from './db/index.js';

export const getTownJson = async (str) => {
    const query = `SELECT t.id, t.type,t.name_bg as town, th.name_bg as townhall, m.name_bg as municipality, r.name_bg as region
        FROM towns t LEFT JOIN townhalls th ON t.townhall_id = th.id
	    JOIN municipalities m ON t.municipality_id = m.id
	    JOIN regions r ON r.id = m.region_id
		WHERE t.name_bg ~* $1 OR t.name_en ~* $1`;


    if (typeof str !== 'string') {
        throw new Error('Not a valid function parameter!');
    }

    const param = [str];

    try {
        const res = await db.query(query, param);
        const formattedRes = { rowCount: res.rowCount, rows: res.rows };
        return formattedRes;
    } catch (err) {
        console.error(err);
        throw new Error('DB query failed');
    }
}

//getTownJson('varn');