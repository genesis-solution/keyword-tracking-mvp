require("dotenv").config();

const express = require("express");
const app = express();
const port = 5000;

const trackController = require("./controllers/trackController");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/track/:type/:prompt/:keyword", trackController.trackKeyword);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
