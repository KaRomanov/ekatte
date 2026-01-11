import { getPagesNum, setCurrentPage, currentPage } from './table.state.js';
import { renderPage } from './table.render.js';


export function createPageButton(page, renderFn = renderPage) {
    const btn = document.createElement('button');
    btn.textContent = page;

    btn.addEventListener('click', () => {
        setCurrentPage(page);
        renderFn();
        setupPagination(renderFn);
    });

    return btn;
}


export function setupPagination(renderFn = renderPage) {
    const pageNumbers = document.getElementById('pageNumbers');
    if (!pageNumbers) return;
    pageNumbers.innerHTML = '';

    const totalPages = getPagesNum();
    if (totalPages <= 1) return;

    const current = typeof currentPage === 'number' && currentPage > 0 ? currentPage : 1;

    const start = Math.max(1, current - 3);
    const end = Math.min(totalPages, current + 3);

    if (start > 1) {
        pageNumbers.append('...');
    }

    for (let i = start; i <= end; i++) {
        const b = createPageButton(i, renderFn);
        if (i === current) {
            b.className = 'active';
            b.disabled = true;
        }
        pageNumbers.appendChild(b);
    }

    if (end < totalPages) {
        pageNumbers.append('...');
    }

    pageNumbers.setAttribute('data-current', String(current));
}

export default setupPagination;
