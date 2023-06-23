require("dotenv").config();
const express = require("express");
const db = require("./configs/db");
const cors = require("cors");
const app = express();
const route = require("./routes");
// const bodyParser = require("body-parser");
// Connect database
db.connect();

app.use(express.json({ limit: "300mb" }));
app.use(express.urlencoded({ extended: false, limit: "300mb" }));
app.use(cors());
app.options("*", cors());
// Routes init
route(app);

app.listen(process.env.PORT, () => console.log(`App listening at localhost:${process.env.PORT}`));
