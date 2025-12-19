import { jest } from '@jest/globals';
import { query } from '../db/index.js';

const mockQuery = jest.fn();
jest.unstable_mockModule('../db/index.js', () => ({
    query: mockQuery
}));

const {
    getTownsByCriteria,
    getRowCount,
    getTablesRowCounts
} = await import('../helpers/serverFunctions.js');

describe('getTownsByCriteria', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns formatted result when query succeeds', async () => {
        const mockDbResponse = {
            rowCount: 2,
            rows: [
                {
                    id: 1,
                    type: 'city',
                    town: 'Sofia',
                    townhall: 1,
                    municipality: 'Sofia',
                    municipality_id: 1,
                    region: 'Sofia Region'
                },
                {
                    id: 2,
                    type: 'town',
                    town: 'Plovdiv',
                    townhall: 2,
                    municipality: 'Plovdiv',
                    municipality_id: 2,
                    region: 'Plovdiv Region'
                }
            ]
        };

        mockQuery.mockResolvedValueOnce(mockDbResponse);

        const params = {
            town: 'Sofia',
            townhall: '',
            municipality: '',
            region: ''
        };

        const result = await getTownsByCriteria(params);

        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
            'Sofia',
            '',
            '',
            ''
        ]);

        expect(result).toEqual({
            rowCount: 2,
            rows: mockDbResponse.rows
        });
    });

    test('throws error when DB query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(
            getTownsByCriteria({})
        ).rejects.toThrow('DB query failed');

        expect(mockQuery).toHaveBeenCalledTimes(1);
    });
});

describe('getRowCount', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns count when query succeeds', async () => {
        mockQuery.mockResolvedValueOnce({
            rows: [{ count: '42' }]
        });

        const result = await getRowCount('towns');

        expect(mockQuery).toHaveBeenCalledWith('SELECT COUNT(*) FROM towns');
        expect(result).toBe('42');
    });

    test('returns 0 when query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        const result = await getRowCount('towns');

        expect(result).toBe(0);
    });
});

describe('getTablesRowCounts', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns row counts for all tables', async () => {
        mockQuery
            .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // towns
            .mockResolvedValueOnce({ rows: [{ count: '5' }] })  // municipalities
            .mockResolvedValueOnce({ rows: [{ count: '3' }] })  // townhalls
            .mockResolvedValueOnce({ rows: [{ count: '2' }] }); // regions

        const result = await getTablesRowCounts();

        expect(result).toEqual({
            towns: '10',
            municipalities: '5',
            townhalls: '3',
            regions: '2'
        });

        expect(mockQuery).toHaveBeenCalledTimes(4);
    });
});