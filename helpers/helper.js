import fs from 'fs/promises';

export async function loadJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath);
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
        throw new Error(`Not a valid json file: ${filePath} - ${err.message}`);
    }
}