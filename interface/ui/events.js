import { fetchTowns } from "../components/api.js";
import { exportCSV, exportExcel } from '../components/export.js';
import { getRowsState, setCurrentPage, renderPage, setupPagination, getPagesNum, populateTable } from "../components/table/table.js";
import { updateRowCount } from "./dom.js";
import { initTable } from "./init.js";


export function setupEventListeners() {
    const csvBtn = document.getElementById('export-csv');
    if (csvBtn) csvBtn.addEventListener('click', () => exportCSV(getRowsState()));

    const excelBtn = document.getElementById('export-excel');
    if (excelBtn) excelBtn.addEventListener('click', () => exportExcel(getRowsState()));

    const firstBtn = document.getElementById('first');
    if (firstBtn) firstBtn.addEventListener('click', () => {
        setCurrentPage(1);
        renderPage();
        setupPagination();
    });

    const lastBtn = document.getElementById('last');
    if (lastBtn) lastBtn.addEventListener('click', () => {
        setCurrentPage(getPagesNum());
        renderPage();
        setupPagination();
    });

    const form = document.getElementById('search-form');
    if (form) {
        form.addEventListener('reset', async (event) => {
            event.preventDefault();
            await initTable();
        });

        form.addEventListener('submit', async (event) => {
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

            const data = await fetchTowns(params);
            populateTable(data);
            updateRowCount(data.rowCount);
        });
    }
}


export default setupEventListeners;
