// Shared SQL statements. All values are bound with ? placeholders at
// execution time (parameterized queries — never string interpolation).

// Daily production totals per animal, for the dashboard charts
const productionRecordsForFarmer = `
  SELECT
    Animal.animal_tag,
    Animal.name AS animal_name,
    MilkProduction.production_date,
    SUM(MilkProduction.quantity) AS total_daily_production,
    COUNT(*) AS milking_sessions,
    Farmers.farm_name,
    MilkProduction.unit
FROM MilkProduction
JOIN Animal ON MilkProduction.animal_id = Animal.animal_tag
JOIN Farmers ON Animal.owner_id = Farmers.farmer_id
WHERE Farmers.farmer_id = ?
GROUP BY Animal.animal_tag, Animal.name, MilkProduction.production_date, Farmers.farm_name, MilkProduction.unit
ORDER BY MilkProduction.production_date DESC, total_daily_production DESC`;

// Lifetime production totals per animal, for the animal-profiles pie chart
const animalsProductionsForFarmer = `
SELECT
    f.farm_name,
    f.fullname AS farmer_name,
    a.animal_tag,
    a.name AS animal_name,
    SUM(mp.quantity) AS total_production,
    mp.unit
FROM Farmers f
JOIN Animal a ON f.farmer_id = a.owner_id
JOIN MilkProduction mp ON a.animal_tag = mp.animal_id
WHERE f.farmer_id = ?
GROUP BY f.farm_name, f.fullname, a.animal_tag, a.name, mp.unit`;

// Latest 30 individual milking records, for the production records table
const recentProductionsForFarmer = `
SELECT
    Animal.animal_tag,
    Animal.name AS animal_name,
    MilkProduction.production_date,
    MilkProduction.production_time,
    quantity
FROM MilkProduction
JOIN Animal ON MilkProduction.animal_id = Animal.animal_tag
JOIN Farmers ON Animal.owner_id = Farmers.farmer_id
WHERE Farmers.farmer_id = ?
ORDER BY MilkProduction.production_date DESC
LIMIT 30`;

// Ownership guard: does this animal belong to this farmer?
const ownsAnimal = "SELECT 1 FROM Animal WHERE animal_tag = ? AND owner_id = ?";

// Animal dropdown options for record forms
const ownedAnimals =
  "SELECT animal_tag, name FROM Animal WHERE owner_id = ? ORDER BY animal_tag";

module.exports = {
  productionRecordsForFarmer,
  animalsProductionsForFarmer,
  recentProductionsForFarmer,
  ownsAnimal,
  ownedAnimals,
};
