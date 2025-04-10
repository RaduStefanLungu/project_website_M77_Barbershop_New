import { useEffect, useState } from 'react'
import { getTickets } from '../inventoryAPI'

import { MdOutlineKeyboardArrowDown,MdOutlineKeyboardArrowUp } from "react-icons/md";


function orderByTimestamp(tickets, ascending) {
  return [...tickets].sort((a, b) => {
    const parseTimestamp = (timestamp) => {
      // Split the timestamp into date and time parts
      const [datePart, timePart] = timestamp.split(" ");
      const [day, month, year] = datePart.split("/").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);

      // Create a Date object
      return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const timestampA = parseTimestamp(a.data.meta.timestamp);
    const timestampB = parseTimestamp(b.data.meta.timestamp);

    // Ascending if `ascending` is true, otherwise descending
    return ascending ? timestampA - timestampB : timestampB - timestampA;
  });
}




export default function TicketHistory() {

//   function getHistory(){
//     //TODO 
//     // gets all tickets history with form :
//     // {
//     //     "tickets" : [
//     //         {
//     //             id : "ticket_1",
//     //             date : "10/18/2024 ...",
//     //             items : [...],
//     //             total_sum : 230.99,
//     //         },
//     //         ...
//     //     ]
//     // }
// }

  const [tickets,setTickets] = useState([])

  const [orderTicketsAsceding,setOrderTicketsAsceding] = useState(false)

  async function getHistory(){
    await getTickets().then(
      (response) => {
        setTickets(orderByTimestamp(response,orderTicketsAsceding))
      }
    )
  }

  useEffect(
    ()=>{
      getHistory();
    },[]
  )



  function handleOrderTicketsAscending(e){
    // e.preventDefault();
    console.log('> handleling order tickets ascending');
    
    console.log(tickets);
    console.log(orderByTimestamp(tickets,!orderTicketsAsceding));
    
    


    setTickets(orderByTimestamp(tickets,!orderTicketsAsceding))
    setOrderTicketsAsceding(!orderTicketsAsceding)
  }



  return (
    <div className='flex flex-col bg-[var(--brand-black)] px-2 py-3'>
      <h1 className='text-start my-auto pb-5 text-4xl font-bold text-white'>Historique de Tickets</h1>

      <div className='flex gap-5 font-bold py-2 bg-white'>
        <label>Ordre Chronologique</label>
        <input type='checkbox' value={orderTicketsAsceding} checked={orderTicketsAsceding} onChange={handleOrderTicketsAscending} />
      </div>

      <div className='grid bg-white py-5 px-2 gap-5'>
        {
          tickets.map(
            (value,key)=>{
              return(
                <TicketView ticketData={value} key={key} />
              )
            }
          )
        }
      </div>

    </div>
  )
}


const TicketView = ({ticketData}) => {

  const [clickedDropdown,setClickedDropdown] = useState(false)

  function handleClickedDropdown(e){
    e.preventDefault();
    setClickedDropdown(!clickedDropdown)
  }

  return(
    <div className='grid bg-[var(--brand-black-25)] transition-all duration-200 p-2'>

      <button onClick={handleClickedDropdown} className='flex justify-between '>
        <div className='grid'>
          <label className=''>
            {ticketData.data.meta.timestamp}
          </label>
          <div className='flex gap-5 font-bold'>
            <label>Total : </label>
            <label>{ticketData.data.total_amount} €</label>
          </div>
        </div>

        <div className='text-center my-auto text-3xl'>
          {
            clickedDropdown? <MdOutlineKeyboardArrowUp/> : <MdOutlineKeyboardArrowDown/> 
          }
        </div>

      </button>

      <div className={`${clickedDropdown? 'grid' : 'hidden'} bg-[var(--brand-white)] p-2`}>
        <div className='grid'>
          <label>Fait par : <span className='font-medium'>{ticketData.data.meta.created_by}</span></label>
          <label className='text-xs'>Id : {ticketData.id}</label>
        </div>
        <div className='grid'>
          <label className='py-2'>Objets</label>
          <div className='grid px-5'>
            {
              ticketData.data.items.map(
                (value,key)=>{
                  return(
                    <div key={key} className='grid grid-cols-3 border-[0.10rem] border-[var(--brand-black)]'>
                      <label className='col-span-2 overflow-auto max-h-[50px] px-2 border-r-[0.10rem] border-[var(--brand-black)]'>{value.item.item_name}</label>
                      <div className='col-span-1 grid grid-cols-2'> 
                        <label className='text-right px-3'>{value.quantity}x</label>
                        <label className='text-center'>{value.item.item_sell_price} €</label>
                      </div>
                    </div>
                  )
                }
              )
              
            }
          </div>
        </div>

      </div>

    </div>
  )

}

