// import { generateDailyAppointmentStats } from "./DataPrep";


import { Chart } from 'react-google-charts';

export default function AppointmentsByDayChart({appointments}) {
  const data = generateDailyAppointmentStats(appointments);

  const options = {
    title: 'Appointments per Day',
    hAxis: { title: 'Date' },
    vAxis: { title: 'Number of Appointments' },
  };

  return <Chart chartType="Bar" width="100%" height="400px" data={data} options={options} />;
}


function generateDailyAppointmentStats(appointments) {
    const stats = {};
    
    // appointments.forEach((doc) => {
    //   const date = doc.id; // yyyy-mm-dd
    //   const count = doc.appointments.length;
    //   stats[date] = (stats[date] || 0) + count;
    // });

    for(let i = 0; i < appointments.length; i++) {
        const doc = appointments[i];

        const date = doc.id; // yyyy-mm-dd
        const count = doc.appointments.length;
        stats[date] = (stats[date] || 0) + count;
    }
  
    const dates = Object.keys(stats).sort();
    const counts = dates.map((date) => stats[date]);
  
    return [['Date', 'Appointments'], ...dates.map((date, i) => [date, counts[i]])];
  }
  