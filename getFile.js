const https = require('https');
const fs = require('fs');

const getFile = (fileURL, fileDest) => {
    return new Promise((resolve, reject) => {

        const file = fs.createWriteStream(fileDest);

        file.on('error', (err) => {
            fs.unlink(fileDest, () => reject(err));
        });

        https.get(fileURL, (response) => {

            if (response.statusCode !== 200) {
                fs.unlink(fileDest, () => reject(new Error(`HTTP error ${response.statusCode}`)));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close(() => resolve());
            });

        }).on('error', (err) => {

            fs.unlink(fileDest, () => reject(err));
        });
    });
}

module.exports = getFile;