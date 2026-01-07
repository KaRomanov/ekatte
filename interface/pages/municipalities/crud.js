import { initMunicipalities } from "./page.js"
import { addEntry, deleteEntry, updateEntry } from "../../components/api.js";

export async function addMunicipality() {

    const params = {
        id: document.getElementById('id').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        region_id: document.getElementById('region_id').value.trim(),
        municipality_center_id: document.getElementById('municipality_center_id').value.trim() || null
    };

    if (!params.id || !params.name_en || !params.name_bg || !params.region_id) {
        alert('Моля, попълнете всички полета преди да добавите нова община.');
        return;
    }

    if (params.id.length !== 5) {
        alert('ID-то на общината трябва да е точно 5 символа!');
        return;
    }

    if (params.region_id.length !== 3) {
        alert('ID-то на региона трябва да е точно 3 символа!');
        return;
    }

    if (params.municipality_center_id && params.municipality_center_id.length !== 5) {
        alert('ID-то на центъра на общината трябва да е точно 5 символа!');
        return;
    }

    try {
        const res = await addEntry('municipalities', params);

        if (res.success) {
            alert(`Общината с ID ${params.id} беше добавена успешно.`);
            await initMunicipalities();
        }

    } catch (err) {
        handleError(err);
    }

}


export async function editMunicipality() {

    const params = {
        id: document.getElementById('id').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        region_id: document.getElementById('region_id').value.trim(),
        municipality_center_id: document.getElementById('municipality_center_id').value.trim()
    };

    if (!params.id) {
        alert('Моля, попълнете ID на общината, която искате да редактирате.');
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
        const res = await updateEntry('municipalities', params.id, inputParams);

        if (res.success) {
            alert(`Общината с ID ${params.id} беше редактирана успешно.`);
            await initMunicipalities();
        }

    } catch (err) {
        handleError(err);
    }

}


export async function deleteMunicipality() {

    const id = document.getElementById('id').value.trim();

    if (!id) {
        alert('Моля, попълнете ID на общината, която искате да изтриете.');
        return;
    }

    if (id.length !== 5) {
        alert('ID-то на общината трябва да е точно 5 символа!');
        return;
    }

    const confirmed = confirm(
        `ВНИМАНИЕ!\n\n` +
        `Изтриването на община с ID ${id} ще доведе до:\n` +
        `• изтриване на всички кметства\n` +
        `• изтриване на всички населени места\n\n` +
        `Това действие е НЕОБРАТИМО!\n\n` +
        `Сигурни ли сте, че искате да продължите?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const res = await deleteEntry('municipalities', id);

        if (res.success) {
            alert(`Общината с ID ${id} беше изтрита успешно.`);
            await initMunicipalities();
        }

    } catch (err) {
        handleError(err);
    }

}
