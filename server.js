import http from 'http';
import url from 'url';
import { getTownsByCriteria, getTablesRowCounts, getRegionsByCriteria,
    getMunicipalitiesByCriteria, getTownhallsByCriteria, getSettlementsByCriteria
 } from './helpers/serverFunctions.js';
import path from 'path';

const server = http.createServer();
const PORT = 3000;

server.on('request', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'GET') {
        return res.statusCode = 405, res.end();
    }

    const parsedURL = url.parse(req.url, true);
    const pathName = parsedURL.pathname;

    if (pathName === '/towns') {

        const params = {
            town: parsedURL.query.town || '',
            townhall: parsedURL.query.townhall || '',
            municipality: parsedURL.query.municipality || '',
            region: parsedURL.query.region || ''
        };

        try {
            const data = await getTownsByCriteria(params);
            res.setHeader('Content-Type', 'application/json');
            console.log('API return: ', parsedURL.path);
            return res.end(JSON.stringify(data));
        } catch (err) {
            console.error(err);
            return res.statusCode = 500, res.end();
        }

    } else if (pathName === '/tables') {

        try {
            const data = await getTablesRowCounts();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
        } catch (err) {
            console.error(err);
            return res.statusCode = 500, res.end();
        }

    } else if (pathName === '/regions') {

        const params = {
            id: parsedURL.query.id || '',
            name: parsedURL.query.name || '',
            region_center_id: parsedURL.query.region_center_id || ''
        };

        try {
            const data = await getRegionsByCriteria(params);
            res.setHeader('Content-Type', 'application/json');
            console.log('API return: ', parsedURL.path);
            return res.end(JSON.stringify(data));
        } catch (err) {
            console.error(err);
            return res.statusCode = 500, res.end();
        }

    } else if (pathName === '/municipalities') {

        const params = {
            id: parsedURL.query.id || '',
            name: parsedURL.query.name || '',
            region_id: parsedURL.query.region_id || '',
            municipality_center_id: parsedURL.query.municipality_center_id || ''
        };

        try {
            const data = await getMunicipalitiesByCriteria(params);
            res.setHeader('Content-Type', 'application/json');
            console.log('API return: ', parsedURL.path);
            return res.end(JSON.stringify(data));
        } catch (err) {
            console.error(err);
            return res.statusCode = 500, res.end();
        }

    } else if (pathName === '/townhalls') {

        const params = {
            id: parsedURL.query.id || '',
            name: parsedURL.query.name || '',
            municipality_id: parsedURL.query.municipality_id || ''
        };

        try {
            const data = await getTownhallsByCriteria(params);
            res.setHeader('Content-Type', 'application/json');
            console.log('API return: ', parsedURL.path);
            return res.end(JSON.stringify(data));
        } catch (err) {
            console.error(err);
            return res.statusCode = 500, res.end();
        }

    } else if (pathName === '/settlements') {
        const params = {
            id: parsedURL.query.id || '',
            name: parsedURL.query.name || '',
            type: parsedURL.query.type || '',
            municipality_id: parsedURL.query.municipality_id || '',
            region_id: parsedURL.query.region_id || ''
        };

        try {
            const data = await getSettlementsByCriteria(params);
            res.setHeader('Content-Type', 'application/json');
            console.log('API return: ', parsedURL.path);
            return res.end(JSON.stringify(data));
        } catch (err) {
            console.error(err);
            return res.statusCode = 500, res.end();
        }

    }
    else {
        return res.statusCode = 404, res.end();
    }

});

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default server;