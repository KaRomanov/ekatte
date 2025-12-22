import { fetchTowns, fetchStats } from "../components/api.js";
import { populateTable } from "../components/table/table.js";
import { addRowCounts, updateRowCount, clearFields, handleError } from "./dom.js";

export async function initTable() {
    try {
        clearFields();
        const data = await fetchTowns();
        const rowCounts = await fetchStats();

        populateTable(data);
        updateRowCount(data.rowCount);
        addRowCounts(rowCounts);
    } catch (err) {
        handleError(err);
    }
}

export default initTable;
