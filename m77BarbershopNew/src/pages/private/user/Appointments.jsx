import { useEffect, useRef, useState } from 'react'
import { FaCalendarAlt } from "react-icons/fa";
import { FaTableCellsRowLock } from "react-icons/fa6";
import { IoStatsChartSharp } from "react-icons/io5";
import { useAuth } from '../../../context/AuthContext';
import { getAllGeneralLockedDays, getAppointments, getProfileByEmail, getProfiles, lockDays, lockProfileDay, unlockDays, unlockProfileDay, updateAppointment } from '../../../api/firebase';

import { MdEmail, MdMarkEmailRead } from "react-icons/md";
import { CiCircleChevDown,CiCircleChevUp,CiUnlock } from "react-icons/ci";
import { Link } from 'react-router-dom';




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
        fetchProfile();
    },[])

    const dico = {
      "my-appointments" : <MyAppointments profile={profileData} popUpSetter={[popUp,setPopUp]}/>,
      "lock-days" : <LockDays profile={profileData}/>,
      "admin-rapport" : <AdminRpport/>
  }

  return (
    <div className='font-custom_1 min-h-screen relative flex flex-col max-w-[750px] mx-auto pb-10'>

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
      <div className='grid ml-auto px-5'>
        <Link to={'/user/dashboard'} className='button-2'>Retour</Link>
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
    'CONFIRMED' : ["bg-green-500","border-green-500"],
    'ABSENT' : ["bg-orange-500","border-orange-500"],
    'CANCELED' : ["bg-red-500","border-red-500"],
    'UNCONFIRMED' : ["bg-gray-500","border-gray-500"]
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
      <div className={`${colorCode[data.confirmed][1]} border-x-[0.15rem] border-y-[0.15rem] p-2`}>
        <h1 className='text-xl'>{data.appointment_hour}</h1>
        
        <div className='grid'>
          <div onClick={()=>{setShowDetails(!showDetails)}} className='flex justify-between py-3 '>
            <h2 className='text-lg px-10'>{data.appointment_user.name} - {data.appointment_service}</h2>
            {
              showDetails? <CiCircleChevUp className='text-3xl my-auto'/> : <CiCircleChevDown className='text-3xl my-auto'/>
            }
          </div>
          <div className={`${showDetails? "grid" : "hidden"} gap-5 `}>
            <button className='button-1 disabled:bg-gray-500 hover:text-[var(--brand-white)]' disabled={today>chosenDay}>Rappel Email</button>
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
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode["CONFIRMED"][0]}`} />
              <span>présent</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode["ABSENT"][0]}`} />
              <span>absent</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode["CANCELED"][0]}`} />
              <span>annulé</span>
            </div>
            <div className='flex gap-1'>
              <div className={`w-[25px] h-[25px] rounded-full ${colorCode["UNCONFIRMED"][0]}`} />
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



const LockDays = ({profile}) => {
  const getTodayDate = () => {
    return new Date().toLocaleString("en-GB", {
      timeZone: "Europe/Brussels",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).split("/").reverse().join("-");
  };

  const [historyClicked,setHistoryClicked] = useState(false)
  const [activeClicked,setActiveClicked] = useState(false)
  const [allLockedClicked,setAllLockedClicked] = useState(false)
  const [chosenDay, setChosenDay] = useState(getTodayDate()); // Selected day
  const [message, setMessage] = useState([]);

  const [allProfiles,setAllProfiles] = useState([])
  const selectedProfileRef = useRef();
  const [otherProfileChosenDay, setOtherProfileChosenDay] = useState(getTodayDate());
  const [otherProfileMessage, setOtherProfileMessage] = useState([]);

  const [selectedAllChosenDay, setSelectedAllChosenDay] = useState(getTodayDate());
  const [allMessage, setAllMessage] = useState([]);
  const [allLockedDays, setAllLockedDays] = useState([]);

  async function handleBlockDay(e){
    e.preventDefault();
    await lockProfileDay(profile.profile_id,chosenDay).then(
      (response) => {
        setMessage(response)
        if(response[0]){
          profile.locked_days = [...profile.locked_days,chosenDay]
        }
        // wait 3 seconds and reset message
        setTimeout(()=>{
          setMessage([])
        },3000)
      }
    )
  }

  async function handleUnlockDay(e,day){
    e.preventDefault();
    await unlockProfileDay(profile.profile_id,day).then(
      (response) => {
        setMessage(response)
        if(response[0]){
          profile.locked_days = profile.locked_days.filter((locked_day)=>{return locked_day !== day})
        }
        // wait 3 seconds and reset message
        setTimeout(()=>{
          setMessage([])
        },3000)
      }
    )
  }

  async function handleAdminLockForOther(e){
    e.preventDefault();
    console.log(selectedProfileRef.current.value,otherProfileChosenDay);

    await lockProfileDay(selectedProfileRef.current.value,otherProfileChosenDay).then(
      (response) => {
        setOtherProfileMessage([response[0],`Jour ${otherProfileChosenDay} bloqué pour le profil ${selectedProfileRef.current.value} - ${response[1]}`])
        // wait 3 seconds and reset message
        setTimeout(()=>{
          setOtherProfileMessage([])
        },3000)
      }
    )
    
  }

  async function handleAdminLockForAll(e){
    e.preventDefault();
    await lockDays([selectedAllChosenDay]).then((response)=>{
      setAllMessage([response[0],`Jour ${selectedAllChosenDay} bloqué pour tous`]);
      setTimeout(()=>{
        setAllMessage([])
      },3000)
      
    })
  }

  async function handleAdminUnlockForAll(e,day){
    e.preventDefault();
    await unlockDays([day]).then(
      (response)=>{
        if(response){
          setAllMessage([response,`Jour ${day} débloqué pour tous`]);
          setTimeout(()=>{
            setAllMessage([])
          },3000)
        }
      }
    )
  }

  async function fetchProfiles(){
    // get all profiles
    await getProfiles().then(
      (response)=>{
        setAllProfiles(response)
      }
    )
  }

  async function fetchAllLockedDays(){
    await getAllGeneralLockedDays().then(
      (response)=>{
        setAllLockedDays(response);
      }
    )
  }

  useEffect(()=>{
    if(profile.admin){
      fetchProfiles();
      fetchAllLockedDays();
    }
  },[])

  if(profile===null || profile === undefined){
    return(
      <div>
        <h1>Profile not found</h1>
      </div>
    )
  }
  else{
    return(
    <div className='py-10 grid gap-10'>
      <div id='self-lock-days' className='grid'>
        <div className='pb-5'>
          <h2 className="text-design-h2">Bloquer des jours</h2>
          <p className='text-design-p text-sm text-start p-0'>
            Vous pouvez bloquer des jours pour lesquels vous ne voulez pas prendre de rendez-vous.<br/>
            Les jours bloqués seront affichés en rouge dans le calendrier des rendez-vous.
          </p>
        </div>
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
                profile.locked_days.map((day,index)=>{
                  if(getTodayDate()>day){
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
                profile.locked_days.map((day,index)=>{
                  if(getTodayDate()<=day){
                    return(
                      <div key={index} className='flex justify-between px-5'>
                        <span className={`${getTodayDate() === day? "text-green-500": "text-green-700"} font-bold`}>{day}</span>
                        <button type='button' onClick={(e)=>{handleUnlockDay(e,day)}} className='text-2xl' ><CiUnlock/></button>
                      </div>
                    )
                  }
                })
              }
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-5 pt-5'>
          <div className='grid'>
            <div className='flex gap-3'>
              <label className="my-auto text-xl">Choisisez le jour à bloquer : </label>
              <input
                type="date"
                min={getTodayDate()}
                value={chosenDay} // Bind the input value to `chosenDay`
                onChange={(e)=>{setChosenDay(e.target.value)}}
                className="text-xl"
              />
            </div>
            <div className='grid gap-3'>
              <p className={`${message[0]? "text-green-500":"text-red-500"}`}>{message[1]}</p>
              <button type='button' onClick={handleBlockDay} className='button-1 mr-auto'>Bloquer</button>
            </div>
          </div>
        </div>
      </div>
      <div id='admin-lock-days-for-other-profiles'>
            {
              profile.admin? 
              <div>
                <div className='grid pb-5'>
                  <h2 className='text-design-h2'>ADMIN - Bloquer des jours pour d'autres profils</h2>
                  <p className='text-design-p text-sm text-start p-0'>
                    Vous pouvez bloquer des jours pour d'autres profils.<br/>
                    Les jours bloqués seront affichés en rouge dans le calendrier des rendez-vous.
                  </p>
                </div>
                <div className='grid grid-cols-2'>
                  <label>Choisissez le profil : </label>
                  {/* dropdown input list with profiles' ids : */}
                  <select ref={selectedProfileRef} className='text-xl border-[0.15rem] border-[var(--brand-black)]'>
                    {
                      allProfiles.map((profile,index)=>{
                        return(
                          <option key={index} value={profile.profile_id}>{profile.profile_id}</option>
                        )
                      })
                    }
                  </select>
                </div>
                <div className='grid grid-cols-2'>
                  <label>Choisissez le jour à bloquer : </label>
                  <input
                    type="date"
                    min={getTodayDate()}
                    value={otherProfileChosenDay} // Bind the input value to `otherProfileChosenDay`
                    onChange={(e)=>{setOtherProfileChosenDay(e.target.value)}}
                    className="text-xl mr-auto"
                  />
                </div>
                <div>
                  <span className={`${otherProfileMessage[0]? "text-green-500" : "text-red-500"}`}>{otherProfileMessage[1]}</span>
                </div>
                <div className='grid justify-start pt-5'>
                  <button type='button' onClick={handleAdminLockForOther} className='button-1'>Bloquer</button>
                </div>
              </div> 
              : <></>
            }
      </div>
      <div id='admin-lock-days-for-all'>
            {
              profile.admin? 
              <div>
                <div className='grid pb-5'>
                  <h2 className='text-design-h2'>ADMIN - Bloquer des jours pour <span className='underline'>tous</span></h2>
                  <p className='text-design-p text-sm text-start p-0'>
                    Vous pouvez bloquer des jours pour tout le monde (example: fermeture du salon pour congé annuel)<br/>
                    Les jours bloqués seront affichés en rouge dans le calendrier des rendez-vous.
                  </p>
                </div>
                <div id='active-future-locked-days' className=''>
                  <div className='flex items-center text-center gap-3'>
                    <label className='text-xl'>Jours totalement bloqués</label>
                    {
                      allLockedClicked ? <CiCircleChevUp onClick={()=>{setAllLockedClicked(false)}} className='text-3xl my-auto cursor-pointer'/> : <CiCircleChevDown onClick={()=>{setAllLockedClicked(true)}} className='text-3xl my-auto cursor-pointer'/>
                    }
                  </div>
                  <div id='active-future-locked-days-container' className={`${allLockedClicked? "flex flex-col h-[150px]" : "hidden"} overflow-auto`}>
                    {
                      allLockedDays.map((day,index)=>{
                        if(getTodayDate()<=day){
                          return(
                            <div key={index} className='flex justify-between px-5'>
                              <span className={`${getTodayDate() === day? "text-green-500": "text-green-700"} font-bold`}>{day}</span>
                              <button type='button' onClick={(e)=>{handleAdminUnlockForAll(e,day)}} className='text-2xl' ><CiUnlock/></button>
                            </div>
                          )
                        }
                      })
                    }
                  </div>
                </div>
                <div className='grid grid-cols-2'>
                  <label>Choisissez le jour à bloquer : </label>
                  <input
                    type="date"
                    min={getTodayDate()}
                    value={selectedAllChosenDay} // Bind the input value to `otherProfileChosenDay`
                    onChange={(e)=>{setSelectedAllChosenDay(e.target.value)}}
                    className="text-xl mr-auto"
                  />
                </div>
                <div>
                  <span className={`${allMessage[0]? "text-green-500": "text-red-500"}`}>{allMessage[1]}</span>
                </div>
                <div className='grid justify-start pt-5'>
                  <button type='button' onClick={handleAdminLockForAll} className='button-1'>Bloquer</button>
                </div>
              </div> 
              : <></>
            }
      </div>
    </div>
  )
  }

  
}

const AdminRpport = () => {
  return(
    <div>
      <h1>Admin Rapport</h1>
    </div>
  )
}