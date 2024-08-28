import React, { useState } from 'react'
import { populateProfile } from '../api/firebase'
import { useRef } from 'react'

export default function Dev() {

    const [messages,setMessages] = useState([]) 
    

    function handleClearLog(e){
        e.preventDefault()
        setMessages([])
    }

  return (
    <div>
        
        <h1 className='font-bold text-4xl py-5'> Appointment System </h1>
        
        <div className='grid lg:grid-cols-2'>

            <div className='bg-orange-200 pt-5 px-20 grid'>
                <h2 className='font-bold text-3xl py-3'> Dev Page </h2>

                <div className='grid gap-5'>
                    <AddBarber messagesLog={[messages,setMessages]}></AddBarber>

                    <PopulateProfile messagesLog={[messages,setMessages]} ></PopulateProfile>

                    <div>
                        ...
                    </div>

                </div>
            
            </div>

            <div className='bg-emerald-200 pt-5 px-20 flex flex-col'>
                <h2 className='font-bold text-3xl py-3'> LOG </h2>
                <div className='flex flex-col border-[0.15] border-blue-500 min-h-[200px] max-h-[300px] lg:max-h-[350px] overflow-y-scroll'>
                    {
                        messages.map((value,key) => {
                            return(
                               value
                            )                            
                        })
                    }
                </div>
                <button onClick={handleClearLog} className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Clear Log</button>
            </div>
        </div>

    </div>
  )
}

const AddBarber = ({messagesLog}) => {

    const [firstName,setFirstName] = useState('')
    const [lastName,setLastName] = useState('')
    const [startingContract,setStartingContract] = useState('')
    const [isCDI,setIsCDI] = useState(false)
    const [endingContract,setEndingContract] = useState('/')

    const [today,setToday] = useState(new Date().toISOString().split('T')[0])

    function handleCreateTable(e){
        e.preventDefault();
        console.log(`Adding barber ${barberName}`);

        const data = {
            barber_name: lastName + " " + firstName,
            first_name : firstName,
            last_name : lastName,
            starting_contract : startingContract,
            ending_contract : endingContract,
            is_cdi : isCDI
        }

        addProfile


        messagesLog[1]([messagesLog,<Message message={`Created new table ${'table_name'}`}/>])
    }

    return(
        <form className='flex flex-col gap-1 max-w-[350px]' onSubmit={handleCreateTable}>
            <label className='text-md'>Add Barber</label>
            <div className='grid grid-cols-2'>
                <input onChange={(e)=>{setFirstName(e.target.value)}} type='text' placeholder='first name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                <input onChange={(e)=>{setLastName(e.target.value)}} type='text' placeholder='last name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
            </div>
            <input onChange={(e)=>{setStartingContract(e.target.value)}} type='date' min={today} required placeholder='starting contract' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
            <div className='flex gap-5'>
                <label className='text-lg'>CDI</label>
                <input onClick={()=>{setIsCDI(!isCDI)}} type='checkbox' className='w-4' />
            </div>
            <input onChange={(e)=>{setEndingContract(e.target.value)}} type='date' min={today} placeholder='ending contract' disabled={isCDI} required={isCDI} className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
            <button type='submit' className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Add</button>
        </form>
    )
}

const PopulateProfile = ({messagesLog}) => {

    function handlePopulateProfile(e){
        e.preventDefault();
        console.log('Populating profile ...');
        populateProfile('barber_name','fromDate','toDate').then(
            (response) => {
                console.log(response);
            }
        )

        messagesLog[1]([messagesLog,<Message key={messagesLog[0].length-1} message={`Populated profile ${'profile_name'}`}/>])
    }
    
    

    return(
        <div className='flex flex-col max-w-[350px]'>
            <label className='text-md'>Populate Profile</label>
            <div className='grid gap-2'>
                <input type='text' placeholder='profile name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' ></input>
                <input type='text' placeholder='from date' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' ></input>
                <input type='text' placeholder='to date' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' ></input>
            </div>
            <button onClick={handlePopulateProfile} className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Populate</button>
        </div>
    )
}

const Message = ({message,error}) => {
    return(
        <span className={`${error? "text-red-600" : ""} `}>
            {"> "}{message}
        </span>
    )
}
