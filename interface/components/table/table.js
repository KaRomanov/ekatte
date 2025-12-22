import * as state from './table.state.js';

import { renderPage } from './table.render.js';
import { setupPagination } from './table.pagination.js';
import { updateSortIndicators } from './table.sorting.js';

export const allRows = state.allRows;
export const currentPage = state.currentPage;
export const rowsPerPage = state.rowsPerPage;
export const sortState = state.sortState;


export function getRowsState() {
    return state.getRowsState();
}


export function getPagesNum(rows = state.allRows, perPage = state.rowsPerPage) {
    return state.getPagesNum(rows, perPage);
}


export function setCurrentPage(page) {
    return state.setCurrentPage(page);
}


export function populateTable(data) {
    state.populateTable(data);
    renderPage();
    setupPagination();
    updateSortIndicators();
}


export { renderPage } from './table.render.js';
export { setupPagination, createPageButton } from './table.pagination.js';
export {
    initSorting,
    handleSortClick,
    applySort,
    updateSortIndicators
} from './table.sorting.js';
