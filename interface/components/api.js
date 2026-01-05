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


export async function fetchRegions(params = {}) {
    const apiUrl = new URL(HOST + '/regions');

    for (const key in params) {
        if (params[key]) {
            apiUrl.searchParams.append(key, params[key]);
        }
    }

    const data = await (await fetch(apiUrl)).json();
    return data;
}


export async function fetchMunicipalities(params = {}) {
    const apiUrl = new URL(HOST + '/municipalities');

    for (const key in params) {
        if (params[key]) {
            apiUrl.searchParams.append(key, params[key]);
        }
    }

    const data = await (await fetch(apiUrl)).json();
    return data;
}

export async function fetchTownhalls(params = {}) {
    const apiUrl = new URL(HOST + '/townhalls');

    for (const key in params) {
        if (params[key]) {
            apiUrl.searchParams.append(key, params[key]);
        }
    }

    const data = await (await fetch(apiUrl)).json();
    return data;
}

export async function fetchSettlements(params = {}) {

    const apiUrl = new URL(HOST + '/settlements');
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

    let data;
    try {
        data = await response.json();
    } catch {
        data = await response.text();
    }

    if (!response.ok) {
        const errorMessage =
            typeof data === 'string'
                ? data
                : data?.error || 'Request failed';

        throw new Error(errorMessage);
    }

    return data;
}
