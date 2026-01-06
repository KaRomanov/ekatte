const HOST = 'http://127.0.0.1:3000'


export function fixData(rows) {
    for (const row of rows) {
        if (row.townhall == null) {
            row.townhall = row.municipality_id + '-00';
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


export async function fetchTable(endpoint, params = {}) {
    const apiUrl = new URL(HOST + `/${endpoint}`);
    for (const key in params) {
        if (params[key]) {
            apiUrl.searchParams.append(key, params[key]);
        }
    }
    const data = await (await fetch(apiUrl)).json();
    return data;
}


export async function deleteEntry(endpoint, id) {

    const apiUrl = new URL(HOST + `/${endpoint}/${id}`);

    const response = await fetch(apiUrl, {
        method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data?.error || 'Request failed';
        throw new Error(errorMessage);
    }

    return data;
}


export async function addEntry(endpoint, params) {
    const apiUrl = new URL(HOST + `/${endpoint}`);

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data?.error || 'Request failed';
        throw new Error(errorMessage);
    }

    return data;
}


export async function updateEntry(endpoint, id, params) {

    const apiUrl = new URL(HOST + `/${endpoint}/${id}`);

    const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data?.error || 'Request failed';
        throw new Error(errorMessage);
    }

    return data;
}
