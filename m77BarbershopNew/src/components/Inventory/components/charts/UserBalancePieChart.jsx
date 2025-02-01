import React from "react";
import { Chart } from "react-google-charts";

const UserBalancePieChart = ({ organizedTickets, selectedDate }) => {
  if (!organizedTickets || organizedTickets.length === 0) {
    return <p className="text-gray-500 text-center">Aucune donnée disponible</p>;
  }

  // Extract year and month from selectedDate (format: yyyy-mm-dd)
  const [year, month] = selectedDate.split("-").map(Number);

  // Filter tickets for the given month and year
  const filteredTickets = organizedTickets.filter(({ date }) => {
    const [day, ticketMonth, ticketYear] = date.split("/").map(Number);
    return ticketMonth === month && ticketYear === year;
  });

  // Calculate total balance per user
  const userBalances = {};
  filteredTickets.forEach(({ tickets }) => {
    tickets.forEach(ticket => {
      const userEmail = ticket.data.meta.created_by;
      const ticketTotal = parseFloat(ticket.data.total_amount);

      if (!userBalances[userEmail]) {
        userBalances[userEmail] = 0;
      }
      userBalances[userEmail] += ticketTotal;
    });
  });

  // Prepare data for the chart
  const chartData = [["Utilisateur", "Total Vente"], ...Object.entries(userBalances)];

  // If no user data exists, show an empty pie chart
  if (chartData.length === 1) {
    chartData.push(["Aucun utilisateur", 1]); // Dummy data for empty pie chart
  }

  // Function to generate distinct colors
  const generateColors = (count) => {
    const predefinedColors = [
      "#4CAF50", "#FF9800", "#F44336", "#2196F3", "#9C27B0",
      "#00BCD4", "#8BC34A", "#FFEB3B", "#FF5722", "#795548"
    ];

    if (count <= predefinedColors.length) {
      return predefinedColors.slice(0, count);
    }

    // Generate additional random colors if needed
    const extraColors = Array.from({ length: count - predefinedColors.length }, (_, i) => {
      const hue = Math.floor(Math.random() * 360); // Random hue (0-360)
      return `hsl(${hue}, 70%, 50%)`; // Generate HSL color
    });

    return [...predefinedColors, ...extraColors];
  };

  // Generate colors dynamically
  const colors = generateColors(Object.keys(userBalances).length || 1); // Prevents negative/invalid length

  // Chart options
  const options = {
    title: "Répartition des ventes par utilisateur",
    pieHole: 0.4,
    is3D: false,
    chartArea: { width: "80%", height: "80%" },
    legend: { position: "bottom" },
    colors: colors,
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
        Répartition des ventes par utilisateur ({month}/{year})
      </h2>
      <Chart chartType="PieChart" data={chartData} options={options} width="100%" height="400px" />
    </div>
  );
};

export default UserBalancePieChart;
