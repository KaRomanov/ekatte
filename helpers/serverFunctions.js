import { query } from '../db/index.js';

export const getTownsByCriteria = async (params) => {
    const sql = `SELECT t.id, t.type, t.name_bg as town, th.id as townhall, m.name_bg as municipality,m.id as municipality_id, r.name_bg as region
        FROM towns t LEFT JOIN townhalls th ON t.townhall_id = th.id
	    JOIN municipalities m ON t.municipality_id = m.id
	    JOIN regions r ON r.id = m.region_id
		WHERE ($1 = '' OR t.name_bg ~* $1 OR t.name_en ~* $1)
            AND ($2 = '' OR th.name_bg ~* $2 OR th.name_en ~* $2)
            AND ($3 = '' OR m.name_bg ~* $3 OR m.name_en ~* $3)
            AND ($4 = '' OR r.name_bg ~* $4 OR r.name_en ~* $4)`;


    const values = [
        params.town || '',
        params.townhall || '',
        params.municipality || '',
        params.region || ''
    ];

    try {
        const res = await query(sql, values);
        const formattedRes = { rowCount: res.rowCount, rows: res.rows };
        return formattedRes;
    } catch (err) {
        console.error(err);
        throw new Error('DB query failed');
    }
}


export const getRowCount = async (table) => {
    try {
        const res = await query(`SELECT COUNT(*) FROM ${table}`);
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

export const getRegionsByCriteria = async (params) => {

    const sql = `SELECT id, name_bg, name_en, region_center_id
        FROM regions
        WHERE ($1 = '' OR name_bg ~* $1)
            AND ($2 = '' OR name_en ~* $2)
            AND ($3 = '' OR id ~* $3)
            AND ($4 = '' OR region_center_id ~* $4)`;

    const values = [
        params.name_bg || '',
        params.name_en || '',
        params.id || '',
        params.region_center_id || ''
    ];

    try {
        const res = await query(sql, values);
        const formattedRes = { rowCount: res.rowCount, rows: res.rows };
        return formattedRes;
    } catch (err) {
        console.error(err);
        throw new Error('DB query failed');
    }

}


export const getMunicipalitiesByCriteria = async (params) => {

    const sql = `SELECT id, name_bg, name_en, region_id, municipality_center_id
        FROM municipalities WHERE ($1 = '' OR name_bg ~* $1)
            AND ($2 = '' OR name_en ~* $2)
            AND ($3 = '' OR id ~* $3)
            AND ($4 = '' OR region_id ~* $4)
            AND ($5 = '' OR municipality_center_id ~* $5)`;

    const values = [params.name_bg || '',
    params.name_en || '',
    params.id || '',
    params.region_id || '',
    params.municipality_center_id || ''];

    try {
        const res = await query(sql, values);
        const formattedRes = { rowCount: res.rowCount, rows: res.rows };
        return formattedRes;
    } catch (err) {
        console.error(err);
        throw new Error('DB query failed');
    }

}

export const getTownhallsByCriteria = async (params) => {

    const sql = `SELECT id, name_bg, name_en, municipality_id, townhall_center_id
        FROM townhalls WHERE ($1 = '' OR name_bg ~* $1)
            AND ($2 = '' OR name_en ~* $2)
            AND ($3 = '' OR id ~* $3)
            AND ($4 = '' OR municipality_id ~* $4)`;

    const values = [params.name_bg || '',
    params.name_en || '',
    params.id || '',
    params.municipality_id || ''];

    try {
        const res = await query(sql, values);
        const formattedRes = { rowCount: res.rowCount, rows: res.rows };
        return formattedRes;
    } catch (err) {
        console.error(err);
        throw new Error('DB query failed');
    }

}

export const getSettlementsByCriteria = async (params) => {

    const sql = `SELECT id, type, name_bg, name_en, townhall_id, municipality_id
        FROM towns WHERE ($1 = '' OR name_bg ~* $1)
            AND ($2 = '' OR name_en ~* $2)
            AND ($3 = '' OR id ~* $3)
            AND ($4 = '' OR type ~* $4)
            AND ($5 = '' OR townhall_id ~* $5)
            AND ($6 = '' OR municipality_id ~* $6)`;

    const values = [params.name_bg || '',
    params.name_en || '',
    params.id || '',
    params.type || '',
    params.townhall_id || '',
    params.municipality_id || ''];

    try {
        const res = await query(sql, values);
        const formattedRes = { rowCount: res.rowCount, rows: res.rows };
        return formattedRes;
    } catch (err) {
        console.error(err);
        throw new Error('DB query failed');
    }

}

export const deleteEntry = async (table, id) => {

    if (!['regions', 'municipalities', 'townhalls', 'towns'].includes(table)) {
        throw new Error('Invalid table name');
    }

    const sql = `DELETE FROM ${table} WHERE id = $1`;
    const values = [id];

    try {
        const res = await query(sql, values);
        return { success: res.rowCount > 0 };
    } catch (err) {
        console.error(err);
        throw new Error('DB query failed');
    }
}