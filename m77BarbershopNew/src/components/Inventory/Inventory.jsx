import React, { useEffect, useState } from 'react'
import Stock from './components/Stock'

import { FaBoxes,FaQuestion,FaTrash } from "react-icons/fa";
import { MdShoppingCartCheckout } from "react-icons/md";
import { RiFileHistoryFill } from "react-icons/ri";

import { getItems, updateQuantity } from './inventoryAPI';
import Checkout from './components/Checkout';
import TicketHistory from './components/TicketHistory';


export default function Inventory() {

    const [selection,setSelection] = useState('checkout')

    const dico = {
        "stock" : <Stock/>,
        "checkout" : <Checkout/>,
        "ticket-history" : <TicketHistory/>
    }

  return (
    <div className='grid'>

        <h1 className='text-blue-500 font-bold text-5xl py-5'>
            Inventaire
        </h1>


        <div id='buttons' className=''>
            <button onClick={()=>{setSelection('stock')}} className={`text-4xl p-5 ${selection=='stock'? "bg-blue-500" : "bg-blue-700"} hover:bg-blue-500 text-white border-y-transparent border-l-transparent border-r-white border-[0.15rem]`}>
                <FaBoxes/>
            </button>
            <button onClick={()=>{setSelection('checkout')}} className={`text-4xl p-5 ${selection=='checkout'? "bg-blue-500" : "bg-blue-700"} hover:bg-blue-500 text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <MdShoppingCartCheckout/>
            </button>
            <button onClick={()=>{setSelection('ticket-history')}} className={`text-4xl p-5 bg-blue-700 hover:bg-blue-500 text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <RiFileHistoryFill/>
            </button>
            <button className={`text-4xl p-5 bg-blue-700 hover:bg-blue-500 text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <FaQuestion/>
            </button>
        </div>

        <div id='container' className='grid pb-5 bg-slate-300'>
            {dico[selection]}
        </div>

    </div>
  )
}

// TODO :

const SellHistory = () => {

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

    return(
        <div>
            <div className='flex flex-col bg-blue-500 px-2 py-3 rounded-tr-xl'>
                <h1 className='text-start my-auto pb-5 text-4xl font-bold text-white'>Historique</h1>

                <div className='flex flex-col'>

                    list of tickets
                    
                </div>

            </div>
        </div>
    )
}


