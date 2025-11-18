import http from 'http';
import url from 'url';
import { getTownsByCriteria, getTablesRowCounts } from './serverFunctions.js';

const server = http.createServer();
const PORT = 3000;

server.on('request', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
            console.log('API return: ',parsedURL.path);
            return res.end(JSON.stringify(data));
        } catch (err) {
            console.error(err);
            return res.statusCode = 500, res.end();
        }

    }


    if (pathName === '/tables') {
        try {
            const data = await getTablesRowCounts();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
        } catch (err) {
            console.error(err);
            return res.statusCode = 500, res.end();
        }
    }

});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});