import { jest } from '@jest/globals';


jest.unstable_mockModule('../interface/ui/dom.js', async () => ({
    showTime: jest.fn(),
}));


const { exportCSV, exportExcel } = await import('../interface/components/export.js');
const { showTime } = await import('../interface/ui/dom.js');


describe('exportCSV', () => {
    let clickMock;

    beforeEach(() => {
        let time = 1000;
        jest.spyOn(global.performance, 'now')
            .mockImplementation(() => (time += 50));

        URL.createObjectURL = jest.fn(() => 'blob:fake-url');
        URL.revokeObjectURL = jest.fn();

        clickMock = jest.fn();

        document.createElement = jest.fn(() => ({
            href: '',
            download: '',
            click: clickMock,
        }));

        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should generate CSV, trigger download, and call showTime', () => {
        const rows = [
            {
                id: 1,
                type: 'A',
                town: 'Town1',
                townhall: 'TH1',
                municipality: 'M1',
                municipality_id: '001',
                region: 'R1',
            },
        ];

        exportCSV(rows);

        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(clickMock).toHaveBeenCalled();
        expect(document.body.appendChild).toHaveBeenCalled();
        expect(document.body.removeChild).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');

        expect(showTime).toHaveBeenCalledWith('50.00');
    });
});

describe('exportExcel (global XLSX)', () => {
    let jsonToSheetMock;
    let bookNewMock;
    let bookAppendSheetMock;
    let writeFileMock;

    beforeEach(() => {
        let time = 1000;
        jest.spyOn(global.performance, 'now')
            .mockImplementation(() => (time += 50));

        jsonToSheetMock = jest.fn(() => ({}));
        bookNewMock = jest.fn(() => ({}));
        bookAppendSheetMock = jest.fn();
        writeFileMock = jest.fn();

        globalThis.XLSX = {
            utils: {
                json_to_sheet: jsonToSheetMock,
                book_new: bookNewMock,
                book_append_sheet: bookAppendSheetMock,
            },
            writeFile: writeFileMock,
        };
    });

    afterEach(() => {
        delete globalThis.XLSX;
        jest.restoreAllMocks();
    });

    test('should generate Excel file and call showTime', () => {
        const rows = [
            {
                id: 1,
                type: 'A',
                town: 'Town1',
                townhall: 'TH1',
                municipality: 'M1',
                municipality_id: '001',
                region: 'R1',
            },
        ];

        exportExcel(rows);

        expect(jsonToSheetMock).toHaveBeenCalledWith([
            {
                ID: 1,
                Type: 'A',
                Town: 'Town1',
                Townhall: 'TH1',
                Municipality: 'M1',
                Municipality_ID: '001',
                Region: 'R1',
            },
        ]);

        expect(bookNewMock).toHaveBeenCalled();
        expect(bookAppendSheetMock).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            'Towns'
        );

        expect(writeFileMock).toHaveBeenCalledWith(
            expect.any(Object),
            'towns.xlsx'
        );

        expect(showTime).toHaveBeenCalledWith('50.00');
    });
});