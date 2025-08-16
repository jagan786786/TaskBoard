const express = require("express");
const dotenv = require("dotenv");
const connectToDb = require("./db/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const userRoutes = require('./routes/UserRoutes');
dotenv.config();

connectToDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//routing of different models
app.use('/api/auth',userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
