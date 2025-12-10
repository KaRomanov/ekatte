import { jest, test, expect, beforeEach } from '@jest/globals';
let mockQuery = jest.fn();
let mockGetRowCount = jest.fn();

jest.mock("../db/index.js", () => ({
    query: mockQuery,
    default: { query: mockQuery },
    __esModule: true,
}));


jest.mock("../serverFunctions.js", () => {
    const actual = jest.requireActual("../serverFunctions.js");

    return {
        getRowCount: mockGetRowCount,
        getTablesRowCounts: actual.getTablesRowCounts,
        getTownsByCriteria: actual.getTownsByCriteria,
        __esModule: true,
    };
});
import {
    getTablesRowCounts,
    getTownsByCriteria,
    getRowCount
}
    from "../serverFunctions.js";


describe('Server helper functions', () => {

    beforeEach(() => {
        mockQuery.mockClear();
        mockQuery.mockReset();
        mockGetRowCount.mockClear();
        mockGetRowCount.mockReset();
    });



    test("getTablesRowCounts returns correct counts", async () => {

        mockGetRowCount
            .mockResolvedValueOnce("10")
            .mockResolvedValueOnce("5")
            .mockResolvedValueOnce("3")
            .mockResolvedValueOnce("1");

        const result = await getTablesRowCounts();

        expect(mockGetRowCount).toHaveBeenCalledTimes(4);

        expect(result).toEqual({
            towns: "10", municipalities: "5", townhalls: "3", regions: "1"
        });

    });

    test("getTablesRowCounts returns 0 if a table fails", async () => {

        mockGetRowCount
            .mockResolvedValueOnce("10")
            .mockRejectedValueOnce(new Error("fail"))
            .mockResolvedValueOnce("3")
            .mockResolvedValueOnce("1");

        const result = await getTablesRowCounts();

        expect(result).toEqual({
            towns: "10",
            municipalities: 0,
            townhalls: "3",
            regions: "1"
        });

    });


    test("getTownsByCriteria example", async () => {
        mockQuery = jest.fn().mockResolvedValueOnce({ rowCount: 1, rows: [{ town: 'Sofia' }] });
        const result = await getTownsByCriteria({ town: 'Sofia' });
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(result.rowCount).toBe(1);
    });

});