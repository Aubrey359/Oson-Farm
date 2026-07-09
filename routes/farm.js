// Core farm pages: dashboard, animal profiles, milk production.

const express = require("express");
const db = require("../db");
const queries = require("../db/queries");
const utils = require("../lib/utils");

const router = express.Router();
const ownsAnimal = db.prepare(queries.ownsAnimal);

router.get("/dashboard", (req, res) => {
  const records = db
    .prepare(queries.productionRecordsForFarmer)
    .all(req.session.farmer.farmer_id);
  res.render("dashboard.ejs", { groupedData: utils.groupAndExtractLatest(records) });
});

router.get("/animal-profiles", (req, res) => {
  const farmerId = req.session.farmer.farmer_id;
  const productions = db
    .prepare(queries.animalsProductionsForFarmer)
    .all(farmerId);
  const allAnimalsForFarmer = db
    .prepare("SELECT * FROM Animal WHERE owner_id = ?")
    .all(farmerId);
  res.render("animal-profiles.ejs", {
    animals: utils.getChartData(productions),
    allAnimalsForFarmer,
  });
});

router.post("/new-animal", (req, res) => {
  let { animal_tag, dob, purchase_date, breed, name, source, gender, status } =
    req.body;
  if (!purchase_date) purchase_date = null;
  try {
    db.prepare(
      "INSERT INTO Animal (animal_tag, name, dob, purchase_date, breed, status, source, gender, owner_id) VALUES (?,?,?,?,?,?,?,?,?)"
    ).run(
      animal_tag,
      name,
      dob,
      purchase_date,
      breed,
      status,
      source,
      gender,
      req.session.farmer.farmer_id
    );
  } catch (err) {
    return res
      .status(400)
      .send(
        `Could not register animal (is the tag "${animal_tag}" already in use?). Go back and try a different tag.`
      );
  }
  res.redirect("/animal-profiles");
});

router.get("/milk-production", (req, res) => {
  const productions = db
    .prepare(queries.recentProductionsForFarmer)
    .all(req.session.farmer.farmer_id);
  res.render("milk-production.ejs", { productions });
});

router.get("/add-milk-production", (req, res) => {
  const animals = db
    .prepare(
      "SELECT animal_tag, name FROM Animal WHERE owner_id = ? AND status = 'Alive' AND gender = 'Female'"
    )
    .all(req.session.farmer.farmer_id);
  res.render("add-milk-production.ejs", { animals });
});

router.post("/add-milk-production", (req, res) => {
  let { animal_unique_val, production_date, production_time, quantity, quality } =
    req.body;
  quality = quality || "High";
  if (!ownsAnimal.get(animal_unique_val, req.session.farmer.farmer_id)) {
    return res.status(403).send("That animal does not belong to your farm.");
  }
  db.prepare(
    "INSERT INTO MilkProduction (animal_id, production_date, production_time, quantity, quality) VALUES (?,?,?,?,?)"
  ).run(animal_unique_val, production_date, production_time, quantity, quality);
  res.redirect("/milk-production");
});

module.exports = router;
