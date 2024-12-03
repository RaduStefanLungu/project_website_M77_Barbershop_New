import React, { useEffect, useState } from 'react'
import Stock from './components/Stock'

import { FaBoxes,FaQuestion,FaTrash } from "react-icons/fa";
import { MdShoppingCartCheckout } from "react-icons/md";
import { RiFileHistoryFill } from "react-icons/ri";

import { getItems, updateQuantity } from './inventoryAPI';
import Checkout from './components/Checkout';
import TicketHistory from './components/TicketHistory';
import { useAuth } from '../../context/AuthContext';


export default function Inventory() {

    const [selection,setSelection] = useState('checkout')

    const dico = {
        "stock" : <Stock/>,
        "checkout" : <Checkout/>,
        "ticket-history" : <TicketHistory/>
    }

    const {currentUser,logout} = useAuth();

    async function handleLogout(e){
        e.preventDefault();

        await logout();
    }

  return (
    <div className='grid'>

        <div className='bg-black text-white flex justify-between px-5'>
            <div className='flex gap-2'>
                <label>username : {currentUser.email} </label>
            </div>
            <div className='flex'>
                <button onClick={handleLogout}>Log Out</button>
            </div>

        </div>

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
            <button onClick={()=>{setSelection('ticket-history')}} className={`text-4xl p-5  ${selection=='ticket-history'? "bg-blue-500" : "bg-blue-700"} hover:bg-blue-500 text-white border-y-transparent border-x-white border-[0.15rem]`}>
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


