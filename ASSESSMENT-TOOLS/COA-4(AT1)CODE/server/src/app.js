const express = require("express");
const cors = require("cors");

const turbinesRouter = require("./routes/turbines");
const alertsRouter = require("./routes/alerts");
const optimizationRouter = require("./routes/optimization");
const weatherRouter = require("./routes/weather");
const maintenanceRouter = require("./routes/maintenance");
const analyticsRouter = require("./routes/analytics");
const { notFound, errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ status: "ok", service: "smart-offshore-windfarm-platform" }));

  app.use("/api/turbines", turbinesRouter);
  app.use("/api/alerts", alertsRouter);
  app.use("/api/optimization", optimizationRouter);
  app.use("/api/weather", weatherRouter);
  app.use("/api/maintenance", maintenanceRouter);
  app.use("/api/analytics", analyticsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
