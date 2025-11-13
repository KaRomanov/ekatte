import { jest, test, expect, beforeEach } from '@jest/globals';
import fs from 'fs/promises';
import { getFile, downloadFiles } from '../downloadFiles.js';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks();
});


describe('getFile', () => {
    beforeEach(() => {
        fetch.resetMocks?.();
        jest.restoreAllMocks();
    });


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

        await expect(
            getFile('https://example.com/missing.json', 'dest.json')
        ).rejects.toThrow('Failed to download: https://example.com/missing.json');
    });


    it('throws if writing to disk fails', async () => {
        fetch.mockResponseOnce('{"name":"test"}');
        const writeFileSpy = jest.spyOn(fs, 'writeFile').mockRejectedValue(new Error('Disk full'));

        await expect(
            getFile('https://example.com/file.json', 'dest.json')
        ).rejects.toThrow('Failed to download: https://example.com/file.json');

        expect(writeFileSpy).toHaveBeenCalled();
    });


    it('throws if URL is null', async () => {
        await expect(getFile(null, 'dest.json')).rejects.toThrow();
    });


    it('throws if URL is empty string', async () => {
        await expect(getFile('', 'dest.json')).rejects.toThrow();
    });


    it('throws if dest is null', async () => {
        fetch.mockResponseOnce('{"data":"test"}');
        await expect(getFile('https://example.com/file.json', null)).rejects.toThrow();
    });


    it('throws if dest is empty string', async () => {
        fetch.mockResponseOnce('{"data":"test"}');
        await expect(getFile('https://example.com/file.json', '')).rejects.toThrow();
    });


    it('throws if fetch itself rejects (network error)', async () => {
        fetch.mockRejectOnce(new Error('Network error'));

        await expect(
            getFile('https://example.com/file.json', 'dest.json')
        ).rejects.toThrow('Failed to download: https://example.com/file.json');
    });

});


describe('downloadFiles', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const files = [
        { fileUrl: 'https://example.com/a.json', fileDest: 'a.json' },
        { fileUrl: 'https://example.com/b.json', fileDest: 'b.json' },
    ];


    it('downloads multiple files', async () => {
        fetch
            .mockResponseOnce('{"file":1}')
            .mockResponseOnce('{"file":2}');

        const writeFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue();
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

        await downloadFiles(files);

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(writeFileSpy).toHaveBeenCalledTimes(2);
        expect(writeFileSpy).toHaveBeenCalledWith('a.json', '{"file":1}');
        expect(writeFileSpy).toHaveBeenCalledWith('b.json', '{"file":2}');

        writeFileSpy.mockRestore();
        consoleSpy.mockRestore();
    });


    it('handles failed downloads', async () => {
        fetch
            .mockResponseOnce('{"file":1}')
            .mockRejectOnce(new Error('Network error'));

        const writeFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue();
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        await expect(downloadFiles(files)).rejects.toThrow(
            'Download failed b.json'
        );

        expect(consoleSpy).toHaveBeenCalledWith(
            'Download failed: ',
            'Failed to download: https://example.com/b.json'
        );

        writeFileSpy.mockRestore();
        consoleSpy.mockRestore();
    });

});