import { jest } from '@jest/globals';

import { fixData, fetchTowns, fetchStats } from '../interface/api.js';

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