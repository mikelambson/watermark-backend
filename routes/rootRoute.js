// routes/rootRoute.js

import express from "express";
import { statusRouter, updateLogData } from "./statusRoute.js";
//  import { getLog, addToLog } from "../logger.js";

const rootRoute = express.Router();

////////////////////// ROOT /////////////////////

// define the home page route
rootRoute.get("/", (req, res) => {
  const clientIP = req.ip;
  const clientIPsocket = res.socket.remoteAddress;
  const reqHeaders = req.headers;
  console.log("\nRoot Page Requested | IP", clientIP, "\n", clientIPsocket, "\n");
  updateLogData(`Root Page Requested | IP: ${clientIP} | Host: ${reqHeaders.host}\n`);
  // Render the "home.ejs" template and pass the initial content for the <div>
  res.render("home", {
    pageTitle: "Home",
    initialContent: "STATUSLOG: ",
  });
});

export default rootRoute;
