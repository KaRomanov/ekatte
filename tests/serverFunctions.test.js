import { describe, jest, test } from '@jest/globals';
import { query } from '../db/index.js';

const mockQuery = jest.fn();
jest.unstable_mockModule('../db/index.js', () => ({
    query: mockQuery
}));

const {
    getTownsByCriteria, getRowCount, getTablesRowCounts,
    getRegionsByCriteria, getMunicipalitiesByCriteria,
    getTownhallsByCriteria, getSettlementsByCriteria,
    deleteEntry, insertEntry, updateEntry, parseBody
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

describe('getRegionsByCriteria', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns formatted result when query succeeds', async () => {
        const mockDbResponse = {
            rowCount: 1,
            rows: [
                {
                    id: 1,
                    name_en: 'Sofia Region'
                }
            ]
        };

        mockQuery.mockResolvedValueOnce(mockDbResponse);

        const params = {
            name_en: 'Sofia'
        };

        const result = await getRegionsByCriteria(params);

        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
            '', 'Sofia', '', ''
        ]);
        expect(result).toEqual({
            rowCount: 1,
            rows: mockDbResponse.rows
        });
    });


    test('throws error when DB query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        await expect(
            getRegionsByCriteria({})
        ).rejects.toThrow('DB query failed');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

});

describe('getMunicipalitiesByCriteria', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns formatted result when query succeeds', async () => {
        const mockDbResponse = {
            rowCount: 1,
            rows: [
                {
                    id: 1,
                    name_en: 'Sofia Municipality'
                }
            ]
        };

        mockQuery.mockResolvedValueOnce(mockDbResponse);

        const params = {
            name_en: 'Sofia'
        };
        const result = await getMunicipalitiesByCriteria(params);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
            '', 'Sofia', '', '', ''
        ]);
        expect(result).toEqual({
            rowCount: 1,
            rows: mockDbResponse.rows
        });
    });

    test('throws error when DB query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        await expect(getMunicipalitiesByCriteria({})).rejects.toThrow('DB query failed');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

});

describe('getTownhallsByCriteria', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns formatted result when query succeeds', async () => {
        const mockDbResponse = {
            rowCount: 1,
            rows: [
                {
                    id: 1,
                    name_en: 'Sofia Townhall'
                }
            ]
        };

        mockQuery.mockResolvedValueOnce(mockDbResponse);

        const params = { name_en: 'Sofia' };

        const result = await getTownhallsByCriteria(params);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
            '', 'Sofia', '', '']);
        expect(result).toEqual({
            rowCount: 1,
            rows: mockDbResponse.rows
        });
    });
    test('throws error when DB query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        await expect(getTownhallsByCriteria({})).rejects.toThrow('DB query failed');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

});

describe('getSettlementsByCriteria', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns formatted result when query succeeds', async () => {
        const mockDbResponse = {
            rowCount: 1,
            rows: [
                {
                    id: 1,
                    name_en: 'Sofia'
                }
            ]
        };

        mockQuery.mockResolvedValueOnce(mockDbResponse);

        const params = { name_en: 'Sofia' };
        const result = await getSettlementsByCriteria(params);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
            '', 'Sofia', '', '', '', ''
        ]);

        expect(result).toEqual({
            rowCount: 1,
            rows: mockDbResponse.rows
        });
    });

    test('throws error when DB query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        await expect(getSettlementsByCriteria({})).rejects.toThrow('DB query failed');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

});

describe('deleteEntry', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns success message when deletion succeeds', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });

        const result = await deleteEntry('towns', 1);

        expect(mockQuery).toHaveBeenCalledWith(
            'DELETE FROM towns WHERE id = $1',
            [1]
        );

        expect(result).toEqual({ success: true });
    });

    test('throws error for invalid table name', async () => {
        await expect(deleteEntry('invalid_table', 1)).rejects.toThrow('Invalid table name');
        expect(mockQuery).toHaveBeenCalledTimes(0);
    });

    test('throws error when DB query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        await expect(deleteEntry('towns', 1)).rejects.toThrow('DB query failed');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    test('returns failure message when no rows are deleted', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        const result = await deleteEntry('towns', 999);
        expect(result).toEqual({ success: false });
    });

});


describe('insertEntry', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns success message when insertion succeeds', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ name_en: 'New Town', municipality_id: 1 }] });
        const data = { name_en: 'New Town', municipality_id: 1 };
        const result = await insertEntry('municipalities', data);
        expect(mockQuery).toHaveBeenCalledWith(
            'INSERT INTO municipalities (name_en, municipality_id) VALUES ($1, $2) RETURNING *',
            ['New Town', 1]
        );
        expect(result).toEqual({ success: true, row: { name_en: 'New Town', municipality_id: 1 } });
    });

    test('throws error for invalid table name', async () => {
        await expect(insertEntry('invalid_table', {})).rejects.toThrow('Invalid table name');
        expect(mockQuery).toHaveBeenCalledTimes(0);
    });

    test('throws error when DB query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        await expect(insertEntry('towns', {})).rejects.toThrow('DB query failed');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

});

describe('updateEntry', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns success message when update succeeds', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, name_en: 'Updated Town' }] });
        const data = { name_en: 'Updated Town' };
        const result = await updateEntry('towns', 1, data);
        expect(mockQuery).toHaveBeenCalledWith(
            'UPDATE towns SET name_en = $1 WHERE id = $2 RETURNING *',
            ['Updated Town', 1]
        );
        expect(result).toEqual({ success: true, row: { id: 1, name_en: 'Updated Town' } });
    });

    test('throws error for invalid table name', async () => {
        await expect(updateEntry('invalid_table', 1, {})).rejects.toThrow('Invalid table name');
        expect(mockQuery).toHaveBeenCalledTimes(0);
    });

    test('throws error when DB query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        await expect(updateEntry('towns', 1, { name_bg: 'Sofia' })).rejects.toThrow('DB query failed');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    test('throws error when there is nothing to update', async () => {
        await expect(updateEntry('towns', 1)).rejects.toThrow('Nothing to update');
        expect(mockQuery).toHaveBeenCalledTimes(0);
    });

    test('return failure message when no rows are updated', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });
        const result = await updateEntry('towns', 999, { name_en: 'Nonexistent Town' });
        expect(result).toEqual({ success: false, row: null });
    });

});

describe('parseBody', () => {
    test('resolves with parsed JSON for valid body', async () => {
        const mockReq = {
            on: jest.fn()
        };
        const bodyChunks = ['{"name_en": "Sofia", ', '"municipality_id": 1}'];

        mockReq.on.mockImplementation((event, callback) => {
            if (event === 'data') {
                bodyChunks.forEach(chunk => callback(chunk));
            }
            if (event === 'end') {
                callback();
            }
        });

        const result = await parseBody(mockReq);
        expect(result).toEqual({ name_en: 'Sofia', municipality_id: 1 });
    });

    test('rejects with error for invalid JSON', async () => {
        const mockReq = {
            on: jest.fn()
        };
        const bodyChunks = ['{"name_en": "Sofia", ', '"municipalit'];
        mockReq.on.mockImplementation((event, callback) => {
            if (event === 'data') {
                bodyChunks.forEach(chunk => callback(chunk));
            }
            if (event === 'end') {
                callback();
            }
        });

        await expect(parseBody(mockReq)).rejects.toThrow('Invalid JSON');
    });
});