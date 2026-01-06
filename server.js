import http from 'http';
import url from 'url';
import {
    getTownsByCriteria, getTablesRowCounts, getRegionsByCriteria, deleteEntry, insertEntry,
    getMunicipalitiesByCriteria, getTownhallsByCriteria, getSettlementsByCriteria, parseBody, updateEntry
} from './helpers/serverFunctions.js';

const server = http.createServer();
const PORT = 3000;

server.on('request', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


    const parsedURL = url.parse(req.url, true);
    const pathParts = parsedURL.pathname.split('/').filter(Boolean);
    const pathName = pathParts[0];

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method == 'GET') {
        //read data

        if (pathName === 'towns') {

            const params = {
                town: parsedURL.query.town || '',
                townhall: parsedURL.query.townhall || '',
                municipality: parsedURL.query.municipality || '',
                region: parsedURL.query.region || ''
            };

            try {
                const data = await getTownsByCriteria(params);
                res.setHeader('Content-Type', 'application/json');
                console.log('API return: ', req.method, parsedURL.path);
                return res.end(JSON.stringify(data));
            } catch (err) {
                console.error(err);
                return res.statusCode = 500, res.end();
            }

        } else if (pathName === 'tables') {

            try {
                const data = await getTablesRowCounts();
                res.setHeader('Content-Type', 'application/json');
                console.log('API return: ', req.method, parsedURL.path);
                return res.end(JSON.stringify(data));
            } catch (err) {
                console.error(err);
                return res.statusCode = 500, res.end();
            }

        } else if (pathName === 'regions') {

            const params = {
                id: parsedURL.query.id || '',
                name_bg: parsedURL.query.name_bg || '',
                name_en: parsedURL.query.name_en || '',
                region_center_id: parsedURL.query.region_center_id || ''
            };

            try {
                const data = await getRegionsByCriteria(params);
                res.setHeader('Content-Type', 'application/json');
                console.log('API return: ', req.method, parsedURL.path);
                return res.end(JSON.stringify(data));
            } catch (err) {
                console.error(err);
                return res.statusCode = 500, res.end();
            }

        } else if (pathName === 'municipalities') {

            const params = {
                id: parsedURL.query.id || '',
                name_bg: parsedURL.query.name_bg || '',
                name_en: parsedURL.query.name_en || '',
                region_id: parsedURL.query.region_id || '',
                municipality_center_id: parsedURL.query.municipality_center_id || ''
            };

            try {
                const data = await getMunicipalitiesByCriteria(params);
                res.setHeader('Content-Type', 'application/json');
                console.log('API return: ', req.method, parsedURL.path);
                return res.end(JSON.stringify(data));
            } catch (err) {
                console.error(err);
                return res.statusCode = 500, res.end();
            }

        } else if (pathName === 'townhalls') {

            const params = {
                id: parsedURL.query.id || '',
                name_bg: parsedURL.query.name_bg || '',
                name_en: parsedURL.query.name_en || '',
                municipality_id: parsedURL.query.municipality_id || ''
            };

            try {
                const data = await getTownhallsByCriteria(params);
                res.setHeader('Content-Type', 'application/json');
                console.log('API return: ', req.method, parsedURL.path);
                return res.end(JSON.stringify(data));
            } catch (err) {
                console.error(err);
                return res.statusCode = 500, res.end();
            }

        } else if (pathName === 'settlements') {
            const params = {
                id: parsedURL.query.id || '',
                name_bg: parsedURL.query.name_bg || '',
                name_en: parsedURL.query.name_en || '',
                type: parsedURL.query.type || '',
                townhall_id: parsedURL.query.townhall_id || '',
                municipality_id: parsedURL.query.municipality_id || ''
            };

            try {
                const data = await getSettlementsByCriteria(params);
                res.setHeader('Content-Type', 'application/json');
                console.log('API return: ', req.method, parsedURL.path);
                return res.end(JSON.stringify(data));
            } catch (err) {
                console.error(err);
                return res.statusCode = 500, res.end();
            }

        }
        else {
            return res.statusCode = 404, res.end();
        }

    } else if (req.method == 'POST') {
        // add new entries

        const tableMap = {
            settlements: 'towns',
            townhalls: 'townhalls',
            municipalities: 'municipalities',
            regions: 'regions'
        };

        const table = tableMap[pathName];

        if (!table) {
            return res.statusCode = 404, res.end(JSON.stringify({
                success: false,
                error: 'Invalid endpoint'
            }));
        }

        try {
            const params = await parseBody(req);

            //validate body?

            await insertEntry(table, params);

            console.log('API return: ', req.method, parsedURL.path);
            return res.statusCode = 201, res.end(JSON.stringify({ success: true }));

        } catch (err) {
            return res.statusCode = 500, res.end(JSON.stringify({
                success: false,
                error: err.message || 'Internal Server Error'
            }));
        }

    } else if (req.method === 'DELETE') {
        //delete entries
        const id = pathParts[1];

        if (!id) {
            return res.statusCode = 404, res.end();
        }

        const tableMap = {
            settlements: 'towns',
            townhalls: 'townhalls',
            municipalities: 'municipalities',
            regions: 'regions'
        };

        const table = tableMap[pathName];

        if (!table) {
            return res.statusCode = 404, res.end(JSON.stringify({
                success: false,
                error: 'Invalid endpoint'
            }));
        }

        try {
            await deleteEntry(table, id);

            console.log('API return: ', req.method, parsedURL.path);
            return res.statusCode = 200, res.end(JSON.stringify({ success: true }));

        } catch (err) {
            return res.statusCode = 500, res.end(JSON.stringify({
                success: false,
                error: err.message || 'Internal Server Error'
            }));
        }

    } else if (req.method === 'PUT') {
        //update entries

        const id = pathParts[1];

        if (!id) {
            return res.statusCode = 404, res.end(JSON.stringify({
                success: false,
                error: 'ID not provided'
            }));
        }

        const tableMap = {
            settlements: 'towns',
            townhalls: 'townhalls',
            municipalities: 'municipalities',
            regions: 'regions'
        };

        const table = tableMap[pathName];

        if (!table) {
            return res.statusCode = 404, res.end();
        }

        try {
            const params = await parseBody(req);

            const updateData = Object.fromEntries(
                Object.entries(params).filter(([key, val]) => key !== 'id' && val !== '')
            );

            if (Object.keys(updateData).length === 0) {
                return res.statusCode = 400, res.end(JSON.stringify({
                    success: false,
                    error: 'No fields to update'
                }));
            }

            await updateEntry(table, id, updateData);

            console.log('API return: ', req.method, parsedURL.path);
            return res.statusCode = 200, res.end(JSON.stringify({ success: true }));

        } catch (err) {
            return res.statusCode = 500, res.end(JSON.stringify({
                success: false,
                error: err.message || 'Internal Server Error'
            }));
        }

    } else {
        return res.statusCode = 405, res.end();
    }

});

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default server;