// Account management: farmer profile and settings (password change).

const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();
const SALT_ROUNDS = 12;

router.get("/farmer-profile", (req, res) => {
  const profile = db
    .prepare(
      "SELECT farmer_id, fullname, phone, email, county, farm_location, farm_name, registration_date FROM Farmers WHERE farmer_id = ?"
    )
    .get(req.session.farmer.farmer_id);
  res.render("farmer-profile.ejs", {
    profile,
    message: req.query.message === "saved" ? "Profile updated successfully." : null,
  });
});

router.post("/farmer-profile", (req, res) => {
  const { fullname, phone, county, farm_location, farm_name } = req.body;
  db.prepare(
    "UPDATE Farmers SET fullname = ?, phone = ?, county = ?, farm_location = ?, farm_name = ? WHERE farmer_id = ?"
  ).run(fullname, phone, county, farm_location, farm_name, req.session.farmer.farmer_id);
  req.session.farmer.fullname = fullname;
  res.redirect("/farmer-profile?message=saved");
});

router.get("/settings", (req, res) => {
  const message = req.query.message;
  let feedback = null;
  if (message === "changed") feedback = "Password changed successfully.";
  else if (message === "wrong") feedback = "Current password is incorrect.";
  else if (message === "mismatch") feedback = "New passwords do not match.";
  res.render("settings.ejs", { message: feedback });
});

router.post("/settings", (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  if (!new_password || new_password !== confirm_password) {
    return res.redirect("/settings?message=mismatch");
  }
  const user = db
    .prepare("SELECT password FROM Farmers WHERE farmer_id = ?")
    .get(req.session.farmer.farmer_id);
  if (!user || !bcrypt.compareSync(current_password || "", user.password)) {
    return res.redirect("/settings?message=wrong");
  }
  db.prepare("UPDATE Farmers SET password = ? WHERE farmer_id = ?").run(
    bcrypt.hashSync(new_password, SALT_ROUNDS),
    req.session.farmer.farmer_id
  );
  res.redirect("/settings?message=changed");
});

module.exports = router;
