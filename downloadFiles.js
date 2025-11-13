import fs from 'fs/promises';

export const getFile = async (url, dest) => {

    if (!url || typeof url !== 'string') {
        throw new Error('URL is not valid');
    }

    if (!dest || typeof dest !== 'string') {
        throw new Error('Destination is not valid');
    }

    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP response status: ${res.status}`);
        }

        const text = await res.text();
        await fs.writeFile(dest, text);
        console.log('Downloaded file: ', dest);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to download: ${url}`);
    }
}

export const downloadFiles = async (files) => {
    for (const { fileUrl, fileDest } of files) {
        try {
            await getFile(fileUrl, fileDest);
        } catch (err) {
            console.error('Download failed: ', err.message);
            throw new Error(`Download failed ${fileDest}`);
        }
    }
}
