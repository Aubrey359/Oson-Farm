// Demo data seeding, ported from mysql-schema.sql.
// Runs only when the Farmers table is empty (i.e. a brand-new database).

const bcrypt = require("bcrypt");

module.exports = function seedIfEmpty(db) {
  const farmerCount = db.prepare("SELECT COUNT(*) AS n FROM Farmers").get().n;
  if (farmerCount > 0) return;

  const demoPassword = bcrypt.hashSync("demo1234", 12);

  const seed = db.transaction(() => {
    const insertFarmer = db.prepare(
      "INSERT INTO Farmers (fullname, phone, email, password, county, farm_location, farm_name) VALUES (?,?,?,?,?,?,?)"
    );
    insertFarmer.run("John Mwangi", "0712345678", "john@example.com", demoPassword, "Nairobi", "Kiambu Road", "Green Pastures");
    insertFarmer.run("Mary Wanjiku", "0723456789", "mary@example.com", demoPassword, "Nakuru", "Rongai", "Sunny Farm");

    const insertAnimal = db.prepare(
      "INSERT INTO Animal (animal_tag, name, owner_id, dob, purchase_date, breed, gender, source, status) VALUES (?,?,?,?,?,?,?,?,?)"
    );
    [
      ["A001", "Kamau", 1, "2020-03-15", "2020-06-01", "Friesian", "Male", "Purchase", "Alive"],
      ["A002", "Pendo", 1, "2019-08-22", null, "Ayrshire", "Female", "Birth", "Alive"],
      ["A003", "Kadogo", 1, "2021-01-10", "2021-03-05", "Guernsey", "Female", "Purchase", "Alive"],
      ["A004", "Joy", 1, "2018-05-17", null, "Friesian", "Male", "Birth", "Alive"],
      ["A005", "Lelmet", 1, "2020-09-12", "2020-12-01", "Jersey", "Female", "Purchase", "Alive"],
      ["A006", "Mwangi", 1, "2017-11-03", null, "Zebu", "Male", "Birth", "Alive"],
      ["A007", "Nyambura", 2, "2019-02-14", "2019-06-01", "Sahiwal", "Female", "Purchase", "Alive"],
      ["A008", "Lelkina", 2, "2021-07-25", "2021-09-15", "Friesian", "Male", "Purchase", "Alive"],
      ["A009", "Daisy", 2, "2019-12-30", null, "Ayrshire", "Female", "Birth", "Alive"],
      ["A010", "Otieno", 2, "2018-04-11", "2018-07-20", "Jersey", "Male", "Purchase", "Alive"],
      ["A011", "Achieng", 2, "2020-06-05", null, "Guernsey", "Female", "Birth", "Alive"],
      ["A012", "Baraka", 2, "2021-02-19", "2021-04-22", "Sahiwal", "Male", "Purchase", "Alive"],
      ["A013", "Wairimu", 2, "2019-09-01", null, "Friesian", "Female", "Birth", "Alive"],
      ["A014", "Cherono", 2, "2020-01-25", "2020-04-15", "Jersey", "Female", "Purchase", "Alive"],
      ["A015", "Mutiso", 2, "2018-10-10", "2019-01-05", "Zebu", "Male", "Purchase", "Alive"],
    ].forEach((row) => insertAnimal.run(...row));

    const insertMilk = db.prepare(
      "INSERT INTO MilkProduction (animal_id, production_date, production_time, quantity, quality, unit) VALUES (?,?,?,?,?,'Liters')"
    );
    [
      ["A002", "2023-08-01", "06:00:00", 12.5, "High"],
      ["A003", "2023-08-01", "06:30:00", 10.2, "Medium"],
      ["A005", "2023-08-01", "07:00:00", 8.7, "High"],
      ["A007", "2023-08-01", "07:15:00", 9.5, "High"],
      ["A009", "2023-08-01", "07:30:00", 11.3, "High"],
      ["A011", "2023-08-01", "07:45:00", 10.0, "Medium"],
      ["A013", "2023-08-01", "08:00:00", 12.0, "High"],
      ["A014", "2023-08-01", "08:15:00", 9.8, "High"],
      ["A002", "2023-08-02", "06:00:00", 12.7, "High"],
      ["A003", "2023-08-02", "06:30:00", 10.0, "Medium"],
      ["A005", "2023-08-02", "07:00:00", 8.5, "High"],
      ["A007", "2023-08-02", "07:15:00", 9.3, "High"],
      ["A009", "2023-08-02", "07:30:00", 11.0, "High"],
      ["A011", "2023-08-02", "07:45:00", 9.8, "Medium"],
      ["A013", "2023-08-02", "08:00:00", 12.2, "High"],
      ["A002", "2023-09-01", "06:00:00", 12.3, "High"],
      ["A002", "2023-09-01", "18:00:00", 11.8, "High"],
      ["A002", "2023-09-02", "06:00:00", 12.5, "High"],
      ["A002", "2023-09-02", "18:00:00", 12.0, "High"],
      ["A002", "2023-09-03", "06:00:00", 12.1, "Medium"],
      ["A002", "2023-09-03", "18:00:00", 11.9, "High"],
      ["A002", "2023-09-04", "06:00:00", 12.6, "High"],
      ["A002", "2023-09-04", "18:00:00", 12.2, "High"],
      ["A002", "2023-09-05", "06:00:00", 12.4, "High"],
      ["A002", "2023-09-05", "18:00:00", 12.1, "Medium"],
      ["A003", "2023-09-01", "06:30:00", 9.8, "Medium"],
      ["A003", "2023-09-01", "18:30:00", 9.5, "Medium"],
      ["A003", "2023-09-02", "06:30:00", 10.0, "High"],
      ["A003", "2023-09-02", "18:30:00", 9.7, "Medium"],
      ["A003", "2023-09-03", "06:30:00", 9.9, "High"],
      ["A003", "2023-09-03", "18:30:00", 9.4, "Medium"],
      ["A003", "2023-09-04", "06:30:00", 10.2, "High"],
      ["A003", "2023-09-04", "18:30:00", 9.8, "High"],
      ["A003", "2023-09-05", "06:30:00", 9.6, "Medium"],
      ["A003", "2023-09-05", "18:30:00", 9.3, "Medium"],
      ["A005", "2023-09-01", "07:00:00", 8.2, "High"],
      ["A005", "2023-09-01", "19:00:00", 8.0, "High"],
      ["A005", "2023-09-02", "07:00:00", 8.5, "Medium"],
      ["A005", "2023-09-02", "19:00:00", 8.1, "High"],
      ["A005", "2023-09-03", "07:00:00", 8.4, "High"],
      ["A005", "2023-09-03", "19:00:00", 8.0, "Medium"],
      ["A005", "2023-09-04", "07:00:00", 8.6, "High"],
      ["A005", "2023-09-04", "19:00:00", 3.3, "Medium"],
      ["A005", "2023-09-05", "07:00:00", 4.7, "High"],
      ["A005", "2023-09-05", "19:00:00", 8.2, "High"],
    ].forEach((row) => insertMilk.run(...row));

    const insertSale = db.prepare(
      "INSERT INTO Sales (sale_date, sale_type, item_description, price_per_unit, quantity, unit, farmer_id) VALUES (?,?,?,?,?,?,?)"
    );
    [
      ["2023-08-05", "Milk", "Fresh milk sold to local market", 50.0, 20, "Liters", 1],
      ["2023-08-06", "Milk", "Milk supplied to school", 45.0, 50, "Liters", 1],
      ["2023-08-07", "Milk", "Fresh milk to hotel", 55.0, 30, "Liters", 1],
      ["2023-08-08", "Mursik", "Traditional mursik to shop", 100.0, 10, "Liters", 2],
      ["2023-08-09", "Milk", "Milk to neighbors", 50.0, 15, "Liters", 2],
      ["2023-08-10", "Animal", "Sale of bull calf A015", 25000.0, 1, "Animal", 2],
      ["2023-08-11", "Milk", "Milk sold to cooperative", 48.0, 60, "Liters", 1],
      ["2023-08-12", "Other", "Cow dung sold as manure", 200.0, 5, "Bags", 1],
      ["2023-08-13", "Milk", "Milk sold at market", 50.0, 25, "Liters", 2],
      ["2023-08-14", "Milk", "Fresh milk to hotel", 55.0, 40, "Liters", 2],
      ["2023-08-15", "Mursik", "Mursik to friends", 90.0, 8, "Liters", 2],
      ["2023-08-16", "Milk", "Milk to local shop", 50.0, 18, "Liters", 1],
      ["2023-08-17", "Animal", "Sale of heifer A005", 45000.0, 1, "Animal", 1],
      ["2023-08-18", "Milk", "Milk supplied to milk bar", 52.0, 35, "Liters", 2],
      ["2023-08-19", "Other", "Sale of hides after slaughter", 1500.0, 1, "Hide", 2],
    ].forEach((row) => insertSale.run(...row));

    const insertMedication = db.prepare(
      "INSERT INTO Medication (animal_id, medication_name, dose, start_date, end_date, veterinary_name, veterinary_remarks, notes) VALUES (?,?,?,?,?,?,?,?)"
    );
    [
      ["A002", "Antibiotics", "10ml", "2023-07-01", "2023-07-05", "Dr. Kiptoo", "Responding well", "For mastitis"],
      ["A003", "Dewormer", "15ml", "2023-06-15", null, "Dr. Wambui", "Normal", "Routine deworming"],
      ["A005", "Vitamin Supplement", "20ml", "2023-07-10", "2023-07-12", "Dr. Mwangi", "Good recovery", "Weakness observed"],
      ["A007", "Painkiller", "5ml", "2023-07-20", "2023-07-21", "Dr. Otieno", "Improved", "Leg injury"],
      ["A009", "Antibiotics", "12ml", "2023-06-05", "2023-06-10", "Dr. Cherono", "Recovered", "Respiratory infection"],
      ["A011", "Calcium Boost", "25ml", "2023-08-01", "2023-08-03", "Dr. Mutua", "Effective", "Post-calving"],
      ["A013", "Dewormer", "15ml", "2023-07-22", null, "Dr. Wekesa", "Routine", "Quarterly schedule"],
      ["A014", "Antibiotics", "10ml", "2023-05-01", "2023-05-06", "Dr. Kibet", "Recovered", "Wound treatment"],
      ["A002", "Painkiller", "5ml", "2023-06-01", "2023-06-02", "Dr. Omondi", "Stable", "Minor injury"],
      ["A003", "Vitamin Supplement", "20ml", "2023-08-05", "2023-08-07", "Dr. Achieng", "Improved", "Boost strength"],
      ["A005", "Calcium Boost", "25ml", "2023-07-25", "2023-07-26", "Dr. Mwangi", "OK", "Milk fever"],
      ["A007", "Dewormer", "15ml", "2023-08-10", null, "Dr. Kiprono", "Normal", "Routine deworming"],
      ["A009", "Painkiller", "5ml", "2023-08-12", "2023-08-13", "Dr. Nyambura", "Improved", "Hoof injury"],
      ["A011", "Antibiotics", "10ml", "2023-07-14", "2023-07-18", "Dr. Kiprotich", "Recovered", "Mastitis"],
      ["A013", "Vitamin Supplement", "20ml", "2023-06-22", "2023-06-24", "Dr. Wambua", "Good", "Nutritional boost"],
    ].forEach((row) => insertMedication.run(...row));

    const insertVaccination = db.prepare(
      "INSERT INTO Vaccination (animal_id, vaccine_name, date_administered, next_due_date, notes) VALUES (?,?,?,?,?)"
    );
    [
      ["A002", "FMD", "2023-01-10", "2024-01-10", "Routine vaccination"],
      ["A003", "Lumpy Skin", "2023-02-15", "2024-02-15", "Annual dose"],
      ["A005", "CBPP", "2023-03-05", "2024-03-05", "Protective vaccine"],
      ["A007", "Anthrax", "2023-04-20", "2024-04-20", "Annual requirement"],
      ["A009", "Black Quarter", "2023-05-18", "2024-05-18", "Routine dose"],
      ["A011", "FMD", "2023-01-12", "2024-01-12", "Routine vaccination"],
      ["A013", "CBPP", "2023-03-10", "2024-03-10", "Annual booster"],
      ["A014", "Lumpy Skin", "2023-02-25", "2024-02-25", "Good response"],
      ["A002", "Anthrax", "2022-12-01", "2023-12-01", "Previous schedule"],
      ["A003", "FMD", "2023-01-20", "2024-01-20", "Routine"],
      ["A005", "Black Quarter", "2023-06-15", "2024-06-15", "Normal"],
      ["A007", "CBPP", "2023-07-12", "2024-07-12", "Annual dose"],
      ["A009", "FMD", "2023-01-18", "2024-01-18", "Routine"],
      ["A011", "Lumpy Skin", "2023-02-22", "2024-02-22", "Good"],
      ["A013", "Anthrax", "2023-03-30", "2024-03-30", "Routine"],
    ].forEach((row) => insertVaccination.run(...row));

    const insertExpense = db.prepare(
      "INSERT INTO Expenses (expense_date, expense_type, description, amount, farmer_id) VALUES (?,?,?,?,?)"
    );
    [
      ["2023-08-01", "Feeds", "Napier grass purchase", 5000.0, 1],
      ["2023-08-02", "Vaccination", "FMD vaccine costs", 2000.0, 1],
      ["2023-08-03", "Medication", "Antibiotics for A002", 1500.0, 1],
      ["2023-08-04", "Maintenance", "Repair of cowshed", 8000.0, 1],
      ["2023-08-05", "Labor", "Farm worker wages", 12000.0, 1],
      ["2023-08-06", "Feeds", "Dairy meal bags", 7000.0, 2],
      ["2023-08-07", "Insemination", "AI service for A013", 2500.0, 2],
      ["2023-08-08", "Other", "Transport costs", 3000.0, 2],
      ["2023-08-09", "Feeds", "Hay bales", 6000.0, 2],
      ["2023-08-10", "Vaccination", "Anthrax vaccine", 2200.0, 2],
      ["2023-08-11", "Medication", "Painkillers for A007", 1800.0, 2],
      ["2023-08-12", "Labor", "Casual workers", 4000.0, 1],
      ["2023-08-13", "Feeds", "Molasses supplement", 3500.0, 1],
      ["2023-08-14", "Maintenance", "Fence repair", 5000.0, 1],
      ["2023-08-15", "Other", "Fuel for transport", 2500.0, 2],
    ].forEach((row) => insertExpense.run(...row));

    const insertLoss = db.prepare(
      "INSERT INTO Losses (animal_id, loss_type, date, notes) VALUES (?,?,?,?)"
    );
    insertLoss.run("A004", "Death", "2022-05-10", "Died due to pneumonia");
    insertLoss.run("A006", "Theft", "2021-11-15", "Stolen from grazing field");

    const insertFeed = db.prepare(
      "INSERT INTO FeedConsumption (animalfed, quantity, type, cost, date) VALUES (?,?,?,?,?)"
    );
    [
      ["A002", 15.0, "Napier Grass", 750.0, "2023-08-01 08:00:00"],
      ["A003", 10.0, "Dairy Meal", 1200.0, "2023-08-01 08:30:00"],
      ["A005", 12.0, "Hay", 600.0, "2023-08-01 09:00:00"],
      ["A007", 14.0, "Napier Grass", 700.0, "2023-08-01 09:30:00"],
      ["A009", 11.0, "Silage", 900.0, "2023-08-01 10:00:00"],
      ["A011", 13.0, "Dairy Meal", 1500.0, "2023-08-01 10:30:00"],
      ["A013", 12.5, "Hay", 650.0, "2023-08-01 11:00:00"],
      ["A014", 10.5, "Napier Grass", 525.0, "2023-08-01 11:30:00"],
      ["A002", 16.0, "Molasses", 800.0, "2023-08-02 08:00:00"],
      ["A003", 9.5, "Silage", 820.0, "2023-08-02 08:30:00"],
      ["A005", 11.0, "Napier Grass", 550.0, "2023-08-02 09:00:00"],
      ["A007", 13.0, "Dairy Meal", 1400.0, "2023-08-02 09:30:00"],
      ["A009", 12.5, "Hay", 700.0, "2023-08-02 10:00:00"],
      ["A011", 14.0, "Napier Grass", 700.0, "2023-08-02 10:30:00"],
      ["A013", 10.0, "Molasses", 500.0, "2023-08-02 11:00:00"],
    ].forEach((row) => insertFeed.run(...row));
  });

  seed();
  console.log("Database seeded with demo data (login: john@example.com / demo1234)");
};
