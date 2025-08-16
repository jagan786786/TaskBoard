const express = require("express");
const dotenv = require("dotenv");
const connectToDb = require("./db/db");
const app = express();
dotenv.config();

connectToDb();

app.get('/',(req,res)=>{
    res.send("Hello World");
})


module.exports = app;