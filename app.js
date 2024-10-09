// app.js

//////////////////// Import Controllers ////////////////////
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { PORT } from "./config/config.js";
import cookieParser from "cookie-parser";

import router from "./routes/router.js";
import { updateLogData } from "./routes/statusRoute.js";
import { checkDatabaseConnection } from "./utils/dbStatus.js";
import errorHandler from "./middleware/errorHandler.js";

// ////////////////////////////////////////////////////////////
const __filename = fileURLToPath(import.meta.url); // Convert import.meta.url to __filename
const __dirname = path.dirname(__filename); // Convert __filename to __dirname
let initMessage = [];

//////////////////// Controllters ////////////////////

//////////////////// Construct App ////////////////////
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.use("/", router);

////////////////// Server Startup ////////////////
async function startup() {
  await checkDatabaseConnection();
}

////////////////// Error Handling ///////////////
// Global error handling middleware
app.use(errorHandler)



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startup()
});

//////////////////////////////////////////////////////
