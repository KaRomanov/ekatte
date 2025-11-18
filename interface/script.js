const HOST = 'http://127.0.0.1:3000'


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

    for (const row of data.rows) {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = row.id || '';
        tr.appendChild(tdId);

        const tdTown = document.createElement('td');
        tdTown.textContent = (row.type + ' ' + row.town) || '';
        tr.appendChild(tdTown);


        const tdTownhall = document.createElement('td');
        tdTownhall.textContent = row.townhall || '-';
        tr.appendChild(tdTownhall);


        const tdMunicipality = document.createElement('td');
        tdMunicipality.textContent = row.municipality || '';
        tr.appendChild(tdMunicipality);


        const tdRegion = document.createElement('td');
        tdRegion.textContent = row.region || '';
        tr.appendChild(tdRegion);


        tbody.appendChild(tr);
    }
}


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
