const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const isWindows = process.platform === 'win32';
const inProgressSymbol = '○';  // Circle symbol
const inProgressMessage = "Getting line count ...";
const successSymbol = '✓';     // Checkmark symbol
const currentCountMessage = "The current line count is:";
const updatingMessage = "Updating package.json linecount ..."
const successMessage = "Updated package.json with current line count.";

console.log(chalk.bold`${inProgressSymbol} {reset ${inProgressMessage}}`);

const command = isWindows
  ? 'PowerShell -Command "Get-Content $(git ls-files) | Measure-Object -Line | Select-Object -ExpandProperty Lines"'
  : 'git ls-files | xargs wc -l';

// execSync(command, { stdio: 'inherit' });
const lineCount = parseInt(execSync(command, { encoding: 'utf-8' }).trim(), 10);

console.log(chalk.green.bold`${successSymbol} {white ${currentCountMessage}} {blueBright ${lineCount}}`);
console.log(chalk.bold`${inProgressSymbol} {reset ${updatingMessage}}`);

const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

packageJson.linecount = lineCount;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(chalk.green.bold`${successSymbol} {reset ${successMessage}}\n\n`);