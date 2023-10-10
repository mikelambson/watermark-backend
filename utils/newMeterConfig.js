const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Example user input
const userInput = {
  name: "A1",
  sourceType: "file",
  sourceLocation: "path/to/A1-data.csv",
  ignoreLines: 1,
  commentChar: "#",
  fields: [
    {
      name: "DateTime",
      type: "Sequelize.DATE",
      primaryKey: true,
      sourceField: "DateTime",
    },
    {
      name: "StationName",
      type: "Sequelize.STRING",
      primaryKey: true,
      sourceField: "StationName",
    },
    { name: "Stage", type: "Sequelize.FLOAT", sourceField: "HG" },
    { name: "FlowRate", type: "Sequelize.FLOAT", sourceField: "HGQ" },
    { name: "BatteryVoltage", type: "Sequelize.FLOAT", sourceField: "VB" },
  ],
};

// Output file path
const outputPath = path.join("models", "meters", `${userInput.name}.jsx`);

// Check if the file already exists
if (fs.existsSync(outputPath)) {
  rl.question(
    `File ${outputPath} already exists. Do you want to overwrite it? (yes/no): `,
    (answer) => {
      if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
        createConfigFile();
      } else {
        console.log("Operation cancelled.");
        rl.close();
      }
    }
  );
} else {
  createConfigFile();
}

function createConfigFile() {
  // Create the .jsx content
  const jsxContent = `
  const config = {
    name: '${userInput.name}',
    source: {
      type: '${userInput.sourceType}',
      location: '${userInput.sourceLocation}',
      ignoreLines: ${userInput.ignoreLines},
      commentChar: '${userInput.commentChar}'
    },
    fields: {
      ${userInput.fields
        .map(
          (field) => `
        ${field.name}: {
          type: ${field.type},
          ${field.primaryKey ? "primaryKey: true," : ""}
          sourceField: '${field.sourceField}'
        }`
        )
        .join(",\n")}
    }
  };
  
  export default config;
  `;

  // Write the .jsx file
  fs.writeFileSync(outputPath, jsxContent);

  console.log(
    `Meter configuration for ${userInput.name} created at ${outputPath}`
  );
  rl.close();
}
