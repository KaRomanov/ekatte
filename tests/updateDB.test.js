import { jest } from '@jest/globals';
import { loadJsonFile } from '../updateDB.js';

jest.mock("fs/promises")
import fs from 'fs/promises';

describe('loadJsonFile', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should load and parse a valid JSON file', async () => {
        const fakeJson = JSON.stringify({ foo: 'bar' });
        fs.readFile = jest.fn().mockResolvedValue(fakeJson);

        const result = await loadJsonFile('dummy.json');

        expect(result).toEqual({ foo: 'bar' });
        expect(fs.readFile).toHaveBeenCalledWith('dummy.json');
    });

    test('should throw an error for invalid JSON', async () => {
        fs.readFile = jest.fn().mockResolvedValue('not json');

        await expect(loadJsonFile('bad.json'))
            .rejects
            .toThrow(/Not a valid json file/);

        expect(fs.readFile).toHaveBeenCalledWith('bad.json');
    });

    test('should throw an error if fs.readFile fails', async () => {
        fs.readFile = jest.fn().mockRejectedValue(new Error('file not found'));

        await expect(loadJsonFile('missing.json'))
            .rejects
            .toThrow(/Not a valid json file/);

        expect(fs.readFile).toHaveBeenCalledWith('missing.json');
    });
});