import { getPagesNum, setCurrentPage } from './table.state.js';
import { renderPage } from './table.render.js';

export function createPageButton(page) {
    const btn = document.createElement('button');
    btn.textContent = page;

    btn.addEventListener('click', () => {
        setCurrentPage(page);
        renderPage();
        setupPagination();
    });

    return btn;
}

export function setupPagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    if (!pageNumbers) return;
    pageNumbers.innerHTML = '';

    const totalPages = getPagesNum();
    if (totalPages <= 1) return;

    const current = (function () {
        const active = pageNumbers.getAttribute('data-current');
        return active ? Number(active) : 1;
    })();

    const start = Math.max(1, current - 3);
    const end = Math.min(totalPages, current + 3);

    if (start > 1) {
        pageNumbers.append('...');
    }

    for (let i = start; i <= end; i++) {
        const b = createPageButton(i);
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
