import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', async () => {
    const myPool = {
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
    };

    return {
        Pool: jest.fn(() => myPool),
        __pool: myPool,
    };
});

const { query, getClient, end } = await import('../db/index.js');
const pg = await import('pg');
const myPool = pg.__pool;

describe('db module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    test('query executes successfully', async () => {
        const fakeResult = { rows: [{ id: 1 }] };
        myPool.query.mockResolvedValue(fakeResult);

        const res = await query('SELECT 1');

        expect(myPool.query).toHaveBeenCalledWith('SELECT 1', undefined);
        expect(res).toBe(fakeResult);
    });

    test('query throws on failure', async () => {
        const error = new Error('DB error');
        myPool.query.mockRejectedValue(error);

        await expect(query('SELECT 1')).rejects.toThrow('DB error');
    });


    test('getClient returns a client', async () => {
        const fakeClient = {
            query: jest.fn(),
            release: jest.fn(),
        };

        myPool.connect.mockResolvedValue(fakeClient);

        const client = await getClient();

        expect(myPool.connect).toHaveBeenCalled();
        expect(client).toBe(fakeClient);
    });


    test('end closes the pool', async () => {
        await end();

        expect(myPool.end).toHaveBeenCalled();
    });

});