// routes/rootRoute.js

import express from "express";
import { statusRouter, updateLogData } from "./statusRoute.js";
//  import { getLog, addToLog } from "../logger.js";

const rootRoute = express.Router();

////////////////////// ROOT /////////////////////

// define the home page route
rootRoute.get("/", (req, res) => {
  console.log("Root Requested");
  updateLogData(`Root Page Requested`);
  // Render the "home.ejs" template and pass the initial content for the <div>
  res.render("home", {
    pageTitle: "Home",
    initialContent: "STATUSLOG: ",
  });
});

export default rootRoute;
