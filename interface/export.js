import { showTime } from "./script.js";


export function exportCSV(rows) {
    const t0 = performance.now();

    let fileContent = `id,type,town,townhall,municipality,municipality_id,region\n`;

    for (const row of rows) {
        const line = `${row.id},${row.type},${row.town},${row.townhall},${row.municipality},${row.municipality_id},${row.region}\n`;
        fileContent += line;
    }

    const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'towns.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const t1 = performance.now();
    const duration = (t1 - t0).toFixed(2)
    showTime(duration);
}

export function exportExcel(rows) {
    const t0 = performance.now();

    const table = rows.map(r => ({
        ID: r.id,
        Type: r.type,
        Town: r.town,
        Townhall: r.townhall,
        Municipality: r.municipality,
        Municipality_ID: r.municipality_id,
        Region: r.region
    }));

    const wSheet = XLSX.utils.json_to_sheet(table);
    const wBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wBook, wSheet, 'Towns');

    XLSX.writeFile(wBook, 'towns.xlsx');

    const t1 = performance.now();
    const duration = (t1 - t0).toFixed(2)
    showTime(duration);
}
