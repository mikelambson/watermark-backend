import fs from "fs";
import path from "path";
import pkg from "papaparse"; //CommonJS modules can always be imported via the default export
const { parse } = pkg; //CommonJS module usage variable constructed

class CSVParser {
  constructor(filePath) {
    this.filePath = filePath;
    this.filePath = path.normalize(this.filePath);
  }

  async readAndParse() {
    return new Promise((resolve, reject) => {
      const results = [];

      fs.readFile(this.filePath, "utf8", (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        parse(data, {
          header: true, // Assuming the first row contains headers
          dynamicTyping: true, // Automatically convert numeric values
          skipEmptyLines: true, // Skip lines with empty values
          complete: (parsedData) => {
            resolve(parsedData.data);
          },
          error: (err) => {
            reject(err);
          },
        });
      });
    });
  }
}

export default CSVParser;
