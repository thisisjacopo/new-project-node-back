const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
require("dotenv").config();

// const authRouter = require("./routes/authRouter");
// const usersRouter = require("./routes/usersRouter");
// const scenesRouter = require("./routes/scenesRouter");

// MONGOOSE CONNECTION
mongoose
//NEEDING NEW CLUSTER AND CONNECTION FROM ATLAS, THEN BUILD ROUTERS, CHECK DOC FOR MONGODB 4.4
  .connect(process.env.MONGODB_URI, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log(`Connected to database`))
  .catch((err) => console.error(err));

// mongoose
//   .connect(process.env.MONGODB_URI, {
//     keepAlive: true,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//   })

//   .then(() => console.log(`Connected to database`))
//   .catch((err) => console.error(err));

// EXPRESS SERVER INSTANCE
const app = express();

// CORS MIDDLEWARE SETUP
// app.use(
//   cors({
//     credentials: true,
//     origin: [process.env.PUBLIC_DOMAIN],
//   })
// );
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_DOMAIN );
//   res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });

// SESSION MIDDLEWARE
app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 * 30 * 6, // 6 months
    }),
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// MIDDLEWARE
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ROUTER MIDDLEWARE
// app.use("/auth", authRouter);
// app.use("/users", usersRouter);
// app.use("/scenes", scenesRouter);

// ERROR HANDLING
// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({ code: "not found" });
});

app.use((err, req, res, next) => {
  // always log the error
  console.error("ERROR", req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    const statusError = err.status || "500";
    res.status(statusError).json(err);
  }
});

module.exports = app;
