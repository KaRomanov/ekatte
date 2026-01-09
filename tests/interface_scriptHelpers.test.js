import { jest } from '@jest/globals';

import {
    addRowCounts, updateRowCount,
    handleError, clearFields, showStats
} from '../interface/ui/dom.js';

describe('DOM manipulation functions', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="towns-count"></div>
            <div id="townhalls-count"></div>
            <div id="municipalities-count"></div>
            <div id="regions-count"></div>
            <div id="rows-count"></div>
            <div id="table-error"></div>
            <table>
                <tbody id="table-tbody"></tbody>
            </table>
            <div id="export-time"></div>
            <div id="export-file-size"></div>
            <div id="export-memory-used"></div>
            <div id="export-throughput"></div>
        `;
    });

    describe('addRowCounts', () => {
        test('should update all row count elements', () => {
            const rowCounts = {
                towns: 5,
                townhalls: 3,
                municipalities: 2,
                regions: 4
            };

            addRowCounts(rowCounts);

            expect(document.getElementById('towns-count').textContent).toBe('5');
            expect(document.getElementById('townhalls-count').textContent).toBe('3');
            expect(document.getElementById('municipalities-count').textContent).toBe('2');
            expect(document.getElementById('regions-count').textContent).toBe('4');
        });
    });

    describe('updateRowCount', () => {
        test('should update rows-count element', () => {
            updateRowCount(10);
            expect(document.getElementById('rows-count').textContent).toBe('10');
        });

        test('should do nothing if rows-count element does not exist', () => {
            document.getElementById('rows-count').remove();
            expect(() => updateRowCount(10)).not.toThrow();
        });
    });

    describe('handleError', () => {
        let consoleErrorSpy;

        beforeEach(() => {
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            document.getElementById('table-tbody').innerHTML = '<tr><td>dummy</td></tr>';
        });

        afterEach(() => {
            consoleErrorSpy.mockRestore();
        });

        test('should display error message, log error, and clear tbody', () => {
            const error = new Error('Test error');
            handleError(error);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching data:', error);
            const errorDiv = document.getElementById('table-error');
            expect(errorDiv.textContent).toBe('Test error');
            expect(errorDiv.style.display).toBe('block');

            expect(document.getElementById('table-tbody').innerHTML).toBe('');
        });
    });

    describe('clearFields', () => {
        test('should clear error and export-time fields', () => {
            const errorDiv = document.getElementById('table-error');
            const exportTime = document.getElementById('export-time');

            errorDiv.textContent = 'Some error';
            errorDiv.style.display = 'block';
            exportTime.textContent = '5s';

            clearFields();

            expect(errorDiv.textContent).toBe('');
            expect(errorDiv.style.display).toBe('none');
            expect(exportTime.textContent).toBe('');
        });
    });
});

describe('showStats', () => {
    test("should update all spans when all stats are provided", () => {
        const stats = {
            time: "150.50",
            fileSizeMB: "1.25",
            memoryUsedKB: "2500",
            throughput: "33.33"
        };

        showStats(stats);

        expect(document.getElementById('export-time').textContent).toBe("Time: 150.50 ms");
        expect(document.getElementById('export-file-size').textContent).toBe(" | File size: 1.25 MB");
        expect(document.getElementById('export-memory-used').textContent).toBe(" | Memory used: 2500 KB");
        expect(document.getElementById('export-throughput').textContent).toBe(" | Speed: 33.33 rows/ms");
    });

    test("should only update existing values and not crash if some stats are missing", () => {
        const stats = {
            time: 50.00,
            throughput: "100"
        };

        showStats(stats);

        expect(document.getElementById('export-time').textContent).toBe("Time: 50 ms");
        expect(document.getElementById('export-throughput').textContent).toBe(" | Speed: 100 rows/ms");

        expect(document.getElementById('export-file-size').textContent).toBe("");
        expect(document.getElementById('export-memory-used').textContent).toBe("");
    });

    test("should not throw an error if DOM elements are missing", () => {
        document.body.innerHTML = "";

        const stats = { time: "10" };

        expect(() => showStats(stats)).not.toThrow();
    });
});
