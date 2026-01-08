import {
    populateTable as statePopulate,
    getRowsState,
    currentPage,
    rowsPerPage,
    setCurrentPage,
    getPagesNum
} from "../../components/table/table.state.js";
import { setupPagination } from "../../components/table/table.js";
import { handleError, updateRowCount, clearFields } from "../../ui/dom.js";
import { fetchTable, fetchStats } from "../../components/api.js";


function updateDisplay() {
    renderTownhallsPage();
    setupPagination(renderTownhallsPage);
}

export async function setupPage() {
    await initTownhalls();

    const form = document.getElementById('search-form');
    if (!form) return;

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();

        const formData = new FormData(form);
        const params = Object.fromEntries(formData.entries());

        Object.keys(params).forEach(key => params[key] = params[key].trim());

        const data = await fetchTable('townhalls', params);
        statePopulate(data);
        updateRowCount(data.rowCount);
        setCurrentPage(1);
        updateDisplay();
    });

    form.addEventListener('reset', async (ev) => {
        ev.preventDefault();
        await initTownhalls();
    });

    document.addEventListener('click', async (e) => {
        const id = e.target.id;

        if (id === 'new-townhall') await addTownhall();
        if (id === 'edit-townhall') await editTownhall();
        if (id === 'delete-townhall') await deleteTownhall();

        if (id === 'first') {
            setCurrentPage(1);
            updateDisplay();
        }

        if (id === 'last') {
            setCurrentPage(getPagesNum());
            updateDisplay();
        }
    });
}

export async function initTownhalls() {
    try {
        clearFields();
        const [data, stats] = await Promise.all([
            fetchTable('townhalls'),
            fetchStats()
        ]);

        statePopulate(data);
        document.getElementById('total-rows-count').textContent = stats.townhalls;
        updateRowCount(data.rowCount);
        updateDisplay();
    } catch (err) {
        handleError(err);
    }
}

export function renderTownhallsPage() {
    const tbody = document.getElementById('table-tbody');
    if (!tbody) return;

    const rows = getRowsState() || [];
    const start = (currentPage - 1) * rowsPerPage;
    const pageRows = rows.slice(start, start + rowsPerPage);

    const fragment = document.createDocumentFragment();
    pageRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id ?? ''}</td>
            <td>${row.name_en ?? ''}</td>
            <td>${row.name_bg ?? ''}</td>
            <td>${row.municipality_id ?? ''}</td>
            <td>${row.townhall_center_id ?? ''}</td>
        `;
        fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}
