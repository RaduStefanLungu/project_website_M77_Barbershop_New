
export function generateDailyAppointmentStats(appointments) {
  const stats = {};

//   appointments.forEach((doc) => {
//     const date = doc.id; // yyyy-mm-dd
//     const count = doc.appointments.length;
//     stats[date] = (stats[date] || 0) + count;
//   });

  for(let i; i < appointments.length; i++) {
    const doc = appointments[i];

    const date = doc.id; // yyyy-mm-dd
    const count = doc.appointments.length;
    stats[date] = (stats[date] || 0) + count;
  }

  const dates = Object.keys(stats).sort();
  const counts = dates.map((date) => stats[date]);

  return { dates, counts };
}

export function generateAppointmentStatusRatio(appointments) {
  const statusCount = { confirmed: 0, unconfirmed: 0, absent: 0, cancelled: 0 };

  appointments.forEach((doc) => {
    doc.appointments.forEach((appointment) => {
      const status = appointment.confirmed.toLowerCase();
      if (statusCount[status] !== undefined) {
        statusCount[status]++;
      }
    });
  });

  return Object.entries(statusCount).map(([status, count]) => ({
    name: status,
    value: count,
  }));
}
