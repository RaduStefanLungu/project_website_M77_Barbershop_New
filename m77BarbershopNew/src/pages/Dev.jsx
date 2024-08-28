import React, { useState } from 'react'
import { populateProfile } from '../firebase';

export default function Dev() {

    const [messages,setMessages] = useState([<Message key={0} message={'test message'} error={true} />])
    

  return (
    <div>
        
        <h1 className='font-bold text-4xl py-5'> Appointment System </h1>
        
        <div className='grid grid-cols-2'>
            <div className='bg-orange-200 pt-5 px-20 grid'>
                <h2 className='font-bold text-3xl py-3'> Dev Page </h2>

                <div className='grid gap-5'>
                    <CreateTable></CreateTable>

                    <PopulateProfile></PopulateProfile>

                    <div>
                        ...
                    </div>

                </div>
            
            </div>

            <div className='bg-emerald-200 pt-5 px-20 flex flex-col'>
                <h2 className='font-bold text-3xl py-3'> LOG </h2>
                <div className='flex flex-col border-[0.15] border-blue-500 h-[250px] overflow-y-scroll'>
                    message...
                </div>
            </div>
        </div>

    </div>
  )
}

const CreateTable = () => {

    function handleCreateTable(e){
        e.preventDefault();
        console.log('Creating table ...');
    }

    return(
        <div className='flex flex-col max-w-[350px]'>
            <label className='text-md'>Create Table</label>
            <input type='text' placeholder='table name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' ></input>
            <button onClick={handleCreateTable} className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Create</button>
        </div>
    )
}

const PopulateProfile = () => {

    function handlePopulateProfile(e){
        e.preventDefault();
        console.log('Populating profile ...');
        console.log(populateProfile('barber_1','2024-10-30','2024-11-30'));
        
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

const Message = (message,error) => {
    return(
        <span className={`${error? "text-red-700" : ""} `}>
            {message}
        </span>
    )
}