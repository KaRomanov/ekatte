import { setupPage, renderMunicipalitiesPage } from './page.js';
import { initSorting } from '../../components/table/table.sorting.js';

document.addEventListener('DOMContentLoaded', async () => {
    await setupPage();
    initSorting(renderMunicipalitiesPage);
});
