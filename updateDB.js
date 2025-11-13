import * as db from './db/index.js';
import fs from 'fs/promises';

async function loadJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath);
        return JSON.parse(data);
    } catch (err) {
        throw new Error(`Not a valid json file: ${filePath} - ${err.message}`);
    }
}

async function insertRegions() {

    const regions = await loadJsonFile('./src/regions.json');

    const validData = regions.filter(r => r.oblast && r.name && r.name_en && r.ekatte)
        .map(r => ({
            id: r.oblast,
            name_bg: r.name.trim(),
            name_en: r.name_en.trim(),
            region_center_id: r.ekatte
        }));

    const query = `
        INSERT INTO regions (id, name_bg, name_en, region_center_id)
        VALUES ($1, $2, $3, $4)`;

    try {
        for (const r of validData) {
            const values = [r.id, r.name_bg, r.name_en, r.region_center_id];
            await db.query(query, values);
        }
    } catch (err) {
        throw new Error(`Failed to insert region: ${err.message}`);
    }
}

async function insertMunicipalities() {

    const municipalities = await loadJsonFile('./src/municipalities.json');

    const validData = municipalities.filter(m => m.obshtina && m.name && m.name_en && m.ekatte)
        .map(m => ({
            id: m.obshtina,
            name_bg: m.name.trim(),
            name_en: m.name_en.trim(),
            region_id: m.obshtina.substring(0, 3),
            municipality_center_id: m.ekatte
        }));

    const query = `INSERT INTO municipalities (id, name_bg, name_en, region_id, municipality_center_id)
        VALUES ($1, $2, $3, $4, $5)`;

    try {
        for (const m of validData) {
            const values = [m.id, m.name_bg, m.name_en, m.region_id, m.municipality_center_id];
            await db.query(query, values);
        }
    } catch (err) {
        throw new Error(`Failed to insert municipality: ${err.message}`);
    }
}

async function insertTownhalls() {

    const townhalls = await loadJsonFile('./src/townhalls.json');

    const validData = townhalls.filter(th => th.kmetstvo && th.name && th.name_en && th.ekatte)
        .map(th => ({
            id: th.kmetstvo,
            name_bg: th.name.trim(),
            name_en: th.name_en.trim(),
            municipality_id: th.kmetstvo.substring(0, 5),
            townhall_center_id: th.ekatte
        }));

    const query = `INSERT INTO townhalls (id, name_bg, name_en, municipality_id, townhall_center_id)
        VALUES ($1, $2, $3, $4, $5);`;

    try {
        for (const th of validData) {
            const values = [th.id, th.name_bg, th.name_en, th.municipality_id, th.townhall_center_id];
            const res = await db.query(query, values);
        }
    } catch (err) {
        throw new Error(`Failed to insert townhall: ${err.message}`);
    }
}


async function insertTowns() {
    const towns = await loadJsonFile('./src/towns.json');

    const validData = towns.filter(t => t.ekatte && t.t_v_m && t.name && t.name_en && t.kmetstvo && t.obshtina)
        .map(t => {
            let townhall_id = t.kmetstvo;
            if (townhall_id.endsWith('00')) {
                townhall_id = null;
            }

            return {
                id: t.ekatte,
                type: t.t_v_m,
                name_bg: t.name,
                name_en: t.name_en,
                townhall_id,
                municipality_id: t.obshtina
            };
        });

    const query = `INSERT INTO towns (id, type, name_bg, name_en, townhall_id, municipality_id)
        VALUES ($1, $2, $3, $4, $5, $6)`;

    try {
        for (const t of validData) {
            const values = [t.id, t.type, t.name_bg, t.name_en, t.townhall_id, t.municipality_id];
            const res = await db.query(query, values);
        }
    } catch (err) {
        throw new Error(`Failed to insert town: ${err.message}`);
    }
}

export const populateDB = async () => {
    try {

        await db.query('BEGIN');
        await db.query('SET CONSTRAINTS ALL DEFERRED');

        console.log('Clearing tables...');
        await db.query('TRUNCATE towns, townhalls, municipalities, regions;');

        console.log('Inserting regions');
        await insertRegions();
        console.log('Regions inserted!')

        console.log('Inserting municipalities');
        await insertMunicipalities();
        console.log('Municipalities inserted!')

        console.log('Inserting townhalls');
        await insertTownhalls();
        console.log('Townhalls inserted!');

        console.log('Inserting towns');
        await insertTowns();
        console.log('Towns inserted!');

        await db.query('COMMIT');

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error during insert sequence:', err.message);
        console.log('Transaction rolled back!');
    } finally {
        await db.end();
    }
}
