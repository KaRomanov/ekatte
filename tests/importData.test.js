import { jest } from '@jest/globals';

describe('main script', () => {
    let mockDownloadFiles;
    let mockPopulateDB;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.resetModules();
        mockDownloadFiles = jest.fn();
        mockPopulateDB = jest.fn();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test('runs downloadFiles and populateDB successfully', async () => {
        mockDownloadFiles.mockResolvedValue();
        mockPopulateDB.mockResolvedValue();

        await jest.isolateModulesAsync(async () => {
            jest.unstable_mockModule('../helpers/downloadFiles.js', () => ({
                downloadFiles: mockDownloadFiles
            }));
            jest.unstable_mockModule('../helpers/updateDB.js', () => ({
                populateDB: mockPopulateDB
            }));

            await import('../importData.js');
        });

        expect(mockDownloadFiles).toHaveBeenCalledTimes(1);
        expect(mockPopulateDB).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('logs error if downloadFiles fails', async () => {
        const testError = new Error('Download failed');
        mockDownloadFiles.mockRejectedValue(testError);

        await jest.isolateModulesAsync(async () => {
            jest.unstable_mockModule('../helpers/downloadFiles.js', () => ({
                downloadFiles: mockDownloadFiles
            }));
            jest.unstable_mockModule('../helpers/updateDB.js', () => ({
                populateDB: mockPopulateDB
            }));

            await import('../importData.js');
        });

        expect(mockDownloadFiles).toHaveBeenCalledTimes(1);
        expect(mockPopulateDB).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    });

    test('logs error if populateDB fails', async () => {
        mockDownloadFiles.mockResolvedValue();
        const testError = new Error('DB failed');
        mockPopulateDB.mockRejectedValue(testError);

        await jest.isolateModulesAsync(async () => {
            jest.unstable_mockModule('../helpers/downloadFiles.js', () => ({
                downloadFiles: mockDownloadFiles
            }));
            jest.unstable_mockModule('../helpers/updateDB.js', () => ({
                populateDB: mockPopulateDB
            }));

            await import('../importData.js');
        });

        expect(mockDownloadFiles).toHaveBeenCalledTimes(1);
        expect(mockPopulateDB).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    });
});