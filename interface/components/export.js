import { showStats } from "../ui/dom.js";


export function exportCSV(rows) {
    const t0 = performance.now();

    let fileContent = `id,type,town,townhall,municipality,municipality_id,region\n`;

    for (const row of rows) {
        const line = `${row.id},${row.type},${row.town},${row.townhall},${row.municipality},${row.municipality_id},${row.region}\n`;
        fileContent += line;
    }

    const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });

    const t1 = performance.now();
    const duration = parseFloat((t1 - t0).toFixed(2));

    const rowsPerMs = duration > 0 ? (rows.length / duration).toFixed(2) : rows.length;

    const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
    const stringSizeKB = (fileContent.length * 2 / 1024).toFixed(2);

    const stats = {
        time: duration,
        fileSizeMB: fileSizeMB,
        memoryUsedKB: stringSizeKB,
        throughput: rowsPerMs
    };

    showStats(stats);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'towns.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

    const t1 = performance.now();
    const duration = parseFloat((t1 - t0).toFixed(2));

    const rowsPerMs = duration > 0 ? (rows.length / duration).toFixed(2) : rows.length;

    const rawJsonString = JSON.stringify(table);
    const memoryUsedKB = (rawJsonString.length * 2 / 1024).toFixed(2);

    const stats = {
        time: duration,
        memoryUsedKB: memoryUsedKB,
        throughput: rowsPerMs
    };

    showStats(stats);

    XLSX.writeFile(wBook, 'towns.xlsx');
}
