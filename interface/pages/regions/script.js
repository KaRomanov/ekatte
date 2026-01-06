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
import { fetchRegions, fetchStats, deleteEntry, addEntry } from "../../components/api.js";


async function initRegions() {
    try {
        clearFields();
        const data = await fetchRegions();
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

document.addEventListener('DOMContentLoaded', () => {
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

            const data = await fetchRegions(params);

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

    }

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
});

function renderRegionsPage() {
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


async function addRegion() {

    const params = {
        id: document.getElementById('id').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        region_center_id: document.getElementById('region_center_id').value.trim() || null
    };

    if (!params.id || !params.name_en || !params.name_bg) {
        alert('Моля, попълнете всички полета преди да добавите нов регион.');
        return;
    }

    if (params.id.length !== 3) {
        alert('ID-то на региона трябва да е точно 3 символа!');
        return;
    }

    if (params.region_center_id && params.region_center_id.length !== 5) {
        alert('ID-то на регионалния център трябва да е точно 5 символа!');
        return;
    }

    try {
        const res = await addEntry('regions', params);

        if (res.success) {
            alert(`Регионът с ID ${params.id} беше добавен успешно.`);
            await initRegions();
        }

    } catch (err) {
        handleError(err);
    }

}


async function editRegion() {

    const params = {
        id: document.getElementById('id').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        region_center_id: document.getElementById('region_center_id').value.trim()
    };

    if (!params.id) {
        alert('Моля, попълнете ID на региона, който искате да редактирате.');
        return;
    }

    try {
        //finish
    } catch (err) {
        handleError(err);
    }
}


async function deleteRegion() {

    const id = document.getElementById('id').value.trim();

    if (!id) {
        alert('Моля, въведете ID на региона, който искате да изтриете.');
        return;
    }

    if (id.length !== 3) {
        alert('ID-то на региона трябва да е точно 3 символа!');
        return;
    }

    const confirmed = confirm(
        `ВНИМАНИЕ!\n\n` +
        `Изтриването на регион с ID ${id} ще доведе до:\n` +
        `• изтриване на всички общини в региона\n` +
        `• изтриване на всички кметства\n` +
        `• изтриване на всички населени места\n\n` +
        `Това действие е НЕОБРАТИМО!\n\n` +
        `Сигурни ли сте, че искате да продължите?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const res = await deleteEntry('regions', id);

        if (res.success) {
            alert(`Регионът с ID ${id} беше изтрит успешно.`);
            await initRegions();
        }
    } catch (err) {
        handleError(err);
    }
}

export default initRegions;
