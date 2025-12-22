import { jest } from '@jest/globals';

jest.unstable_mockModule('../interface/components/api.js', async () => ({
    fetchTowns: jest.fn(async () => ({ rows: [{ id: 1 }], rowCount: 1 })),
    fetchStats: jest.fn(async () => ({ towns: 1, townhalls: 1, municipalities: 1, regions: 1 }))
}));

jest.unstable_mockModule('../interface/components/table/table.js', async () => ({
    populateTable: jest.fn()
}));

jest.unstable_mockModule('../interface/ui/dom.js', async () => ({
    addRowCounts: jest.fn(),
    updateRowCount: jest.fn(),
    clearFields: jest.fn(),
    handleError: jest.fn()
}));

const { initTable } = await import('../interface/ui/init.js');
const api = await import('../interface/components/api.js');
const table = await import('../interface/components/table/table.js');
const dom = await import('../interface/ui/dom.js');

describe('ui/init', () => {
    afterEach(() => jest.restoreAllMocks());

    test('initTable calls fetch and updates DOM/table', async () => {
        await initTable();
        expect(api.fetchTowns).toHaveBeenCalled();
        expect(api.fetchStats).toHaveBeenCalled();
        expect(table.populateTable).toHaveBeenCalledWith(expect.objectContaining({ rows: expect.any(Array) }));
        expect(dom.updateRowCount).toHaveBeenCalledWith(1);
        expect(dom.addRowCounts).toHaveBeenCalled();
    });

    test('initTable calls handleError when fetchTowns rejects', async () => {
        api.fetchTowns.mockImplementationOnce(async () => { throw new Error('fail towns'); });
        await initTable();
        expect(dom.handleError).toHaveBeenCalled();
    });

    test('initTable calls handleError when fetchStats rejects', async () => {
        api.fetchStats.mockImplementationOnce(async () => { throw new Error('fail stats'); });
        await initTable();
        expect(dom.handleError).toHaveBeenCalled();
    });
});
