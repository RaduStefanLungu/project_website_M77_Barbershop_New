import React, { useEffect, useState } from 'react'
import AppointmentsByDayChart from '../../../components/StatisticsRapport/Appointments/AppointmentsByDayChart'
import { getAppointments, getProfileByEmail } from '../../../api/firebase'


export default function RapportRDVs() {

  const [myAppointments,setMyAppointments] = useState([])
  
  const [chosenMonth,setChosenMonth] = useState(1)
  const [chosenProfileEmail,setChosenProfileEmail] = useState('maitregims@test.com')

  async function fetchAppointments() {
    const days_of_chosen_month = getAllDaysOfMonth(chosenMonth); // Assume chosenMonth is already defined
    const chosenProfile = await getProfileByEmail(chosenProfileEmail);
  
    const allAppointments = await Promise.all(
      days_of_chosen_month.map(async (day) => {
        const dayAppointments = (await getAppointments(day, chosenProfile)) || [];
        return dayAppointments; // Return an array (even if empty) for each day
      })
    );
  
    return allAppointments.flat(); // Flatten the array of arrays into a single list
  }
  
  

  useEffect(()=>{
    setMyAppointments(fetchAppointments())    
  },[])

  return (
    <div>
      <h2 className='text-design-h2'>RapportRDVs</h2>
      <div className='py-10'>
        <AppointmentsByDayChart appointments={myAppointments} />
      </div>
    </div>
  )
}





function getAllDaysOfMonth(month) {
  const response = []; // List to store the dates
  const year = new Date().getFullYear(); // Get the current year

  // Get the total number of days in the given month
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-indexed here

  // Loop through the days of the month
  for (let day = 2; day <= daysInMonth+1; day++) {
    const date = new Date(year, month - 1, day); // month is 0-indexed here
    const formattedDate = date.toISOString().split("T")[0];
    response.push(formattedDate);
  }

  return response;
}
