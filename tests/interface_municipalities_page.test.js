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

jest.unstable_mockModule('../interface/pages/municipalities/crud.js', () => ({
    addMunicipality: jest.fn(),
    editMunicipality: jest.fn(),
    deleteMunicipality: jest.fn()
}));

const api = await import('../interface/components/api.js');
const tableState = await import('../interface/components/table/table.state.js');
const domUtils = await import('../interface/ui/dom.js');
const crud = await import('../interface/pages/municipalities/crud.js');
const { setupPage, renderMunicipalitiesPage, initMunicipalities } = await import('../interface/pages/municipalities/page.js');

describe('Municipalities Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form id="search-form">
                <input id="id" name="id" value="MUN01" />
                <input id="name_en" name="name_en" value="Plovdiv" />
                <input id="name_bg" name="name_bg" value="Пловдив" />
                <input id="region_id" name="region_id" value="REG02" />
                <input id="municipality_center_id" name="municipality_center_id" value="10" />
                <button type="submit">Search</button>
                <button type="reset">Reset</button>
            </form>
            <button id="new-municipality"></button>
            <button id="edit-municipality"></button>
            <button id="delete-municipality"></button>
            <button id="first"></button>
            <button id="last"></button>
            <div id="total-rows-count"></div>
            <table>
                <tbody id="table-tbody"></tbody>
            </table>
        `;
        jest.clearAllMocks();
    });

    test('should fetch and populate municipalities on init', async () => {
        const mockData = { rowCount: 265, rows: [{ id: 'MUN01' }] };
        const mockStats = { municipalities: 265 };

        api.fetchTable.mockResolvedValue(mockData);
        api.fetchStats.mockResolvedValue(mockStats);

        await initMunicipalities();

        expect(domUtils.clearFields).toHaveBeenCalled();
        expect(api.fetchTable).toHaveBeenCalledWith('municipalities');
        expect(document.getElementById('total-rows-count').textContent).toBe('265');
    });

    test('should handle API errors via handleError', async () => {
        const mockError = new Error('Database Error');
        api.fetchTable.mockRejectedValue(mockError);

        await initMunicipalities();

        expect(domUtils.handleError).toHaveBeenCalledWith(mockError);
    });

    test('should fetch filtered results with FormData on search submit', async () => {
        await setupPage();
        api.fetchTable.mockResolvedValue({ rowCount: 1, rows: [] });

        const form = document.getElementById('search-form');
        form.dispatchEvent(new Event('submit'));

        expect(api.fetchTable).toHaveBeenCalledWith('municipalities', expect.objectContaining({
            id: 'MUN01',
            name_en: 'Plovdiv',
            region_id: 'REG02'
        }));
    });

    test('should render table rows using DocumentFragment', () => {
        tableState.getRowsState.mockReturnValue([
            { id: 'MUN01', name_en: 'Plovdiv', name_bg: 'Пловдив', region_id: 'REG02', municipality_center_id: '10' }
        ]);

        renderMunicipalitiesPage();

        const tbody = document.getElementById('table-tbody');
        expect(tbody.children.length).toBe(1);
        expect(tbody.innerHTML).toContain('Plovdiv');
        expect(tbody.innerHTML).toContain('REG02');
    });

    test('should call CRUD functions on button click', async () => {
        await setupPage();

        document.getElementById('new-municipality').click();
        expect(crud.addMunicipality).toHaveBeenCalled();

        document.getElementById('edit-municipality').click();
        expect(crud.editMunicipality).toHaveBeenCalled();

        document.getElementById('delete-municipality').click();
        expect(crud.deleteMunicipality).toHaveBeenCalled();
    });

    test('should handle pagination: jump to first and last', async () => {
        await setupPage();
        tableState.getPagesNum.mockReturnValue(26);

        document.getElementById('first').click();
        expect(tableState.setCurrentPage).toHaveBeenCalledWith(1);

        document.getElementById('last').click();
        expect(tableState.setCurrentPage).toHaveBeenCalledWith(26);
    });

    test('should re-init data when search form is reset', async () => {
        await setupPage();
        jest.clearAllMocks();
        api.fetchTable.mockResolvedValue({ rowCount: 265, rows: [] });
        api.fetchStats.mockResolvedValue({ municipalities: 265 });

        const form = document.getElementById('search-form');
        form.dispatchEvent(new Event('reset'));

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(api.fetchTable).toHaveBeenCalledWith('municipalities');
    });

    test('setupPage should not fail if form is missing', async () => {
        document.body.innerHTML = '';
        await expect(setupPage()).resolves.not.toThrow();
    });

    test('renderMunicipalitiesPage should exit if tbody is missing', () => {
        document.body.innerHTML = '';
        expect(renderMunicipalitiesPage()).toBeUndefined();
    });

    test('renderMunicipalitiesPage should handle empty or null rows', () => {
        tableState.getRowsState.mockReturnValue([{ id: null, region_id: undefined }]);
        renderMunicipalitiesPage();
        const tbody = document.getElementById('table-tbody');
        expect(tbody.innerHTML).toContain('<td></td>');
    });

});
