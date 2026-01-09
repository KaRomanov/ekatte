import { jest } from '@jest/globals';


jest.unstable_mockModule('../interface/ui/dom.js', async () => ({
    showStats: jest.fn(),
}));


const { exportCSV, exportExcel } = await import('../interface/components/export.js');
const { showStats } = await import('../interface/ui/dom.js');


describe('Export Component Tests', () => {
    let clickMock;

    beforeEach(() => {
        let callCount = 0;
        jest.spyOn(global.performance, 'now').mockImplementation(() => {
            return callCount++ === 0 ? 1000 : 1050;
        });

        URL.createObjectURL = jest.fn(() => 'blob:fake-url');
        URL.revokeObjectURL = jest.fn();
        
        global.Blob = class {
            constructor(content) {
                this.content = content;
                this.size = 1024 * 1024;
            }
        };

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
        jest.clearAllMocks();
    });

    describe('exportCSV', () => {
        test('should generate CSV and call showStats with metrics', () => {
            const rows = [
                { id: 1, type: 'A', town: 'T1', townhall: 'TH1', municipality: 'M1', municipality_id: '01', region: 'R1' }
            ];

            exportCSV(rows);

            expect(showStats).toHaveBeenCalledWith(expect.objectContaining({
                time: 50,
                throughput: "0.02",
                memoryUsedKB: expect.any(String),
                fileSizeMB: expect.any(String)
            }));

            expect(clickMock).toHaveBeenCalled();
            expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
        });
    });

    describe('exportExcel', () => {
        beforeEach(() => {
            globalThis.XLSX = {
                utils: {
                    json_to_sheet: jest.fn(() => ({})),
                    book_new: jest.fn(() => ({})),
                    book_append_sheet: jest.fn(),
                },
                writeFile: jest.fn(),
            };
        });

        test('should generate Excel and call showStats with metrics', () => {
            const rows = [
                { id: 1, type: 'A', town: 'T1', townhall: 'TH1', municipality: 'M1', municipality_id: '01', region: 'R1' }
            ];

            exportExcel(rows);

            expect(showStats).toHaveBeenCalledWith(expect.objectContaining({
                time: 50,
                throughput: "0.02",
                memoryUsedKB: expect.any(String)
            }));

            expect(globalThis.XLSX.writeFile).toHaveBeenCalled();
        });
    });
});