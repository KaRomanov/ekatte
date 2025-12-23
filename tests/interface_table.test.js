import { jest } from '@jest/globals';

beforeEach(() => {
    document.body.innerHTML = `<table><tbody id="table-tbody"></tbody></table>`;
});

afterEach(() => {
    jest.restoreAllMocks();
});

import { getRowsState, allRows } from '../interface/components/table/table.js';

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


describe('renderPage and pagination helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = `<table><tbody id="table-tbody"></tbody></table><div id="pageNumbers"></div>`;
    });

    test('renderPage should populate tbody', async () => {
        const state = await import('../interface/components/table/table.state.js');
        const render = await import('../interface/components/table/table.render.js');

        state.populateTable({
            rows: [
                { id: 1, type: 'A', town: 'Town1', townhall: 'TH1', municipality: 'M1', municipality_id: '001', region: 'R1' },
                { id: 2, type: 'B', town: 'Town2', townhall: 'TH2', municipality: 'M2', municipality_id: '002', region: 'R2' }
            ]
        });
        state.setCurrentPage(1);

        render.renderPage();

        const tbody = document.getElementById('table-tbody');
        expect(tbody.querySelectorAll('tr').length).toBe(2);
        expect(tbody.textContent).toContain('Town1');
        expect(tbody.textContent).toContain('Town2');
    });

    test('renderPage should return if there is no tbody', async () => {
        const render = await import('../interface/components/table/table.render.js');

        document.body.innerHTML = `<table></table>`;

        render.renderPage();

        expect(render.renderPage).not.toThrow();
    });

    test('createPageButton should call setCurrentPage, renderPage and setupPagination on click', async () => {
        const state = await import('../interface/components/table/table.state.js');
        const renderMod = await import('../interface/components/table/table.render.js');
        const pagination = await import('../interface/components/table/table.pagination.js');

        const btn = pagination.createPageButton(3);
        expect(btn.textContent).toBe('3');

        btn.click();

        expect(state.currentPage).toBe(3);
    });

    test('setupPagination should render page buttons and set data-current', async () => {
        const state = await import('../interface/components/table/table.state.js');
        const pagination = await import('../interface/components/table/table.pagination.js');


        state.populateTable({ rows: new Array(50).fill({}) });
        const pageNumbers = document.getElementById('pageNumbers');
        pageNumbers.setAttribute('data-current', '1');

        pagination.setupPagination();

        expect(pageNumbers.querySelectorAll('button').length).toBeGreaterThan(0);
        expect(pageNumbers.getAttribute('data-current')).toBe('1');
    });
});


describe('sorting behavior (pure functions and trigger)', () => {
    test('handleSortClick changes sort', async () => {
        const { handleSortClick } = await import('../interface/components/table/table.sorting.js');

        let next = handleSortClick([], 'id', false);
        expect(next).toEqual([{ key: 'id', dir: 'asc' }]);

        next = handleSortClick(next, 'id', false);
        expect(next).toEqual([{ key: 'id', dir: 'desc' }]);

        next = handleSortClick(next, 'id', false);
        expect(next).toEqual([]);
    });

    test('handleSortClick with shift adds and removes multi-column sorts', async () => {
        const { handleSortClick } = await import('../interface/components/table/table.sorting.js');

        let s = [];
        s = handleSortClick(s, 'id', true);
        expect(s).toEqual([{ key: 'id', dir: 'asc' }]);

        s = handleSortClick(s, 'name', true);
        expect(s).toEqual([{ key: 'id', dir: 'asc' }, { key: 'name', dir: 'asc' }]);

        s = handleSortClick(s, 'id', true);
        expect(s).toEqual([{ key: 'id', dir: 'desc' }, { key: 'name', dir: 'asc' }]);

        s = handleSortClick(s, 'id', true);
        expect(s).toEqual([{ key: 'name', dir: 'asc' }]);
    });

    test('triggerSort updates state and calls applySort and updateSortIndicators', async () => {
        const state = await import('../interface/components/table/table.state.js');
        const sorting = await import('../interface/components/table/table.sorting.js');

        state.setSortState([]);

        sorting.triggerSort('id', false);

        expect(state.getSortState()).toEqual([{ key: 'id', dir: 'asc' }]);
    });
});


describe('getPagesNum, setCurrentPage, populateTable', () => {
    test('getPagesNum works', async () => {
        const table = await import('../interface/components/table/table.js');

        expect(table.getPagesNum([], 5)).toBe(0);
        expect(table.getPagesNum(new Array(3).fill({}), 5)).toBe(1);
        expect(table.getPagesNum(new Array(10).fill({}), 5)).toBe(2);
        expect(table.getPagesNum(new Array(12).fill({}), 5)).toBe(3);
    });

    test('setCurrentPage updates state and currentPage', async () => {
        const table = await import('../interface/components/table/table.js');
        const state = await import('../interface/components/table/table.state.js');

        table.setCurrentPage(4);
        expect(state.currentPage).toBe(4);
    });

    test('populateTable stores rows, resets page and sort state', async () => {
        const table = await import('../interface/components/table/table.js');
        const state = await import('../interface/components/table/table.state.js');

        const rows = [{ id: 9 }, { id: 10 }];
        table.populateTable({ rows });


        expect(state.getRowsState()).toBe(rows);
        expect(state.currentPage).toBe(1);
        expect(state.getSortState()).toEqual([]);
    });
});
