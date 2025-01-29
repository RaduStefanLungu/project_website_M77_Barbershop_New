import React from "react";
import { Chart } from "react-google-charts";

const PieChart = ({ appointments }) => {
  const getChartData = () => {
    if (!appointments || appointments.length === 0) {
      return [["Status", "Percentage"], ["No Data", 1]]; // Prevents empty chart errors
    }

    const statusCounts = {
      CONFIRMED: 0,
      ABSENT: 0,
      CANCELED: 0,
      UNCONFIRMED: 0,
    };

    appointments.forEach((appointment) => {
      const status = appointment.confirmed || "UNCONFIRMED"; // Default to "UNCONFIRMED"
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }
    });

    const totalAppointments = Object.values(statusCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalAppointments === 0) {
      return [["Status", "Percentage"], ["No Appointments", 1]];
    }

    const chartData = [
      ["Status", "Percentage"],
      ...Object.entries(statusCounts).map(([status, count]) => [
        status,
        Number(((count / totalAppointments) * 100).toFixed(2)), // Convert string to number
      ]),
    ];

    return chartData;
  };

  const chartData = getChartData();

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 ">
        Appointment Status Distribution
      </h2>
      <Chart
        chartType="PieChart"
        data={chartData}
        options={{
          title: "Appointment Status Distribution",
          pieHole: 0.4,
          is3D: false,
          colors: ["#4CAF50", "#FF9800", "#F44336", "#6b7280"],
          legend: { position: "bottom" },
        }}
        width="100%"
        height="300px"
      />
    </div>
  );
};

export default PieChart;
