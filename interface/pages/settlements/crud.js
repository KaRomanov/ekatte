import { addEntry, deleteEntry, updateEntry } from "../../components/api.js";
import { initSettlements } from "./page.js";
import { handleError } from "../../ui/dom.js";


export async function addSettlement() {

    const params = {
        id: document.getElementById('id').value.trim(),
        type: document.getElementById('type').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        townhall_id: document.getElementById('townhall_id').value.trim() || null,
        municipality_id: document.getElementById('municipality_id').value.trim()
    };

    if (!params.name_en || !params.name_bg || !params.type || !params.municipality_id) {
        alert('Моля попълнете задължителните полета: Име (EN), Име (BG), Тип и Община ID!');
        return;
    }

    if (params.id.length !== 5) {
        alert('ID-то на населеното място трябва да е точно 5 символа!');
        return;
    }

    if (params.municipality_id.length !== 5) {
        alert('ID-то на общината трябва да е точно 5 символа!');
        return;
    }

    if (params.type !== 'гр.' && params.type !== 'с.' && params.type !== 'ман.') {
        alert('Типът на населеното място трябва да бъде един от следните: гр., с., ман.!');
        return;
    }

    if (params.townhall_id && params.townhall_id.length !== 8) {
        alert('ID-то на кметството трябва да е точно 8 символа!');
        return;
    }

    try {
        const res = await addEntry('settlements', params);

        if (res.success) {
            alert(`Населеното място беше добавено успешно с ID ${params.id}.`);
            await initSettlements();
        }

    } catch (err) {
        handleError(err);
    }

}


export async function editSettlement() {

    const params = {
        id: document.getElementById('id').value.trim(),
        type: document.getElementById('type').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        townhall_id: document.getElementById('townhall_id').value.trim(),
        municipality_id: document.getElementById('municipality_id').value.trim()
    };

    if (!params.id) {
        alert('Моля въведете ID на населеното място, което искате да редактирате!');
        return;
    }

    const inputParams = {};
    for (const [key, value] of Object.entries(params)) {
        if (key === 'id') continue;
        if (value !== '') {
            inputParams[key] = value;
        }
    }

    if (Object.keys(inputParams).length === 0) {
        alert('Моля, попълнете поне едно поле за редактиране.');
        return;
    }

    try {
        const res = await updateEntry('settlements', params.id, inputParams);

        if (res.success) {
            alert(`Населеното място с ID ${params.id} беше редактирано успешно.`);
            await initSettlements();
        }

    } catch (err) {
        handleError(err);
    }

}


export async function deleteSettlement() {
    const id = document.getElementById('id').value.trim();

    if (!id) {
        alert('Моля въведете ID на населеното място, което искате да изтриете!');
        return;
    }

    if (id.length !== 5) {
        alert('ID-то на населеното място трябва да е точно 5 символа!');
        return;
    }

    try {

        const res = await deleteEntry('settlements', id);

        if (res.success) {
            alert(`Населеното място с ID ${id} беше изтрито успешно.`);
            await initSettlements();
        }
    } catch (err) {
        handleError(err);
    }

}
