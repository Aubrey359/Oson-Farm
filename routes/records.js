// Record keeping: expenses, vaccination, medication, feed consumption.

const express = require("express");
const db = require("../db");
const queries = require("../db/queries");

const router = express.Router();
const ownsAnimal = db.prepare(queries.ownsAnimal);
const ownedAnimals = db.prepare(queries.ownedAnimals);

// --- Expenses ---

router.get("/expenses", (req, res) => {
  const farmerId = req.session.farmer.farmer_id;
  const expenses = db
    .prepare(
      "SELECT * FROM Expenses WHERE farmer_id = ? ORDER BY expense_date DESC"
    )
    .all(farmerId);
  const total = db
    .prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM Expenses WHERE farmer_id = ?")
    .get(farmerId).total;
  res.render("expenses.ejs", { expenses, total });
});

router.post("/expenses", (req, res) => {
  const { expense_date, expense_type, description, amount } = req.body;
  db.prepare(
    "INSERT INTO Expenses (expense_date, expense_type, description, amount, farmer_id) VALUES (?,?,?,?,?)"
  ).run(expense_date, expense_type, description, amount, req.session.farmer.farmer_id);
  res.redirect("/expenses");
});

// --- Vaccination ---

router.get("/vaccination", (req, res) => {
  const farmerId = req.session.farmer.farmer_id;
  const vaccinations = db
    .prepare(
      `SELECT v.*, a.name AS animal_name FROM Vaccination v
       JOIN Animal a ON v.animal_id = a.animal_tag
       WHERE a.owner_id = ? ORDER BY v.date_administered DESC`
    )
    .all(farmerId);
  res.render("vaccination.ejs", { vaccinations, animals: ownedAnimals.all(farmerId) });
});

router.post("/vaccination", (req, res) => {
  const { animal_id, vaccine_name, date_administered, next_due_date, notes } =
    req.body;
  if (!ownsAnimal.get(animal_id, req.session.farmer.farmer_id)) {
    return res.status(403).send("That animal does not belong to your farm.");
  }
  db.prepare(
    "INSERT INTO Vaccination (animal_id, vaccine_name, date_administered, next_due_date, notes) VALUES (?,?,?,?,?)"
  ).run(animal_id, vaccine_name, date_administered, next_due_date || null, notes);
  res.redirect("/vaccination");
});

// --- Medication ---

router.get("/medication", (req, res) => {
  const farmerId = req.session.farmer.farmer_id;
  const medications = db
    .prepare(
      `SELECT m.*, a.name AS animal_name FROM Medication m
       JOIN Animal a ON m.animal_id = a.animal_tag
       WHERE a.owner_id = ? ORDER BY m.start_date DESC`
    )
    .all(farmerId);
  res.render("medication.ejs", { medications, animals: ownedAnimals.all(farmerId) });
});

router.post("/medication", (req, res) => {
  const {
    animal_id,
    medication_name,
    dose,
    start_date,
    end_date,
    veterinary_name,
    notes,
  } = req.body;
  if (!ownsAnimal.get(animal_id, req.session.farmer.farmer_id)) {
    return res.status(403).send("That animal does not belong to your farm.");
  }
  db.prepare(
    "INSERT INTO Medication (animal_id, medication_name, dose, start_date, end_date, veterinary_name, notes) VALUES (?,?,?,?,?,?,?)"
  ).run(animal_id, medication_name, dose, start_date, end_date || null, veterinary_name, notes);
  res.redirect("/medication");
});

// --- Feed consumption ---

router.get("/feed-consumption", (req, res) => {
  const farmerId = req.session.farmer.farmer_id;
  const feeds = db
    .prepare(
      `SELECT fc.*, a.name AS animal_name FROM FeedConsumption fc
       JOIN Animal a ON fc.animalfed = a.animal_tag
       WHERE a.owner_id = ? ORDER BY fc.date DESC LIMIT 50`
    )
    .all(farmerId);
  res.render("feed-consumption.ejs", { feeds, animals: ownedAnimals.all(farmerId) });
});

router.post("/feed-consumption", (req, res) => {
  const { animalfed, quantity, type, cost, date } = req.body;
  if (!ownsAnimal.get(animalfed, req.session.farmer.farmer_id)) {
    return res.status(403).send("That animal does not belong to your farm.");
  }
  db.prepare(
    "INSERT INTO FeedConsumption (animalfed, quantity, type, cost, date) VALUES (?,?,?,?,?)"
  ).run(animalfed, quantity, type, cost, date || new Date().toISOString().slice(0, 19).replace("T", " "));
  res.redirect("/feed-consumption");
});

module.exports = router;
