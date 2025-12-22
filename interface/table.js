export let allRows = [];
export let currentPage = 1;
export const rowsPerPage = 20;
const buttonsNum = 3;
export let sortState = [];


export function getRowsState() {
    return allRows;
}


export function getPagesNum(rows = allRows, perPage = rowsPerPage) {
    return Math.ceil(rows.length / perPage);
}


export function renderPage() {
    const tbody = document.getElementById('table-tbody');
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


export function createPageButton(page) {
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


export function setupPagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    const totalPages = getPagesNum();
    if (totalPages <= 1) return;

    const start = Math.max(1, currentPage - buttonsNum);
    const end = Math.min(totalPages, currentPage + buttonsNum);

    if (start > 1) {
        pageNumbers.append('...');
    }

    for (let i = start; i <= end; i++) {
        pageNumbers.appendChild(createPageButton(i));
    }

    if (end < totalPages) {
        pageNumbers.append('...');
    }
}


export function populateTable(data) {
    allRows = data.rows;
    currentPage = 1;
    sortState = [];
    renderPage();
    setupPagination();
    updateSortIndicators();
}


export function getCorrectSortValue(row, key) {
    let value = row[key] ?? '';
    if (typeof value === 'string') {
        value = value.toLowerCase();
    }
    return value;
}


export function applySort() {
    allRows.sort((a, b) => {
        for (const { key, dir } of sortState) {

            let valA = getCorrectSortValue(a, key);
            let valB = getCorrectSortValue(b, key);

            if (valA < valB) {
                if (dir === 'asc') {
                    return -1;
                }
                return 1;
            }

            if (valB < valA) {
                if (dir === 'asc') {
                    return 1;
                }
                return -1;
            }
        }
        return 0;
    });

    currentPage = 1;
    renderPage();
    setupPagination();
    updateSortIndicators();
}


export function updateSortIndicators() {
    document.querySelectorAll('th[data-key]').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });

    sortState.forEach(({ key, dir }) => {
        const th = document.querySelector(`th[data-key="${key}"]`);
        if (th) th.classList.add(`sorted-${dir}`);
    });
}


export function handleSortClick(key, isShift) {
    const exist = sortState.find(s => s.key === key);

    if (!isShift && !exist) {
        sortState = [];
    }

    if (!exist) {
        sortState.push({ key, dir: 'asc' });
    } else if (exist.dir === 'asc') {
        exist.dir = 'desc';
    } else {
        sortState = sortState.filter(s => s.key !== key);
    }

    applySort();
}


export function initSorting() {
    document.querySelectorAll('th[data-key]').forEach(th => {
        th.addEventListener('click', (e) => {
            handleSortClick(th.dataset.key, e.shiftKey);
        });
    });
}
