import React, { useState,useEffect } from 'react'
import { addAppointment2, getProfiles, getScheduleHours } from '../api/firebase'

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
    const [clientAppointmentTime,setClientAppointmentTime] = useState('hh:mm')
    const [clientAppointmentService,setClientAppointmentService] = useState('test service')
    
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

        const response = await addAppointment2({
            barber_id : chosenProfile.profile_id,
            appointment_id : v4(),
            appointment_hour : "10:30",
            appointment_date : clientAppointmentDate,
            appointment_service : "modern haircut",
            appointment_user : {
              email : clientEmail,
              name : `${clientLastName} ${clientFirstName}`,
              phone : clientPhone
            },
            registered_time : new Date().toLocaleString()
          })
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
                    <div className="absolute overflow-hidden bottom-0 backdrop-grayscale bg-black/35 hover:bg-transparent hover:backdrop-grayscale-0 transition-all duration-500 z-20 w-[250px] h-[550px] flex">
                        <div className='text-white text-start flex flex-col w-full h-full px-5 pt-[425px] transform translate-y-0 hover:translate-y-[100px] transition-transform duration-500 ease-in-out'>
                            <label className="font-bold text-xl pb-2">
                                {profile.last_name + " " + profile.first_name}
                            </label>
                            <p className='text-sm italic'>
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

        setClientAppointmentDate(e.target.value);
        await getScheduleHours(e.target.value)

    }
    
    return(
        <div>
            <h2 className='font-bold text-3xl py-3'> Appointment Form </h2>
            <form onSubmit={handleSubmit}>

                {
                    chosenProfile === null? 
                    <div id='chose_user' className='flex flex-col lg:flex-row gap-10'>
                        {
                            profiles.map((profile,key) => {                            
                                return(
                                    <ProfileCard key={key} profile={profile} setter={setChosenProfile} clickable={true} ></ProfileCard>
                                )
                            })
                        }
                    </div> :
                    <div className='flex flex-col justify-center'>
                        <div className='flex flex-col'>
                            <ProfileCard profile={chosenProfile} setter={setChosenProfile} clickable={false}></ProfileCard>
                            <button className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2' onClick={(e)=>{setChosenProfile(null)}}>Back</button>
                        </div>
                        <div className='pt-10 pb-5 grid gap-2'>
                            <div className='grid grid-cols-2 gap-2'>
                                <input onChange={(e)=>{setClientFirstName(e.target.value)}} required type='text' placeholder='first name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                                <input onChange={(e)=>{setClientLastName(e.target.value)}} required type='text' placeholder='last name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                            </div>
                            <input onChange={(e)=>{setClientEmail(e.target.value)}} required type='email' placeholder='email' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                            <input onChange={(e)=>{setClientPhone(e.target.value)}} required type='tel' placeholder='phone' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />

                            <div className='flex flex-col gap-5'>
                                <div className='flex gap-10'>
                                    <label>Chose a date : </label>
                                    <input type='date' min={today} onChange={handleDateChosen} ></input>
                                </div>
                                <div id='list of hours and appointments of that day'>
                                    ...list of available hours
                                </div>
                            </div>
                        
                        </div>
                    </div>
                }

                <button type='submit' className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Add Apointment</button>
            </form>
        </div>
    )
}
