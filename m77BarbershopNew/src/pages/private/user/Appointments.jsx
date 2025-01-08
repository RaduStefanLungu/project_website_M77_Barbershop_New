import React, { useEffect, useRef, useState } from 'react'
import { FaCalendarAlt } from "react-icons/fa";
import { FaTableCellsRowLock } from "react-icons/fa6";
import { IoStatsChartSharp } from "react-icons/io5";
import { useAuth } from '../../../context/AuthContext';
import { getAppointments, getProfileByEmail } from '../../../api/firebase';
import { Link } from 'react-router-dom';


export default function Appointments() {

    const {currentUser} = useAuth()

    const [profileData,setProfileData] = useState({})

    const [view,setView] = useState('my-appointments')

    const dico = {
        "my-appointments" : <MyAppointments profile={profileData}/>,
        "lock-days" : <LockDays/>,
        "admin-rapport" : <AdminRpport/>
    }

    async function fetchProfile(){
      await getProfileByEmail(currentUser.email).then(
        (response)=>{
            setProfileData(response)            
        }
      )
    }
    
    useEffect(()=>{
        fetchProfile();
    },[])

  return (
    <div className='font-custom_1'>
      Appointments
      <div className='grid grid-flow-col py-5'>
        <button onClick={()=>{setView('my-appointments')}} className={`${view==='my-appointments'? "button-2" : "button-1"} text-3xl text-center mx-auto my-auto`}>
          <FaCalendarAlt/>
        </button>
        <button onClick={()=>{setView('lock-days')}} className={`${view==='lock-days'? "button-2" : "button-1"} text-3xl text-center mx-auto my-auto`}>
          <FaTableCellsRowLock/>
        </button>
        {
          profileData.admin ? <button onClick={()=>{setView('admin-rapport')}} className={`${view==='admin-rapport'? "button-2" : "button-1"} text-3xl text-center mx-auto my-auto`}><IoStatsChartSharp/></button> : <></>
        }
      </div>
      <div className='grid'>
        {dico[view]}
      </div>
    </div>
  )
}

const MyAppointments = ({ profile }) => {
  // Function to get today's date in the desired format
  const getTodayDate = () => {
    return new Date().toLocaleString("en-GB", {
      timeZone: "Europe/Brussels",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).split("/").reverse().join("-");
  };

  const [today] = useState(getTodayDate()); // Today's date
  const [chosenDay, setChosenDay] = useState(today); // Selected day
  const [appointments, setAppointments] = useState([]); // Appointments for the chosen day

  // Function to fetch appointments
  const fetchAppointments = async (day) => {
    try {
      const response = await getAppointments(day, profile);
      setAppointments(response);
      console.log(`Appointments for ${day}:`, response);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  // Fetch appointments on component mount and when `chosenDay` changes
  useEffect(() => {
    fetchAppointments(chosenDay);
  }, [chosenDay]);

  // Handle day selection
  const handleNewDay = (e) => {
    const selectedDate = e.target.value; // New date selected
    setChosenDay(selectedDate);
  };

  return (
    <div className="py-10 grid">
      <h2 className="text-design-h2">Mes Rendez-vous</h2>
      <div className="flex gap-5">
        <label className="my-auto text-xl">Jour : </label>
        <input
          type="date"
          value={chosenDay} // Bind the input value to `chosenDay`
          onChange={handleNewDay}
          className="text-xl"
        />
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-bold">Rendez-vous pour le {chosenDay}:</h3>
        {appointments.length > 0 ? (
          <ul className="mt-3">
            {appointments.map((appointment, index) => (
              <AppointmentTab key={index} data={appointment}  />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-gray-500">Aucun rendez-vous trouvé.</p>
        )}
      </div>
    </div>
  );
};

const AppointmentTab = ({data}) => {
  return(
    <div className='border-b-gray-400 border-b-[0.15rem] p-2'>
      <h1 className='text-xl'>{data.appointment_hour}</h1>
      <h2 className='text-lg px-10'>{data.appointment_user.name} -- {data.appointment_service}</h2>
    </div>
  )
}

const LockDays = () => {
  return(
    <div>
      <h1>Lock Days</h1>
    </div>
  )
}

const AdminRpport = () => {
  return(
    <div>
      <h1>Admin Rapport</h1>
    </div>
  )
}