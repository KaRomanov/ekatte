import { jest } from '@jest/globals';


const addEntry = jest.fn();
const updateEntry = jest.fn();
const deleteEntry = jest.fn();
const handleError = jest.fn();
const initMunicipalities = jest.fn();

jest.unstable_mockModule("../interface/components/api.js", () => ({
    addEntry,
    updateEntry,
    deleteEntry
}));

jest.unstable_mockModule("../interface/pages/municipalities/page.js", () => ({
    initMunicipalities
}));

jest.unstable_mockModule("../interface/ui/dom.js", () => ({
    handleError
}));


const {
    addMunicipality,
    editMunicipality,
    deleteMunicipality
} = await import("../interface/pages/municipalities/crud.js");


describe("Municipality CRUD", () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <input id="id" />
            <input id="name_en" />
            <input id="name_bg" />
            <input id="region_id" />
            <input id="municipality_center_id" />
        `;

        jest.spyOn(window, "alert").mockImplementation(() => { });
        jest.spyOn(window, "confirm").mockImplementation(() => true);

        initMunicipalities.mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe("addMunicipality", () => {

        test("adds municipality successfully", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("name_en").value = "Municipality EN";
            document.getElementById("name_bg").value = "Община";
            document.getElementById("region_id").value = "123";
            document.getElementById("municipality_center_id").value = "54321";

            addEntry.mockResolvedValue({ success: true });

            await addMunicipality();

            expect(addEntry).toHaveBeenCalledWith("municipalities", {
                id: "12345",
                name_en: "Municipality EN",
                name_bg: "Община",
                region_id: "123",
                municipality_center_id: "54321"
            });

            expect(initMunicipalities).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Общината с ID 12345 беше добавена успешно."
            );
        });

        test("fails when required fields are missing", async () => {
            await addMunicipality();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails on invalid municipality ID length", async () => {
            document.getElementById("id").value = "123";
            document.getElementById("name_en").value = "Municipality EN";
            document.getElementById("name_bg").value = "Община";
            document.getElementById("region_id").value = "123";

            await addMunicipality();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на общината трябва да е точно 5 символа!"
            );
        });

        test("fails on invalid region ID length", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("name_en").value = "Municipality EN";
            document.getElementById("name_bg").value = "Община";
            document.getElementById("region_id").value = "12";

            await addMunicipality();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на региона трябва да е точно 3 символа!"
            );
        });

        test("fails on invalid municipality center ID length", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("name_en").value = "Municipality EN";
            document.getElementById("name_bg").value = "Община";
            document.getElementById("region_id").value = "123";
            document.getElementById("municipality_center_id").value = "12";

            await addMunicipality();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на центъра на общината трябва да е точно 5 символа!"
            );
        });

        test("calls handleError when addEntry throws", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("name_en").value = "Municipality EN";
            document.getElementById("name_bg").value = "Община";
            document.getElementById("region_id").value = "123";

            const error = new Error("Add failed");
            addEntry.mockRejectedValue(error);

            await addMunicipality();

            expect(handleError).toHaveBeenCalledWith(error);
            expect(initMunicipalities).not.toHaveBeenCalled();
        });

    });


    describe("editMunicipality", () => {

        test("edits municipality successfully", async () => {
            document.getElementById("id").value = "12345";
            document.getElementById("name_en").value = "Updated name";

            updateEntry.mockResolvedValue({ success: true });

            await editMunicipality();

            expect(updateEntry).toHaveBeenCalledWith(
                "municipalities",
                "12345",
                { name_en: "Updated name" }
            );

            expect(initMunicipalities).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Общината с ID 12345 беше редактирана успешно."
            );
        });

        test("fails when no ID is provided", async () => {
            await editMunicipality();

            expect(updateEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails when no fields are provided", async () => {
            document.getElementById("id").value = "12345";

            await editMunicipality();

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

            await editMunicipality();

            expect(handleError).toHaveBeenCalledWith(error);
            expect(initMunicipalities).not.toHaveBeenCalled();
        });

    });


    describe("deleteMunicipality", () => {

        test("deletes municipality successfully", async () => {
            document.getElementById("id").value = "12345";

            deleteEntry.mockResolvedValue({ success: true });

            await deleteMunicipality();

            expect(window.confirm).toHaveBeenCalled();
            expect(deleteEntry).toHaveBeenCalledWith("municipalities", "12345");
            expect(initMunicipalities).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Общината с ID 12345 беше изтрита успешно."
            );
        });

        test("does not delete if confirmation is cancelled", async () => {
            window.confirm.mockReturnValue(false);
            document.getElementById("id").value = "12345";

            await deleteMunicipality();

            expect(deleteEntry).not.toHaveBeenCalled();
        });

        test("fails when no ID is provided", async () => {
            await deleteMunicipality();

            expect(deleteEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails on invalid ID length", async () => {
            document.getElementById("id").value = "12";

            await deleteMunicipality();

            expect(deleteEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на общината трябва да е точно 5 символа!"
            );
        });

        test("calls handleError when deleteEntry throws", async () => {
            document.getElementById("id").value = "12345";

            const error = new Error("Delete failed");
            deleteEntry.mockRejectedValue(error);

            await deleteMunicipality();

            expect(handleError).toHaveBeenCalledWith(error);
            expect(initMunicipalities).not.toHaveBeenCalled();
        });

    });

});
