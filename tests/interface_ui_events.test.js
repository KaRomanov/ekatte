import { jest } from '@jest/globals';

jest.unstable_mockModule('../interface/components/export.js', async () => ({
    exportCSV: jest.fn(),
    exportExcel: jest.fn()
}));

jest.unstable_mockModule('../interface/components/table/table.js', async () => ({
    getRowsState: jest.fn(() => [{ id: 1 }]),
    setCurrentPage: jest.fn(),
    renderPage: jest.fn(),
    setupPagination: jest.fn(),
    getPagesNum: jest.fn(() => 3),
    populateTable: jest.fn()
}));

jest.unstable_mockModule('../interface/ui/dom.js', async () => ({
    updateRowCount: jest.fn()
}));

jest.unstable_mockModule('../interface/ui/init.js', async () => ({
    initTable: jest.fn(async () => { })
}));

const { setupEventListeners } = await import('../interface/ui/events.js');
const exportMod = await import('../interface/components/export.js');
const table = await import('../interface/components/table/table.js');
const dom = await import('../interface/ui/dom.js');
const uiInit = await import('../interface/ui/init.js');

describe('ui/events wiring', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button id="export-csv"></button>
            <button id="export-excel"></button>
            <button id="first"></button>
            <button id="last"></button>
            <form id="search-form">
                <input id="town" />
                <input id="region" />
                <input id="municipality" />
                <input id="townhall" />
            </form>
        `;
        setupEventListeners();
    });

    afterEach(() => jest.restoreAllMocks());

    test('export buttons call export functions', () => {
        document.getElementById('export-csv').click();
        expect(exportMod.exportCSV).toHaveBeenCalled();

        document.getElementById('export-excel').click();
        expect(exportMod.exportExcel).toHaveBeenCalled();
    });

    test('first/last buttons navigate pages', () => {
        document.getElementById('first').click();
        expect(table.setCurrentPage).toHaveBeenCalledWith(1);

        document.getElementById('last').click();
        expect(table.setCurrentPage).toHaveBeenCalledWith(3);
    });

    test('form reset calls initTable', () => {
        const evt = new Event('reset');
        document.getElementById('search-form').dispatchEvent(evt);
        expect(uiInit.initTable).toHaveBeenCalled();
    });

    test('form submit with empty params does nothing', async () => {
        const form = document.getElementById('search-form');
        form.querySelector('#town').value = '';
        form.querySelector('#region').value = '';
        form.querySelector('#municipality').value = '';
        form.querySelector('#townhall').value = '';

        const evt = new Event('submit');
        form.dispatchEvent(evt);

        expect(table.populateTable).not.toHaveBeenCalled();
    });
});
