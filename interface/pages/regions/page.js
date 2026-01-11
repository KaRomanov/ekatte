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
import { addRegion, deleteRegion, editRegion } from "./crud.js";


function refreshUI() {
    renderRegionsPage();
    setupPagination(renderRegionsPage);
}

export async function setupPage() {
    // Initial data load
    await initRegions();

    const form = document.getElementById('search-form');
    if (form) {
        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();

            const formData = new FormData(form);
            const params = Object.fromEntries(formData.entries());
            
            Object.keys(params).forEach(key => params[key] = params[key].trim());

            const data = await fetchTable('regions', params);
            statePopulate(data);
            updateRowCount(data.rowCount);
            setCurrentPage(1);
            refreshUI();
        });

        form.addEventListener('reset', async (ev) => {
            ev.preventDefault();
            await initRegions();
        });

        document.getElementById('new-region')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await addRegion();
        });

        document.getElementById('edit-region')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await editRegion();
        });

        document.getElementById('delete-region')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteRegion();
        });
    }

    document.getElementById('first')?.addEventListener('click', () => {
        setCurrentPage(1);
        refreshUI();
    });

    document.getElementById('last')?.addEventListener('click', () => {
        setCurrentPage(getPagesNum());
        refreshUI();
    });
}

export async function initRegions() {
    try {
        clearFields();
        const [data, stats] = await Promise.all([
            fetchTable('regions'),
            fetchStats()
        ]);

        statePopulate(data);
        document.getElementById('total-rows-count').textContent = stats.regions;
        updateRowCount(data.rowCount);
        refreshUI();
    } catch (err) {
        handleError(err);
    }
}

export function renderRegionsPage() {
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
            <td>${row.region_center_id ?? ''}</td>
        `;
        fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}
