import { useEffect, useState } from 'react'
import Stock from './components/Stock'

import { FaBoxes,FaQuestion, FaChartPie } from "react-icons/fa";

import { MdShoppingCartCheckout } from "react-icons/md";
import { RiFileHistoryFill } from "react-icons/ri";

import Checkout from './components/Checkout';
import TicketHistory from './components/TicketHistory';
import { useAuth } from '../../context/AuthContext';
import Statistics from './components/Statistics';
import { getProfileByEmail } from '../../api/firebase';


export default function Inventory() {
    const {currentUser} = useAuth();

    const [selection,setSelection] = useState('stock')
    const [profileData,setProfileData] = useState({})

    const dico = {
        "stock" : <Stock connectedUser={currentUser.email}/>,
        "checkout" : <Checkout connectedUser={currentUser.email}/>,
        "ticket-history" : <TicketHistory/>,
        "statistics" : <Statistics/>,
    }

    
    async function fetchProfile() {
        const response = await getProfileByEmail(currentUser.email);
        setProfileData(response)
    }

    useEffect(()=>{
        fetchProfile();
    },[])


  return (
    <div className='grid'>

        <h1 className='section-title py-5'>
            Inventaire
        </h1>


        <div id='buttons' className=''>
            {
                profileData.admin? 
                <button onClick={()=>{setSelection('stock')}} className={`text-4xl p-5 ${selection=='stock'? "bg-[var(--brand-black)]" : "bg-[var(--brand-black-50)]"} hover:bg-[var(--brand-black-50)] text-white border-y-transparent border-l-transparent border-r-white border-[0.15rem]`}>
                <FaBoxes/></button> : <></>
            }
            <button onClick={()=>{setSelection('checkout')}} className={`text-4xl p-5 ${selection=='checkout'? "bg-[var(--brand-black)]" : "bg-[var(--brand-black-50)]"} hover:bg-[var(--brand-black-50)] text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <MdShoppingCartCheckout/>
            </button>
            <button onClick={()=>{setSelection('ticket-history')}} className={`text-4xl p-5  ${selection=='ticket-history'? "bg-[var(--brand-black)]" : "bg-[var(--brand-black-50)]"} hover:bg-[var(--brand-black-50)] text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <RiFileHistoryFill/>
            </button>
            {
                profileData.admin?
                <button onClick={()=>{setSelection('statistics')}} className={`text-4xl p-5  ${selection=='statistics'? "bg-[var(--brand-black)]" : "bg-[var(--brand-black-50)]"} hover:bg-[var(--brand-black-50)] text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <FaChartPie/>
            </button>: <></>
            }
            {/* <button className={`text-4xl p-5 bg-[var(--brand-black)] hover:bg-[var(--brand-black-50)] text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <FaQuestion/>
            </button> */}
        </div>

        <div id='container' className='grid pb-5'>
            {dico[selection]}
        </div>

    </div>
  )
}


