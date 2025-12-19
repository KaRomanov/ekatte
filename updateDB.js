import { getClient } from './db/index.js';
import {
    insertMunicipalities, insertRegions,
    insertTownhalls, insertTowns
} from './inserts.js';

export const populateDB = async () => {
    let client = null;
    try {

        client = await getClient();

        await client.query('BEGIN');
        await client.query('SET CONSTRAINTS ALL DEFERRED');

        console.log('Clearing tables...');
        await client.query('TRUNCATE towns, townhalls, municipalities, regions;');

        console.log('Inserting regions');
        await insertRegions(client);
        console.log('Regions inserted!')

        console.log('Inserting municipalities');
        await insertMunicipalities(client);
        console.log('Municipalities inserted!')

        console.log('Inserting townhalls');
        await insertTownhalls(client);
        console.log('Townhalls inserted!');

        console.log('Inserting towns');
        await insertTowns(client);
        console.log('Towns inserted!');

        await client.query('COMMIT');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during insert sequence:', err.message);
        console.log('Transaction rolled back!');
    } finally {
        client.release();
    }
}
