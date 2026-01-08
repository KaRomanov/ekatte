import { jest } from '@jest/globals';


const addEntry = jest.fn();
const updateEntry = jest.fn();
const deleteEntry = jest.fn();
const handleError = jest.fn();
const initRegions = jest.fn();

jest.unstable_mockModule("../interface/components/api.js", () => ({
    addEntry,
    updateEntry,
    deleteEntry
}));

jest.unstable_mockModule("../interface/pages/regions/page.js", () => ({
    initRegions
}));

jest.unstable_mockModule("../interface/ui/dom.js", () => ({
    handleError
}));


const {
    addRegion,
    editRegion,
    deleteRegion
} = await import("../interface/pages/regions/crud.js");


describe("Region CRUD", () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <input id="id" />
            <input id="name_en" />
            <input id="name_bg" />
            <input id="region_center_id" />
        `;

        jest.spyOn(window, "alert").mockImplementation(() => { });
        jest.spyOn(window, "confirm").mockImplementation(() => true);

        initRegions.mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe("addRegion", () => {

        test("adds region successfully", async () => {
            document.getElementById("id").value = "101";
            document.getElementById("name_en").value = "North";
            document.getElementById("name_bg").value = "Север";
            document.getElementById("region_center_id").value = "12345";

            addEntry.mockResolvedValue({ success: true });

            await addRegion();

            expect(addEntry).toHaveBeenCalledWith("regions", {
                id: "101",
                name_en: "North",
                name_bg: "Север",
                region_center_id: "12345"
            });

            expect(initRegions).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Регионът с ID 101 беше добавен успешно."
            );
        });

        test("fails when required fields are missing", async () => {
            await addRegion();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails on invalid region ID length", async () => {
            document.getElementById("id").value = "12";
            document.getElementById("name_en").value = "North";
            document.getElementById("name_bg").value = "Север";

            await addRegion();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на региона трябва да е точно 3 символа!"
            );
        });

        test("fails on invalid region center ID length", async () => {
            document.getElementById("id").value = "101";
            document.getElementById("name_en").value = "North";
            document.getElementById("name_bg").value = "Север";
            document.getElementById("region_center_id").value = "123";

            await addRegion();

            expect(addEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на регионалния център трябва да е точно 5 символа!"
            );
        });

        test("calls handleError when addEntry throws", async () => {
            document.getElementById("id").value = "101";
            document.getElementById("name_en").value = "North";
            document.getElementById("name_bg").value = "Север";

            const error = new Error("Add failed");
            addEntry.mockRejectedValue(error);

            await addRegion();

            expect(handleError).toHaveBeenCalledWith(error);
            expect(initRegions).not.toHaveBeenCalled();
        });

    });


    describe("editRegion", () => {

        test("edits region successfully", async () => {
            document.getElementById("id").value = "101";
            document.getElementById("name_en").value = "Updated";

            updateEntry.mockResolvedValue({ success: true });

            await editRegion();

            expect(updateEntry).toHaveBeenCalledWith(
                "regions",
                "101",
                { name_en: "Updated" }
            );

            expect(initRegions).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Регионът с ID 101 беше редактиран успешно."
            );
        });

        test("fails when no ID is provided", async () => {
            await editRegion();

            expect(updateEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails when no fields are provided", async () => {
            document.getElementById("id").value = "101";

            await editRegion();

            expect(updateEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Моля, попълнете поне едно поле за редактиране."
            );
        });

        test("calls handleError when updateEntry throws", async () => {
            document.getElementById("id").value = "101";
            document.getElementById("name_bg").value = "Обновен";

            const error = new Error("Update failed");
            updateEntry.mockRejectedValue(error);

            await editRegion();

            expect(handleError).toHaveBeenCalledWith(error);
            expect(initRegions).not.toHaveBeenCalled();
        });

    });


    describe("deleteRegion", () => {

        test("deletes region successfully", async () => {
            document.getElementById("id").value = "101";

            deleteEntry.mockResolvedValue({ success: true });

            await deleteRegion();

            expect(window.confirm).toHaveBeenCalled();
            expect(deleteEntry).toHaveBeenCalledWith("regions", "101");
            expect(initRegions).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "Регионът с ID 101 беше изтрит успешно."
            );
        });

        test("does not delete if confirmation is cancelled", async () => {
            window.confirm.mockReturnValue(false);
            document.getElementById("id").value = "101";

            await deleteRegion();

            expect(deleteEntry).not.toHaveBeenCalled();
        });

        test("fails when no ID is provided", async () => {
            await deleteRegion();

            expect(deleteEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });

        test("fails on invalid region ID length", async () => {
            document.getElementById("id").value = "12";

            await deleteRegion();

            expect(deleteEntry).not.toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(
                "ID-то на региона трябва да е точно 3 символа!"
            );
        });

        test("calls handleError when deleteEntry throws", async () => {
            document.getElementById("id").value = "101";

            const error = new Error("Delete failed");
            deleteEntry.mockRejectedValue(error);

            await deleteRegion();

            expect(handleError).toHaveBeenCalledWith(error);
            expect(initRegions).not.toHaveBeenCalled();
        });

    });

});