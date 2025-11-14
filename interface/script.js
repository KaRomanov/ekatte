
const HOST = 'http://127.0.0.1:3000'

function populateTable(data) {

    const table = document.getElementById('table');
    const rowsCountSpan = document.getElementById('rows-count');

    if (typeof data.rowCount !== 'number') {
        rowsCountSpan.textContent = data.rowCount;
    } else if (data.rows) {
        rowsCountSpan.textContent = data.rows.length;
    }

    for (const row of data.rows) {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = row.id || '';
        tr.appendChild(tdId);

        const tdTown = document.createElement('td');
        tdTown.textContent = (row.type + ' ' + row.town) || '';
        tr.appendChild(tdTown);


        const tdTownhall = document.createElement('td');
        tdTownhall.textContent = row.townhall || 'Не е част от кметство';
        tr.appendChild(tdTownhall);


        const tdMunicipality = document.createElement('td');
        tdMunicipality.textContent = row.municipality || '';
        tr.appendChild(tdMunicipality);


        const tdRegion = document.createElement('td');
        tdRegion.textContent = row.region || '';
        tr.appendChild(tdRegion);


        table.appendChild(tr);
    }
}

function addRowCounts(rowCounts) {
    document.getElementById('towns-count').textContent = rowCounts.towns;
    document.getElementById('townhalls-count').textContent = rowCounts.townhalls;
    document.getElementById('municipalities-count').textContent = rowCounts.municipalities;
    document.getElementById('regions-count').textContent = rowCounts.regions;
}


document.addEventListener('DOMContentLoaded', async () => {

    try {
        const data = await (await fetch(HOST + '/towns')).json();
        const rowCounts = await (await fetch(HOST + '/tables')).json();
        populateTable(data);
        addRowCounts(rowCounts);
    } catch (err) {
        console.error('Error fetching data:', err);
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = 'Неуспешно зареждане на данните';
        td.style.textAlign = 'center';
        tr.appendChild(td);
        table.appendChild(tr);
    }

});