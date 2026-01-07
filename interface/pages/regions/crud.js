import { initRegions } from './page.js';
import { addEntry, updateEntry, deleteEntry } from '../../components/api.js';


export async function addRegion() {

    const params = {
        id: document.getElementById('id').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        region_center_id: document.getElementById('region_center_id').value.trim() || null
    };

    if (!params.id || !params.name_en || !params.name_bg) {
        alert('Моля, попълнете всички полета преди да добавите нов регион.');
        return;
    }

    if (params.id.length !== 3) {
        alert('ID-то на региона трябва да е точно 3 символа!');
        return;
    }

    if (params.region_center_id && params.region_center_id.length !== 5) {
        alert('ID-то на регионалния център трябва да е точно 5 символа!');
        return;
    }

    try {
        const res = await addEntry('regions', params);

        if (res.success) {
            alert(`Регионът с ID ${params.id} беше добавен успешно.`);
            await initRegions();
        }

    } catch (err) {
        handleError(err);
    }

}


export async function editRegion() {

    const params = {
        id: document.getElementById('id').value.trim(),
        name_en: document.getElementById('name_en').value.trim(),
        name_bg: document.getElementById('name_bg').value.trim(),
        region_center_id: document.getElementById('region_center_id').value.trim()
    };

    if (!params.id) {
        alert('Моля, попълнете ID на региона, който искате да редактирате.');
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
        const res = await updateEntry('regions', params.id, inputParams);

        if (res.success) {
            alert(`Регионът с ID ${params.id} беше редактиран успешно.`);
            await initRegions();
        }

    } catch (err) {
        handleError(err);
    }
}


export async function deleteRegion() {

    const id = document.getElementById('id').value.trim();

    if (!id) {
        alert('Моля, въведете ID на региона, който искате да изтриете.');
        return;
    }

    if (id.length !== 3) {
        alert('ID-то на региона трябва да е точно 3 символа!');
        return;
    }

    const confirmed = confirm(
        `ВНИМАНИЕ!\n\n` +
        `Изтриването на регион с ID ${id} ще доведе до:\n` +
        `• изтриване на всички общини в региона\n` +
        `• изтриване на всички кметства\n` +
        `• изтриване на всички населени места\n\n` +
        `Това действие е НЕОБРАТИМО!\n\n` +
        `Сигурни ли сте, че искате да продължите?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const res = await deleteEntry('regions', id);

        if (res.success) {
            alert(`Регионът с ID ${id} беше изтрит успешно.`);
            await initRegions();
        }
    } catch (err) {
        handleError(err);
    }
}