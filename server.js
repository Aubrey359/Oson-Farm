const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const db = require("./db.js");
const sqlQueries = require("./sqlStatement.js");
const utils = require("./utils.js");

const app = express();
const PORT = process.env.PORT || 3000;
const SALT_ROUNDS = 12;

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

// authorization middleware: everything except these paths requires login
const publicPaths = ["/", "/login", "/register", "/logout"];
app.use((req, res, next) => {
  if (publicPaths.includes(req.path)) return next();
  if (req.session && req.session.farmer) {
    res.locals.farmer = req.session.farmer;
    return next();
  }
  res.redirect("/login?message=unauthorized");
});

// prepared statements shared by several routes
const getOwnedAnimals = db.prepare(
  "SELECT animal_tag, name FROM Animal WHERE owner_id = ? ORDER BY animal_tag"
);
const ownsAnimal = db.prepare(
  "SELECT 1 FROM Animal WHERE animal_tag = ? AND owner_id = ?"
);

// root route/landing page
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Authentication routes
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/login", (req, res) => {
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

app.post("/register", (req, res) => {
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

app.post("/login", (req, res) => {
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

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Dashboard
app.get("/dashboard", (req, res) => {
  const records = db
    .prepare(sqlQueries.productionRecordsForFarmer)
    .all(req.session.farmer.farmer_id);
  res.render("dashboard.ejs", { groupedData: utils.groupAndExtractLatest(records) });
});

// Animals
app.get("/animal-profiles", (req, res) => {
  const farmerId = req.session.farmer.farmer_id;
  const productions = db
    .prepare(sqlQueries.animalsProductionsForFarmer)
    .all(farmerId);
  const allAnimalsForFarmer = db
    .prepare("SELECT * FROM Animal WHERE owner_id = ?")
    .all(farmerId);
  res.render("animal-profiles.ejs", {
    animals: utils.getChartData(productions),
    allAnimalsForFarmer,
  });
});

app.post("/new-animal", (req, res) => {
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

// Milk production
app.get("/milk-production", (req, res) => {
  const productions = db
    .prepare(sqlQueries.recentProductionsForFarmer)
    .all(req.session.farmer.farmer_id);
  res.render("milk-production.ejs", { productions });
});

app.get("/add-milk-production", (req, res) => {
  const animals = db
    .prepare(
      "SELECT animal_tag, name FROM Animal WHERE owner_id = ? AND status = 'Alive' AND gender = 'Female'"
    )
    .all(req.session.farmer.farmer_id);
  res.render("add-milk-production.ejs", { animals });
});

app.post("/add-milk-production", (req, res) => {
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

// Expenses
app.get("/expenses", (req, res) => {
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

app.post("/expenses", (req, res) => {
  const { expense_date, expense_type, description, amount } = req.body;
  db.prepare(
    "INSERT INTO Expenses (expense_date, expense_type, description, amount, farmer_id) VALUES (?,?,?,?,?)"
  ).run(expense_date, expense_type, description, amount, req.session.farmer.farmer_id);
  res.redirect("/expenses");
});

// Vaccination
app.get("/vaccination", (req, res) => {
  const farmerId = req.session.farmer.farmer_id;
  const vaccinations = db
    .prepare(
      `SELECT v.*, a.name AS animal_name FROM Vaccination v
       JOIN Animal a ON v.animal_id = a.animal_tag
       WHERE a.owner_id = ? ORDER BY v.date_administered DESC`
    )
    .all(farmerId);
  res.render("vaccination.ejs", { vaccinations, animals: getOwnedAnimals.all(farmerId) });
});

app.post("/vaccination", (req, res) => {
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

// Medication
app.get("/medication", (req, res) => {
  const farmerId = req.session.farmer.farmer_id;
  const medications = db
    .prepare(
      `SELECT m.*, a.name AS animal_name FROM Medication m
       JOIN Animal a ON m.animal_id = a.animal_tag
       WHERE a.owner_id = ? ORDER BY m.start_date DESC`
    )
    .all(farmerId);
  res.render("medication.ejs", { medications, animals: getOwnedAnimals.all(farmerId) });
});

app.post("/medication", (req, res) => {
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

// Feed consumption
app.get("/feed-consumption", (req, res) => {
  const farmerId = req.session.farmer.farmer_id;
  const feeds = db
    .prepare(
      `SELECT fc.*, a.name AS animal_name FROM FeedConsumption fc
       JOIN Animal a ON fc.animalfed = a.animal_tag
       WHERE a.owner_id = ? ORDER BY fc.date DESC LIMIT 50`
    )
    .all(farmerId);
  res.render("feed-consumption.ejs", { feeds, animals: getOwnedAnimals.all(farmerId) });
});

app.post("/feed-consumption", (req, res) => {
  const { animalfed, quantity, type, cost, date } = req.body;
  if (!ownsAnimal.get(animalfed, req.session.farmer.farmer_id)) {
    return res.status(403).send("That animal does not belong to your farm.");
  }
  db.prepare(
    "INSERT INTO FeedConsumption (animalfed, quantity, type, cost, date) VALUES (?,?,?,?,?)"
  ).run(animalfed, quantity, type, cost, date || new Date().toISOString().slice(0, 19).replace("T", " "));
  res.redirect("/feed-consumption");
});

// Farmer profile
app.get("/farmer-profile", (req, res) => {
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

app.post("/farmer-profile", (req, res) => {
  const { fullname, phone, county, farm_location, farm_name } = req.body;
  db.prepare(
    "UPDATE Farmers SET fullname = ?, phone = ?, county = ?, farm_location = ?, farm_name = ? WHERE farmer_id = ?"
  ).run(fullname, phone, county, farm_location, farm_name, req.session.farmer.farmer_id);
  req.session.farmer.fullname = fullname;
  res.redirect("/farmer-profile?message=saved");
});

// Settings (change password)
app.get("/settings", (req, res) => {
  const message = req.query.message;
  let feedback = null;
  if (message === "changed") feedback = "Password changed successfully.";
  else if (message === "wrong") feedback = "Current password is incorrect.";
  else if (message === "mismatch") feedback = "New passwords do not match.";
  res.render("settings.ejs", { message: feedback });
});

app.post("/settings", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
