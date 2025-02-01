import React from "react";
import { Chart } from "react-google-charts";

const TicketsChart = ({ organizedTickets, selectedDate }) => {
  // Extraire l'année et le mois de la date sélectionnée (yyyy-mm-dd)
  const [selectedYear, selectedMonth] = selectedDate.split("-").map(Number);

  // Filtrer les tickets par année et mois sélectionnés
  const filteredTickets = organizedTickets.filter(({ date }) => {
    const [day, month, year] = date.split("/").map(Number); // Extraire jour, mois, année de "dd/mm/yyyy"
    return year === selectedYear && month === selectedMonth;
  });

  // Préparer les données pour le graphique
  const chartData = [
    ["Date", "Nombre de Tickets"], // En-tête
    ...(filteredTickets.length > 0
      ? filteredTickets.map(({ date, tickets }) => [date, tickets.length])
      : [["-", 0]] // Afficher un graphique vide si aucune donnée n'est disponible
    )
  ];

  // Options du graphique
  const options = {
    title: `Tickets en ${selectedYear}-${String(selectedMonth).padStart(2, "0")}`,
    chartArea: { width: "80%" },
    hAxis: { title: "Date", textStyle: { fontSize: 12 } },
    vAxis: { title: "Tickets", minValue: 0 },
    legend: { position: "none" },
    colors: ["#4CAF50"], // Vert pour les tickets
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
        Ventes de Tickets Quotidiennes pour {selectedYear}-{String(selectedMonth).padStart(2, "0")}
      </h2>
      <Chart chartType="ColumnChart" data={chartData} options={options} width="100%" height="400px" />
    </div>
  );
};

export default TicketsChart;
