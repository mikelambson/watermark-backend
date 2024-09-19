// routes/router.js

import express from "express";
import rootRoute from "./rootRoute.js";
import dataRouter from "./dataRoutes.js";
import { statusRouter, updateLogData } from "./statusRoute.js";
import api from "./apiRoutes.js";
import auth from "./auth/auth.js"

const router = express.Router();

////////////////////// Routes /////////////////////

// middleware that is specific to this router
router.use((req, res, next) => {
  res.locals.pageTitle = "WaterMARK Backend";
  console.log("Time: ", new Date(Date.now()).toLocaleString());
  next();
});

// Define the about route
router.get("/about", (req, res) => {
  updateLogData(`About Requested`);
  res.render("about"); // Render the "about.ejs" template
});

///// Modules /////
router.use("/", rootRoute);
router.use("/status", statusRouter);
router.use("/data", dataRouter);
router.use("/api", api);
router.use("/auth", auth);

//////////////////////////////////////////////////

export default router;
