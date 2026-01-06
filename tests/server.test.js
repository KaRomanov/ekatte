import { describe, jest, test } from '@jest/globals';
import request from 'supertest';

const mockGetTownsByCriteria = jest.fn();
const mockGetTablesRowCounts = jest.fn();
const mockInsertEntry = jest.fn();
const mockDeleteEntry = jest.fn();
const mockUpdateEntry = jest.fn();
const mockParseBody = jest.fn();
const mockGetRegionsByCriteria = jest.fn();
const mockGetMunicipalitiesByCriteria = jest.fn();
const mockGetTownhallsByCriteria = jest.fn();
const mockGetSettlementsByCriteria = jest.fn();

jest.unstable_mockModule('../helpers/serverFunctions.js', () => ({
    getTownsByCriteria: mockGetTownsByCriteria,
    getTablesRowCounts: mockGetTablesRowCounts,
    insertEntry: mockInsertEntry,
    deleteEntry: mockDeleteEntry,
    updateEntry: mockUpdateEntry,
    parseBody: mockParseBody,
    getRegionsByCriteria: mockGetRegionsByCriteria,
    getMunicipalitiesByCriteria: mockGetMunicipalitiesByCriteria,
    getTownhallsByCriteria: mockGetTownhallsByCriteria,
    getSettlementsByCriteria: mockGetSettlementsByCriteria
}));

const { default: server } = await import('../server.js');

afterEach(() => {
    jest.clearAllMocks();
});

describe('API tests', () => {
    test('GET /towns returns towns data', async () => {
        mockGetTownsByCriteria.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ id: 1, town: 'Sofia' }]
        });

        const res = await request(server)
            .get('/towns')
            .query({ town: 'Sofia' })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual({
            rowCount: 1,
            rows: [{ id: 1, town: 'Sofia' }]
        });

        expect(mockGetTownsByCriteria).toHaveBeenCalledWith({
            town: 'Sofia',
            townhall: '',
            municipality: '',
            region: ''
        });
    });

    test('GET /towns returns 500 on error', async () => {
        mockGetTownsByCriteria.mockRejectedValueOnce(new Error('DB failure'));

        await request(server).get('/towns').expect(500);
    });

    test('GET /tables return 500 on error', async () => {
        mockGetTablesRowCounts.mockRejectedValueOnce(new Error('DB failure'));

        await request(server).get('/tables').expect(500);
    });

    test('GET /tables returns table row counts', async () => {
        mockGetTablesRowCounts.mockResolvedValueOnce({
            towns: '10',
            municipalities: '5',
            townhalls: '3',
            regions: '2'
        });

        const res = await request(server)
            .get('/tables')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual({
            towns: '10',
            municipalities: '5',
            townhalls: '3',
            regions: '2'
        });

        expect(mockGetTablesRowCounts).toHaveBeenCalledTimes(1);
    });

    test('GET unknown route returns 404', async () => {
        await request(server)
            .get('/does-not-exist')
            .expect(404);
    });

    test('POST /settlements creates a new entry', async () => {
        mockParseBody.mockResolvedValueOnce({
            name: 'Test Town',
            id: '123'
        });

        mockInsertEntry.mockResolvedValueOnce();

        const res = await request(server)
            .post('/settlements')
            .send({ name: 'Test Town', id: '123' })
            .expect(201)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual({ success: true });

        expect(mockInsertEntry).toHaveBeenCalledWith('towns', {
            name: 'Test Town',
            id: '123'
        });
    });

    test('POST /settlements returns 500 on error', async () => {
        mockParseBody.mockResolvedValueOnce({
            name: 'Test Town',
            pid: '123'
        });

        mockInsertEntry.mockRejectedValueOnce(new Error('DB failure'));

        const res = await request(server)
            .post('/settlements')
            .send({ name: 'Test Town', id: '123' })
            .expect(500)
            .expect('Content-Type', /json/);
        expect(res.body).toEqual({
            success: false,
            error: 'DB failure'
        });
    });

    test('DELETE /settlements/:id deletes an entry', async () => {
        mockDeleteEntry.mockResolvedValueOnce();

        const res = await request(server)
            .delete('/settlements/123')
            .expect(200)
            .expect('Content-Type', /json/);
        expect(res.body).toEqual({ success: true });

        expect(mockDeleteEntry).toHaveBeenCalledWith('towns', '123');
    });

    test('DELETE /settlements/:id returns 500 on error', async () => {
        mockDeleteEntry.mockRejectedValueOnce(new Error('DB failure'));
        const res = await request(server)
            .delete('/settlements/123')
            .expect(500)
            .expect('Content-Type', /json/);
        expect(res.body).toEqual({
            success: false,
            error: 'DB failure'
        });
    });

    test('request method OPTIONS returns 200', async () => {
        await request(server)
            .options('/towns')
            .expect(204);
    });

    test('GET /regions returns regions data', async () => {
        mockGetRegionsByCriteria.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ id: 1, region: 'RegionName' }]
        });
        const res = await request(server)
            .get('/regions')
            .query({ region: 'RegionName' })
            .expect(200)
            .expect('Content-Type', /json/);
        expect(res.body).toEqual({
            rowCount: 1,
            rows: [{ id: 1, region: 'RegionName' }]
        });
        expect(mockGetRegionsByCriteria).toHaveBeenCalled();
    });

    test('GET /municipalities returns municipalities data', async () => {
        mockGetMunicipalitiesByCriteria.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ id: 1, municipality: 'MunicipalityName' }]
        });

        const res = await request(server)
            .get('/municipalities')
            .query({ municipality: 'MunicipalityName' })
            .expect(200)
            .expect('Content-Type', /json/);
        expect(res.body).toEqual({
            rowCount: 1,
            rows: [{ id: 1, municipality: 'MunicipalityName' }]
        });
        expect(mockGetMunicipalitiesByCriteria).toHaveBeenCalled();
    });

    test('GET /townhalls returns townhalls data', async () => {
        mockGetTownhallsByCriteria.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ id: 1, townhall: 'TownhallName' }]
        });
        const res = await request(server)
            .get('/townhalls')
            .query({ townhall: 'TownhallName' })
            .expect(200)
            .expect('Content-Type', /json/);
        expect(res.body).toEqual({
            rowCount: 1,
            rows: [{ id: 1, townhall: 'TownhallName' }]
        });
        expect(mockGetTownhallsByCriteria).toHaveBeenCalled();
    });

    test('GET /settlements returns settlements data', async () => {
        mockGetSettlementsByCriteria.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ id: 1, settlement: 'SettlementName' }]
        });
        const res = await request(server)
            .get('/settlements')
            .query({ settlement: 'SettlementName' })
            .expect(200)
            .expect('Content-Type', /json/);
        expect(res.body).toEqual({
            rowCount: 1,
            rows: [{ id: 1, settlement: 'SettlementName' }]
        });
        expect(mockGetSettlementsByCriteria).toHaveBeenCalled();
    });

    test('POST /settlements returns 500 when insertEntry throws', async () => {
        mockParseBody.mockResolvedValueOnce({
            name: 'Bad Town'
        });

        mockInsertEntry.mockRejectedValueOnce(new Error('DB insert failed'));

        const res = await request(server)
            .post('/settlements')
            .send({ name: 'Bad Town' })
            .expect(500)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual({
            success: false,
            error: 'DB insert failed'
        });

        expect(mockInsertEntry).toHaveBeenCalledWith('towns', {
            name: 'Bad Town'
        });
    });

    test('DELETE /settlements/:id returns 500 when deleteEntry throws', async () => {
        mockDeleteEntry.mockRejectedValueOnce(new Error('DB delete failed'));

        const res = await request(server)
            .delete('/settlements/999')
            .expect(500)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual({
            success: false,
            error: 'DB delete failed'
        });

        expect(mockDeleteEntry).toHaveBeenCalledWith('towns', '999');
    });

    test('PUT /settlements/:id returns 500 when updateEntry throws', async () => {
        mockParseBody.mockResolvedValueOnce({
            id: '123',
            name: 'Broken Town'
        });

        mockUpdateEntry.mockRejectedValueOnce(new Error('DB update failed'));

        const res = await request(server)
            .put('/settlements/123')
            .send({ name: 'Broken Town' })
            .expect(500)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual({
            success: false,
            error: 'DB update failed'
        });

        expect(mockUpdateEntry).toHaveBeenCalledWith('towns', '123', {
            name: 'Broken Town'
        });
    });

    test('POST /settlements returns 500 when parseBody throws', async () => {
        mockParseBody.mockRejectedValueOnce(new Error('Invalid JSON'));

        const res = await request(server)
            .post('/settlements')
            .send('invalid-json')
            .expect(500)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual({
            success: false,
            error: 'Invalid JSON'
        });
    });

    test('PUT /settlements/:id returns 500 when parseBody throws', async () => {
        mockParseBody.mockRejectedValueOnce(new Error('Invalid JSON'));

        const res = await request(server)
            .put('/settlements/123')
            .send('invalid-json')
            .expect(500)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual({
            success: false,
            error: 'Invalid JSON'
        });
    });

    test('GET /regions returns 500 on error', async () => {
        mockGetRegionsByCriteria.mockRejectedValueOnce(new Error('DB failure'));
        await request(server)
            .get('/regions')
            .expect(500);
    });

    test('GET /municipalities returns 500 on error', async () => {
        mockGetMunicipalitiesByCriteria.mockRejectedValueOnce(new Error('DB failure'));
        await request(server)
            .get('/municipalities')
            .expect(500);
    });

    test('GET /townhalls returns 500 on error', async () => {
        mockGetTownhallsByCriteria.mockRejectedValueOnce(new Error('DB failure'));
        await request(server)
            .get('/townhalls')
            .expect(500);
    });

    test('GET /settlements returns 500 on error', async () => {
        mockGetSettlementsByCriteria.mockRejectedValueOnce(new Error('DB failure'));
        await request(server)
            .get('/settlements')
            .expect(500);
    });

    test('POST table not in tableMap returns 404', async () => {
        const res = await request(server)
            .post('/invalidTable')
            .send({ some: 'data' })
            .expect(404)
            .expect('Content-Type', /json/);

        expect(res.body).toEqual({
            success: false,
            error: 'Invalid endpoint'
        });
    });

    test('DELETE table not in tableMap returns 404', async () => {
        await request(server)
            .delete('/invalidTable/123')
            .expect(404);
    });

    test('DELETE without id returns 404', async () => {
        await request(server)
            .delete('/settlements/')
            .expect(404);
    });

    test('PUT without id returns 404', async () => {
        await request(server)
            .put('/settlements/')
            .expect(404);
    });

    test('PUT table not in tableMap returns 404', async () => {
        await request(server)
            .put('/invalidTable/123')
            .send({ some: 'data' })
            .expect(404);
    });

    test('PUT no fields to update returns 400', async () => {
        mockParseBody.mockResolvedValueOnce({});
        const res = await request(server)
            .put('/settlements/123')
            .send({})
            .expect(400)
            .expect('Content-Type', /json/);
        expect(res.body).toEqual({
            success: false,
            error: 'No fields to update'
        });
    });

    test('PUT successful update returns 200', async () => {
        mockParseBody.mockResolvedValueOnce({ name: 'Updated Town' });
        mockUpdateEntry.mockResolvedValueOnce();
        const res = await request(server)
            .put('/settlements/123')
            .send({ name: 'Updated Town' })
            .expect(200)
            .expect('Content-Type', /json/);
        expect(res.body).toEqual({ success: true });
        expect(mockUpdateEntry).toHaveBeenCalledWith('towns', '123', { name: 'Updated Town' });
    });

    test('return 405 for unsupported methods', async () => {
        await request(server)
            .patch('/towns')
            .expect(405);
    });

});
