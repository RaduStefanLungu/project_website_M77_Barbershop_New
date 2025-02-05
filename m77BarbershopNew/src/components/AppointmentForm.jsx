import { useState,useEffect, useRef } from 'react'
import { addAppointment2, getSchedule, getVisibleProfiles } from '../api/firebase'
import { v4 } from 'uuid'
import emailjs from '@emailjs/browser';

import SERVICES from '../data/services.json'
import { Link } from 'react-router-dom'

import INFO_DATA from '../data/data.json'
import APPOINTMENT_STATES from '../data/appointmentStates.json'

export default function AppointmentForm(){

    const [profiles,setProfiles] = useState([])

    const [chosenProfile,setChosenProfile] = useState(null)

    const [appointView,setAppointView] = useState(null)
    const [showAppointView,setShowAppointView] = useState(false)

    useEffect(()=>{
        async function fetchProfiles(){
            await getVisibleProfiles().then(
                (response) => {
                    setProfiles(response)
                }
            )
        } 

        fetchProfiles()
    },[])
    

    function handleBack(e){
        e.preventDefault()
        setChosenProfile(null)

        setAppointView(null)
        setShowAppointView(false)
        
        scrollToTop()
    }
    
    return(
        <div className=''>
            {/* <h2 className='font-bold text-3xl py-3'> Choisisez le barber</h2> */}
            <div className={`${!showAppointView? "block" : "hidden"}`}>

                {
                    chosenProfile === null ? 
                    <ProfileSelection existingProfiles={profiles} profileSetter={setChosenProfile}></ProfileSelection> :
                    <TakingAppointment barberProfile={chosenProfile} backButtonFunction={handleBack} appointViewSetter={[appointView,setAppointView]} showViewSetter={[showAppointView,setShowAppointView]}></TakingAppointment>
                }
            </div>
            <div className={`${showAppointView? "block" : "hidden"}`}>
                {appointView}
            </div>
        </div>
    )
}
const ProfileCard = ({ profile,setter, clickable=false }) => {

    function handleClickedProfile(e) {
        e.preventDefault();         
        if(clickable){
            setter(profile)
            scrollToTop();
        }
        
    }
    
    return (
        <button type='button' onClick={handleClickedProfile}>
            <div className="relative container m-auto w-[250px] h-[450px] overflow-hidden">
                <div className={`absolute overflow-hidden bottom-0 ${clickable? "backdrop-grayscale bg-black/35 hover:bg-transparent hover:backdrop-grayscale-0 transition-all duration-500" : ""} z-20 w-[250px] h-[550px] flex`}>
                    <div className={`text-white text-start flex flex-col w-full h-full px-5 pt-[425px] transform ${clickable? "translate-y-0 hover:translate-y-[100px]" : "translate-y-[100px]"}  transition-transform duration-500 ease-in-out`}>
                        <label className="font-custom_1 font-bold text-xl pb-2">
                            {profile.last_name + " " + profile.first_name}
                        </label>
                        <p className='font-custom_1 text-sm italic'>
                            {profile.profile_description}
                        </p>
                    </div>
                    
                </div>
                <img src={profile.image_url} className="w-[250px] h-[450px] absolute top-0 z-0" alt="Profile"/>
            </div>
        </button>
    );
};

const ProfileSelection = ({existingProfiles,profileSetter}) => {

    return(
        <div className='grid'>
            <h2 className='font-custom_1 text-3xl py-3'> Choisisez le barber</h2>
            <div id='chose_user' className='grid md:grid-cols-2 lg:grid-flow-col gap-10'>
                {
                    existingProfiles.map((profile,key) => {                            
                        return(
                            <ProfileCard key={key} profile={profile} setter={profileSetter} clickable={true} ></ProfileCard>
                        )
                    })
                }
            </div>
        </div>
    )
}

const TakingAppointment = ({barberProfile, backButtonFunction,appointViewSetter,showViewSetter}) => {
    const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
        timeZone: 'Europe/Brussels', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
      }).split('/').reverse().join('-'))

    const [clientFirstName,setClientFirstName] = useState('')
    const [clientLastName,setClientLastName] = useState('')
    const [clientEmail,setClientEmail] = useState('')
    const [clientPhone,setClientPhone] = useState('')
    const [clientAppointmentDate,setClientAppointmentDate] = useState('')

    const [clientAppointmentService,setClientAppointmentService] = useState('')

    const [hoursOfDay,setHoursOfDay] = useState([])
    const [chosenHour,setChosenHour] = useState('')

    const [clickedSubmit,setClickedSubmit] = useState(false);

    const confirmationEmailFormRef = useRef()

    async function handleSubmit(e){
        e.preventDefault();

        setClickedSubmit(true);

        const appointment = {
            barber_id : barberProfile.profile_id,
            appointment_id : v4(),
            appointment_hour : chosenHour,
            appointment_date : clientAppointmentDate,
            appointment_service : clientAppointmentService,
            appointment_user : {
              email : clientEmail,
              name : `${clientLastName} ${clientFirstName}`,
              phone : clientPhone
            },
            confirmed : APPOINTMENT_STATES.neutral_state,
            registered_time : new Date().toLocaleString()
          }
        
        if(barberProfile !== null && clientFirstName && clientLastName && clientEmail && clientPhone && clientAppointmentDate && clientAppointmentService && chosenHour){
            await addAppointment2(appointment).then(
                (response) => {
                    let message = null
                    if(response){
                        message = <span>Votre rendez-vous a été sauvegardé !<br/> Un email de confirmation a été envoyé.<br/>Pour tout changement, contactez : {INFO_DATA.mirco.contact_phone} </span>
                        emailjs.sendForm(import.meta.env.VITE_REACT_APP_EMAILJS_SERVICE_ID, "template_9xg2a7c", confirmationEmailFormRef.current , import.meta.env.VITE_REACT_APP_EMAILJS_USER_ID)
                            .then((result) => {
                                console.log(`Email envoyé : ${result.text} !` )
                                // Add any success message or logic here
                            }, (error) => {
                                console.error('Email sending failed:', error.text);
                                message = <span>Erreur lors de l'envoie de l'email de confirmation !<br/> Veuillez nous contacter pour confirmer la prise de votre rendez-vous.</span>
                                // Add any error handling logic here
                            });
                    }
                    else{
                        message = <span>Erreur lors de la sauvegarde de votre rendez-vous !<br/> Veuillez réessayer.</span>
                    }
                    appointViewSetter[1](<AppointmentResponseView success={response} message={message} />)
                    showViewSetter[1](true)

                    scrollToTop();

                }
            )

        }

    }
    

    async function handleDateChosen(e){
        e.preventDefault();
        setChosenHour('')

        setClientAppointmentDate(e.target.value);
        setHoursOfDay(await getSchedule(e.target.value,barberProfile))
    }

    function handleServiceSelect(e,selected_service){
        e.preventDefault();
        setClientAppointmentService(selected_service)
    }

    function handleBack(e){
        e.preventDefault();
        backButtonFunction(e);

        setClientFirstName('');
        setClientLastName('');
        setClientEmail('');
        setClientPhone('');
        setClientAppointmentDate('');
        setClientAppointmentService('');
        setHoursOfDay([]);
        setChosenHour('');
        // setAppointmentConfirmed(false);
    }

    return(
        <div className='grid'>
            <form onSubmit={handleSubmit} className='flex flex-col justify-center md:flex-row gap-5'>

                <div className='flex flex-col justify-center items-center'>
                    <div className='mb-auto'>
                        <ProfileCard profile={barberProfile} setter={null} clickable={false}></ProfileCard>
                    </div>
                    {/* <div className='grid pt-0'>
                        <button className='button-1' onClick={handleBack}>Retour</button>
                    </div> */}
                </div>

                <div className='flex flex-col px-5'>
                    <div>
                        <h4 className='font-custom_1 text-3xl font-bold pb-5'>Completez le formulaire</h4>
                    </div>
                    <div className='grid gap-2'>
                        <div className='grid grid-cols-2 gap-2'>
                            <input onChange={(e)=>{setClientFirstName(e.target.value)}} required type='text' placeholder='Prénom' className='input-designed-1' />
                            <input onChange={(e)=>{setClientLastName(e.target.value)}} required type='text' placeholder='Nom de famille' className='input-designed-1' />
                        </div>
                        <input onChange={(e)=>{setClientEmail(e.target.value)}} required type='email' placeholder='Email' className='input-designed-1' />
                        <input onChange={(e)=>{setClientPhone(e.target.value)}} required type='tel' placeholder='GSM' className='input-designed-1' />

                        <div className='flex flex-col gap-5'>
                            <div className='flex justify-between'>
                                <label className='text-xl my-auto'>Séléctionez la date : </label>
                                <input type='date' min={today} onChange={handleDateChosen} className='input-designed-1 w-[200px]' ></input>
                            </div>
                            <div id='list of taken (or not) hours of that day'>
                                <HoursGrid hours={hoursOfDay} chosenHourSetter={[chosenHour,setChosenHour]} />
                            </div>
                        </div>

                        <div id='services' className='grid font-custom_1 gap-5'>
                            {
                                SERVICES.services_by_group.map(
                                    (value,key) =>{
                                        return(
                                            <div key={key}>
                                                <label className='text-3xl'>{value.group}</label>
                                                <div className='grid pt-5 gap-2'>
                                                    {
                                                        value.services.map(
                                                            (service,key2)=>{
                                                                return(
                                                                    <div key={key2} id={service.name} onClick={(e)=>{handleServiceSelect(e,service.name)}} className={`grid p-1 border-[0.15rem] border-[var(--brand-black)] ${clientAppointmentService===service.name ? "bg-[var(--brand-black)] text-white" : ""}`}>
                                                                        <div className='grid grid-cols-2'>
                                                                            <label className='text-xl'>{service.name}</label>
                                                                            <label className='text-xl'>{service.price}€</label>
                                                                        </div>
                                                                        <label>{service.description}</label>
                                                                    </div>
                                                                )
                                                            }
                                                        )
                                                    }
                                                </div>

                                            </div>
                                        )
                                    }
                                )
                            }
                            {
                                SERVICES.packages.map(
                                    (value,key) =>{
                                        return(
                                            <div key={key}>
                                                <label className='text-3xl'>{value.group}</label>
                                                <div className='grid pt-5 gap-2'>
                                                    {
                                                        value.services.map(
                                                            (service,key2)=>{
                                                                return(
                                                                    <button type='button' key={key2} id={service.name} onClick={(e)=>{handleServiceSelect(e,service.name)}} className={`grid p-1 border-[0.15rem] border-[var(--brand-black)] ${clientAppointmentService===service.name ? "bg-[var(--brand-black)] text-white" : ""}`}>
                                                                        <div className='grid grid-cols-2'>
                                                                            <label className='text-xl'>{service.name}</label>
                                                                            <label className='text-xl'>{service.price}€</label>
                                                                        </div>
                                                                        <label>{service.description}</label>
                                                                    </button>
                                                                )
                                                            }
                                                        )
                                                    }
                                                </div>

                                            </div>
                                        )
                                    }
                                )
                            }
                        </div>
                    
                    </div>
                    <ul className='py-3 list-disc grid gap-3'>
                        <li className='text-start'><span className='font-bold'>A partir de 18h30</span> il y aura un <span className='font-bold'>supplément de 10€</span></li>
                        <li className='text-start'>Au dela de <span className='font-bold'>10 minutes de retard</span>, le rendez-vous sera <span className='font-bold'>annulé</span> !</li>
                    </ul>
                    <div className='grid grid-flow-col gap-5 py-5'>
                        <button type='button' className='button-1' onClick={handleBack}>Retour</button>
                        <button type='submit' disabled={clickedSubmit} className='button-2 disabled:bg-gray-300'>Réserver</button>
                    </div>
                    
                </div>
                </form>
            <form ref={confirmationEmailFormRef} className='hidden'>
              <input name="user_email" value={clientEmail}></input>
              <input name="user_name" value={`${clientLastName} ${clientFirstName}`}></input>
              <input name="appointment_date" value={clientAppointmentDate}></input>
              <input name="appointment_time" value={chosenHour}></input>
              <input name="selected_service" value={clientAppointmentService}></input>
            </form>
        </div>
    )
}

const HourTab = ({setter,hour,taken, selected}) => {

    return(
        <button type='button' onClick={()=>{setter[1](hour)}}
            disabled={taken} className={`${taken? "bg-red-500" : "bg-green-500 hover:border-[var(--brand-black)]"} text-white px-5 py-2 rounded-lg border-[0.15rem] ${selected? " border-[var(--brand-black)]" : " border-transparent"} `}>
            {hour}
        </button>
    )
}

const HoursGrid = ({hours,chosenHourSetter}) => {

    if(hours.length >= 1){
        return(
            <div className='flex flex-col'>

                <div className='flex pb-3 gap-5'>
                    <div className='flex gap-2'>
                        <div className='w-[25px] h-[25px] bg-green-500 rounded-full'/>
                        <label>disponible</label>
                    </div>
                    
                    <div className='flex gap-2'>
                        <div className='w-[25px] h-[25px] bg-red-500 rounded-full'/>
                        <label>indisponible</label>
                    </div>
                </div>

                <div className='grid grid-cols-3 lg:grid-cols-7 gap-2'>
                    {
                        hours.map(
                            (value,key)=>{
                                return(
                                    <HourTab key={key} setter={chosenHourSetter} hour={value[0]} taken={value[1]} selected={chosenHourSetter[0]===value[0]} ></HourTab>
                                )
                            }
                        )
                    }
                </div>  

            </div>
            
        )
    }
    else{
        return(<></>)
    }
}

const AppointmentResponseView = ({success,message}) => {
    
    return(
        <div className='bg-[var(--brand-white)] grid py-5'>
            <label className={`${success? "text-green-500" : "text-red-500"} text-start font-bold font-custom_1 text-2xl`}>{message}</label>
            <div className='py-5 flex justify-center items-center gap-5'>
                <Link to={'/rendez-vous'} onClick={(e)=>{e.preventDefault();window.location.reload();}} className='button-1'>Retour</Link>
                <Link to={'/'} className='button-2'>Accueil</Link>
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