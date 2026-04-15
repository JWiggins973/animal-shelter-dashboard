// chart.js
// Author: Jermaine Wiggins
// Date:   2025
// Purpose: Chart.js breed distribution doughnut chart.

let pieChart = null; // Chart.js instance.

// Builds a pie chart from filteredData, grouped by CONFIG.chart.field.
// Values under 1% of the total are grouped into an Other slice.
function updateChart() {
  const field  = CONFIG.chart.field;
  const counts = {};

  // Count how many animals have each value.
  filteredData.forEach(row => {
    const val   = row[field] ?? "Unknown";
    counts[val] = (counts[val] || 0) + 1;
  });

  const total     = Object.values(counts).reduce((a, b) => a + b, 0);
  const threshold = total * 0.01;
  const labels    = [];
  const values    = [];
  let other       = 0;

  // Sort by count descending and group anything under 1% into Other.
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, count]) => {
      if (count >= threshold) {
        labels.push(label);
        values.push(count);
      } else {
        other += count;
      }
    });

  if (other > 0) { labels.push("Other"); values.push(other); }

  const colors = [
    "#2563eb","#60a5fa","#93c5fd","#bfdbfe","#dbeafe",
    "#1d4ed8","#3b82f6","#6366f1","#818cf8","#a5b4fc"
  ];

  // Destroy the previous chart instance before creating a new one.
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(document.getElementById("pie-chart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data:            values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth:     2,
        borderColor:     "#fff"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
          labels: { font: { family: "DM Sans", size: 12 }, boxWidth: 12 }
        }
      }
    }
  });
}
