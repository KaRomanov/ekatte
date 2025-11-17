import http from 'http';
import url from 'url';
import { getTownsByName, getTablesRowCounts } from './serverFunctions.js';

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
        const name = parsedURL.query.name || '';
        try {
            const data = await getTownsByName(name);
            res.setHeader('Content-Type', 'application/json');
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