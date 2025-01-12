import React, { useEffect, useRef, useState } from 'react'
import { FaCalendarAlt } from "react-icons/fa";
import { FaTableCellsRowLock } from "react-icons/fa6";
import { IoStatsChartSharp } from "react-icons/io5";
import { useAuth } from '../../../context/AuthContext';
import { getAppointments, getProfileByEmail, updateAppointment } from '../../../api/firebase';
import { Link } from 'react-router-dom';

import { MdEmail, MdMarkEmailRead } from "react-icons/md";
import { CiCircleChevDown,CiCircleChevUp } from "react-icons/ci";



export default function Appointments() {

    const {currentUser} = useAuth()

    const [profileData,setProfileData] = useState({})
    const [appointments,setAppointments] = useState([])

    const [view,setView] = useState('my-appointments')

    const [popUp,setPopUp] = useState(null)

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

    const dico = {
      "my-appointments" : <MyAppointments profile={profileData} popUpSetter={[popUp,setPopUp]}/>,
      "lock-days" : <LockDays/>,
      "admin-rapport" : <AdminRpport/>
  }

  return (
    <div className='font-custom_1 min-h-screen relative'>

      <div className={`${popUp!==null? "grid" : "hidden"} absolute top-0 left-0 bg-black/90 h-full w-screen`}>
        {popUp}
      </div>

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
      <div className='grid px-5'>
        {dico[view]}
      </div>
    </div>
  )
}

const MyAppointments = ({ profile,popUpSetter }) => {
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

  const [showColorCode,setShowColorCode] = useState(false)
  const colorCode = {
    // used for visual representation of the appointment status
    'CONFIRMED' : 'green-500',
    'ABSENT' : 'orange-500',
    'CANCELED' : 'red-500',
    'UNCONFIRMED' : 'gray-500'
  }


  // Function to fetch appointments
  async function fetchAppointments (day){
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
  }, [chosenDay]); // TODO add profile here

  // Handle day selection
  const handleNewDay = (e) => {
    const selectedDate = e.target.value; // New date selected
    setChosenDay(selectedDate);
  };

  const PopUpSecurity = ({text,appointment_id,confirmation_state}) => {

    async function handleYes(e){
      e.preventDefault();
      await updateAppointment(chosenDay,appointment_id,confirmation_state).then(
        (response)=>{
          popUpSetter[1](null) // close the popup
          
        }
      )
    }

    function handleNo(e){
      e.preventDefault();
      popUpSetter[1](null);
      
    }

    return(
      <div className='flex flex-col px-5 pt-32 '>
        <h1 className='text-design-h2 text-white text-center'>{text}</h1>
        <div className='flex justify-center gap-5'>
          <button onClick={handleYes} className='button-1 bg-green-500'>Oui</button>
          <button onClick={handleNo} className='button-1 bg-red-500'>Non</button>
        </div>
      </div>
    )
  }

  const AppointmentTab = ({data,colorCode}) => {

    const [showDetails,setShowDetails] = useState(false)
    const [showMoreDetails,setShowMoreDetails] = useState(false)

    function handleConfirmed(e){
      e.preventDefault();
      popUpSetter[1](<PopUpSecurity appointment_id={data.appointment_id} confirmation_state={'CONFIRMED'} text={"Etez vous certain de confirmer la 'présence' ?"}/>)
    }
    function handleAbsent(e){
      e.preventDefault();
      popUpSetter[1](<PopUpSecurity appointment_id={data.appointment_id} confirmation_state={'ABSENT'} text={"Etez vous certain de confirmer l' 'absence' ?"}/>)
    }
    function handleCanceled(e){
      e.preventDefault();
      popUpSetter[1](<PopUpSecurity appointment_id={data.appointment_id} confirmation_state={'CANCELED'} text={"Etez vous certain de confirmer l' 'annulation' ?"}/>)
    }

    return(
      <div className={`border-${colorCode[data.confirmed]} border-x-[0.15rem] border-y-[0.15rem] p-2`}>
        <h1 className='text-xl'>{data.appointment_hour}</h1>
        
        <div className='grid'>
          <div onClick={()=>{setShowDetails(!showDetails)}} className='flex justify-between py-3 '>
            <h2 className='text-lg px-10'>{data.appointment_user.name} - {data.appointment_service}</h2>
            {
              showDetails? <CiCircleChevUp className='text-3xl my-auto'/> : <CiCircleChevDown className='text-3xl my-auto'/>
            }
          </div>
          <div className={`${showDetails? "grid" : "hidden"} gap-5 `}>
            <button className='button-1'>Rappel Email</button>
            <div className='grid'>
              <span>Nom : {data.appointment_user.name}</span>
              <span>GSM : {data.appointment_user.phone}</span>
              <span>Email : {data.appointment_user.email}</span>

              <div>
                <button type='button' onClick={()=>{setShowMoreDetails(!showMoreDetails)}} className='text-sm text-gray-500'>..plus</button>
                <div className={`${showMoreDetails? "grid" : "hidden"} gap-1 border-[0.15rem] border-[var(--brand-black)] p-2`}>
                  <span>{data.appointment_id}</span>
                  <span>Barber : {data.barber_id}</span>
                  <span>Pris le : {data.registered_time}</span>
                </div>
              </div>

            </div>
            <div className='flex justify-center gap-5'>
              <button onClick={handleConfirmed} className='button-2 px-3'>Présent</button>
              <button onClick={handleAbsent} className='button-2 px-3'>Absent</button>
              <button onClick={handleCanceled} className='button-2 px-3'>Annulation</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10 grid">
      <h2 className="text-design-h2">Mes Rendez-vous</h2>
      <div className="flex gap-5 ">
        <label className="my-auto text-xl">Jour : </label>
        <input
          type="date"
          value={chosenDay} // Bind the input value to `chosenDay`
          onChange={handleNewDay}
          className="text-xl"
        />
      </div>

      <div className="mt-5 h-[500px] overflow-y-auto">
        <h3 className="text-xl font-bold">Rendez-vous pour le {chosenDay}:</h3>
        <div className='grid'>
          <div className='px-5 flex justify-between gap-10 border-[0.15rem] border-[var(--brand-black)]'>
            <h4 className='text-lg'>Code couleurs</h4>
            {
              showColorCode ? <CiCircleChevUp onClick={()=>{setShowColorCode(false)}} className='text-3xl my-auto cursor-pointer'/> : <CiCircleChevDown onClick={()=>{setShowColorCode(true)}} className='text-3xl my-auto cursor-pointer'/>
            }
          </div>
          <div className={`${showColorCode? "grid" : "hidden"} px-5 py-1 grid-cols-2 gap-5 border-x-[0.15rem] border-b-[0.15rem] border-[var(--brand-black)]`}>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full bg-${colorCode["CONFIRMED"]}`} />
              <span>présent</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full bg-${colorCode["ABSENT"]}`} />
              <span>absent</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full bg-${colorCode["CANCELED"]}`} />
              <span>annulé</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full bg-${colorCode["UNCONFIRMED"]}`} />
              <span>non confirmé</span>
            </div>
          </div>
        </div>
        {appointments.length > 0 ? (
          <ul className="mt-3">
            {appointments.map((appointment, index) => (
              <AppointmentTab key={index} data={appointment} colorCode={colorCode}  />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-gray-500">Aucun rendez-vous trouvé.</p>
        )}
      </div>
    </div>
  );
};



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