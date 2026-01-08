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
import { addSettlement, deleteSettlement, editSettlement } from "./crud.js";


function refreshUI() {
    renderSettlementsPage();
    setupPagination(renderSettlementsPage);
}

export async function setupPage() {
    await initSettlements();

    const form = document.getElementById('search-form');
    if (form) {
        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();

            const formData = new FormData(form);
            const params = Object.fromEntries(formData.entries());

            Object.keys(params).forEach(key => params[key] = params[key].trim());

            const data = await fetchTable('settlements', params);
            statePopulate(data);
            updateRowCount(data.rowCount);
            setCurrentPage(1);
            refreshUI();
        });

        form.addEventListener('reset', async (ev) => {
            ev.preventDefault();
            await initSettlements();
        });

        document.getElementById('new-settlement')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await addSettlement();
        });

        document.getElementById('edit-settlement')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await editSettlement();
        });

        document.getElementById('delete-settlement')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteSettlement();
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

export async function initSettlements() {
    try {
        clearFields();
        const [data, stats] = await Promise.all([
            fetchTable('settlements'),
            fetchStats()
        ]);

        statePopulate(data);
        document.getElementById('total-rows-count').textContent = stats.towns;
        updateRowCount(data.rowCount);
        refreshUI();
    } catch (err) {
        handleError(err);
    }
}

export function renderSettlementsPage() {
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
            <td>${row.type ?? ''}</td>
            <td>${row.name_en ?? ''}</td>
            <td>${row.name_bg ?? ''}</td>
            <td>${row.townhall_id ?? row.municipality_id + '-00'}</td>
            <td>${row.municipality_id ?? ''}</td>
        `;
        fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}
