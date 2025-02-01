const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();
require("./config/mongo-setup");

const routes = require("./routes/index");
const errorHandler = require("./handlers/error");
const successHandler = require("./handlers/success");
const { sessionConfig } = require("./config/session");

const app = express();
const port = 3000;

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(session(sessionConfig));

app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(successHandler, routes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
