import React, { useEffect, useState } from 'react'
import AddBarberForm from '../../../components/AddBarberForm'
import { getProfiles, removeProfile } from '../../../api/firebase'

export default function Admin() {

  const [messages,setMessages] = useState([]) 


  return (
    <div className='grid'>

      <div className='py-10 grid justify-center'>
        <AddBarberForm/>
      </div>

      <div className='grid'>
        <CreatedProfilesList messagesLog={[messages,setMessages]}/>
      </div>

    </div>
  )
}


const CreatedProfilesList = ({messagesLog}) => {


    const [profiles,setProfiles] = useState([])

    async function fetchProfiles(){
        await getProfiles().then(
            (response) => {
                setProfiles(response)
            }
        )
    }

    useEffect(()=>{
        fetchProfiles()
    },[])

    const ProfileTab = ({data,Key,messagesLog}) => {
        // TODO : you should remove the deletion button if not accessed by admin

        const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
            timeZone: 'Europe/Brussels', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit'
          }).split('/').reverse().join('-'))

        async function handleRemove(e){
            e.preventDefault()
            await removeProfile(data.profile_id).then(
                (response) => {
                    messagesLog[1]([messagesLog,<Message key={messagesLog[0].length-1} message={`Removed profile ${data.profile_id}`}/>])                    
                }
            )
        }

        

        return(
            <div className={` ${(Key % 2 ===0) ? 'bg-slate-200' : 'bg-slate-100' } flex`}>
                <div className="flex flex-col">
                    <div className='grid grid-cols-2'>
                        <label className='font-medium text-xl'>{data.last_name} {data.first_name}</label>
                        <label className='text-md overflow-x-auto'>{data.email}</label>
                    </div>
                    <div className='flex flex-col'>
                        <label>profile_id : {data.profile_id}</label>
                        <label>visible : <input type='checkbox' checked readOnly={true} className={`${data.visible? "accent-green-500" : "accent-red-500"}`} /></label>
                    </div>
                    <div className='grid grid-cols-2 gap-5'>
                        <label>Starting Contract : {data.starting_contract}</label>
                        <label className={`${today >= data.ending_contract && !['/','cdi'].includes(data.ending_contract)? "underline font-medium text-red-500" : " " }`}>Ending Contract : {data.ending_contract}</label>
                    </div>
                    <div>
                        <img src={data.image_url} className='w-[250px]' />
                    </div>
                </div>
                <button onClick={handleRemove} className='bg-red-500 text-white font-semibold py-2 px-10 rounded-xl m-auto'>Remove</button>
            </div>
        )
    }


    return(
        <div id='profiles' className='flex flex-col p-3 bg-slate-100'>
            <h2 className='text-design-h2'>Utilisateurs</h2>
            <div className='flex flex-col border-[0.15] border-blue-500 min-h-[200px] max-h-[500px] lg:max-h-[750px] overflow-y-scroll'>
                {
                    profiles.length>0 && profiles.map((value,key) => {
                        return(<ProfileTab key={key} Key={key} data={value} messagesLog={messagesLog} />)    
                    })
                }
            </div>
            <button className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Clear Log</button>
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