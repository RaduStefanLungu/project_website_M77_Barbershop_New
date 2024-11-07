import { useState,useEffect } from 'react'
import { addAppointment2, getProfiles, getSchedule } from '../api/firebase'
import { v4 } from 'uuid'

import SERVICES from '../data/services.json'
import ServicesCard from './services/ServicesCard'

export default function AppointmentForm(){
    const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
        timeZone: 'Europe/Brussels', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
      }).split('/').reverse().join('-'))

    const [profiles,setProfiles] = useState([])

    const [chosenProfile,setChosenProfile] = useState(null)

    const [clientFirstName,setClientFirstName] = useState('')
    const [clientLastName,setClientLastName] = useState('')
    const [clientEmail,setClientEmail] = useState('')
    const [clientPhone,setClientPhone] = useState('')
    const [clientAppointmentDate,setClientAppointmentDate] = useState('')

    const [clientAppointmentService,setClientAppointmentService] = useState('')

    const [hoursOfDay,setHoursOfDay] = useState([])
    const [chosenHour,setChosenHour] = useState('')


    useEffect(()=>{
        async function fetchProfiles(){
            await getProfiles().then(
                (response) => {
                    setProfiles(response)
                }
            )
        } 

        fetchProfiles()
    },[])

    
    async function handleSubmit(e){
        e.preventDefault();

        // const response = await addAppointment2({
        //     barber_id : chosenProfile.profile_id,
        //     appointment_id : v4(),
        //     appointment_hour : chosenHour,
        //     appointment_date : clientAppointmentDate,
        //     appointment_service : "modern haircut",
        //     appointment_user : {
        //       email : clientEmail,
        //       name : `${clientLastName} ${clientFirstName}`,
        //       phone : clientPhone
        //     },
        //     registered_time : new Date().toLocaleString()
        //   })

        console.log({
            barber_id : chosenProfile.profile_id,
            appointment_id : v4(),
            appointment_hour : chosenHour,
            appointment_date : clientAppointmentDate,
            appointment_service : "modern haircut",         //TODO : let user chose this !!
            appointment_user : {
              email : clientEmail,
              name : `${clientLastName} ${clientFirstName}`,
              phone : clientPhone
            },
            registered_time : new Date().toLocaleString()
          });
        

    }

    const ProfileCard = ({ profile,setter, clickable=false }) => {

        function handleClickedProfile(e) {
            e.preventDefault();         
            if(clickable){
                setter(profile)
            }
            
        }
        
        return (
            <button onClick={handleClickedProfile}>
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
    

    async function handleDateChosen(e){
        e.preventDefault();
        setChosenHour('')

        setClientAppointmentDate(e.target.value);
        setHoursOfDay(await getSchedule(e.target.value,chosenProfile))
    }

    function handleServiceSelect(e,selected_service){
        e.preventDefault();
        setClientAppointmentService(selected_service)
        
    }

    function handleBack(e){
        e.preventDefault()

        setChosenProfile(null)
        setClientAppointmentDate('')
        setHoursOfDay([])

        setClientAppointmentService('')

    }
    
    return(
        <div className=''>
            {/* <h2 className='font-bold text-3xl py-3'> Choisisez le barber</h2> */}
            <form onSubmit={handleSubmit} className=''>

                {
                    chosenProfile === null? 
                    <div className='grid'>
                        <h2 className='font-custom_1 text-3xl py-3'> Choisisez le barber</h2>
                        <div id='chose_user' className='grid md:grid-cols-2 lg:grid-flow-col gap-10'>
                            {
                                profiles.map((profile,key) => {                            
                                    return(
                                        <ProfileCard key={key} profile={profile} setter={setChosenProfile} clickable={true} ></ProfileCard>
                                    )
                                })
                            }
                        </div>
                    </div> :
                    <div className='flex flex-col justify-center md:flex-row gap-5'>

                        <div className='flex flex-col justify-center items-center'>
                            <div className='mb-auto'>
                                <ProfileCard profile={chosenProfile} setter={setChosenProfile} clickable={false}></ProfileCard>
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
                                                                            <div key={key2} id={service.name} onClick={(e)=>{handleServiceSelect(e,service.name)}} className={`grid p-1 border-[0.15rem] ${clientAppointmentService===service.name ? "border-red-500" : "border-[var(--brand-black)]"}`}>
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
                                                                            <div key={key2} id={service.name} onClick={(e)=>{handleServiceSelect(e,service.name)}} className={`grid p-1 border-[0.15rem] ${clientAppointmentService===service.name ? "border-red-500" : "border-[var(--brand-black)]"}`}>
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
                                </div>
                            
                            </div>
                            <div className='grid grid-flow-col gap-5 py-5'>
                                <button className='button-1' onClick={handleBack}>Retour</button>
                                <button type='submit' className='button-2'>Rezerver</button>
                            </div>
                            
                        </div>
                    </div>
                }

                
            </form>
        </div>
    )
}


const HourTab = ({setter,hour,taken, selected}) => {

    return(
        <button onClick={()=>{setter[1](hour)}}
            disabled={taken} className={`${taken? "bg-red-500" : "bg-green-500 hover:border-black"} text-white px-5 py-2 rounded-lg border-[0.15rem] ${selected? " border-black" : " border-transparent"} `}>
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