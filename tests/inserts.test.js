import { jest } from '@jest/globals';
const mockLoadJsonFile = jest.fn();

jest.unstable_mockModule('../helper.js', () => ({
    loadJsonFile: mockLoadJsonFile
}));

let dbClient;

beforeAll(() => {
    dbClient = { query: jest.fn(), release: jest.fn() };
});

beforeEach(() => {
    jest.clearAllMocks();
});

const { insertRegions, insertMunicipalities, insertTownhalls, insertTowns } = await import('../inserts.js');

describe('insertRegions', () => {

    test('inserts only valid regions with trimmed values', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            {
                oblast: 1,
                name: ' Sofia ',
                name_en: ' Sofia ',
                ekatte: 100
            },
            {
                oblast: null,
                name: 'Invalid',
                name_en: 'Invalid',
                ekatte: 200
            }
        ]);

        dbClient.query.mockResolvedValueOnce();

        await insertRegions(dbClient);

        expect(mockLoadJsonFile).toHaveBeenCalledWith('./src/regions.json');

        expect(dbClient.query).toHaveBeenCalledTimes(1);

        const [sql, values] = dbClient.query.mock.calls[0];

        expect(sql).toContain('INSERT INTO regions');

        expect(values).toEqual([
            1,
            'Sofia',
            'Sofia',
            100
        ]);
    });

    test('does nothing when no valid regions exist', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            { oblast: null, name: '', name_en: '', ekatte: null }
        ]);

        await insertRegions(dbClient);

        expect(dbClient.query).not.toHaveBeenCalled();
    });

    test('throws wrapped error when db insert fails', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            {
                oblast: 1,
                name: 'Sofia',
                name_en: 'Sofia',
                ekatte: 100
            }
        ]);

        dbClient.query.mockRejectedValueOnce(new Error('DB error'));

        await expect(insertRegions(dbClient))
            .rejects
            .toThrow('Failed to insert region: DB error');
    });
});

describe('insertMunicipalities', () => {

    test('inserts only valid municipalities with trimmed values and substr region_id', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            {
                obshtina: '12345',
                name: ' Sofia Municipality ',
                name_en: ' Sofia Municipality ',
                ekatte: 1000
            },
            {
                obshtina: null,
                name: 'Invalid',
                name_en: 'Invalid',
                ekatte: 2000
            }
        ]);

        dbClient.query.mockResolvedValueOnce();

        await insertMunicipalities(dbClient);

        expect(mockLoadJsonFile).toHaveBeenCalledWith('./src/municipalities.json');
        expect(dbClient.query).toHaveBeenCalledTimes(1);

        const [sql, values] = dbClient.query.mock.calls[0];

        expect(sql).toContain('INSERT INTO municipalities');

        expect(values).toEqual([
            '12345',
            'Sofia Municipality',
            'Sofia Municipality',
            '123',
            1000
        ]);
    });

    test('does nothing when no valid municipalities exist', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            {
                obshtina: null,
                name: '',
                name_en: '',
                ekatte: null
            }
        ]);

        await insertMunicipalities(dbClient);

        expect(dbClient.query).not.toHaveBeenCalled();
    });

    test('throws wrapped error when db insert fails', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            {
                obshtina: '12345',
                name: 'Sofia',
                name_en: 'Sofia',
                ekatte: 1000
            }
        ]);

        dbClient.query.mockRejectedValueOnce(new Error('DB error'));

        await expect(insertMunicipalities(dbClient))
            .rejects
            .toThrow('Failed to insert municipality: DB error');
    });
});

describe('insertTownhalls', () => {

    test('inserts only valid townhalls with trimmed values and substr municipality_id', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            {
                kmetstvo: '1234567',
                name: ' Central Townhall ',
                name_en: ' Central Townhall ',
                ekatte: 555
            },
            {
                kmetstvo: null,
                name: 'Invalid',
                name_en: 'Invalid',
                ekatte: 999
            }
        ]);

        dbClient.query.mockResolvedValueOnce();

        await insertTownhalls(dbClient);

        expect(mockLoadJsonFile).toHaveBeenCalledWith('./src/townhalls.json');
        expect(dbClient.query).toHaveBeenCalledTimes(1);

        const [sql, values] = dbClient.query.mock.calls[0];

        expect(sql).toContain('INSERT INTO townhalls');

        expect(values).toEqual([
            '1234567',
            'Central Townhall',
            'Central Townhall',
            '12345',
            555
        ]);
    });

    test('throws error when db insert fails', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            {
                kmetstvo: '1234567',
                name: 'Central Townhall',
                name_en: 'Central Townhall',
                ekatte: 555
            }
        ]);

        dbClient.query.mockRejectedValueOnce(new Error('DB error'));

        await expect(insertTownhalls(dbClient))
            .rejects
            .toThrow('Failed to insert townhall: DB error');

        expect(dbClient.query).toHaveBeenCalledTimes(1);
    });
});

describe('insertTowns', () => {

    test('sets townhall_id to null when kmetstvo ends with "00"', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            {
                ekatte: '1001',
                t_v_m: 'city',
                name: 'Town A',
                name_en: 'Town A EN',
                kmetstvo: '12000',
                obshtina: '2001'
            },
            {
                ekatte: '1002',
                t_v_m: 'town',
                name: 'Town B',
                name_en: 'Town B EN',
                kmetstvo: '12340',
                obshtina: '2002'
            }
        ]);

        dbClient.query.mockResolvedValue();

        await insertTowns(dbClient);

        expect(dbClient.query).toHaveBeenCalledTimes(2);

        const firstCallValues = dbClient.query.mock.calls[0][1];
        expect(firstCallValues).toEqual([
            '1001',
            'city',
            'Town A',
            'Town A EN',
            null,
            '2001'
        ]);

        const secondCallValues = dbClient.query.mock.calls[1][1];
        expect(secondCallValues).toEqual([
            '1002',
            'town',
            'Town B',
            'Town B EN',
            '12340',
            '2002'
        ]);
    });

    test('throws wrapped error when db insert fails', async () => {
        mockLoadJsonFile.mockResolvedValueOnce([
            {
                ekatte: '1003',
                t_v_m: 'village',
                name: 'Town C',
                name_en: 'Town C EN',
                kmetstvo: '1300',
                obshtina: '2003'
            }
        ]);

        dbClient.query.mockRejectedValueOnce(new Error('DB error'));

        await expect(insertTowns(dbClient))
            .rejects
            .toThrow('Failed to insert town: DB error');
    });

});