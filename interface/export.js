

export function exportCSV(rows) {

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
}

export function exportExcel() {

}