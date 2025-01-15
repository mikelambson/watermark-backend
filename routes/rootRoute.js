// routes/rootRoute.js

import express from "express";
import { statusRouter, updateLogData } from "./statusRoute.js";
//  import { getLog, addToLog } from "../logger.js";

const rootRoute = express.Router();

////////////////////// ROOT /////////////////////

// define the home page route
rootRoute.get("/", (req, res) => {
  const userAgent = req.headers['user-agent'] || null; // Get user agent
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
  // const clientIP = req.ip;
  console.log("\n--Root Page Requested | IP", ipAddress, "\n");
  updateLogData(`Root Page Requested | IP: ${ipAddress} | User Agent: ${userAgent}`);
  // Render the "home.ejs" template and pass the initial content for the <div>
  res.render("home", {
    pageTitle: "Home",
    initialContent: "STATUSLOG: ",
  });
});

export default rootRoute;
