const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const port = process.env.PORT || 3001;

const json = require("body-parser");
app.use(bodyParser.json());

const todoRoutes = require("./routes/budget");

// Router
app.use(express.static(path.join(__dirname, "../client/build")), todoRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`listening on *:${port}`);
});
