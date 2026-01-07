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

export async function setupPage() {
    initRegions();

    const form = document.getElementById('search-form');

    if (form) {
        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();

            const params = {
                id: document.getElementById('id').value.trim(),
                name_en: document.getElementById('name_en').value.trim(),
                name_bg: document.getElementById('name_bg').value.trim(),
                region_center_id: document.getElementById('region_center_id').value.trim()
            };

            const data = await fetchTable('regions', params);

            statePopulate(data);
            renderRegionsPage();

            setupPagination(renderRegionsPage);

            updateRowCount(data.rowCount);
        });

        form.addEventListener('reset', async (ev) => {
            ev.preventDefault();
            await initRegions();
        });

        document.getElementById('new-region').addEventListener('click', async (e) => {
            e.preventDefault();
            await addRegion();
        });

        document.getElementById('edit-region').addEventListener('click', async (e) => {
            e.preventDefault();
            await editRegion();
        });

        document.getElementById('delete-region').addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteRegion();
        });

        const firstBtn = document.getElementById('first');
        if (firstBtn) firstBtn.addEventListener('click', () => {
            setCurrentPage(1);
            renderRegionsPage();
            setupPagination(renderRegionsPage);
        });

        const lastBtn = document.getElementById('last');
        if (lastBtn) lastBtn.addEventListener('click', () => {
            const last = getPagesNum();
            setCurrentPage(last);
            renderRegionsPage();
            setupPagination(renderRegionsPage);
        });
    }
}

export async function initRegions() {
    try {
        clearFields();
        const data = await fetchTable('regions');
        const stats = await fetchStats();

        statePopulate(data);
        renderRegionsPage();
        setupPagination(renderRegionsPage);

        document.getElementById('total-rows-count').textContent = stats.regions;
        updateRowCount(data.rowCount);
    } catch (err) {
        handleError(err);
    }
}

export function renderRegionsPage() {
    const tbody = document.getElementById('table-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const rows = getRowsState();
    const start = (currentPage - 1) * rowsPerPage;
    const pageRows = (rows || []).slice(start, start + rowsPerPage);

    for (const row of pageRows) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id ?? ''}</td>
            <td>${row.name_en ?? ''}</td>
            <td>${row.name_bg ?? ''}</td>
            <td>${row.region_center_id ?? ''}</td>
        `;
        tbody.appendChild(tr);
    }
}
