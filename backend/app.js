const express = require("express");
const dotenv = require("dotenv");
const connectToDb = require("./db/db");
const cors = require("cors");
const app = express();
const errorHandler = require('./middlewares/errorHandler.middlewares');
const userRoutes = require('./routes/UserRoutes');
const taskRoutes = require('./routes/TaskRoutes');
const commentRoutes = require('./routes/CommentRoutes');
dotenv.config();

connectToDb();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,              
  })
);app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth',userRoutes);
app.use('/api/task',taskRoutes);
app.use('/api/comment',commentRoutes)

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
