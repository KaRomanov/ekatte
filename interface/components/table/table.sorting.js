import * as state from './table.state.js';
import { renderPage } from './table.render.js';
import { setupPagination } from './table.pagination.js';

export const getVal = (row, key) => {
    const val = row[key];
    if (val == null) return '';
    return typeof val === 'string' ? val.toLowerCase() : val;
};


export function applySort(sort = state.sortState, renderFn = renderPage) {
    if (!sort || sort.length === 0) return;

    state.allRows.sort((a, b) => {
        for (const { key, dir } of sort) {
            const va = getVal(a, key);
            const vb = getVal(b, key);
            if (va < vb) return dir === 'asc' ? -1 : 1;
            if (vb < va) return dir === 'asc' ? 1 : -1;
        }
        return 0;
    });

    renderFn();
    setupPagination(renderFn);
    updateSortIndicators();
}


export function updateSortIndicators(sort = state.sortState) {
    document.querySelectorAll('th[data-key]').forEach(th => th.classList.remove('sorted-asc', 'sorted-desc'));
    for (const { key, dir } of sort) {
        const th = document.querySelector(`th[data-key="${key}"]`);
        if (th) th.classList.add(`sorted-${dir}`);
    }
}


export function handleSortClick(currentSort, key, isShift = false) {
    const idx = currentSort.findIndex(x => x.key === key);

    if (!isShift) {
        if (idx === -1) return [{ key, dir: 'asc' }];
        if (currentSort[idx].dir === 'asc') return [{ key, dir: 'desc' }];
        return [];
    }

    if (idx === -1) return [...currentSort, { key, dir: 'asc' }];

    if (currentSort[idx].dir === 'asc') {
        return currentSort.map(s => s.key === key ? { key, dir: 'desc' } : s);
    }

    return currentSort.filter(s => s.key !== key);
}


export function triggerSort(key, isShift = false, renderFn) {
    const current = state.getSortState();
    const next = handleSortClick(current, key, isShift);
    updateSortIndicators(next);
    state.setSortState(next);
    applySort(next, renderFn);
}

export function initSorting(renderFn = renderPage) {
    document.querySelectorAll('th[data-key]').forEach(th => {
        th.addEventListener('click', (e) => triggerSort(th.dataset.key, e.shiftKey, renderFn));
    });
}

export default { applySort, updateSortIndicators, handleSortClick, initSorting };
