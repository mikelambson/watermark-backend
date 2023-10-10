// models/csv/csvModel.js

import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

class CSVModel {
  constructor(filePath) {
    // Construct the file path relative to the module directory
    this.filePath = filePath;
    // Normalize the path to use forward slashes
    this.filePath = path.normalize(this.filePath);
  }

  async readAndParse() {
    return new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream(this.filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          results.push(row);
        })
        .on("end", () => {
          resolve(results);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }
}

export default CSVModel;
