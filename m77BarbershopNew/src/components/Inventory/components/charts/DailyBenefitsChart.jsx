import React from "react";
import { Chart } from "react-google-charts";

const DailySalesAndBenefitsChart = ({ organizedTickets, selectedDate }) => {
  // Extract year and month from the selected date (yyyy-mm-dd)
  const [selectedYear, selectedMonth] = selectedDate.split("-").map(Number);

  // Filter tickets for the selected month and year
  const filteredTickets = organizedTickets.filter(({ date }) => {
    const [day, month, year] = date.split("/").map(Number); // Extract day, month, year from "dd/mm/yyyy"
    return year === selectedYear && month === selectedMonth;
  });

  // Prepare chart data
  const chartData = [
    ["Date", "Ventes Totales (€)", "Bénéfices Totaux (€)"], // Chart headers in French
    ...(filteredTickets.length > 0
      ? filteredTickets.map(({ date, tickets }) => {
          const totalSales = tickets.reduce((sum, ticket) => sum + parseFloat(ticket.data.total_amount), 0);
          const totalBenefits = tickets.reduce((sum, ticket) => {
            return sum + ticket.data.items.reduce((benefit, item) => {
              return benefit + (parseFloat(item.item.item_sell_price) - parseFloat(item.item.item_buy_price)) * item.quantity;
            }, 0);
          }, 0);

          return [date, totalSales, totalBenefits];
        })
      : [["-", 0, 0]] // Empty graph case
    )
  ];

  // Chart options in French
  const options = {
    title: `Ventes & Bénéfices pour ${selectedYear}-${String(selectedMonth).padStart(2, "0")}`,
    chartArea: { width: "80%" },
    hAxis: { title: "Date", textStyle: { fontSize: 12 } },
    vAxis: { title: "Montant (€)", minValue: 0 },
    legend: { position: "top" },
    colors: ["#4CAF50", "#FF9800"], // Green for sales, Orange for benefits
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
        Ventes & Bénéfices Quotidiens pour {selectedYear}-{String(selectedMonth).padStart(2, "0")}
      </h2>
      <Chart chartType="ColumnChart" data={chartData} options={options} width="100%" height="400px" />
    </div>
  );
};

export default DailySalesAndBenefitsChart;
