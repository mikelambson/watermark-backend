// routes/router.js

import express from "express";
import rootRoute from "./rootRoute.js";
import dataRouter from "./dataRoutes.js";
import { statusRouter, updateLogData } from "./statusRoute.js";
import api from "./apiRoutes.js";
import auth from "./auth/authRoutes.js"
import requestheaders from "./getIProute.js";

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
router.use("/ip", requestheaders);

//////////////////////////////////////////////////

// Centralized error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack for debugging
  res.status(500).send("Something went wrong! Please try again later."); // Send user-friendly error message
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason); 
  // You might want to log this error to your logging system
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  // You might want to log this error to your logging system
  // Optionally restart the server if necessary
});


export default router;
