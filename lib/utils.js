// Helpers that reshape database rows into the arrays the Chart.js views need.

function groupAndExtractLatest(records) {
  // Step 1: Group records by animal_tag
  const grouped = records.reduce((acc, record) => {
    const tag = record.animal_tag;
    if (!acc[tag]) {
      acc[tag] = {
        animal_name: record.animal_name,
        production_dates: [],
        total_daily_productions: [],
      };
    }

    acc[tag].production_dates.push(new Date(record.production_date));
    acc[tag].total_daily_productions.push(record.total_daily_production);

    return acc;
  }, {});

  // Step 2: Sort each group's records by date and keep only the latest 15
  for (const tag in grouped) {
    const combined = grouped[tag].production_dates.map((date, i) => ({
      date,
      production: grouped[tag].total_daily_productions[i],
    }));

    combined.sort((a, b) => b.date - a.date);

    const latest15 = combined.slice(0, 15);

    grouped[tag].production_dates = latest15.map((item) =>
      item.date.toLocaleDateString()
    );
    grouped[tag].total_daily_productions = latest15.map(
      (item) => item.production
    );
  }

  return grouped;
}

function getChartData(animals) {
  const xValues = [];
  const yValues = [];
  animals.forEach((animal) => {
    xValues.push(animal.animal_name + "-" + animal.animal_tag);
    yValues.push(animal.total_production);
  });
  return [xValues, yValues];
}

module.exports = { groupAndExtractLatest, getChartData };
