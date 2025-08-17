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

const allowList = new Set(
  [
    process.env.CLIENT_URL,       
    "http://localhost:5173",      
  ].filter(Boolean)
);

const corsOptionsDelegate = function (req, callback) {
  const requestOrigin = req.header("Origin");
  const isAllowed = !requestOrigin || allowList.has(requestOrigin);
  const corsOptions = {
    origin: isAllowed ? requestOrigin : false,
    credentials: true,
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  };
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.options("*", cors(corsOptionsDelegate));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth',userRoutes);
app.use('/api/task',taskRoutes);
app.use('/api/comment',commentRoutes)

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
