import { jest } from '@jest/globals';

import {
    addRowCounts, updateRowCount,
    handleError, clearFields, showTime
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
            expect(errorDiv.textContent).toBe('Неуспешно зареждане на данните');
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

describe('showTime', () => {
    test('should write formatted export time', () => {
        showTime('12.34');

        const exportTime = document.getElementById('export-time');
        expect(exportTime.textContent).toBe('Export took 12.34 ms');
    });

    test('should not throw if export-time element does not exist', () => {
        document.getElementById('export-time').remove();

        expect(() => showTime('5')).not.toThrow();
    });
});
