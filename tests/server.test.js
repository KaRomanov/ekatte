import { jest, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

jest.mock('../serverFunctions.js');

import server from '../server.js';

import { getTownsByCriteria, getTablesRowCounts } from '../__mocks__/serverFunctions.js';

const expectedMockTownsData = [{ id: 101, name: 'Testville', region: 'R1' }];
const expectedMockTablesData = { towns: 99, regions: 12 };


describe('HTTP Server Endpoints', () => {

    afterAll((done) => {
        server.close(done);
    });

    afterEach(() => {
        getTownsByCriteria.mockClear();
        getTablesRowCounts.mockClear();
    });

    test('should return 200 and town data with default (empty) parameters', async () => {
        const response = await request(server).get('/towns');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expectedMockTownsData);

        expect(getTownsByCriteria).toHaveBeenCalledWith({
            town: '',
            townhall: '',
            municipality: '',
            region: ''
        });
    });

    test('should correctly parse and pass query parameters', async () => {
        const query = '?town=CityName&region=Area&townhall=Y';

        const response = await request(server).get(`/towns${query}`);

        expect(response.statusCode).toBe(200);
        expect(getTownsByCriteria).toHaveBeenCalledWith({
            town: 'CityName',
            townhall: 'Y',
            municipality: '',
            region: 'Area'
        });
    });

    test('should return 500 if the underlying function throws a database error', async () => {
        const response = await request(server).get('/towns?town=ErrorTown');

        expect(response.statusCode).toBe(500);
        expect(response.text).toBe('');
        expect(getTownsByCriteria).toHaveBeenCalledTimes(1);
    });

    test('should return 405 for a path does not exist', async () => {
        const response = await request(server).get('/no/such/path');

        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('');
    });

    test('should return 404 for DELETE on an unknown endpoint', async () => {
        const response = await request(server).delete('/nowhere');

        expect(response.statusCode).toBe(405);
    });
});
