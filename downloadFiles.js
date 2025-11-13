import fs from 'fs/promises';

export async function getFile(url, dest) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();
    await fs.writeFile(dest, text);
    console.log('Downloaded file: ', dest);
}

export const downloadFiles = async (files) => {
    for (const { fileUrl, fileDest } of files) {
        try {
            await getFile(fileUrl, fileDest);
        } catch (err) {
            console.log('Download failed: ', err);
        }
    }
}

