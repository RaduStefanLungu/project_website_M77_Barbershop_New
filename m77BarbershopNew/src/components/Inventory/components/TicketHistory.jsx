import React, { useEffect, useState } from 'react'
import { getTickets } from '../inventoryAPI'

export default function TicketHistory() {

  function getHistory(){
    //TODO 
    // gets all tickets history with form :
    // {
    //     "tickets" : [
    //         {
    //             id : "ticket_1",
    //             date : "10/18/2024 ...",
    //             items : [...],
    //             total_sum : 230.99,
    //         },
    //         ...
    //     ]
    // }
}

  const [tickets,setTickets] = useState([])

  async function getHistory(){
    const response = await getTickets();
    return(response);
  }

  useEffect(
    ()=>{
      getHistory();
    },[]
  )



  return (
    <div className='flex flex-col bg-blue-500 px-2 py-3 rounded-tr-xl'>
      <h1 className='text-start my-auto pb-5 text-4xl font-bold text-white'>Historique de Tickets</h1>

      <div className='grid'>

      </div>

    </div>
  )
}
