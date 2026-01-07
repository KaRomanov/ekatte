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
    fetchTable, fetchStats,
} from "../../components/api.js";
import { addSettlement, deleteSettlement, editSettlement } from "./crud.js";


export async function setupPage() {
    initSettlements();

    const form = document.getElementById('search-form');

    if (form) {
        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();

            const params = {
                id: document.getElementById('id').value.trim(),
                type: document.getElementById('type').value.trim(),
                name_en: document.getElementById('name_en').value.trim(),
                name_bg: document.getElementById('name_bg').value.trim(),
                townhall_id: document.getElementById('townhall_id').value.trim(),
                municipality_id: document.getElementById('municipality_id').value.trim()
            };

            const data = await fetchTable('settlements', params);
            statePopulate(data);
            renderSettlementsPage();
            setupPagination(renderSettlementsPage);

            updateRowCount(data.rowCount);
        });

        form.addEventListener('reset', async (ev) => {
            ev.preventDefault();
            await initSettlements();
        });

        document.getElementById('new-settlement').addEventListener('click', async (e) => {
            e.preventDefault();
            await addSettlement();
        });

        document.getElementById('edit-settlement').addEventListener('click', async (e) => {
            e.preventDefault();
            await editSettlement();
        });

        document.getElementById('delete-settlement').addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteSettlement();
        });

    }

    const firstBtn = document.getElementById('first');
    if (firstBtn) firstBtn.addEventListener('click', () => {
        setCurrentPage(1);
        renderSettlementsPage();
        setupPagination(renderSettlementsPage);
    });

    const lastBtn = document.getElementById('last');
    if (lastBtn) lastBtn.addEventListener('click', () => {
        const last = getPagesNum();
        setCurrentPage(last);
        renderSettlementsPage();
        setupPagination(renderSettlementsPage);
    });
}

export async function initSettlements() {
    try {
        clearFields();
        const data = await fetchTable('settlements');
        const stats = await fetchStats();
        statePopulate(data);
        renderSettlementsPage();
        setupPagination(renderSettlementsPage);

        document.getElementById('total-rows-count').textContent = stats.towns;
        updateRowCount(data.rowCount);
    } catch (err) {
        handleError(err);
    }
}

export function renderSettlementsPage() {
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
            <td>${row.type ?? ''}</td>
            <td>${row.name_en ?? ''}</td>
            <td>${row.name_bg ?? ''}</td>
            <td>${row.townhall_id ?? null}</td>
            <td>${row.municipality_id ?? ''}</td>
        `;
        tbody.appendChild(tr);
    }
}
