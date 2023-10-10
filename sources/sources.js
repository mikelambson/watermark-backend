const fs = require("fs");

// Read the JSON file
fs.readFile("sources.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    return;
  }

  // Parse the JSON data
  const sourceData = JSON.parse(data);

  // Access and use the source information as needed
  const sources = sourceData.sources;
  sources.forEach((source) => {
    console.log("Source Name:", source.name);
    console.log("LAN Location:", source.lanLocation);
    console.log("Remote Location:", source.remoteLocation);
    console.log("Local Folder:", source.localFolder);
    console.log("Set To:", source.setTo);
    console.log("---");
  });
});
