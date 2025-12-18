import { fetchTowns, fetchStats } from "./api.js";
import {
    populateTable, renderPage,
    setupPagination, initSorting
} from "./table.js";


document.getElementById('first').addEventListener('click', () => {
    currentPage = 1;
    renderPage();
    setupPagination();
});


document.getElementById('last').addEventListener('click', () => {
    currentPage = getPagesNum();
    renderPage();
    setupPagination();
});


async function initTable() {
    try {
        clearError();
        const data = await fetchTowns();
        const rowCounts = await fetchStats();

        populateTable(data);
        updateRowCount(data.rowCount);

        addRowCounts(rowCounts);
    } catch (err) {
        handleError(err);
    }
}


function addRowCounts(rowCounts) {
    document.getElementById('towns-count').textContent = rowCounts.towns;
    document.getElementById('townhalls-count').textContent = rowCounts.townhalls;
    document.getElementById('municipalities-count').textContent = rowCounts.municipalities;
    document.getElementById('regions-count').textContent = rowCounts.regions;
}

function updateRowCount(num) {
    const el = document.getElementById('rows-count');
    if (el) el.textContent = num;
}

function handleError(err) {
    console.error('Error fetching data:', err);
    const errorDiv = document.getElementById('table-error');
    errorDiv.textContent = 'Неуспешно зареждане на данните';
    errorDiv.style.display = 'block';
    document.getElementById('table-tbody').innerHTML = '';
}


function clearError() {
    const errorDiv = document.getElementById('table-error');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
}


document.addEventListener('DOMContentLoaded', async () => {
    await initTable();
    initSorting();
});


document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const params = {
        town: document.getElementById('town').value.trim(),
        region: document.getElementById('region').value.trim(),
        municipality: document.getElementById('municipality').value.trim(),
        townhall: document.getElementById('townhall').value.trim()
    };

    if (!params.town && !params.region && !params.municipality && !params.townhall) {
        return;
    }

    const data = await fetchTowns(params);
    populateTable(data);
    updateRowCount(data.rowCount);
});


document.getElementById('search-form').addEventListener('reset', async (event) => {
    event.preventDefault();
    await initTable();
});
