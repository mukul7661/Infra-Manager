const express = require("express");
const authRoutes = require("./routes/authRoutes");
const deployRoutes = require("./routes/deployRoutes");
const { authenticateJWT } = require("./middleware/authMiddleware");
const { connectDB } = require("./config/db");
const appRoutes = require("./routes/appRoutes");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
connectDB();
// require("./cronJobs");
// const { initKafkaConsumer } = require("./utils/kafkaService");
const { app, server } = require("./socket");

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // preflightContinue: true,
  })
);

app.use("/auth", authRoutes);
app.use("/deploy", authenticateJWT, deployRoutes);
app.use("/apps", authenticateJWT, appRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  // await initKafkaConsumer();
  console.log(`Server running on port ${PORT}`);
});
