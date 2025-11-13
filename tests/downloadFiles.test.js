import { jest, test, expect, beforeEach} from '@jest/globals';
import fs from 'fs/promises';
import { getFile, downloadFiles } from '../downloadFiles.js';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks();
});


describe('getFile', () => {
    it('writes fetched content to a file', async () => {
        fetch.mockResponseOnce('{"name":"test"}');

        const writeFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue();

        await getFile('https://example.com/file.json', 'dest.json');

        expect(fetch).toHaveBeenCalledWith('https://example.com/file.json');
        expect(writeFileSpy).toHaveBeenCalledWith('dest.json', '{"name":"test"}');

        writeFileSpy.mockRestore();
    });

    it('throws on HTTP error', async () => {
        fetch.mockResponseOnce('', { status: 404 });

        await expect(getFile('https://example.com/missing.json', 'dest.json'))
            .rejects.toThrow('HTTP 404');
    });
});

describe('downloadFiles', () => {
    it('downloads multiple files', async () => {
        fetch
            .mockResponseOnce('{"file":1}')
            .mockResponseOnce('{"file":2}');

        const writeFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue();
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

        const files = [
            { fileUrl: 'https://example.com/file1.json', fileDest: 'file1.json' },
            { fileUrl: 'https://example.com/file2.json', fileDest: 'file2.json' },
        ];

        await downloadFiles(files);

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(writeFileSpy).toHaveBeenCalledTimes(2);
        expect(writeFileSpy).toHaveBeenCalledWith('file1.json', '{"file":1}');
        expect(writeFileSpy).toHaveBeenCalledWith('file2.json', '{"file":2}');

        writeFileSpy.mockRestore();
        consoleSpy.mockRestore();
    });

    it('handles failed downloads gracefully', async () => {
        fetch
            .mockResponseOnce('{"file":1}')
            .mockRejectOnce(new Error('Network error'));

        const writeFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue();
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

        const files = [
            { fileUrl: 'https://example.com/file1.json', fileDest: 'file1.json' },
            { fileUrl: 'https://example.com/file2.json', fileDest: 'file2.json' },
        ];

        await downloadFiles(files);

        expect(consoleSpy).toHaveBeenCalledWith(
            'Download failed: ',
            expect.any(Error)
        );

        writeFileSpy.mockRestore();
        consoleSpy.mockRestore();
    });
});
