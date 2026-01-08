import { jest } from '@jest/globals';


const addEntry = jest.fn();
const updateEntry = jest.fn();
const deleteEntry = jest.fn();
const handleError = jest.fn();
const initSettlements = jest.fn();

jest.unstable_mockModule("../interface/components/api.js", () => ({
    addEntry,
    updateEntry,
    deleteEntry
}));

jest.unstable_mockModule("../interface/pages/settlements/page.js", () => ({
    initSettlements
}));

jest.unstable_mockModule("../interface/ui/dom.js", () => ({
    handleError
}));


const {
    addSettlement,
    editSettlement,
    deleteSettlement
} = await import("../interface/pages/settlements/crud.js");


describe("Settlement CRUD", () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <input id="id" />
            <input id="type" />
            <input id="name_en" />
            <input id="name_bg" />
            <input id="townhall_id" />
            <input id="municipality_id" />
        `;

        jest.spyOn(window, "alert").mockImplementation(() => { });
        jest.spyOn(window, "confirm").mockImplementation(() => true);

        initSettlements.mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe("addSettlement", () => {

        test("adds settlement successfully", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("type").value = "гр.";
            document.getElementById("name_en").value = "Sofia";
            document.getElementById("name_bg").value = "София";
            document.getElementById("municipality_id").value = "54321";
            document.getElementById("townhall_id").value = "12345678";

            addEntry.mockResolvedValue({ success: true });

            await addSettlement();

            expect(addEntry).toHaveBeenCalledWith("settlements", {
                id: "12345",
                type: "гр.",
                name_en: "Sofia",
                name_bg: "София",
                townhall_id: "12345678",
                municipality_id: "54321"
            });

            expect(initSettlements).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Населеното място беше добавено успешно с ID 12345."
            );
        });

        test("fails when required fields are missing", async () => {
            await addSettlement();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails on invalid settlement ID length", async () => {
            document.getElementById("id").value = "123";
            document.getElementById("type").value = "гр.";
            document.getElementById("name_en").value = "Test";
            document.getElementById("name_bg").value = "Тест";
            document.getElementById("municipality_id").value = "12345";

            await addSettlement();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на населеното място трябва да е точно 5 символа!"
            );
        });

        test("fails on invalid type", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("type").value = "xx";
            document.getElementById("name_en").value = "Test";
            document.getElementById("name_bg").value = "Тест";
            document.getElementById("municipality_id").value = "12345";

            await addSettlement();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Типът на населеното място трябва да бъде един от следните: гр., с., ман.!"
            );
        });

        test("fails on invalid municipality ID length", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("type").value = "гр.";
            document.getElementById("name_en").value = "Test";
            document.getElementById("name_bg").value = "Тест";
            document.getElementById("municipality_id").value = "12";

            await addSettlement();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                'ID-то на общината трябва да е точно 5 символа!'
            );
        });

        test("fails on invalid townhall ID length", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("type").value = "гр.";
            document.getElementById("name_en").value = "Test";
            document.getElementById("name_bg").value = "Тест";
            document.getElementById("municipality_id").value = "12345";
            document.getElementById("townhall_id").value = "987"

            await addSettlement();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                'ID-то на кметството трябва да е точно 8 символа!'
            );
        });

        test("calls handleError when addEntry throws", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("type").value = "гр.";
            document.getElementById("name_en").value = "Test";
            document.getElementById("name_bg").value = "Тест";
            document.getElementById("municipality_id").value = "12345";

            const error = new Error("Add failed");
            addEntry.mockRejectedValue(error);

            await addSettlement();

            expect(handleError).toHaveBeenCalledWith(error);
            expect(initSettlements).not.toHaveBeenCalled();
        });

    });


    describe("editSettlement", () => {

        test("edits settlement successfully", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("name_en").value = "Updated";

            updateEntry.mockResolvedValue({ success: true });

            await editSettlement();

            expect(updateEntry).toHaveBeenCalledWith(
                "settlements",
                "12345",
                { name_en: "Updated" }
            );

            expect(initSettlements).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Населеното място с ID 12345 беше редактирано успешно."
            );
        });

        test("fails when no ID is provided", async () => {
            await editSettlement();

            expect(updateEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails when no fields are provided", async () => {
            document.getElementById("id").value = "12345";

            await editSettlement();

            expect(updateEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Моля, попълнете поне едно поле за редактиране."
            );
        });

        test("calls handleError when updateEntry throws", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("name_bg").value = "Обновено";

            const error = new Error("Update failed");
            updateEntry.mockRejectedValue(error);

            await editSettlement();

            expect(handleError).toHaveBeenCalledWith(error);
            expect(initSettlements).not.toHaveBeenCalled();
        });

    });


    describe("deleteSettlement", () => {

        test("deletes settlement successfully", async () => {
            document.getElementById("id").value = "12345";

            deleteEntry.mockResolvedValue({ success: true });

            await deleteSettlement();

            expect(deleteEntry).toHaveBeenCalledWith("settlements", "12345");
            expect(initSettlements).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Населеното място с ID 12345 беше изтрито успешно."
            );
        });

        test("fails when no ID is provided", async () => {
            await deleteSettlement();

            expect(deleteEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails on invalid ID length", async () => {
            document.getElementById("id").value = "12";

            await deleteSettlement();

            expect(deleteEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на населеното място трябва да е точно 5 символа!"
            );
        });

        test("calls handleError when deleteEntry throws", async () => {
            document.getElementById("id").value = "12345";

            const error = new Error("Delete failed");
            deleteEntry.mockRejectedValue(error);

            await deleteSettlement();

            expect(handleError).toHaveBeenCalledWith(error);
            expect(initSettlements).not.toHaveBeenCalled();
        });

    });

});
