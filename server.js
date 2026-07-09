// Oson Farm — application entry point.
// App setup and middleware live here; page logic lives in routes/,
// database setup and queries in db/, view helpers in lib/.

const express = require("express");
const path = require("path");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const farmRoutes = require("./routes/farm");
const recordRoutes = require("./routes/records");
const accountRoutes = require("./routes/account");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

// middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-only-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
  })
);

// landing page (public)
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// authentication (public)
app.use(authRoutes);

// everything below requires a logged-in farmer
app.use((req, res, next) => {
  if (req.session && req.session.farmer) {
    res.locals.farmer = req.session.farmer;
    return next();
  }
  res.redirect("/login?message=unauthorized");
});

app.use(farmRoutes);
app.use(recordRoutes);
app.use(accountRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
