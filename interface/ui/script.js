import { initTable } from "./init.js";
import { initSorting } from "../components/table/table.sorting.js";
import { setupEventListeners } from "./events.js";


document.addEventListener('DOMContentLoaded', async () => {
    await initTable();
    initSorting();
    setupEventListeners();
});
