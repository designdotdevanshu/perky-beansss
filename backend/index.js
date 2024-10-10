const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const env = process.env.NODE_ENV;

// Define the path to the frontend dist directory
const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database CONNECTED");
  })
  .catch((err) => {
    console.log("Database ERROR", err);
  });

app.use(
  cors({
    origin: "http://localhost:3000",
    // credentials: true,
  }),
);

if (env === "DEVELOPMENT") {
  app.use(require("./routes/gateway/webHook"));
} else {
  app.use("/api", require("./routes/gateway/webHook"));
}

// Cokkies Creation
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
app.use(cookieParser());

if (env === "DEVELOPMENT") {
  app.use(require("./auth"));
  app.use(require("./routes/index"));
} else {
  app.use(`/api`, require("./auth"));
  app.use(`/api`, require("./routes/index"));
}

app.use(require("./auth"));

app.use(express.static(frontendDistPath));

app.get("/healthz", (req, res) => {
  res.status(200).send("Server is running");
});

app.get("/", (req, res) => {
  res.status(200).sendFile(frontendDistPath);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Serving static files from: ${frontendDistPath}`);
  console.log(`Server is running on http://localhost:${port}`);
});
