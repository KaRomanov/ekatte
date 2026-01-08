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

jest.unstable_mockModule('../interface/pages/regions/crud.js', () => ({
    addRegion: jest.fn(),
    editRegion: jest.fn(),
    deleteRegion: jest.fn()
}));


const api = await import('../interface/components/api.js');
const tableState = await import('../interface/components/table/table.state.js');
const domUtils = await import('../interface/ui/dom.js');
const crud = await import('../interface/pages/regions/crud.js');
const { setupPage, renderRegionsPage, initRegions } = await import('../interface/pages/regions/page.js');

describe('Regions Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form id="search-form">
                <input id="id" name="id" value="REG01" />
                <input id="name_en" name="name_en" value="Sofia" />
                <input id="name_bg" name="name_bg" value="София" />
                <input id="region_center_id" name="region_center_id" value="1" />
                <button type="submit">Search</button>
                <button type="reset">Reset</button>
            </form>
            <button id="new-region"></button>
            <button id="edit-region"></button>
            <button id="delete-region"></button>
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
        const mockData = { rowCount: 28, rows: [{ id: 'REG01' }] };
        const mockStats = { regions: 28 };

        api.fetchTable.mockResolvedValue(mockData);
        api.fetchStats.mockResolvedValue(mockStats);

        await initRegions();

        expect(domUtils.clearFields).toHaveBeenCalled();
        expect(api.fetchTable).toHaveBeenCalledWith('regions');
        expect(document.getElementById('total-rows-count').textContent).toBe('28');
    });

    test('should call handleError when API fails', async () => {
        const mockError = new Error('Fetch Error');
        api.fetchTable.mockRejectedValue(mockError);

        await initRegions();

        expect(domUtils.handleError).toHaveBeenCalledWith(mockError);
    });

    test('should fetch filtered data on form submit', async () => {
        await setupPage();
        api.fetchTable.mockResolvedValue({ rowCount: 1, rows: [] });

        const form = document.getElementById('search-form');
        form.dispatchEvent(new Event('submit'));

        expect(api.fetchTable).toHaveBeenCalledWith('regions', expect.objectContaining({
            id: 'REG01',
            name_en: 'Sofia'
        }));
    });

    test('should render region rows correctly', () => {
        tableState.getRowsState.mockReturnValue([
            { id: 'REG01', name_en: 'Sofia', name_bg: 'София', region_center_id: '1' }
        ]);

        renderRegionsPage();

        const tbody = document.getElementById('table-tbody');
        expect(tbody.children.length).toBe(1);
        expect(tbody.innerHTML).toContain('Sofia');
    });

    test('should trigger crud functions on button clicks', async () => {
        await setupPage();

        document.getElementById('new-region').click();
        expect(crud.addRegion).toHaveBeenCalled();

        document.getElementById('edit-region').click();
        expect(crud.editRegion).toHaveBeenCalled();

        document.getElementById('delete-region').click();
        expect(crud.deleteRegion).toHaveBeenCalled();
    });

    test('should handle pagination buttons', async () => {
        await setupPage();
        tableState.getPagesNum.mockReturnValue(3);

        document.getElementById('first').click();
        expect(tableState.setCurrentPage).toHaveBeenCalledWith(1);

        document.getElementById('last').click();
        expect(tableState.setCurrentPage).toHaveBeenCalledWith(3);
    });

    test('should handle reset event', async () => {
        await setupPage();
        jest.clearAllMocks();
        api.fetchTable.mockResolvedValue({ rowCount: 28, rows: [] });
        api.fetchStats.mockResolvedValue({ regions: 28 });

        const form = document.getElementById('search-form');
        form.dispatchEvent(new Event('reset'));

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(api.fetchTable).toHaveBeenCalledWith('regions');
    });

    test('setupPage should not crash if form is missing', async () => {
        document.body.innerHTML = '';
        await expect(setupPage()).resolves.not.toThrow();
    });

    test('renderRegionsPage should exit if tbody is missing', () => {
        document.body.innerHTML = '';
        expect(renderRegionsPage()).toBeUndefined();
    });

    test('renderRegionsPage should handle null row data', () => {
        tableState.getRowsState.mockReturnValue([{ id: null, name_en: undefined }]);
        renderRegionsPage();
        const tbody = document.getElementById('table-tbody');
        expect(tbody.innerHTML).toContain('<td></td>');
    });

});
