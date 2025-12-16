const HOST = 'http://127.0.0.1:3000'

let allRows = [];
let currentPage = 1;
const rowsPerPage = 20;
const buttonsNum = 3;

function renderPage() {
    const tbody = document.getElementById('table-tbody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageRows = allRows.slice(start, end);

    for (const row of pageRows) {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = row.id || '';
        tr.appendChild(tdId);

        const tdTown = document.createElement('td');
        tdTown.textContent = (row.type + ' ' + row.town) || '';
        tr.appendChild(tdTown);


        const tdTownhall = document.createElement('td');
        tdTownhall.textContent = row.townhall || row.municipality_id + '-00';
        tr.appendChild(tdTownhall);


        const tdMunicipality = document.createElement('td');
        tdMunicipality.textContent = row.municipality || '';
        tr.appendChild(tdMunicipality);

        const tdMunicipalityId = document.createElement('td');
        tdMunicipalityId.textContent = row.municipality_id || '';
        tr.appendChild(tdMunicipalityId);

        const tdRegion = document.createElement('td');
        tdRegion.textContent = row.region || '';
        tr.appendChild(tdRegion);


        tbody.appendChild(tr);
    }
}

function createPageButton(page) {
    const btn = document.createElement('button');
    btn.textContent = page;

    if (page === currentPage) {
        btn.className = 'active';
        btn.disabled = true;
    }

    btn.addEventListener('click', () => {
        currentPage = page;
        renderPage();
        setupPagination();
    });

    return btn;
}

function createDots() {
    const span = document.createElement('span');
    span.textContent = '…';
    span.className = 'dots';
    return span;
}

function setupPagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    const totalPages = getPagesNum();
    if (totalPages <= 1) return;

    const start = Math.max(1, currentPage - buttonsNum);
    const end = Math.min(totalPages, currentPage + buttonsNum);

    if (start > 1) {
        pageNumbers.appendChild(createDots());
    }

    // Page buttons
    for (let i = start; i <= end; i++) {
        pageNumbers.appendChild(createPageButton(i));
    }

    // Right dots
    if (end < totalPages) {
        pageNumbers.appendChild(createDots());
    }
}


function getPagesNum() {
    return Math.ceil(allRows.length / rowsPerPage);
}

function populateTable(data) {

    const tbody = document.getElementById('table-tbody');
    const rowsCountSpan = document.getElementById('rows-count');
    const errorDiv = document.getElementById('table-error');

    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    tbody.innerHTML = '';

    if (typeof data.rowCount !== 'number') {
        rowsCountSpan.textContent = data.rowCount;
    } else if (data.rows) {
        rowsCountSpan.textContent = data.rows.length;
    }

    if (!data.rows) return;

    allRows = data.rows;
    currentPage = 1;

    renderPage();
    setupPagination();

}

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
        const data = await (await fetch(HOST + '/towns')).json();
        const rowCounts = await (await fetch(HOST + '/tables')).json();
        populateTable(data);
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


function handleError(err) {
    console.error('Error fetching data:', err);
    const errorDiv = document.getElementById('table-error');
    errorDiv.textContent = 'Неуспешно зареждане на данните';
    errorDiv.style.display = 'block';
    document.getElementById('table-tbody').innerHTML = '';
}


document.addEventListener('DOMContentLoaded', async () => {
    await initTable();
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

    try {
        const apiUrl = new URL(HOST + '/towns');
        for (const key in params) {
            if (params[key]) {
                apiUrl.searchParams.append(key, params[key]);
            }
        }
        const data = await (await fetch(apiUrl)).json();
        populateTable(data);
    } catch (err) {
        handleError(err);
    }

});


document.getElementById('search-form').addEventListener('reset', async (event) => {
    event.preventDefault();
    await initTable();
});

export {
    populateTable,
    addRowCounts,
    handleError,
    initTable
};