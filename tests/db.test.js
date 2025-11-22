import { jest } from '@jest/globals';

const mockPoolInstance = {
    query: jest.fn(),
    end: jest.fn(),
};

jest.unstable_mockModule('pg', () => ({
    Pool: jest.fn(() => mockPoolInstance),
}));


const { Pool } = await import('pg');
const { query, end } = await import('../db/index.js');


describe('Database tests', () => {
    let mockPool;

    beforeEach(() => {
        mockPool = new Pool();
        jest.clearAllMocks();
    });


    test('query() should call pool.query with correct args and return result', async () => {
        const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
        mockPool.query.mockResolvedValue(mockResult);

        const result = await query('SELECT * FROM users WHERE id = $1', [1]);

        expect(mockPool.query).toHaveBeenCalledWith(
            'SELECT * FROM users WHERE id = $1',
            [1]
        );
        expect(result).toBe(mockResult);
    });


    test('query() should catch errors and log them', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const error = new Error('Database error');

        mockPool.query.mockRejectedValue(error);

        const result = await query('BAD QUERY');

        expect(consoleSpy).toHaveBeenCalledWith('Query failed:', error);
        expect(result).toBeUndefined();
    });


    test('end() should call pool.end()', async () => {
        await end();
        expect(mockPool.end).toHaveBeenCalled();
    });

});