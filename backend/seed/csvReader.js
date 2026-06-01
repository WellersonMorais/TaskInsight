const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

class CsvReader {
  constructor(basePath) {
    this.basePath = basePath;
  }

  async read(fileName) {
    return new Promise((resolve, reject) => {
      const rows = [];

      fs.createReadStream(path.join(this.basePath, fileName))
        .pipe(csv())
        .on("data", row => rows.push(row))
        .on("end", () => resolve(rows))
        .on("error", reject);
    });
  }
}

module.exports = CsvReader;