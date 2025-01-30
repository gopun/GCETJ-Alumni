const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
dotenv.config();
require("./config/mongo-setup");

const routes = require("./routes/index");
const errorHandler = require("./handlers/error");
const successHandler = require("./handlers/success");

const app = express();
const port = 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_STRING,
      collectionName: "sessions",
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    },
  })
);

app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
  })
);

console.log("\n process.env.FRONT_END_URL..", process.env.FRONT_END_URL);
console.warn("\n process.env.FRONT_END_URL..", process.env.FRONT_END_URL);
console.warn("\n process.env..", process.env);

app.use(express.json());

app.use(successHandler, routes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export const config = {
  api: {
    bodyParser: false, // Disables Vercel's body parser
  },
};
