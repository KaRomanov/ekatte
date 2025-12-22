import { jest } from '@jest/globals';

beforeEach(() => {
    document.body.innerHTML = `<table><tbody id="table-tbody"></tbody></table>`;
});

afterEach(() => {
    jest.restoreAllMocks();
});

import { getRowsState, renderPage, allRows, rowsPerPage, currentPage } from '../interface/components/table/table.js';

global.allRows = [
    { id: 1, type: 'A', town: 'Town1', townhall: 'TH1', municipality: 'M1', municipality_id: '001', region: 'R1' },
    { id: 2, type: 'B', town: 'Town2', townhall: 'TH2', municipality: 'M2', municipality_id: '002', region: 'R2' },
    { id: 3, type: 'C', town: 'Town3', townhall: 'TH3', municipality: 'M3', municipality_id: '003', region: 'R3' },
];
global.rowsPerPage = 2;
global.currentPage = 1;

describe('getRowsState', () => {
    test('should return allRows', () => {
        const result = getRowsState();
        expect(result).toBe(allRows);
    });
});
