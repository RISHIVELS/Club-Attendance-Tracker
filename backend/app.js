require("dotenv").config({ path: "./.env" });
const express = require("express");
const morgan = require("morgan");
require("express-async-handler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// FIX: Use only ONE CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// REMOVE THIS LINE: app.use(cors());

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
// app.use(
//   cookieParser({
//     secret: process.env.JWT_SECRET,
//     httpOnly: true,
//   })
// );

// import db connection
const connectDB = require("./db/connect");

// import routes
const eventRoute = require("./routes/eventRoute");
const teamRoute = require("./routes/teamRoute");
const coordinatorRoute = require("./routes/coordinatorRoute");
const scannerRoute = require("./routes/scannerRoute");
const analyticsRoute = require("./routes/analyticsRoute");

// routes
app.use("/api/v1/events", eventRoute);
app.use("/api/v1/teams", teamRoute);
app.use("/api/v1/coordinators", coordinatorRoute);
app.use("/api/v1/attendance", scannerRoute);
app.use("/api/v1/analytics", analyticsRoute);

// not found middleware
app.use((req, res, next) => {
  res.status(404).send("Route not found");
});

// error handler middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something broke!");
});

// PORT - FIX: Your console log says port 3000 but PORT is set to 5000
const PORT = process.env.PORT || 3000; // Change to 3000 to match your actual port

// server setup
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});
