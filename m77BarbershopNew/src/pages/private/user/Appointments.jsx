import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser';
import { FaCalendarAlt } from "react-icons/fa";
import { FaTableCellsRowLock } from "react-icons/fa6";
import { IoStatsChartSharp } from "react-icons/io5";
import { useAuth } from '../../../context/AuthContext';
import { getAllGeneralLockedDays, getAppointments, getProfileByEmail, getProfiles, lockDays, lockProfileDay, unlockDays, unlockProfileDay, updateAppointment, updateAppointmentService } from '../../../api/firebase';

import { MdEmail, MdMarkEmailRead } from "react-icons/md";
import { CiCircleChevDown,CiCircleChevUp,CiUnlock } from "react-icons/ci";
import { Link } from 'react-router-dom';
import RapportRDVs from '../admin/RapportRDVs';

import APPOINTMENT_STATES from '../../../data/appointmentStates.json'
import SERVICES from '../../../data/services.json'


export default function Appointments() {

    const {currentUser} = useAuth()

    const [profileData,setProfileData] = useState({})

    const [view,setView] = useState('my-appointments')

    const [popUp,setPopUp] = useState(null)

    async function fetchProfile() {
      await getProfileByEmail(currentUser.email).then((response) => {
        if (response.locked_days) {
          // order chronologically the locked_days
          response.locked_days.sort((a, b) => new Date(a) - new Date(b));
        }
        setProfileData(response);
      });
    }
    
    useEffect(()=>{
        scrollToTop();
        fetchProfile();
    },[])

    const dico = {
      "my-appointments" : <MyAppointmentsHub profile={profileData} popUpSetter={[popUp,setPopUp]}/>,
      "lock-days" : <LockDaysHolder profile={profileData}/>,
      "admin-rapport" : <RapportRDVs/>
  }

  return (
    <div className='font-custom_1 relative'>

      <div className={`${popUp!==null? "grid" : "hidden"} absolute top-0 left-0 bg-black/90 h-full w-full`}>
        {popUp}
      </div>

      <div className='min-h-screen flex flex-col max-w-[1000px] mx-auto pb-10'>
        <div className='grid grid-flow-col py-5'>
          <button onClick={()=>{setView('my-appointments')}} className={`${view==='my-appointments'? "button-2" : "button-1"} text-3xl text-center mx-auto my-auto`}>
            <FaCalendarAlt/>
          </button>
          {
            profileData.admin ? <button onClick={()=>{setView('lock-days')}} className={`${view==='lock-days'? "button-2" : "button-1"} text-3xl text-center mx-auto my-auto`}>
            <FaTableCellsRowLock/>
          </button> : <></>
          }
          {
            profileData.admin ? <button onClick={()=>{setView('admin-rapport')}} className={`${view==='admin-rapport'? "button-2" : "button-1"} text-3xl text-center mx-auto my-auto`}><IoStatsChartSharp/></button> : <></>
          }
        </div>
        <div className='grid px-0'>
          {dico[view]}
        </div>
        <div className='grid ml-auto px-5'>
          <Link to={'/user/dashboard'} className='button-2'>Retour</Link>
        </div>
      </div>
    </div>
  )
}

const MyAppointmentsHub = ({profile,popUpSetter}) => {
  if(profile.admin){
    return(<MyAppointmentsAdmin profile={profile} popUpSetter={popUpSetter}/>)
  }
  else{
    return(<MyAppointments profile={profile} popUpSetter={popUpSetter}/>)
  }
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
    [APPOINTMENT_STATES.affirmative_state] : ["bg-green-500","border-green-500"],
    [APPOINTMENT_STATES.medium_state] : ["bg-orange-500","border-orange-500"],
    [APPOINTMENT_STATES.negative_state] : ["bg-red-500","border-red-500"],
    [APPOINTMENT_STATES.neutral_state] : ["bg-gray-500","border-gray-500"]
  }

  function orderByTime(listOfAppointments) {
    if (!Array.isArray(listOfAppointments)) {
      console.error("Invalid input: Expected an array of appointments.");
      return [];
    }
  
    return listOfAppointments.sort((a, b) => {
      const [hourA, minuteA] = a.appointment_hour.split(":").map(Number);
      const [hourB, minuteB] = b.appointment_hour.split(":").map(Number);
  
      return hourA * 60 + minuteA - (hourB * 60 + minuteB);
    });
  }
  
  

  // Function to fetch appointments
  async function fetchAppointments (day){
    try {
      const response = await getAppointments(day, profile);
      setAppointments(orderByTime(response));
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  // Fetch appointments on component mount and when `chosenDay` changes
  useEffect(() => {
    fetchAppointments(chosenDay);
  }, [chosenDay,profile]);

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
          fetchAppointments(chosenDay)
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

    const [emailSentMessage,setEmailSentMessage] = useState("")
    const rappelFormRef = useRef()

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

    function handleRappel(e){
      e.preventDefault();

      emailjs.sendForm(import.meta.env.VITE_REACT_APP_EMAILJS_SERVICE_ID, "template_yy6hcmb", rappelFormRef.current , import.meta.env.VITE_REACT_APP_EMAILJS_USER_ID)
            .then((result) => {
                console.log(`Email envoyé : ${result.text} !` )
                setEmailSentMessage("Email envoyé avec success!")
                // Add any success message or logic here
            }, (error) => {
                console.error('Email sending failed:', error.text);
                setEmailSentMessage("Problème lors de l'envoie de l'email!")
                // Add any error handling logic here
            });
    }

    return(
      <div className={`${data.confirmed === APPOINTMENT_STATES.neutral_state ? colorCode[data.confirmed][1] : colorCode[data.confirmed][0]} border-x-[0.15rem] border-y-[0.15rem] p-2`}>
        <h1 className='text-xl'>{data.appointment_hour}</h1>
        
        <div className='grid'>
          <div onClick={()=>{setShowDetails(!showDetails)}} className='flex justify-between py-3 '>
            <h2 className='text-lg px-10'>{data.appointment_user.name} - {data.appointment_service}</h2>
            {
              showDetails? <CiCircleChevUp className='text-3xl my-auto'/> : <CiCircleChevDown className='text-3xl my-auto'/>
            }
          </div>
          <div className={`${showDetails? "grid" : "hidden"} gap-5 `}>
            <button type='button' onClick={handleRappel} className='button-1 disabled:bg-gray-500' disabled={today>chosenDay}>Rappel Email</button>
            <label className='text-center text-lg'>{emailSentMessage}</label>
            <form ref={rappelFormRef} className='hidden'>
              <input name="user_email" value={data.appointment_user.email}></input>
              <input name="user_name" value={data.appointment_user.name}></input>
              <input name="appointment_date" value={data.appointment_date}></input>
              <input name="appointment_time" value={data.appointment_hour}></input>
            </form>
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
                  <span>Statut : {data.confirmed}</span>
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
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode[APPOINTMENT_STATES.affirmative_state][0]}`} />
              <span>présent</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode[APPOINTMENT_STATES.medium_state][0]}`} />
              <span>absent</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode[APPOINTMENT_STATES.negative_state][0]}`} />
              <span>annulé</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode[APPOINTMENT_STATES.neutral_state][0]}`} />
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

const MyAppointmentsAdmin = ({ profile,popUpSetter }) => {
  if(!profile.admin){
    return(<>Ce profile n'est pas ADMINISTRATEUR !</>)
  }
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

  const [allProfiles,setAllProfiles] = useState([]);

  const [chosenDay, setChosenDay] = useState(today); // Selected day
  const [chosenProfile, setChosenProfile] = useState({}); // Selected profile
  const [appointments, setAppointments] = useState([]); // Appointments for the chosen day

  const [showColorCode,setShowColorCode] = useState(false)
  const colorCode = {
    // used for visual representation of the appointment status
    [APPOINTMENT_STATES.affirmative_state] : ["bg-green-500","border-green-500"],
    [APPOINTMENT_STATES.medium_state] : ["bg-orange-500","border-orange-500"],
    [APPOINTMENT_STATES.negative_state] : ["bg-red-500","border-red-500"],
    [APPOINTMENT_STATES.neutral_state] : ["bg-gray-500","border-gray-500"]
  }

  function orderByTime(listOfAppointments) {
    if (!Array.isArray(listOfAppointments)) {
      console.error("Invalid input: Expected an array of appointments.");
      return [];
    }
  
    return listOfAppointments.sort((a, b) => {
      const [hourA, minuteA] = a.appointment_hour.split(":").map(Number);
      const [hourB, minuteB] = b.appointment_hour.split(":").map(Number);
  
      return hourA * 60 + minuteA - (hourB * 60 + minuteB);
    });
  }
  
  

  // Function to fetch appointments
  async function fetchAppointments (profile,day){
    try {
      const response = await getAppointments(day, profile);
      setAppointments(orderByTime(response));
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };


  async function fetchProfiles(){
    const resp = await getProfiles();
    setAllProfiles(resp);
  }

  useEffect(()=>{
    fetchProfiles();
  },[])

  // Fetch appointments on component mount and when `chosenDay` changes
  useEffect(() => {
    fetchAppointments(chosenProfile,chosenDay);
  }, [chosenDay,chosenProfile]);

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
          fetchAppointments(chosenProfile,chosenDay)
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

  const PopUpServiceChange = ({selected_appointment}) => {

    const [newService,setNewService] = useState(null);

    const ServiceDropdown = ({ onSelect }) => {
      const [isOpen, setIsOpen] = useState(false);
      const [selectedService, setSelectedService] = useState(null);
    
      // 🔥 Ensure `all_services_flat` exists
      const serviceList = SERVICES?.all_services_flat || [];
    
      const handleSelect = (service) => {
        setSelectedService(service);
        setIsOpen(false);
        if (onSelect) onSelect(service);
      };
    
      return (
        <div className="relative w-64">
          {/* Button to Open Dropdown */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded flex justify-between items-center"
          >
            {selectedService ? `${selectedService.name} - ${selectedService.price}€` : "Sélectionnez un service"}
            <span>{isOpen ? "▲" : "▼"}</span>
          </button>
    
          {/* Dropdown List */}
          {isOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded max-h-60 overflow-y-auto">
              {serviceList.map((service, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(service)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  <span className="font-bold">{service.name}</span> - {service.price}€
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    function handleClose(e){
      e.preventDefault();
      popUpSetter[1](null);
      
    }

    async function handleSave(e){
      e.preventDefault();
      const resp = await updateAppointmentService(selected_appointment.appointment_date,selected_appointment.appointment_id,newService)
      if(resp){
        fetchAppointments(chosenProfile,chosenDay)
        popUpSetter[1](null) // close the popup
        
      }
    }

    function handleOnSelect(service){
      setNewService(service)
    }

    return(
      <div className='flex flex-col px-0 pt-32 '>
        <h1 className='text-design-h2 text-white text-center'>Choisisez le nouveau service</h1>
        <div className='flex justify-center gap-5'>
          <ServiceDropdown onSelect={handleOnSelect}></ServiceDropdown>
        </div>
        <div className='grid'>
          <label className='text-design-h4 text-white text-center pt-5'>Service séléctionné : {newService!==null ? newService.name : ""}</label>
        </div>
        <div className='flex pt-5 gap-3 mx-auto'>
          <button onClick={handleClose} className='button-1' >Annulation</button>
          <button onClick={handleSave} className='button-2' >Sauvegarder</button>
        </div>
      </div>
    )
  }

  const AppointmentTab = ({data,colorCode}) => {

    const [showDetails,setShowDetails] = useState(false)
    const [showMoreDetails,setShowMoreDetails] = useState(false)

    const [emailSentMessage,setEmailSentMessage] = useState("")
    const rappelFormRef = useRef()

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

    function handleRappel(e){
      e.preventDefault();

      emailjs.sendForm(import.meta.env.VITE_REACT_APP_EMAILJS_SERVICE_ID, "template_yy6hcmb", rappelFormRef.current , import.meta.env.VITE_REACT_APP_EMAILJS_USER_ID)
            .then((result) => {
                console.log(`Email envoyé : ${result.text} !` )
                setEmailSentMessage("Email envoyé avec success!")
                // Add any success message or logic here
            }, (error) => {
                console.error('Email sending failed:', error.text);
                setEmailSentMessage("Problème lors de l'envoie de l'email!")
                // Add any error handling logic here
            });
    }

    function handleServiceChange(e){
      e.preventDefault();

      popUpSetter[1](<PopUpServiceChange selected_appointment={data}></PopUpServiceChange>)
    }

    return(
      <div className={`${data.confirmed === APPOINTMENT_STATES.neutral_state ? colorCode[data.confirmed][1] : colorCode[data.confirmed][0]} border-x-[0.15rem] border-y-[0.15rem] p-2`}>
        <h1 className='text-xl'>{data.appointment_hour}</h1>
        
        <div className='grid'>
          <div onClick={()=>{setShowDetails(!showDetails)}} className='flex justify-between py-3 '>
            <h2 className='text-lg px-10'>{data.appointment_user.name} - {data.appointment_service}</h2>
            {
              showDetails? <CiCircleChevUp className='text-3xl my-auto'/> : <CiCircleChevDown className='text-3xl my-auto'/>
            }
          </div>
          <div className={`${showDetails? "grid" : "hidden"} gap-5 `}>
            <div className='flex gap-3 justify-center'>
              <button type='button' onClick={handleRappel} className='button-1 disabled:bg-gray-500' disabled={today>chosenDay}>Rappel Email</button>
              <button type='button' onClick={handleServiceChange} className='button-2 ' >Changer Service</button>
            </div>
            <label className='text-center text-lg'>{emailSentMessage}</label>
            <form ref={rappelFormRef} className='hidden'>
              <input name="user_email" value={data.appointment_user.email}></input>
              <input name="user_name" value={data.appointment_user.name}></input>
              <input name="appointment_date" value={data.appointment_date}></input>
              <input name="appointment_time" value={data.appointment_hour}></input>
            </form>
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
                  <span>Statut : {data.confirmed}</span>
                </div>
              </div>

            </div>
            <div className='flex justify-center gap-1 md:gap-5'>
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
      <div className="flex gap-5 ">
        <label className="my-auto text-xl">Choisisez le profil : </label>
        <select className='text-xl border border-gray-500'
                value={chosenProfile?.profile_id || ""}
                onChange={(e)=>{
                  const selected = allProfiles.find((p) => p.profile_id === e.target.value);
                  setChosenProfile(selected)
                }} >
          {
            allProfiles.map((p)=>{
              return(
                <option key={p.profile_id} value={p.profile_id}>{p.profile_id}</option>
              )
            })
          }
        </select>
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
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode[APPOINTMENT_STATES.affirmative_state][0]}`} />
              <span>présent</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode[APPOINTMENT_STATES.medium_state][0]}`} />
              <span>absent</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode[APPOINTMENT_STATES.negative_state][0]}`} />
              <span>annulé</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode[APPOINTMENT_STATES.neutral_state][0]}`} />
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


const LockDaysHolder = ({profile}) =>{
  return(
    <div className='grid gap-5'>
      <LockDays profile={profile} />
      <LockDaysForAll profile={profile}/>
    </div>
  )
}

const LockDays = ({ profile }) => {
  const today = new Date().toISOString().split("T")[0]; // Format: yyyy-mm-dd

  const [historyClicked, setHistoryClicked] = useState(false);
  const [activeClicked, setActiveClicked] = useState(false);
  const [chosenDay, setChosenDay] = useState(today);
  const [message, setMessage] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [lockedDays, setLockedDays] = useState([]);

  /** Fetch all profiles */
  async function fetchProfiles() {
    const response = await getProfiles();
    setAllProfiles(response);
    if (response.length > 0) {
      handleProfileChange(response[0].email); // Auto-select first profile
    }
  }

  /** Fetch selected profile data */
  async function handleProfileChange(email) {
    const profileData = await getProfileByEmail(email);
    setSelectedProfile(profileData);
    setLockedDays(profileData.locked_days ? [...profileData.locked_days] : []);
  }

  /** Fetch profiles on component mount */
  useEffect(() => {
    if (profile.admin) {
      fetchProfiles();
    }
  }, []);

  /** Handle locking a day */
  async function handleBlockDay(e) {
    e.preventDefault();
    if (!selectedProfile) return;

    const response = await lockProfileDay(selectedProfile.profile_id, chosenDay);
    setMessage(response);

    if (response[0]) {
      setLockedDays((prev) => [...prev, chosenDay].sort()); // Keep sorted
    }

    setTimeout(() => setMessage([]), 3000);
  }

  /** Handle unlocking a day */
  async function handleUnlockDay(e, day) {
    e.preventDefault();
    if (!selectedProfile) return;

    const response = await unlockProfileDay(selectedProfile.profile_id, day);
    setMessage(response);

    if (response[0]) {
      setLockedDays((prev) => prev.filter((lockedDay) => lockedDay !== day));
    }

    setTimeout(() => setMessage([]), 3000);
  }

  /** Sort dates */
  const pastLockedDays = lockedDays.filter((day) => day < today).sort().reverse(); // Closest past first
  const futureLockedDays = lockedDays.filter((day) => day >= today).sort(); // Chronological order

  return (
    <div className="py-10 grid gap-10">
      <h2 className="text-design-h2">Bloquer des jours</h2>
      <p className="text-sm text-gray-600">
        Sélectionnez un profil et un jour à bloquer. Les jours bloqués seront affichés en rouge.
      </p>

      {/* Profile Selection */}
      <div className="grid grid-cols-2">
        <label>Choisissez un profil :</label>
        <select
          className="text-xl border border-gray-500"
          onChange={(e) => handleProfileChange(e.target.value)}
        >
          {allProfiles.map((p) => (
            <option key={p.email} value={p.email}>
              {p.email}
            </option>
          ))}
        </select>
      </div>

      {/* Locked Days History */}
      {selectedProfile && (
        <div className="grid">
          <div className="flex items-center gap-3">
            <label className="text-xl">Historique</label>
            {historyClicked ? (
              <CiCircleChevUp className="text-3xl cursor-pointer" onClick={() => setHistoryClicked(false)} />
            ) : (
              <CiCircleChevDown className="text-3xl cursor-pointer" onClick={() => setHistoryClicked(true)} />
            )}
          </div>
          <div className={`${historyClicked ? "grid" : "hidden"} h-[150px] overflow-auto`}>
            {pastLockedDays.length > 0 ? (
              pastLockedDays.map((day, index) => (
                <div key={index} className="text-red-600">{day}</div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Aucune donnée</p>
            )}
          </div>
        </div>
      )}

      {/* Future Locked Days */}
      {selectedProfile && (
        <div className="grid">
          <div className="flex items-center gap-3">
            <label className="text-xl">Jours à venir</label>
            {activeClicked ? (
              <CiCircleChevUp className="text-3xl cursor-pointer" onClick={() => setActiveClicked(false)} />
            ) : (
              <CiCircleChevDown className="text-3xl cursor-pointer" onClick={() => setActiveClicked(true)} />
            )}
          </div>
          <div className={`${activeClicked ? "grid" : "hidden"} h-[150px] overflow-auto`}>
            {futureLockedDays.length > 0 ? (
              futureLockedDays.map((day, index) => (
                <div key={index} className="flex justify-between py-3">
                  <span className="text-green-700 font-bold">{day}</span>
                  <button onClick={(e) => handleUnlockDay(e, day)} className="text-2xl">
                    <CiUnlock />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Aucune donnée</p>
            )}
          </div>
        </div>
      )}

      {/* Lock a new day */}
      <div className="grid grid-cols-2">
        <label>Choisissez un jour à bloquer :</label>
        <input type="date" min={today} value={chosenDay} onChange={(e) => setChosenDay(e.target.value)} className="text-xl" />
      </div>

      <div className="grid">
        <p className={`${message[0] ? "text-green-500" : "text-red-500"}`}>{message[1]}</p>
        <button onClick={handleBlockDay} className="button-1">Bloquer</button>
      </div>
    </div>
  );
};

const LockDaysForAll = ({ profile }) => {
  const today = new Date().toISOString().split("T")[0]; // Format: yyyy-mm-dd

  const [historyClicked, setHistoryClicked] = useState(false);
  const [activeClicked, setActiveClicked] = useState(false);
  const [chosenDay, setChosenDay] = useState(today);
  const [message, setMessage] = useState([]);
  const [globalLockedDays, setGlobalLockedDays] = useState([]);

  /** Récupérer les jours bloqués globalement */
  async function fetchGlobalLockedDays() {
    const response = await getAllGeneralLockedDays();
    setGlobalLockedDays(response || []);
  }

  /** Charger les jours bloqués au montage */
  useEffect(() => {
    if (profile.admin) {
      fetchGlobalLockedDays();
    }
  }, []);

  /** Bloquer un jour globalement et mettre à jour immédiatement */
  async function handleGlobalBlockDay(e) {
    e.preventDefault();
    const response = await lockDays([chosenDay]);
    setMessage([response,'La journée a été bloquée !']);

    if (response) {
      setGlobalLockedDays((prev) => [...prev, chosenDay].sort());
    }

    setTimeout(() => setMessage([]), 3000);
  }

  /** Débloquer un jour globalement et mettre à jour immédiatement */
  async function handleGlobalUnlockDay(e, day) {
    e.preventDefault();
    const response = await unlockDays([day]);
    setMessage([response,'La journée a été débloquée !']);

    if (response) {
      setGlobalLockedDays((prev) => prev.filter((lockedDay) => lockedDay !== day));
    }

    setTimeout(() => setMessage([]), 3000);
  }

  /** Trier les jours */
  const pastGlobalLockedDays = [...globalLockedDays.filter((day) => day < today)].sort().reverse();
  const futureGlobalLockedDays = [...globalLockedDays.filter((day) => day >= today)].sort();

  return (
    <div className="py-10 grid gap-10">
      <h2 className="text-design-h2">Bloquer des journées générales</h2>
      <p className="text-sm text-gray-600">
        Sélectionnez une journée à bloquer pour tout le monde. Les jours bloqués apparaissent en rouge.
      </p>

      {/* Bloquer un jour pour tout le monde */}
      <div className="grid">
        <h3 className="text-xl font-semibold">Bloquer un jour pour tout le monde</h3>
        <div className="grid grid-cols-2">
          <label>Choisissez un jour :</label>
          <input type="date" min={today} value={chosenDay} onChange={(e) => setChosenDay(e.target.value)} className="text-xl" />
        </div>
        <button onClick={handleGlobalBlockDay} className="button-1">Bloquer</button>
      </div>

      {/* Historique des jours bloqués globalement */}
      <div className="grid">
        <div className="flex items-center gap-3">
          <label className="text-xl">Historique</label>
          {historyClicked ? (
            <CiCircleChevUp className="text-3xl cursor-pointer" onClick={() => setHistoryClicked(false)} />
          ) : (
            <CiCircleChevDown className="text-3xl cursor-pointer" onClick={() => setHistoryClicked(true)} />
          )}
        </div>
        <div className={`${historyClicked ? "grid" : "hidden"} h-[150px] overflow-auto`}>
          {pastGlobalLockedDays.length > 0 ? (
            pastGlobalLockedDays.map((day, index) => <div key={index} className="text-red-600">{day}</div>)
          ) : (
            <p className="text-gray-500 text-sm">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Jours à venir bloqués globalement */}
      <div className="grid">
        <div className="flex items-center gap-3">
          <label className="text-xl">Jours à venir</label>
          {activeClicked ? (
            <CiCircleChevUp className="text-3xl cursor-pointer" onClick={() => setActiveClicked(false)} />
          ) : (
            <CiCircleChevDown className="text-3xl cursor-pointer" onClick={() => setActiveClicked(true)} />
          )}
        </div>
        <div className={`${activeClicked ? "grid" : "hidden"} h-[150px] overflow-auto`}>
          {futureGlobalLockedDays.length > 0 ? (
            futureGlobalLockedDays.map((day, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-green-700 font-bold">{day}</span>
                <button onClick={(e) => handleGlobalUnlockDay(e, day)} className="text-2xl">
                  <CiUnlock />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Aucune donnée</p>
          )}
        </div>
      </div>

      <p className={`${message[0] ? "text-green-500" : "text-red-500"}`}>{message[1]}</p>
    </div>
  );
};


const AdminLockDays = ({currentProfile,allProfiles}) => {
  const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
    timeZone: 'Europe/Brussels', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  }).split('/').reverse().join('-'))

  const [chosenDay, setChosenDay] = useState(today); // Selected day
  const [message, setMessage] = useState([]);
  
  const selectedProfileRef = useRef();

  if(!currentProfile || !currentProfile.admin){
    return(<>Profile pas retrouve !</>)
  }
  else if(!allProfiles){
    return(<>Pas de profils trouvés</>)
  }

  const ShowHistory = ({wantedProfile}) => {
    const [historyClicked,setHistoryClicked] = useState(false)
    const [activeClicked,setActiveClicked] = useState(false)
    

    async function handleUnlockDay(e,day){
      e.preventDefault();
      await unlockProfileDay(wantedProfile.profile_id,day).then(
        (response) => {
          setMessage(response)
          if(response[0]){
            wantedProfile.locked_days = wantedProfile.locked_days.filter((locked_day)=>{return locked_day !== day})
          }
          // wait 3 seconds and reset message
          setTimeout(()=>{
            setMessage([])
          },3000)
        }
      )
    }

    if(!wantedProfile){
      return(<></>)
    }

    return(
      <div className='grid grid-flow-col'>
        <div id='history' className=''>
          <div className='flex items-center text-center gap-3'>
            <label className='text-xl'>Historique</label>
            {
              historyClicked ? <CiCircleChevUp onClick={()=>{setHistoryClicked(false)}} className='text-3xl my-auto cursor-pointer'/> : <CiCircleChevDown onClick={()=>{setHistoryClicked(true)}} className='text-3xl my-auto cursor-pointer'/>
            }
          </div>
          <div id='historique-container' className={`${historyClicked? "flex flex-col h-[150px]" : "hidden"}  overflow-auto`}>
            {
              wantedProfile.locked_days.map((day,index)=>{
                if(today>day){
                  return(
                    <div key={index} className='flex gap-5 px-5'>
                      <span className='text-red-700'>{day}</span>
                    </div>
                  )
                }
              })
            }
          </div>
        </div>
        <div id='active-future-locked-days' className=''>
          <div className='flex items-center text-center gap-3'>
            <label className='text-xl'>Jours à venir</label>
            {
              activeClicked ? <CiCircleChevUp onClick={()=>{setActiveClicked(false)}} className='text-3xl my-auto cursor-pointer'/> : <CiCircleChevDown onClick={()=>{setActiveClicked(true)}} className='text-3xl my-auto cursor-pointer'/>
            }
          </div>
          <div id='active-future-locked-days-container' className={`${activeClicked? "flex flex-col h-[150px]" : "hidden"} overflow-auto`}>
            {
              wantedProfile.locked_days.map((day,index)=>{
                if(today<=day){
                  return(
                    <div key={index} className='flex justify-between px-5'>
                      <span className={`${today === day? "text-green-500": "text-green-700"} font-bold`}>{day}</span>
                      <button type='button' onClick={(e)=>{handleUnlockDay(e,day)}} className='text-2xl' ><CiUnlock/></button>
                    </div>
                  )
                }
              })
            }
          </div>
        </div>
      </div>
    )
  }

  async function handleBlockDay(e){
    e.preventDefault();
    await lockProfileDay(selectedProfileRef.profile_id,chosenDay).then(
      (response) => {
        setMessage(response)
        if(response[0]){
          selectedProfileRef.locked_days = [...selectedProfileRef.locked_days,chosenDay]
        }
        // wait 3 seconds and reset message
        setTimeout(()=>{
          setMessage([])
        },3000)
      }
    )
  }

  return(
    <div id='admin-lock-days-for-other-profiles'>
      <div>
          <div className='grid pb-5'>
            <h2 className='text-design-h2'>ADMIN - Bloquer des jours pour d'autres profils</h2>
            <p className='text-design-p text-sm text-start p-0'>
              Vous pouvez bloquer des jours pour d'autres profils.<br/>
              Les jours bloqués seront affichés en rouge dans le calendrier des rendez-vous.
            </p>
          </div>
          <ShowHistory wantedProfile={selectedProfileRef} />
          <div className='grid grid-cols-2'>
            <label>Choisissez le profil : </label>
            {/* dropdown input list with profiles' ids : */}
            <select ref={selectedProfileRef} className='text-xl border-[0.15rem] border-[var(--brand-black)]'>
              {
                allProfiles.map((profile,index)=>{
                  return(
                    <option key={index} value={profile}>{profile.profile_id}</option>
                  )
                })
              }
            </select>
          </div>
          <div className='grid grid-cols-2'>
            <label>Choisissez le jour à bloquer : </label>
            <input
              type="date"
              min={today}
              value={chosenDay} // Bind the input value to `otherProfileChosenDay`
              onChange={(e)=>{setChosenDay(e.target.value)}}
              className="text-xl mr-auto"
            />
          </div>
          {/* <div>
            <span className={`${otherProfileMessage[0]? "text-green-500" : "text-red-500"}`}>{otherProfileMessage[1]}</span>
          </div> */}
          <div className='grid justify-start pt-5'>
            <button type='button' onClick={handleBlockDay} className='button-1'>Bloquer</button>
          </div>
        </div> 
      </div>
  )
}

const scrollToTop = () => {
  window.scrollTo({
      top: 0,
      behavior: "smooth", // Optional: "smooth" for animated scroll or "auto" for instant scroll
  });
};

