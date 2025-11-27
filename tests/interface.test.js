/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
let module;

describe('Interface functions', () => {
    beforeEach(async () => {

        document.body.innerHTML = `
        <div id="form-body">
        <form id="search-form">

            <label>
                Име на населено място:
                <input type="text" name="town" id="town">
            </label>

            <label>
                Кметство:
                <input type="text" name="townhall" id="townhall">
            </label>

            <label>
                Община:
                <input type="text" name="municipality" id="municipality">
            </label>

            <label>
                Област:
                <input type="text" name="region" id="region">
            </label>

            <div class="button-row">
                <button type="submit">Търси</button>
                <button type="reset">Нулирай търсенето</button>
            </div>
        </form>
        </div>
          <div id="stats-body">
              <div class="stat-item">Брой редове: <span id="rows-count">0</span></div>
              <div class="stat-item">Брой селища: <span id="towns-count">0</span></div>
              <div class="stat-item">Брой кметства: <span id="townhalls-count">0</span></div>
              <div class="stat-item">Брой общини: <span id="municipalities-count">0</span></div>
              <div class="stat-item">Брой региони: <span id="regions-count">0</span></div>
          </div>
      
          <div id="table-body">
              <div id="table-error"></div>
              <table id="table">
                  <thead>
                      <tr>
                          <th>ID (ekatte)</th>
                          <th>Селище</th>
                          <th>Кметство</th>
                          <th>Община</th>
                          <th>Код на общината</th>
                          <th>Област</th>
                      </tr>
                  </thead>
                  <tbody id="table-tbody"></tbody>
              </table>
          </div>
        `;
        module = await import("../interface/script.js");
    });



    test("populateTable handles missing rows", () => {
        module.populateTable({});
        expect(document.querySelector("#table-tbody").children.length).toBe(0);
    });

    test("populateTable renders correct rows using provided mock data", () => {
        const mockData = {
            rowCount: 3,
            rows: [
                {
                    "id": "68120",
                    "type": "с.",
                    "town": "Софийци",
                    "townhall": "KRZ08-34",
                    "municipality": "Джебел",
                    "municipality_id": "KRZ08",
                    "region": "Кърджали"
                },
                {
                    "id": "68148",
                    "type": "с.",
                    "town": "Софрониево",
                    "townhall": "VRC28-05",
                    "municipality": "Мизия",
                    "municipality_id": "VRC28",
                    "region": "Враца"
                },
                {
                    "id": "68134",
                    "type": "гр.",
                    "town": "София",
                    "townhall": null,
                    "municipality": "Столична",
                    "municipality_id": "SOF46",
                    "region": "София (столица)"
                }
            ]
        };

        module.populateTable(mockData);

        const tbody = document.getElementById("table-tbody");
        const rows = tbody.querySelectorAll("tr");
        expect(rows.length).toBe(3);

        let cells = rows[0].querySelectorAll("td");
        expect(cells[0].textContent).toBe("68120");
        expect(cells[1].textContent).toBe("с. Софийци");
        expect(cells[2].textContent).toBe("KRZ08-34");
        expect(cells[3].textContent).toBe("Джебел");
        expect(cells[4].textContent).toBe("KRZ08");
        expect(cells[5].textContent).toBe("Кърджали");

        cells = rows[1].querySelectorAll("td");
        expect(cells[0].textContent).toBe("68148");
        expect(cells[1].textContent).toBe("с. Софрониево");
        expect(cells[2].textContent).toBe("VRC28-05");
        expect(cells[3].textContent).toBe("Мизия");
        expect(cells[4].textContent).toBe("VRC28");
        expect(cells[5].textContent).toBe("Враца");

        cells = rows[2].querySelectorAll("td");
        expect(cells[0].textContent).toBe("68134");
        expect(cells[1].textContent).toBe("гр. София");
        expect(cells[2].textContent).toBe("SOF46-00");
        expect(cells[3].textContent).toBe("Столична");
        expect(cells[4].textContent).toBe("SOF46");
        expect(cells[5].textContent).toBe("София (столица)");

        expect(document.getElementById("rows-count").textContent).toBe("3");
    });

    test("addRowCounts updates counters", () => {
        module.addRowCounts({
            towns: 10,
            townhalls: 5,
            municipalities: 2,
            regions: 1,
        });

        expect(document.getElementById("towns-count").textContent).toBe("10");
        expect(document.getElementById("townhalls-count").textContent).toBe("5");
        expect(document.getElementById("municipalities-count").textContent).toBe("2");
        expect(document.getElementById("regions-count").textContent).toBe("1");
    });

    test("handleError logs error, displays error message and clears table", () => {
        const testError = new Error("Something failed");
        const tableBody = document.getElementById("table-tbody");
        const errorDiv = document.getElementById("table-error");

        jest.spyOn(console, "error").mockImplementation(() => { });

        module.handleError(testError);

        expect(console.error).toHaveBeenCalledWith(
            "Error fetching data:",
            testError
        );

        expect(tableBody.innerHTML).toBe("");

        expect(errorDiv.textContent).toBe("Неуспешно зареждане на данните");
        expect(errorDiv.style.display).toBe("block");

        jest.restoreAllMocks();
    });

    test("initTable handles fetch errors and updates the UI through handleError", async () => {
        const error = new Error("Network failed");
        global.fetch = jest.fn().mockRejectedValue(error);

        document.getElementById("table-tbody").innerHTML = "<tr><td>test</td></tr>";

        // Mock console.error so it doesn’t pollute test output
        jest.spyOn(console, "error").mockImplementation(() => { });

        await module.initTable();

        const errorDiv = document.getElementById("table-error");

        expect(document.getElementById("table-tbody").innerHTML).toBe("");

        expect(errorDiv.textContent).toBe("Неуспешно зареждане на данните");
        expect(errorDiv.style.display).toBe("block");

        expect(console.error).toHaveBeenCalled();

        console.error.mockRestore();
    });

    test("initTable fetches data and updates table and counters", async () => {
        const mockTowns = {
            rows: [{ id: "1", type: "с.", town: "Тест", townhall: "T1", municipality: "X", municipality_id: "M1", region: "Y" }]
        };

        const mockCounts = {
            towns: 10,
            townhalls: 2,
            municipalities: 1,
            regions: 1
        };

        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                json: async () => mockTowns
            })
            .mockResolvedValueOnce({
                json: async () => mockCounts
            });

        await module.initTable();

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch).toHaveBeenCalledWith("http://127.0.0.1:3000/towns");
        expect(fetch).toHaveBeenCalledWith("http://127.0.0.1:3000/tables");

        const rows = document.querySelectorAll("#table-tbody tr");
        expect(rows.length).toBe(1);

        const cells = rows[0].querySelectorAll("td");

        expect(cells[0].textContent).toBe("1");
        expect(cells[1].textContent).toBe("с. Тест");
        expect(cells[2].textContent).toBe("T1")
        expect(cells[3].textContent).toBe("X");
        expect(cells[4].textContent).toBe("M1");
        expect(cells[5].textContent).toBe("Y");

        expect(document.getElementById("towns-count").textContent).toBe("10");
        expect(document.getElementById("townhalls-count").textContent).toBe("2");
        expect(document.getElementById("municipalities-count").textContent).toBe("1");
        expect(document.getElementById("regions-count").textContent).toBe("1");
    });

});