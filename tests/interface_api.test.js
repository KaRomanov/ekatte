import { describe, jest, test } from '@jest/globals';

import {
    fixData, fetchTowns, fetchStats,
    fetchTable, deleteEntry, updateEntry, addEntry
} from '../interface/components/api.js';

const HOST = 'http://127.0.0.1:3000';

describe('fixData', () => {

    test('should set townhall if it is null', () => {
        const rows = [
            { municipality_id: '123', townhall: null },
            { municipality_id: '456', townhall: '456-01' }
        ];
        fixData(rows);
        expect(rows[0].townhall).toBe('123-00');
        expect(rows[1].townhall).toBe('456-01');
    });

    test('should not change townhall if it is already set', () => {
        const rows = [
            { municipality_id: '789', townhall: '789-05' }
        ];
        fixData(rows);
        expect(rows[0].townhall).toBe('789-05');
    });
});


describe('fetchTowns', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('should fetch towns and fix data with single param', async () => {
        const mockData = {
            rows: [
                { municipality_id: '1', townhall: null },
                { municipality_id: '2', townhall: '2-01' }
            ]
        };
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockData)
        });

        const params = { param1: 'test' };
        const result = await fetchTowns(params);

        expect(global.fetch).toHaveBeenCalledTimes(1);

        const calledUrl = global.fetch.mock.calls[0][0].toString();
        expect(calledUrl).toBe(`${HOST}/towns?param1=test`);

        expect(result.rows[0].townhall).toBe('1-00');
        expect(result.rows[1].townhall).toBe('2-01');
    });

    test('should fetch towns with multiple params', async () => {
        const mockData = { rows: [] };
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockData)
        });

        const params = { param1: 'a', param2: 'b' };
        const result = await fetchTowns(params);

        const calledUrl = global.fetch.mock.calls[0][0].toString();
        expect(calledUrl).toBe(`${HOST}/towns?param1=a&param2=b`);

        expect(result.rows).toEqual([]);
    });

    test('should handle empty params', async () => {
        const mockData = { rows: [] };
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockData)
        });

        const result = await fetchTowns();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const calledUrl = global.fetch.mock.calls[0][0].toString();
        expect(calledUrl).toBe(`${HOST}/towns`);
        expect(result.rows).toEqual([]);
    });

});

describe('fetchStats', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('should fetch stats', async () => {
        const mockStats = { data: [1, 2, 3] };
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockStats)
        });

        const result = await fetchStats();

        expect(global.fetch).toHaveBeenCalledWith(`${HOST}/tables`);
        expect(result).toEqual(mockStats);
    });
});

describe('fetchTable', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('should fetch table with endpoint and params', async () => {
        const mockData = { rows: [] };
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockData)
        });
        const endpoint = 'sample-endpoint';
        const params = { key1: 'value1', key2: 'value2' };
        const result = await fetchTable(endpoint, params);

        const calledUrl = global.fetch.mock.calls[0][0].toString();
        expect(calledUrl).toBe(`${HOST}/${endpoint}?key1=value1&key2=value2`);
        expect(result).toEqual(mockData);
    });

    test('should fetch table without params', async () => {
        const mockData = { rows: [] };
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockData)
        });
        const endpoint = 'sample-endpoint';
        const result = await fetchTable(endpoint);
        const calledUrl = global.fetch.mock.calls[0][0].toString();
        expect(calledUrl).toBe(`${HOST}/${endpoint}`);
        expect(result).toEqual(mockData);
    });

});

describe('deleteEntry', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('send DELETE http request', async () => {
        const mockResponse = { success: true };
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse)
        });

        const endpoint = 'sample-endpoint';
        const id = 123;
        const result = await deleteEntry(endpoint, id);
        const calledUrl = global.fetch.mock.calls[0][0].toString();
        const fetchOptions = global.fetch.mock.calls[0][1];
        expect(calledUrl).toBe(`${HOST}/${endpoint}/${id}`);
        expect(fetchOptions.method).toBe('DELETE');
        expect(result).toEqual(mockResponse);
    });

    test('handle error response', async () => {
        const mockError = { error: 'Not found' };
        global.fetch.mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue(mockError)
        });
        const endpoint = 'sample-endpoint';
        const id = 999;
        await expect(deleteEntry(endpoint, id)).rejects.toThrow('Not found');
    });

});

describe('addEntry', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('send POST http request', async () => {
        const mockResponse = { success: true };
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse)
        });
        const endpoint = 'sample-endpoint';
        const data = { key: 'value' };
        const result = await addEntry(endpoint, data);
        const calledUrl = global.fetch.mock.calls[0][0].toString();
        const fetchOptions = global.fetch.mock.calls[0][1];
        expect(calledUrl).toBe(`${HOST}/${endpoint}`);
        expect(fetchOptions.method).toBe('POST');
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');
        expect(fetchOptions.body).toBe(JSON.stringify(data));
        expect(result).toEqual(mockResponse);
    });

    test('handle error response', async () => {
        const mockError = { error: 'Invalid data' };
        global.fetch.mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue(mockError)
        });
        const endpoint = 'sample-endpoint';
        const data = { key: 'value' };
        await expect(addEntry(endpoint, data)).rejects.toThrow('Invalid data');
    });

});

describe('updateEntry', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('send PUT http request', async () => {
        const mockResponse = { success: true };
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse)
        });
        const endpoint = 'sample-endpoint';
        const id = 456;
        const data = { key: 'newValue' };
        const result = await updateEntry(endpoint, id, data);
        const calledUrl = global.fetch.mock.calls[0][0].toString();
        const fetchOptions = global.fetch.mock.calls[0][1];
        expect(calledUrl).toBe(`${HOST}/${endpoint}/${id}`);
        expect(fetchOptions.method).toBe('PUT');
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');
        expect(fetchOptions.body).toBe(JSON.stringify(data));
        expect(result).toEqual(mockResponse);
    });

    test('handle error response', async () => {
        const mockError = { error: 'Update failed' };
        global.fetch.mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue(mockError)
        });
        const endpoint = 'sample-endpoint';
        const id = 789;
        const data = { key: 'value' };
        await expect(updateEntry(endpoint, id, data)).rejects.toThrow('Update failed');
    });

});