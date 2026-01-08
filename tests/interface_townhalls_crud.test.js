import { jest } from '@jest/globals';

const addEntry = jest.fn();
const updateEntry = jest.fn();
const deleteEntry = jest.fn();
const handleError = jest.fn();
const initTownhalls = jest.fn();

jest.unstable_mockModule("../interface/components/api.js", () => ({
    addEntry,
    updateEntry,
    deleteEntry
}));

jest.unstable_mockModule("../interface/pages/townhalls/page.js", () => ({
    initTownhalls
}));

jest.unstable_mockModule("../interface/ui/dom.js", () => ({
    handleError
}));

const {
    addTownhall,
    editTownhall,
    deleteTownhall
} = await import("../interface/pages/townhalls/crud.js");


describe("Townhall crud", () => {
    beforeEach(() => {
        document.body.innerHTML = `
        <input id="id" />
        <input id="name_en" />
        <input id="name_bg" />
        <input id="municipality_id" />
        <input id="townhall_center_id" />
      `;

        jest.spyOn(window, "alert").mockImplementation(() => { });
        jest.spyOn(window, "confirm").mockImplementation(() => true);

        initTownhalls.mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe("addTownhall", () => {
        test("adds townhall successfully", async () => {
            document.getElementById("id").value = "12345678";
            document.getElementById("name_en").value = "Townhall EN";
            document.getElementById("name_bg").value = "Кметство";
            document.getElementById("municipality_id").value = "12345";
            document.getElementById("townhall_center_id").value = "54321";

            addEntry.mockResolvedValue({
                success: true,
                id: "12345678"
            });

            await addTownhall();

            expect(addEntry).toHaveBeenCalledWith("townhalls", {
                id: "12345678",
                name_en: "Townhall EN",
                name_bg: "Кметство",
                municipality_id: "12345",
                townhall_center_id: "54321"
            });

            expect(initTownhalls).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Общината беше добавена успешно с ID 12345678."
            );
        });

        test("fails when required fields are missing", async () => {
            await addTownhall();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails on invalid ID length", async () => {
            document.getElementById("id").value = "123";
            document.getElementById("name_en").value = "Townhall EN";
            document.getElementById("name_bg").value = "Кметство";
            document.getElementById("municipality_id").value = "12345";
            document.getElementById("townhall_center_id").value = "54321";

            await addTownhall();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на кметството трябва да е точно 8 символа!"
            );
        });

        test('fails on invalid municipality ID length', async () => {
            document.getElementById("id").value = "12345678";
            document.getElementById("name_en").value = "Townhall EN";
            document.getElementById("name_bg").value = "Кметство";
            document.getElementById("municipality_id").value = "123";
            document.getElementById("townhall_center_id").value = "54321";

            await addTownhall();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на общината трябва да е точно 5 символа!"
            );
        });

        test('fails on invalid townhall center ID length', async () => {
            document.getElementById("id").value = "12345678";
            document.getElementById("name_en").value = "Townhall EN";
            document.getElementById("name_bg").value = "Кметство";
            document.getElementById("municipality_id").value = "12345";
            document.getElementById("townhall_center_id").value = "54";

            await addTownhall();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                'ID-то на центъра на кметството трябва да е точно 5 символа!'
            );
        });

        test("calls handleError when addEntry throws", async () => {
            document.getElementById("id").value = "12345678";
            document.getElementById("name_en").value = "Townhall EN";
            document.getElementById("name_bg").value = "Кметство";
            document.getElementById("municipality_id").value = "12345";
            document.getElementById("townhall_center_id").value = "54321";

            const error = new Error("API failure");

            addEntry.mockRejectedValue(error);

            await addTownhall();

            expect(handleError).toHaveBeenCalled();
            expect(handleError).toHaveBeenCalledWith(error);

            expect(initTownhalls).not.toHaveBeenCalled();
            expect(window.alert).not.toHaveBeenCalled();
        });

    });


    describe("editTownhall", () => {
        test("edits townhall successfully", async () => {
            document.getElementById("id").value = "12345678";
            document.getElementById("name_en").value = "Updated name";

            updateEntry.mockResolvedValue({ success: true });

            await editTownhall();

            expect(updateEntry).toHaveBeenCalledWith(
                "townhalls",
                "12345678",
                { name_en: "Updated name" }
            );

            expect(initTownhalls).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Общината с ID 12345678 беше редактирана успешно."
            );
        });

        test("fails when no ID is provided", async () => {
            await editTownhall();

            expect(updateEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails when no fields are provided for editing", async () => {
            document.getElementById("id").value = "12345678";

            await editTownhall();

            expect(updateEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Моля, попълнете поне едно поле за редактиране."
            );
        });

        test("calls handleError when updateEntry throws", async () => {
            document.getElementById("id").value = "12345678";
            document.getElementById("name_en").value = "Updated name";

            const error = new Error("Update failed");

            updateEntry.mockRejectedValue(error);

            await editTownhall();

            expect(updateEntry).toHaveBeenCalledWith(
                "townhalls",
                "12345678",
                { name_en: "Updated name" }
            );

            expect(handleError).toHaveBeenCalledTimes(1);
            expect(handleError).toHaveBeenCalledWith(error);

            expect(initTownhalls).not.toHaveBeenCalled();
        });

    });


    describe("deleteTownhall", () => {
        test("deletes townhall successfully", async () => {
            document.getElementById("id").value = "12345678";

            deleteEntry.mockResolvedValue({ success: true });

            await deleteTownhall();

            expect(window.confirm).toHaveBeenCalled();
            expect(deleteEntry).toHaveBeenCalledWith(
                "townhalls",
                "12345678"
            );
            expect(initTownhalls).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Общината с ID 12345678 беше изтрита успешно."
            );
        });

        test("does not delete if confirmation is cancelled", async () => {
            window.confirm.mockReturnValue(false);
            document.getElementById("id").value = "12345678";

            await deleteTownhall();

            expect(deleteEntry).not.toHaveBeenCalled();
        });

        test('alert if no ID is provided', async () => {
            document.getElementById("id").value = "";

            await deleteTownhall();

            expect(window.alert).toHaveBeenCalledWith(
                'Моля, въведете ID на общината, която искате да изтриете.'
            );

        });

        test("fails on invalid ID length", async () => {
            document.getElementById("id").value = "123";

            await deleteTownhall();

            expect(deleteEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на общината трябва да е точно 8 символа!"
            );
        });

        test("calls handleError if deleteEntry fails", async () => {
            document.getElementById("id").value = "12345678";

            const error = new Error('Delete failed');
            deleteEntry.mockRejectedValue(error)

            await deleteTownhall();

            expect(deleteEntry).toHaveBeenCalledWith('townhalls', '12345678');
            expect(handleError).toHaveBeenCalledWith(error);

            expect(initTownhalls).not.toHaveBeenCalled();
        });

    });

});
