import React from "react";
import { Chart } from "react-google-charts";

const PieChart = ({ appointments }) => {
  // Prepare data for the chart
  const getChartData = () => {
    const statusCounts = {
      CONFIRMED: 0,
      ABSENT: 0,
      CANCELED: 0,
      UNCONFIRMED: 0,
    };

    // Count occurrences of each status
    appointments.forEach((appointment) => {
      const status = appointment.confirmed;
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }
    });

    // Convert counts to percentages
    const totalAppointments = Object.values(statusCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const chartData = [
      ["Status", "Percentage"],
      ...Object.entries(statusCounts).map(([status, count]) => [
        status,
        ((count / totalAppointments) * 100).toFixed(2), // Percentage
      ]),
    ];

    return chartData;
  };

  const chartData = getChartData();

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        Appointment Status Distribution
      </h2>
      <Chart
        chartType="PieChart"
        data={chartData}
        options={{
          title: "Appointment Status Distribution",
          pieHole: 0.4,
          is3D: false,
          colors: ["#4CAF50", "#FF9800", "#F44336", "#2196F3"],
        }}
        width="100%"
        height="300px"
      />
    </div>
  );
};

export default PieChart;
