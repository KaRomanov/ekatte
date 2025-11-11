const downloadFiles = require('./downloadFiles');
const populateDB = require('./updateDB');

const files = [
    { fileUrl: 'https://www.nsi.bg/nrnm/ekatte/territorial-units/json', fileDest: './src/towns.json' },
    { fileUrl: 'https://www.nsi.bg/nrnm/ekatte/town-halls/json', fileDest: './src/townhalls.json' },
    { fileUrl: 'https://www.nsi.bg/nrnm/ekatte/municipalities/json', fileDest: './src/municipalities.json' },
    { fileUrl: 'https://www.nsi.bg/nrnm/ekatte/regions/json', fileDest: './src/regions.json' }
];

(async () => {
    try {
        await downloadFiles(files); 
        await populateDB();          
    } catch (err) {
        console.error('Error:', err);
    }
})();
