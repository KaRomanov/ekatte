

export function addRowCounts(rowCounts) {
    const el = document.getElementById('towns-count');
    if (el) el.textContent = rowCounts.towns;
    const el2 = document.getElementById('townhalls-count');
    if (el2) el2.textContent = rowCounts.townhalls;
    const el3 = document.getElementById('municipalities-count');
    if (el3) el3.textContent = rowCounts.municipalities;
    const el4 = document.getElementById('regions-count');
    if (el4) el4.textContent = rowCounts.regions;
}


export function updateRowCount(num) {
    const el = document.getElementById('rows-count');
    if (el) el.textContent = num;
}


export function handleError(err) {
    console.error('Error fetching data:', err);
    const errorDiv = document.getElementById('table-error');
    if (errorDiv) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    }
    const tbody = document.getElementById('table-tbody');
    if (tbody) tbody.innerHTML = '';
}


export function clearFields() {
    const errorDiv = document.getElementById('table-error');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
    const exportTime = document.getElementById('export-time');
    if (exportTime) exportTime.textContent = '';
}


export function showTime(duration) {
    const exportTimeSpan = document.getElementById('export-time');
    if (exportTimeSpan) {
        exportTimeSpan.textContent = `Export took ${duration} ms`;
    }
}


export default {
    addRowCounts,
    updateRowCount,
    handleError,
    clearFields,
    showTime
};
