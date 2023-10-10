// logger.js

const logObject = {};
const maxLogItems = 100; // Adjust as needed

function addToLog(message) {
  const timestamp = new Date().toLocaleString();
  logObject[timestamp] = message;

  if (Object.keys(logObject).length > maxLogItems) {
    const oldestTimestamp = Object.keys(logObject)[0];
    delete logObject[oldestTimestamp];
  }

  // Optionally, you can trigger a callback here to notify about the new log message
  if (addToLog.callback) {
    addToLog.callback(logObject);
  }
}

function getLog() {
  return logObject;
}

addToLog('-- SERVER STARTED --')

export { addToLog, getLog };
