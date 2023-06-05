require("dotenv").config();
const express = require("express");
const db = require("./configs/db");
const cors = require("cors");
const app = express();
const port = 3000;
const route = require("./routes");
// const bodyParser = require("body-parser");
// Connect database
db.connect();

app.use(express.json({ limit: "300mb" }));
app.use(express.urlencoded({ extended: false, limit: "300mb" }));
app.use(cors());
// Routes init
route(app);

app.listen(port, () => console.log(`App listening at localhost:${port}`));
