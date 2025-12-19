import { jest } from '@jest/globals';

jest.unstable_mockModule('../db/index.js', () => ({
    getClient: jest.fn()
}));

jest.unstable_mockModule('../inserts.js', () => ({
    insertRegions: jest.fn(),
    insertMunicipalities: jest.fn(),
    insertTownhalls: jest.fn(),
    insertTowns: jest.fn()
}));

const { populateDB } = await import('../updateDB.js');
const db = await import('../db/index.js');
const inserts = await import('../inserts.js');

describe('populateDB function', () => {
    let mockClient;

    beforeEach(() => {
        mockClient = {
            query: jest.fn(),
            release: jest.fn()
        };

        db.getClient.mockResolvedValue(mockClient);

        inserts.insertRegions.mockResolvedValue();
        inserts.insertMunicipalities.mockResolvedValue();
        inserts.insertTownhalls.mockResolvedValue();
        inserts.insertTowns.mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('successfully populates the database and commits', async () => {
        await populateDB();

        expect(db.getClient).toHaveBeenCalled();
        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
        expect(mockClient.query).toHaveBeenCalledWith('SET CONSTRAINTS ALL DEFERRED');
        expect(mockClient.query).toHaveBeenCalledWith(
            'TRUNCATE towns, townhalls, municipalities, regions;'
        );
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
        expect(mockClient.release).toHaveBeenCalled();

        expect(inserts.insertRegions).toHaveBeenCalledWith(mockClient);
        expect(inserts.insertMunicipalities).toHaveBeenCalledWith(mockClient);
        expect(inserts.insertTownhalls).toHaveBeenCalledWith(mockClient);
        expect(inserts.insertTowns).toHaveBeenCalledWith(mockClient);
    });

    test('rolls back transaction if an insert fails', async () => {
        inserts.insertMunicipalities.mockRejectedValue(new Error('Insert failed'));

        await populateDB();

        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled();

        expect(inserts.insertRegions).toHaveBeenCalled();
        expect(inserts.insertMunicipalities).toHaveBeenCalled();

        expect(inserts.insertTownhalls).not.toHaveBeenCalled();
        expect(inserts.insertTowns).not.toHaveBeenCalled();
    });

});