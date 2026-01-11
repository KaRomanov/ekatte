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
import { addMunicipality, deleteMunicipality, editMunicipality } from "./crud.js";


function refreshUI() {
    renderMunicipalitiesPage();
    setupPagination(renderMunicipalitiesPage);
}

export async function setupPage() {
    await initMunicipalities();

    const form = document.getElementById('search-form');

    if (form) {
        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();

            const formData = new FormData(form);
            const params = Object.fromEntries(formData.entries());

            Object.keys(params).forEach(key => params[key] = params[key].trim());

            const data = await fetchTable('municipalities', params);
            statePopulate(data);
            updateRowCount(data.rowCount);
            setCurrentPage(1);
            refreshUI();
        });

        form.addEventListener('reset', async (ev) => {
            ev.preventDefault();
            await initMunicipalities();
        });

        document.getElementById('new-municipality')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await addMunicipality();
        });

        document.getElementById('edit-municipality')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await editMunicipality();
        });

        document.getElementById('delete-municipality')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteMunicipality();
        });
    }

    document.getElementById('first')?.addEventListener('click', () => {
        setCurrentPage(1);
        refreshUI();
    });

    document.getElementById('last')?.addEventListener('click', () => {
        const last = getPagesNum();
        setCurrentPage(last);
        refreshUI();
    });
}

export async function initMunicipalities() {
    try {
        clearFields();
        const [data, stats] = await Promise.all([
            fetchTable('municipalities'),
            fetchStats()
        ]);

        statePopulate(data);
        document.getElementById('total-rows-count').textContent = stats.municipalities;
        updateRowCount(data.rowCount);
        refreshUI();
    } catch (err) {
        handleError(err);
    }
}

export function renderMunicipalitiesPage() {
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
            <td>${row.region_id ?? ''}</td>
            <td>${row.municipality_center_id ?? ''}</td>
        `;
        fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}
