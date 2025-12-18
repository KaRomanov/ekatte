
function showTime(duration) {
    const exportTimeSpan = document.getElementById('export-time');
    if (exportTimeSpan) {
        exportTimeSpan.textContent = `Export took ${duration} ms`;
    }
}

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

    let table = `
        <table>
            <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Town</th>
                <th>Townhall</th>
                <th>Municipality</th>
                <th>Municipality ID</th>
                <th>Region</th>
            </tr>
    `;

    for (const row of rows) {
        table += `
            <tr>
                <td>${row.id}</td>
                <td>${row.type}</td>
                <td>${row.town}</td>
                <td>${row.townhall}</td>
                <td>${row.municipality}</td>
                <td>${row.municipality_id}</td>
                <td>${row.region}</td>
            </tr>
        `;
    }

    table += '</table>';

    const blob = new Blob([`\ufeff${table}`], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'towns.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const t1 = performance.now();
    const duration = (t1 - t0).toFixed(2)
    showTime(duration);
}