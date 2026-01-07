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
import {
    fetchTable, fetchStats
} from "../../components/api.js";
import { addMunicipality, deleteMunicipality, editMunicipality } from "./crud.js";

export async function setupPage() {
    initMunicipalities();

    const form = document.getElementById('search-form');

    if (form) {
        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();

            const params = {
                id: document.getElementById('id').value.trim(),
                name_en: document.getElementById('name_en').value.trim(),
                name_bg: document.getElementById('name_bg').value.trim(),
                region_id: document.getElementById('region_id').value.trim(),
                municipality_center_id: document.getElementById('municipality_center_id').value.trim()
            };

            const data = await fetchTable('municipalities', params);
            statePopulate(data);
            renderMunicipalitiesPage();

            setupPagination(renderMunicipalitiesPage);
            updateRowCount(data.rowCount);
        });

        form.addEventListener('reset', async (ev) => {
            ev.preventDefault();
            await initMunicipalities();
        });

        document.getElementById('new-municipality').addEventListener('click', async (e) => {
            e.preventDefault();
            await addMunicipality();
        });

        document.getElementById('edit-municipality').addEventListener('click', async (e) => {
            e.preventDefault();
            await editMunicipality();
        });

        document.getElementById('delete-municipality').addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteMunicipality();
        });

    }

    const firstBtn = document.getElementById('first');
    if (firstBtn) firstBtn.addEventListener('click', () => {
        setCurrentPage(1);
        renderMunicipalitiesPage();
        setupPagination(renderMunicipalitiesPage);
    });

    const lastBtn = document.getElementById('last');
    if (lastBtn) lastBtn.addEventListener('click', () => {
        const last = getPagesNum();
        setCurrentPage(last);
        renderMunicipalitiesPage();
        setupPagination(renderMunicipalitiesPage);
    });
}

export async function initMunicipalities() {
    try {
        clearFields();
        const data = await fetchTable('municipalities');
        const stats = await fetchStats();

        statePopulate(data);
        renderMunicipalitiesPage();
        setupPagination(renderMunicipalitiesPage);

        document.getElementById('total-rows-count').textContent = stats.municipalities;
        updateRowCount(data.rowCount);
    } catch (err) {
        handleError(err);
    }
}

export function renderMunicipalitiesPage() {
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
            <td>${row.region_id ?? ''}</td>
            <td>${row.municipality_center_id ?? ''}</td>
        `;
        tbody.appendChild(tr);
    }
}