import React, { useEffect, useState } from 'react'
import AppointmentsByDayChart from '../../../components/StatisticsRapport/Appointments/AppointmentsByDayChart'
import { getAppointments, getDataForStats, getProfileByEmail } from '../../../api/firebase'


export default function RapportRDVs() {

  const [myAppointments,setMyAppointments] = useState([])
  
  const [chosenMonth,setChosenMonth] = useState(1)
  const [chosenProfileEmail,setChosenProfileEmail] = useState('maitregims@test.com')


  

  useEffect(()=>{

    async function fetch(){
      try{
        const data = await getDataForStats('maitregims@test.com',"2025-01-02")
      setMyAppointments(data);
      }
      catch(e){
        console.log(e);
      }
    }
    
    fetch();
    
  },[])

  if(myAppointments.length <= 0){
    return(
      <div>Chargement ...</div>
    )
  }
  
  else{
    return (
      <div>
        <h2 className='text-design-h2'>Rapport RDVs</h2>
        <div className='py-10 grid'>
          <AppointmentsByDayChart data={myAppointments} />
        </div>
        <div>
          WORKING IN PROGRESS
        </div>
      </div>
    )
  }

  
}