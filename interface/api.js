const HOST = 'http://127.0.0.1:3000'

function fixData(rows) {
    for (const row of rows) {
        if (row.townhall == null) {
            row.townhall = row.municipality_id + '00';
        }
    }
}


export async function fetchTowns(params = {}) {
    const apiUrl = new URL(HOST + '/towns');
    for (const key in params) {
        if (params[key]) {
            apiUrl.searchParams.append(key, params[key]);
        }
    }
    const data = await (await fetch(apiUrl)).json();
    fixData(data.rows);
    return data;
}

export async function fetchStats() {
    return await (await fetch(HOST + '/tables')).json();
}
