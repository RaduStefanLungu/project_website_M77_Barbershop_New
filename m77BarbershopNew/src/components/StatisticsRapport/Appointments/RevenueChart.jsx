import React, { useEffect, useState } from 'react'

import APPOINTMENTS_STATES from '../../../data/appointmentStates.json'
import SERVICES from '../../../data/services.json'

export default function RevenueChart({appointments}) {

    const [totalRevenue,setTotalRevenue] = useState({})

    useEffect(()=>{
        if(appointments.length>0){
            try{
                const response = calculateAllRevenue(appointments)
                setTotalRevenue(response || {} )
            }catch(e){
                console.error(e)
            }
        }
    },[appointments])

    function generateVisuals(data){
        const elements = [];
        const pourcentage_of_one_dollar = 100 / data.total

        for(const key in data){
            
            if(key === 'total'){
                elements.push(
                    <div className='grid grid-cols-2 gap-3'>
                        <label>
                            Somme totale théorique : 
                        </label>
                        <span className='font-bold my-auto text-center'>{data[key]} €</span> 
                    </div>
                )
            }
            
            if(key !== 'total'){
                
                elements.push(
                    <div className="grid grid-cols-2 gap-3">
                        <label>
                            {data[key].props} : 
                        </label>
                        <span className={`font-bold my-auto text-center`} style={{ color: data[key].color }} >{data[key].value} €</span> 
                    </div>
                )
            }
        }

        return(elements);
    }

  return (
    <div className='grid py-5'>
        {
            generateVisuals(totalRevenue).map((value,key) => {
                return(
                    <div key={key}>{value}</div>
                )
            })
        }
    </div>
  )
}


function calculateAllRevenue(appointments){
    let response = {
        total : 0,
        [APPOINTMENTS_STATES.neutral_state] : {
            value : 0,
            color : '#6B7280',
            props : "Somme des prestations non confirmées"
        },
        [APPOINTMENTS_STATES.medium_state] : {
            value : 0,
            color : '#F97316',
            props : "Somme des prestations absentes"
        },
        [APPOINTMENTS_STATES.negative_state] : {
            value : 0,
            color : '#EF4444',
            props : "Somme des prestations annulées"
        },
        [APPOINTMENTS_STATES.affirmative_state] : {
            value : 0,
            color : '#22C55E',
            props : "Somme des prestations confirmées"
        }
        
    }

    for(let i=0; i<appointments.length; i++){
        const appointment = appointments[i]
        const value = findValueOfService(appointment.appointment_service)
        if(value === null){
            throw new Error(`Le service ${appointment.appointment_service} n'existe pas dans services.json`)
        }
        else{
            response.total += value;
            response[appointment.confirmed].value += value
        }
        
    }

    return(response)
    

}


function findValueOfService(service_name){
    const service_list = SERVICES.all_services_flat

    for(let i=0; i<service_list.length; i++){
        const service = service_list[i]
        if(service.name === service_name){
            return(service.price)
        }
    }

    return(null)
}