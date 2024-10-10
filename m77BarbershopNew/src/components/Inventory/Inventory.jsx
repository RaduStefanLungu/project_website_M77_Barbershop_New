import React, { useState } from 'react'
import Stock from './components/Stock'

import { FaBoxes,FaQuestion} from "react-icons/fa";
import { MdShoppingCartCheckout } from "react-icons/md";


export default function Inventory() {

    const [selection,setSelection] = useState('checkout')

    const dico = {
        "stock" : <Stock/>,
        "checkout" : <Checkout/>
    }

  return (
    <div>

        <div id='buttons' className=''>
            <button onClick={()=>{setSelection('stock')}} className={`text-4xl p-5 ${selection=='stock'? "bg-blue-500" : "bg-blue-700"} hover:bg-blue-500 text-white border-y-transparent border-l-transparent border-r-white border-[0.15rem]`}>
                <FaBoxes/>
            </button>
            <button onClick={()=>{setSelection('checkout')}} className={`text-4xl p-5 ${selection=='checkout'? "bg-blue-500" : "bg-blue-700"} hover:bg-blue-500 text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <MdShoppingCartCheckout/>
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


const Checkout = () => {
    return(
        <div>
            <div className='flex text-4xl font-bold text-white bg-blue-500 px-2 py-3 rounded-tr-xl'>
                {/* <h1 className='text-6xl'>{Icon}</h1> */}
                <h1 className='text-center my-auto'>Ventes</h1>
            </div>
        </div>
    )
}