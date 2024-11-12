import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className='fixed z-[100] w-screen flex justify-between bg-[var(--brand-white)] py-3 px-5 xl:px-10'>


      <div className=''>
        <div id='img' className='w-[125px] h-[75px] bg-slate-600' />
      </div>


      <div className='flex items-center gap-2 '>

        <HeaderButton Text={"Acceuil"} Path={"/"} />
        <HeaderButton Text={"A propos"} Path={"/a-propos"} />
        <HeaderButton Text={"Gallerie"} Path={"/gallerie"} />
        <HeaderButton Text={"Rendez-vous"} Path={"/rendez-vous"} />

        {/* TODO : create burger */}

      </div>


    </header>
  )
}



const HeaderButton = ({Text,Path}) => {
  return(
    <a href={Path} className='font-custom_1 text-[var(--brand-white)] bg-[var(--brand-black)] text-xl p-3 border-[0.15rem] border-[var(--brand-black)] 
                              hover:bg-[var(--brand-white)] hover:text-[var(--brand-black)] transition-all duration-300'  >
      {Text}
    </a>
  )
}
