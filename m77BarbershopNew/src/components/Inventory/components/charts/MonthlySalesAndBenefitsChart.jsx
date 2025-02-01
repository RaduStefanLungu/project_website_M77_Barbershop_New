import React from "react";
import { Chart } from "react-google-charts";

const MonthlySalesAndBenefitsChart = ({ organizedTickets, wantedYear }) => {
  if (!organizedTickets || organizedTickets.length === 0) {
    return <p className="text-gray-500 text-center">Aucune donnée disponible</p>;
  }

  // Helper function to extract YYYY-MM from date
  const getYearMonthFromDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return { year, month };
  };

  // Filter tickets by wantedYear
  const filteredTickets = organizedTickets.filter(({ date }) => {
    return getYearMonthFromDate(date).year === wantedYear;
  });

  // Initialize an object to store totals for each month
  const monthlyData = {};
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  for (let i = 1; i <= 12; i++) {
    const monthKey = String(i).padStart(2, "0"); // Format as "01", "02", ...
    monthlyData[monthKey] = { totalSales: 0, totalBenefit: 0 };
  }

  // Process filtered tickets
  filteredTickets.forEach(({ date, tickets }) => {
    const { month } = getYearMonthFromDate(date);

    tickets.forEach((ticket) => {
      const ticketTotal = parseFloat(ticket.data.total_amount);
      monthlyData[month].totalSales += ticketTotal;

      const ticketBenefit = ticket.data.items.reduce((sum, { item, quantity }) => {
        return sum + (Number(item.item_sell_price) - Number(item.item_buy_price)) * quantity;
      }, 0);
      monthlyData[month].totalBenefit += ticketBenefit;
    });
  });

  // Convert to chart format
  const chartData = [
    ["Mois", "Ventes Totales (€)", "Bénéfice Total (€)"], // Header translated
    ...Object.entries(monthlyData).map(([month, { totalSales, totalBenefit }]) => [
      monthNames[parseInt(month) - 1], // Get the month name based on index
      totalSales,
      totalBenefit,
    ]),
  ];

  // Chart options in French
  const options = {
    title: `Ventes Totales & Bénéfices en ${wantedYear}`,
    chartArea: { width: "75%" },
    hAxis: { title: "Mois", textStyle: { fontSize: 12 } },
    vAxis: { title: "Montant (€)", minValue: 0 },
    legend: { position: "top" },
    colors: ["#4CAF50", "#2196F3"], // Green for sales, Blue for benefit
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
        Ventes Mensuelles & Bénéfices en {wantedYear} (€)
      </h2>
      <Chart chartType="ColumnChart" data={chartData} options={options} width="100%" height="400px" />
    </div>
  );
};

export default MonthlySalesAndBenefitsChart;
