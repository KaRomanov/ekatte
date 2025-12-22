import { jest } from '@jest/globals';

import { getVal, updateSortIndicators, handleSortClick } from '../interface/components/table/table.sorting.js';
import * as state from '../interface/components/table/table.state.js';
import { getPagesNum } from '../interface/components/table/table.state.js';

describe('getPagesNum', () => {

    test('returns 0 if there are no rows', () => {
        const rows = [];
        const perPage = 5;
        expect(getPagesNum(rows, perPage)).toBe(0);
    });

    test('returns 1 if rows are fewer than rowsPerPage', () => {
        const rows = [{}, {}, {}];
        const perPage = 5;
        expect(getPagesNum(rows, perPage)).toBe(1);
    });

    test('returns correct number of pages for exact multiple', () => {
        const rows = new Array(10).fill({});
        const perPage = 5;
        expect(getPagesNum(rows, perPage)).toBe(2);
    });

    test('returns correct number of pages for non-exact multiple', () => {
        const rows = new Array(12).fill({});
        const perPage = 5;
        expect(getPagesNum(rows, perPage)).toBe(3);
    });
});

describe('get correct sort value', () => {
    test('should return lowercased string if value is string', () => {
        const row = { name: 'Alice', age: 30 };
        const value = getVal(row, 'name');
        expect(value).toBe('alice');
    });

    test('should return number as-is', () => {
        const row = { name: 'Bob', age: 42 };
        const value = getVal(row, 'age');
        expect(value).toBe(42);
    });

    test('should return empty string for missing key', () => {
        const row = { name: 'Charlie' };
        const value = getVal(row, 'age');
        expect(value).toBe('');
    });

    test('should return empty string for null value', () => {
        const row = { name: null };
        const value = getVal(row, 'name');
        expect(value).toBe('');
    });
});

describe('updateSortIndicators', () => {
    let thId, thTown, thRegion;

    beforeEach(() => {
        document.body.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th data-key="id"></th>
                        <th data-key="town"></th>
                        <th data-key="region"></th>
                    </tr>
                </thead>
            </table>
        `;



        thId = document.querySelector('th[data-key="id"]');
        thTown = document.querySelector('th[data-key="town"]');
        thRegion = document.querySelector('th[data-key="region"]');

        state.setSortState([]);
        state.setSortState([
            { key: 'id', dir: 'asc' },
            { key: 'town', dir: 'desc' }
        ]);
    });

    test('should remove old sort classes before applying new ones', () => {
        thId.classList.add('sorted-desc', 'some-other-class');
        thTown.classList.add('sorted-asc');
        thRegion.classList.add('sorted-asc');

        updateSortIndicators();

        expect(thId.classList.contains('sorted-asc')).toBe(true);
        expect(thId.classList.contains('sorted-desc')).toBe(false);
        expect(thTown.classList.contains('sorted-desc')).toBe(true);
        expect(thTown.classList.contains('sorted-asc')).toBe(false);
        expect(thRegion.className).toBe('');
    });

    test('should apply correct sort classes based on sortState', () => {
        updateSortIndicators();

        expect(thId.classList.contains('sorted-asc')).toBe(true);
        expect(thId.classList.contains('sorted-desc')).toBe(false);

        expect(thTown.classList.contains('sorted-desc')).toBe(true);
        expect(thTown.classList.contains('sorted-asc')).toBe(false);

        expect(thRegion.classList.contains('sorted-asc')).toBe(false);
        expect(thRegion.classList.contains('sorted-desc')).toBe(false);
    });

    test('should do nothing if th element for key does not exist', () => {
        state.setSortState([...state.getSortState(), { key: 'nonexistent', dir: 'asc' }]);
        expect(() => updateSortIndicators()).not.toThrow();

        expect(thId.classList.contains('sorted-asc')).toBe(true);
        expect(thTown.classList.contains('sorted-desc')).toBe(true);
        expect(thRegion.className).toBe('');
    });
});
