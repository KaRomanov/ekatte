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

const api = await import('../interface/components/api.js');
const tableState = await import('../interface/components/table/table.state.js');
const domUtils = await import('../interface/ui/dom.js');
const { setupPage, renderTownhallsPage, initTownhalls } = await import('../interface/pages/townhalls/page.js');

describe('Townhalls Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form id="search-form">
                <input id="id" name="id" value="123" />
                <input id="name_en" name="name_en" value="Sofia" />
                <input id="name_bg" name="name_bg" value="София" />
                <input id="municipality_id" name="municipality_id" value="1" />
                <input id="townhall_center_id" name="townhall_center_id" value="5" />
                <button type="submit">Search</button>
                <button type="reset">Reset</button>
            </form>
            <button id="new-townhall"></button>
            <button id="edit-townhall"></button>
            <button id="delete-townhall"></button>
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
        const mockData = { rowCount: 10, rows: [{ id: 1 }] };
        const mockStats = { townhalls: 100 };

        api.fetchTable.mockResolvedValue(mockData);
        api.fetchStats.mockResolvedValue(mockStats);

        await initTownhalls();

        expect(domUtils.clearFields).toHaveBeenCalled();
        expect(api.fetchTable).toHaveBeenCalledWith('townhalls');
        expect(tableState.populateTable).toHaveBeenCalledWith(mockData);
        expect(document.getElementById('total-rows-count').textContent).toBe('100');
    });

    test('should call handleError when the API fetch fails', async () => {
        const mockError = new Error('Network Failure');

        api.fetchTable.mockRejectedValue(mockError);
        api.fetchStats.mockResolvedValue({ townhalls: 0 });

        await initTownhalls();

        expect(domUtils.handleError).toHaveBeenCalledWith(mockError);

        expect(document.getElementById('total-rows-count').textContent).toBe('');
    });

    test('should fetch filtered data when search form is submitted', async () => {
        await setupPage();
        const form = document.getElementById('search-form');

        api.fetchTable.mockResolvedValue({ rowCount: 1, rows: [] });

        form.dispatchEvent(new Event('submit'));

        expect(api.fetchTable).toHaveBeenCalledWith('townhalls', expect.objectContaining({
            id: '123',
            name_en: 'Sofia'
        }));
    });


    test('should correctly render rows into the tbody', () => {
        tableState.getRowsState.mockReturnValue([
            { id: 1, name_en: 'Town A', name_bg: 'Град А', municipality_id: 10, townhall_center_id: 100 }
        ]);

        renderTownhallsPage();

        const tbody = document.getElementById('table-tbody');
        expect(tbody.children.length).toBe(1);
        expect(tbody.innerHTML).toContain('Town A');
        expect(tbody.innerHTML).toContain('Град А');
    });


    test('should set page to 1 when "first" button is clicked', async () => {
        await setupPage();
        const firstBtn = document.getElementById('first');

        firstBtn.click();

        expect(tableState.setCurrentPage).toHaveBeenCalledWith(1);
    });

    test('should re-initialize data when the search form is reset', async () => {
        await setupPage();

        jest.clearAllMocks();

        const resetData = { rowCount: 50, rows: [] };
        api.fetchTable.mockResolvedValue(resetData);
        api.fetchStats.mockResolvedValue({ townhalls: 50 });

        const form = document.getElementById('search-form');
        form.dispatchEvent(new Event('reset'));

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(domUtils.clearFields).toHaveBeenCalled();
        expect(api.fetchTable).toHaveBeenCalledWith('townhalls');
        expect(tableState.populateTable).toHaveBeenCalledWith(resetData);
        expect(document.getElementById('total-rows-count').textContent).toBe('50');
    });

    test('setupPage should not throw error if form is missing', async () => {
        document.body.innerHTML = '';
        await expect(setupPage()).resolves.not.toThrow();
    });

    test('renderTownhallsPage should exit early if tbody is missing', () => {
        document.body.innerHTML = '';
        expect(renderTownhallsPage()).toBeUndefined();
    });

    test('should set page to last when "last" button is clicked', async () => {
        await setupPage();
        tableState.getPagesNum.mockReturnValue(5);

        const lastBtn = document.getElementById('last');
        lastBtn.click();

        expect(tableState.setCurrentPage).toHaveBeenCalledWith(5);
    });

    test('renderTownhallsPage should handle missing row data gracefully', () => {
        tableState.getRowsState.mockReturnValue([{ id: null, name_en: undefined }]);

        renderTownhallsPage();

        const tbody = document.getElementById('table-tbody');
        expect(tbody.innerHTML).toContain('<td></td>');
    });

});