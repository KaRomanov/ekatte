export let allRows = [];
export let currentPage = 1;
export const rowsPerPage = 20;
export let sortState = [];

export function getSortState() {
    return sortState;
}


export function setSortState(newState = []) {
    sortState.length = 0;
    if (Array.isArray(newState) && newState.length) {
        sortState.push(...newState);
    }
}


export function getRowsState() {
    return allRows;
}


export function getPagesNum(rows = allRows, perPage = rowsPerPage) {
    return Math.ceil(rows.length / perPage);
}


export function setCurrentPage(page) {
    currentPage = page;
}


export function populateTable(data) {
    allRows = data.rows;
    currentPage = 1;
    sortState = [];
}


export default {
    allRows,
    currentPage,
    rowsPerPage,
    sortState,
    getRowsState,
    getPagesNum,
    setCurrentPage,
    populateTable
};
