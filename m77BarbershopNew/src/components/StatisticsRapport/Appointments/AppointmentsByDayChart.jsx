// import { generateDailyAppointmentStats } from "./DataPrep";


import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

export default function AppointmentsByDayChart({data}) {
  // const [data,setData] = useState(null);

  const options = {
    title: 'Appointments per Day',
    hAxis: { title: 'Date' },
    vAxis: { title: 'Number of Appointments' },
    // colors : ["#1b9e77", "#d95f02", "#7570b3"],
    bars : "horizontal",
    bar: {
      groupWidth : "75%"
    }
  };

  // useEffect(()=>{
  //   setData(generateDailyAppointmentStats(appointments))
  // },[])


  return <Chart chartType="ColumnChart" className='w-full max-h-[400px]' height="" data={data} options={options} />;  
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
  