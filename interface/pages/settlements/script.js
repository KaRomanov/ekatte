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
    deleteEntry, addEntry, updateEntry
} from "../../components/api.js";


async function initSettlements() {
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


document.addEventListener('DOMContentLoaded', () => {
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

});


function renderSettlementsPage() {
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


async function addSettlement() {

    const params = {
        id: document.getElementById('id').value.trim(),
        type: document.getElementById('type').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        townhall_id: document.getElementById('townhall_id').value.trim() || null,
        municipality_id: document.getElementById('municipality_id').value.trim()
    };

    if (!params.name_en || !params.name_bg || !params.type || !params.municipality_id) {
        alert('Моля попълнете задължителните полета: Име (EN), Име (BG), Тип и Община ID!');
        return;
    }

    if (params.id.length !== 5) {
        alert('ID-то на населеното място трябва да е точно 5 символа!');
        return;
    }

    if (params.municipality_id.length !== 5) {
        alert('ID-то на общината трябва да е точно 5 символа!');
        return;
    }

    if (params.type !== 'гр.' && params.type !== 'с.' && params.type !== 'ман.') {
        alert('Типът на населеното място трябва да бъде един от следните: гр., с., ман.!');
        return;
    }

    if (params.townhall_id && params.townhall_id.length !== 8) {
        alert('ID-то на кметството трябва да е точно 8 символа!');
        return;
    }

    try {
        const res = await addEntry('settlements', params);

        if (res.success) {
            alert(`Населеното място беше добавено успешно с ID ${params.id}.`);
            await initSettlements();
        }

    } catch (err) {
        handleError(err);
    }

}


async function editSettlement() {

    const params = {
        id: document.getElementById('id').value.trim(),
        type: document.getElementById('type').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        townhall_id: document.getElementById('townhall_id').value.trim(),
        municipality_id: document.getElementById('municipality_id').value.trim()
    };

    if (!params.id) {
        alert('Моля въведете ID на населеното място, което искате да редактирате!');
        return;
    }

    const inputParams = {};
    for (const [key, value] of Object.entries(params)) {
        if (key === 'id') continue;
        if (value !== '') {
            inputParams[key] = value;
        }
    }

    if (Object.keys(inputParams).length === 0) {
        alert('Моля, попълнете поне едно поле за редактиране.');
        return;
    }

    try {
        const res = await updateEntry('settlements', params.id, inputParams);

        if (res.success) {
            alert(`Населеното място с ID ${params.id} беше редактирано успешно.`);
            await initSettlements();
        }

    } catch (err) {
        handleError(err);
    }

}


async function deleteSettlement() {
    const id = document.getElementById('id').value.trim();

    if (!id) {
        alert('Моля въведете ID на населеното място, което искате да изтриете!');
        return;
    }

    if (id.length !== 5) {
        alert('ID-то на населеното място трябва да е точно 5 символа!');
        return;
    }

    try {

        const res = await deleteEntry('settlements', id);

        if (res.success) {
            alert(`Населеното място с ID ${id} беше изтрито успешно.`);
            await initSettlements();
        }
    } catch (err) {
        handleError(err);
    }

}
