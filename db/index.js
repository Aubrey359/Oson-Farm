// Database connection and schema.
// SQLite via better-sqlite3: the database file is created automatically on
// first run, then seeded with demo data (see seed.js).

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// The database lives in ./data by default. On a cloud host with a persistent
// disk, point DB_PATH at the mounted disk (e.g. /var/data/oson_farm.db).
const dbPath =
  process.env.DB_PATH || path.join(__dirname, "..", "data", "oson_farm.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Schema translated from mysql-schema.sql (MySQL) to SQLite
db.exec(`
CREATE TABLE IF NOT EXISTS Farmers (
    farmer_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname          TEXT NOT NULL,
    phone             TEXT,
    email             TEXT UNIQUE,
    password          TEXT NOT NULL,
    county            TEXT,
    farm_location     TEXT,
    farm_name         TEXT,
    registration_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Animal (
    animal_tag        TEXT PRIMARY KEY,
    name              TEXT NOT NULL,
    owner_id          INTEGER,
    dob               TEXT NOT NULL,
    purchase_date     TEXT,
    breed             TEXT,
    gender            TEXT NOT NULL CHECK (gender IN ('Male','Female')),
    source            TEXT NOT NULL CHECK (source IN ('Birth','Purchase')),
    status            TEXT NOT NULL DEFAULT 'Alive' CHECK (status IN ('Alive','Dead','Sold')),
    FOREIGN KEY (owner_id) REFERENCES Farmers(farmer_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS MilkProduction (
    production_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id         TEXT NOT NULL,
    production_date   TEXT NOT NULL,
    production_time   TEXT NOT NULL,
    quantity          REAL NOT NULL,
    quality           TEXT,
    unit              TEXT DEFAULT 'Liters',
    FOREIGN KEY (animal_id) REFERENCES Animal(animal_tag) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Sales (
    sale_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_date         TEXT NOT NULL,
    sale_type         TEXT NOT NULL DEFAULT 'Milk' CHECK (sale_type IN ('Milk','Mursik','Animal','Other')),
    item_description  TEXT,
    price_per_unit    REAL NOT NULL,
    quantity          REAL NOT NULL,
    unit              TEXT NOT NULL,
    total_price       REAL GENERATED ALWAYS AS (price_per_unit * quantity) STORED,
    farmer_id         INTEGER,
    FOREIGN KEY (farmer_id) REFERENCES Farmers(farmer_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Medication (
    medication_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id         TEXT NOT NULL,
    medication_name   TEXT NOT NULL,
    dose              TEXT,
    start_date        TEXT NOT NULL,
    end_date          TEXT,
    veterinary_name   TEXT,
    veterinary_remarks TEXT,
    notes             TEXT,
    FOREIGN KEY (animal_id) REFERENCES Animal(animal_tag) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Vaccination (
    vaccination_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id         TEXT NOT NULL,
    vaccine_name      TEXT NOT NULL,
    date_administered TEXT NOT NULL,
    next_due_date     TEXT,
    notes             TEXT,
    FOREIGN KEY (animal_id) REFERENCES Animal(animal_tag) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Expenses (
    expense_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_date      TEXT NOT NULL,
    expense_type      TEXT NOT NULL CHECK (expense_type IN ('Feeds','Vaccination','Medication','Maintenance','Labor','Insemination','Other')),
    description       TEXT,
    amount            REAL NOT NULL,
    farmer_id         INTEGER,
    FOREIGN KEY (farmer_id) REFERENCES Farmers(farmer_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Losses (
    loss_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id         TEXT NOT NULL,
    loss_type         TEXT NOT NULL CHECK (loss_type IN ('Death','Accident','Theft')),
    date              TEXT NOT NULL,
    notes             TEXT,
    FOREIGN KEY (animal_id) REFERENCES Animal(animal_tag) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS FeedConsumption (
    id_feed           INTEGER PRIMARY KEY AUTOINCREMENT,
    animalfed         TEXT NOT NULL,
    quantity          REAL NOT NULL,
    type              TEXT NOT NULL,
    cost              REAL NOT NULL,
    date              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animalfed) REFERENCES Animal(animal_tag) ON DELETE CASCADE
);
`);

// Populate with demo data on first run
require("./seed")(db);

module.exports = db;
