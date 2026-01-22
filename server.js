const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const path = require("path");


app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const comicsController = require("./controllers/comics.js");
const authController = require("./controllers/auth.js");
const usersController = require("./controllers/users.js");

const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

const port = process.env.PORT ? process.env.PORT : "3000";

//Database ---------------------------------------------------------------

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

//middleware-------------------------------------------------------------
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  })
);

app.use(passUserToView);
// HOME ROUTE
app.get("/", (req, res) => {
  res.render("index", {
    user: req.session.user,
  });
});

app.get("/test-comics", isSignedIn, async (req, res) => {
  const Comic = require("./models/comic");
  const comics = await Comic.find({ user: req.session.user._id });
  res.json(comics);
});

app.get("/drop-comic-index", async (req, res) => {
  const Comic = require("./models/comic");
  try {
    await Comic.collection.dropIndex("user_1_title_1_issueNumber_1");
    res.send("Index dropped! Now you can have duplicate comics.");
  } catch (err) {
    res.send(`Error: ${err.message}`);
  }
});

app.get("/vip-lounge", (req, res) => {
  if (req.session.user) {
    res.send(`Welcome to the party ${req.session.user.username}.`);
  } else {
    res.send("Sorry, no guests allowed.");
  }
});



app.use("/auth", authController);
app.use("/users", usersController);
app.use("/users/:userId/comics", isSignedIn, comicsController);


app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});