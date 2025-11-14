import http from 'http';
import url from 'url';
import { getTownJson } from './serverFunctions.js';

const server = http.createServer();
const PORT = 3000;

server.on('request', async (req, res) => {

    if (req.method !== 'GET') {
        return res.statusCode = 405, res.end();
    }

    const parsedURL = url.parse(req.url,true);
    const pathName = parsedURL.pathname;
    
    if(pathName === '/towns'){

        const name = parsedURL.query.name || '';

        try{
            const data = await getTownJson(name);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
        }catch (err){
            console.error(err);
            return res.statusCode = 500, res.end();
        }
    }
    
    
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});