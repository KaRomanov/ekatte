import { allRows, currentPage, rowsPerPage } from './table.state.js';

export function renderPage() {
    const tbody = document.getElementById('table-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    for (const row of allRows.slice(start, end)) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.type} ${row.town}</td>
            <td>${row.townhall}</td>
            <td>${row.municipality}</td>
            <td>${row.municipality_id}</td>
            <td>${row.region}</td>
        `;
        tbody.appendChild(tr);
    }
}

export default renderPage;
