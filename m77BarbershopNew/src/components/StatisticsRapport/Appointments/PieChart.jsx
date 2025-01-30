import React from "react";
import { Chart } from "react-google-charts";

import APPOINTMENT_STATES from '../../../data/appointmentStates.json'

const PieChart = ({ appointments, groupBy = "confirmed" }) => {
  const STATUS_COLORS = {
    [APPOINTMENT_STATES.affirmative_state]: "#22C55E", // green-500
    [APPOINTMENT_STATES.medium_state]: "#F97316",    // orange-500
    [APPOINTMENT_STATES.negative_state]: "#EF4444",  // red-500
    [APPOINTMENT_STATES.neutral_state]: "#6B7280" // gray-500
  };

  // Generate a full 6-digit valid hex color
  const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
  };

  const getChartData = () => {
    if (!appointments || appointments.length === 0) {
      return [["Category", "Percentage"], ["No Data", 1]];
    }

    const counts = {};
    appointments.forEach((appointment) => {
      const key = appointment[groupBy] || "Unknown"; // Default to "Unknown" if missing
      counts[key] = (counts[key] || 0) + 1;
    });

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (total === 0) {
      return [["Category", "Percentage"], ["No Data", 1]];
    }

    const chartData = [
      ["Category", "Percentage"],
      ...Object.entries(counts).map(([key, count]) => [key, Number(((count / total) * 100).toFixed(2))]),
    ];

    return chartData;
  };

  const chartData = getChartData();

  // Generate a consistent color mapping for services
  const uniqueKeys = chartData.slice(1).map(([key]) => key);
  const serviceColors = Object.fromEntries(
    uniqueKeys.map((key) => [key, STATUS_COLORS[key] || generateRandomColor()])
  );

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <Chart
        chartType="PieChart"
        data={chartData}
        options={{
          title: groupBy === "confirmed" ? "Distribution basée sur l'état du rendez-vous" : "Distribution basée sur le type de service",
          pieHole: 0.4,
          is3D: false,
          colors: uniqueKeys.map((key) => serviceColors[key]), // Ensures colors remain consistent
          legend: { position: "bottom" },
        }}
        width="100%"
        height="300px"
      />
    </div>
  );
};

export default PieChart;
