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
// sample tyest1
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "https://radiant-yeot-e18c90.netlify.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//gfghhdgfchgvdfdghjhgfdsadfghj
app.use('/api/auth',userRoutes);
app.use('/api/task',taskRoutes);
app.use('/api/comment',commentRoutes)

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
