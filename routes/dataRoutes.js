// routes/dataRoutes.js

import express from "express";
import path from "path";
import fs from "fs";
import dataLocation from "../config/locations.js";
import CSVParser from "../sources/csvParse.js"; 

const dataRouter = express.Router();
let directory = dataLocation.tcidLAN.goesFiles.path;

// Extract the keys from tcidLAN
const tcidLANKeys = Object.keys(dataLocation.tcidLAN);

// Create an array of objects containing the name and path properties
const locationOptions = tcidLANKeys.map((key) => {
  const location = dataLocation.tcidLAN[key];
  return { name: location.name, path: location.path };
});

////////////////////// Data Routes /////////////////////

dataRouter.get("/", async (req, res) => {
  const csvFilesDirectory = directory; // Update the path to your network location
  try {
    const csvFiles = fs
      .readdirSync(csvFilesDirectory)
      .filter((file) => file.endsWith(".csv"));

    const selectedCSVFile = req.query.csvFile || csvFiles[0];
    const selectedCSVPath = path.join(csvFilesDirectory, selectedCSVFile);

    if (selectedCSVPath) {
      const csvParser = new CSVParser(selectedCSVPath);
      const parsedData = await csvParser.readAndParse();

      // Define your location options here
      const locationOptions = [
        dataLocation.tcidLAN.goesFiles,
        dataLocation.tcidLAN.dataDrive,
        // Add more locations as needed
      ];

      res.render("data", {
        loading: true,
        data: parsedData,
        headers: Object.keys(parsedData[0]),
        csvFiles: csvFiles,
        locationOptions: locationOptions,
        selectedCSVFile: selectedCSVFile,
      });
    } else {
      res.status(404).send("CSV file not found");
    }
  } catch (err) {
    console.error("Error reading and parsing CSV files:", err);
    res.status(500).send("Internal Server Error");
  }
});

///////////// config ////////////// ...

dataRouter.get("/config", (req, res) => {
  // Read the JSON configuration file
  fs.readFile("./sources/sourceConfig.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Parse the JSON data and send it as a JSON response
    const configData = JSON.parse(data);
    res.json(configData);
  });
});

////////////////////////////////////////////////////////////////
// Add a new route for exporting raw CSV data
dataRouter.get("/raw/:csvName", async (req, res) => {
  const csvName = req.params.csvName;
  const csvFilePath = path.join(
    directory, // Update the path to your network location
    csvName + ".csv"
  );

  try {
    const csvParser = new CSVParser(csvFilePath);
    const rawData = await csvParser.readAndParse();

    res.json(rawData);
  } catch (err) {
    console.error("Error reading and parsing CSV file:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default dataRouter;
