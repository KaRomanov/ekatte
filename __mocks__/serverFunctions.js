import { jest } from '@jest/globals';

const mockTownsData = [{ id: 101, name: 'Testville', region: 'R1' }];
const mockTablesData = { towns: 99, regions: 12 };

// 1. Mock implementation for getTownsByCriteria
export const getTownsByCriteria = jest.fn(async (params) => {
    if (params.town === 'ErrorTown') {
        throw new Error('Database error: Failed to fetch towns');
    }
    return mockTownsData;
});

// 2. Mock implementation for getTablesRowCounts
export const getTablesRowCounts = jest.fn(async () => {
    return mockTablesData;
});