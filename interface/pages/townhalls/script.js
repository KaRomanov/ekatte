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
import { fetchTable, fetchStats, deleteEntry, addEntry } from "../../components/api.js";


async function initTownhalls() {
    try {
        clearFields();
        const data = await fetchTable('townhalls');
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

            const data = await fetchTable('townhalls', params);
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

    if (!params.id || !params.name_en || !params.name_bg || !params.municipality_id) {
        alert('Моля, попълнете всички полета, за да добавите нова община.');
        return;
    }

    if (params.id.length !== 8) {
        alert('ID-то на кметството трябва да е точно 8 символа!');
        return;
    }

    if (params.municipality_id.length !== 5) {
        alert('ID-то на общината трябва да е точно 5 символа!');
        return;
    }

    if (params.townhall_center_id && params.townhall_center_id.length !== 5) {
        alert('ID-то на центъра на кметството трябва да е точно 5 символа!');
        return;
    }

    try {
        const res = await addEntry('townhalls', params);

        if (res.success) {
            alert(`Общината беше добавена успешно с ID ${res.id}.`);
            await initTownhalls();
        }

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
        const res = await updateEntry('townhalls', params.id, inputParams);

        if (res.success) {
            alert(`Общината с ID ${params.id} беше редактирана успешно.`);
            await initTownhalls();
        }

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

    if (id.length !== 8) {
        alert('ID-то на общината трябва да е точно 8 символа!');
        return;
    }

    const confirmed = confirm(
        `ВНИМАНИЕ!\n\n` +
        `Изтриването на кметство с ID ${id} ще доведе до:\n` +
        `• изтриване на всички населени места\n\n` +
        `Това действие е НЕОБРАТИМО!\n\n` +
        `Сигурни ли сте, че искате да продължите?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const res = await deleteEntry('townhalls', id);

        if (res.success) {
            alert(`Общината с ID ${id} беше изтрита успешно.`);
            await initTownhalls();
        }
    } catch (err) {
        handleError(err);
    }

}
