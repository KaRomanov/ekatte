import { jest } from '@jest/globals';


jest.unstable_mockModule('../interface/components/api.js', () => ({
    fetchTable: jest.fn(),
    fetchStats: jest.fn()
}));

jest.unstable_mockModule('../interface/components/table/table.state.js', () => ({
    populateTable: jest.fn(),
    getRowsState: jest.fn(),
    setCurrentPage: jest.fn(),
    getPagesNum: jest.fn(),
    currentPage: 1,
    rowsPerPage: 10
}));

jest.unstable_mockModule('../interface/ui/dom.js', () => ({
    handleError: jest.fn(),
    updateRowCount: jest.fn(),
    clearFields: jest.fn()
}));

jest.unstable_mockModule('../interface/components/table/table.js', () => ({
    setupPagination: jest.fn()
}));

jest.unstable_mockModule('../interface/pages/settlements/crud.js', () => ({
    addSettlement: jest.fn(),
    editSettlement: jest.fn(),
    deleteSettlement: jest.fn()
}));


const api = await import('../interface/components/api.js');
const tableState = await import('../interface/components/table/table.state.js');
const domUtils = await import('../interface/ui/dom.js');
const crud = await import('../interface/pages/settlements/crud.js');
const { setupPage, renderSettlementsPage, initSettlements } = await import('../interface/pages/settlements/page.js');

describe('Settlements Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form id="search-form">
                <input id="id" name="id" value="S01" />
                <input id="type" name="type" value="City" />
                <input id="name_en" name="name_en" value="Plovdiv" />
                <input id="name_bg" name="name_bg" value="Пловдив" />
                <input id="townhall_id" name="townhall_id" value="T99" />
                <input id="municipality_id" name="municipality_id" value="M02" />
                <button type="submit">Search</button>
                <button type="reset">Reset</button>
            </form>
            <button id="new-settlement"></button>
            <button id="edit-settlement"></button>
            <button id="delete-settlement"></button>
            <button id="first"></button>
            <button id="last"></button>
            <div id="total-rows-count"></div>
            <table>
                <tbody id="table-tbody"></tbody>
            </table>
        `;
        jest.clearAllMocks();
    });

    test('should fetch data and populate the table on init', async () => {
        const mockData = { rowCount: 5, rows: [{ id: 'S01' }] };
        const mockStats = { towns: 500 };

        api.fetchTable.mockResolvedValue(mockData);
        api.fetchStats.mockResolvedValue(mockStats);

        await initSettlements();

        expect(domUtils.clearFields).toHaveBeenCalled();
        expect(api.fetchTable).toHaveBeenCalledWith('settlements');
        expect(tableState.populateTable).toHaveBeenCalledWith(mockData);
        expect(document.getElementById('total-rows-count').textContent).toBe('500');
    });

    test('should call handleError when the API fetch fails', async () => {
        const mockError = new Error('API Error');
        api.fetchTable.mockRejectedValue(mockError);
        api.fetchStats.mockResolvedValue({ towns: 0 });

        await initSettlements();

        expect(domUtils.handleError).toHaveBeenCalledWith(mockError);
    });

    test('should fetch filtered data when search form is submitted', async () => {
        await setupPage();
        const form = document.getElementById('search-form');
        api.fetchTable.mockResolvedValue({ rowCount: 1, rows: [] });

        form.dispatchEvent(new Event('submit'));

        expect(api.fetchTable).toHaveBeenCalledWith('settlements', expect.objectContaining({
            id: 'S01',
            type: 'City',
            name_en: 'Plovdiv'
        }));
    });

    test('should correctly render settlement rows into the tbody', () => {
        tableState.getRowsState.mockReturnValue([
            { id: 'S01', type: 'City', name_en: 'Varna', name_bg: 'Варна', townhall_id: 'T1', municipality_id: 'M1' }
        ]);

        renderSettlementsPage();

        const tbody = document.getElementById('table-tbody');
        expect(tbody.children.length).toBe(1);
        expect(tbody.innerHTML).toContain('Varna');
        expect(tbody.innerHTML).toContain('City');
    });

    test('should trigger crud actions when buttons are clicked', async () => {
        await setupPage();

        document.getElementById('new-settlement').click();
        expect(crud.addSettlement).toHaveBeenCalled();

        document.getElementById('edit-settlement').click();
        expect(crud.editSettlement).toHaveBeenCalled();

        document.getElementById('delete-settlement').click();
        expect(crud.deleteSettlement).toHaveBeenCalled();
    });

    test('should handle pagination: first and last buttons', async () => {
        await setupPage();
        tableState.getPagesNum.mockReturnValue(10);

        document.getElementById('first').click();
        expect(tableState.setCurrentPage).toHaveBeenCalledWith(1);

        document.getElementById('last').click();
        expect(tableState.setCurrentPage).toHaveBeenCalledWith(10);
    });

    test('should re-initialize data when the search form is reset', async () => {
        await setupPage();
        jest.clearAllMocks();
        api.fetchTable.mockResolvedValue({ rowCount: 100, rows: [] });
        api.fetchStats.mockResolvedValue({ towns: 100 });

        const form = document.getElementById('search-form');
        form.dispatchEvent(new Event('reset'));

        // Wait for async reset
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(api.fetchTable).toHaveBeenCalledWith('settlements');
        expect(document.getElementById('total-rows-count').textContent).toBe('100');
    });

    test('renderSettlementsPage should handle missing row data gracefully', () => {
        tableState.getRowsState.mockReturnValue([{ id: null, type: undefined }]);
        renderSettlementsPage();
        const tbody = document.getElementById('table-tbody');
        expect(tbody.innerHTML).toContain('<td></td>');
    });

    test('renderSettlementsPage should exit early if tbody is missing', () => {
        document.body.innerHTML = '';
        expect(renderSettlementsPage()).toBeUndefined();
    });

});
