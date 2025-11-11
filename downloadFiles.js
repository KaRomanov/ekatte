const getFile = require('./getFile');

const downloadFiles = async (files) => {
    for (const { fileUrl, fileDest } of files) {
        await getFile(fileUrl, fileDest);
        console.log(`Downloaded file: ${fileUrl}`);
    }
}

module.exports = downloadFiles;
