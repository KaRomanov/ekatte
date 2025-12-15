import { describe, jest } from '@jest/globals';
import request from 'supertest';
import http from 'http';

const mockGetTownsByCriteria = jest.fn();
const mockGetTablesRowCounts = jest.fn();

jest.unstable_mockModule('../serverFunctions.js', () => ({
    getTownsByCriteria: mockGetTownsByCriteria,
    getTablesRowCounts: mockGetTablesRowCounts
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

        await request(server)
            .get('/towns')
            .expect(500);
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

    test('POST request returns 405', async () => {
        await request(server)
            .post('/towns')
            .expect(405);
    });

    test('GET unknown route returns 404', async () => {
        await request(server)
            .get('/does-not-exist')
            .expect(404);
    });
})

