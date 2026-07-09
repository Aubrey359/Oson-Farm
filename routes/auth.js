// Authentication: registration, login, logout.

const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();
const SALT_ROUNDS = 12;

router.get("/register", (req, res) => {
  res.render("register.ejs");
});

router.post("/register", (req, res) => {
  const { email, phone, password, fullname, farm_location, farm_name, county } =
    req.body;
  if (!email || !password || !fullname) {
    return res.status(400).send("Full name, email and password are required.");
  }
  const exists = db
    .prepare("SELECT email FROM Farmers WHERE email = ?")
    .get(email);
  if (exists) return res.redirect("/login?message=exists");

  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
  db.prepare(
    "INSERT INTO Farmers (fullname, phone, email, password, farm_name, farm_location, county) VALUES (?,?,?,?,?,?,?)"
  ).run(fullname, phone, email, hashedPassword, farm_name, farm_location, county);
  res.redirect("/login?message=success");
});

router.get("/login", (req, res) => {
  const message = req.query.message;
  if (message === "exists") {
    res.locals.message = "Email already exists. Please login.";
  } else if (message === "success") {
    res.locals.message = "Registration successful. Please login.";
  } else if (message === "invalid") {
    res.locals.message = "Invalid email or password. Try again";
  } else if (message === "unauthorized") {
    res.locals.message = "Please login to access that page.";
  }
  res.render("login.ejs");
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db
    .prepare(
      "SELECT farmer_id, email, fullname, password FROM Farmers WHERE email = ?"
    )
    .get(email);
  if (!user || !bcrypt.compareSync(password || "", user.password)) {
    return res.redirect("/login?message=invalid");
  }
  req.session.farmer = {
    farmer_id: user.farmer_id,
    email: user.email,
    fullname: user.fullname,
  };
  res.redirect("/dashboard");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;
