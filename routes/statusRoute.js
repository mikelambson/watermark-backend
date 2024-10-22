// routes/statusRoute.js

import express from "express";
import { getLog, addToLog } from "@/logger.js";


const statusRouter = express.Router();

////////////////////// STATUS /////////////////////


const clients = [];
statusRouter.get("/events", async function (req, res) {
  console.log("Got /status/events");
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  // Tell the client to retry every 10 seconds if connectivity is lost
  res.write("retry: 10000\n\n");
  let count = 0;

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ++count;
    // Emit an SSE that contains the current 'count' as a string
    res.write(`data: ${count}\n\n`);
  }
});

statusRouter.get("/", (req, res, next) => {
  const timestamp = new Date().toLocaleString();
  const initMessage = JSON.stringify({'INITIALIZATION ':'STARTING SERVER' });
  const headers = {
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "X-Accel-Buffering": "no",
  };
  
  res.writeHead(200, headers);
  res.flushHeaders();
  res.write("retry: 10000\n\n");
  res.write(`data: ${initMessage}\n\n`);
  
  // Send existing log data to the new client
  sendLogDataToClient(res);
  // Add the new client to the list
  clients.push(res);

  // Handle client disconnection
  req.on("close", () => {
    clients.splice(clients.indexOf(res), 1);
  });
});

// Function to send log data to a specific client
function sendLogDataToClient(client) {
  
  // Get the last sent timestamp for this client
  const lastSentTimestamp = client.lastSentTimestamp || null;
  // Get the log entries
  const logEntries = Object.entries(getLog());
  // Find the index of the last sent timestamp
  const lastIndex = lastSentTimestamp
    ? logEntries.findIndex(([timestamp]) => timestamp === lastSentTimestamp)
    : -1;

  
  // Inside sendLogDataToClient function
  for (let i = lastIndex + 1; i < logEntries.length; i++) {
    const [timestamp, message] = logEntries[i];
    // const eventName = "Statuslog"; // Specify an event name, e.g., "logUpdate"
    const eventData = JSON.stringify({ [timestamp]: message });

    client.write(`data: ${eventData}\n\n`);
  }
  // Update the last sent timestamp for this client
  if (logEntries.length > 0) {
    client.lastSentTimestamp = logEntries[logEntries.length - 1][0];
  }
}

// Update log data and notify connected clients
function updateLogData(message) {
  addToLog(message);

  // Notify all connected clients about the updated log data
  clients.forEach((client) => {
    sendLogDataToClient(client);
  });
}

export { statusRouter, updateLogData };
