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
import { fetchTownhalls, fetchStats } from "../../components/api.js";


async function initTownhalls() {
    try {
        clearFields();
        const data = await fetchTownhalls();
        const stats = await fetchStats();

        statePopulate(data);
        renderTownhallsPage();
        setupPagination(renderTownhallsPage);

        document.getElementById('total-rows-count').textContent = stats.townhalls;
        updateRowCount(data.rowCount);
    } catch (err) {
        handleError(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTownhalls();

    const form = document.getElementById('search-form');

    if (form) {
        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();

            const params = {
                id: document.getElementById('id').value.trim(),
                name_en: document.getElementById('name_en').value.trim(),
                name_bg: document.getElementById('name_bg').value.trim(),
                municipality_id: document.getElementById('municipality_id').value.trim(),
                townhall_center_id: document.getElementById('townhall_center_id').value.trim()
            };

            const data = await fetchTownhalls(params);
            statePopulate(data);

            renderTownhallsPage();
            setupPagination(renderTownhallsPage);
            updateRowCount(data.rowCount);
        });

        form.addEventListener('reset', async (ev) => {
            ev.preventDefault();
            await initTownhalls();
        });

        document.getElementById('new-townhall').addEventListener('click', async (e) => {
            e.preventDefault();
            await addTownhall();
        });

        document.getElementById('edit-townhall').addEventListener('click', async (e) => {
            e.preventDefault();
            await editTownhall();
        });

        document.getElementById('delete-townhall').addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteTownhall();
        });

    }

    const firstBtn = document.getElementById('first');
    if (firstBtn) firstBtn.addEventListener('click', () => {
        setCurrentPage(1);
        renderTownhallsPage();
        setupPagination(renderTownhallsPage);
    });

    const lastBtn = document.getElementById('last');
    if (lastBtn) lastBtn.addEventListener('click', () => {
        const last = getPagesNum();
        setCurrentPage(last);
        renderTownhallsPage();
        setupPagination(renderTownhallsPage);
    });

});

function renderTownhallsPage() {
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
            <td>${row.municipality_id ?? ''}</td>
            <td>${row.townhall_center_id ?? ''}</td>
        `;
        tbody.appendChild(tr);
    }
}


async function addTownhall() {
    const params = {
        id: document.getElementById('id').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        municipality_id: document.getElementById('municipality_id').value.trim(),
        townhall_center_id: document.getElementById('townhall_center_id').value.trim()
    };

    if (!params.id || !params.name_en || !params.name_bg || !params.municipality_id || !params.townhall_center_id) {
        alert('Моля, попълнете всички полета, за да добавите нова община.');
        return;
    }

    try {
        //finish
    } catch (err) {
        handleError(err);
    }

}


async function editTownhall() {
    const params = {
        id: document.getElementById('id').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        municipality_id: document.getElementById('municipality_id').value.trim(),
        townhall_center_id: document.getElementById('townhall_center_id').value.trim()
    };

    if (!params.id) {
        alert('Моля, въведете ID на общината, която искате да редактирате.');
        return;
    }

    try {
        //finish
    } catch (err) {
        handleError(err);
    }

}


async function deleteTownhall() {

    const id = document.getElementById('id').value.trim();

    if (!id) {
        alert('Моля, въведете ID на общината, която искате да изтриете.');
        return;
    }

    try {
        //finish
    } catch (err) {
        handleError(err);
    }

}

export default initTownhalls;
