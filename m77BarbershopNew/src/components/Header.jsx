import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import { TbMenu2,TbMenuDeep  } from "react-icons/tb";

import LOGO from '../assets/logo/logo.jpg'


export default function Header() {

  const [burgerClicked,setBurgerClicked] = useState(false);

  function handleClickedBurger(e){
    e.preventDefault();

    setBurgerClicked(!burgerClicked);

  }

  return (
    <header className='fixed z-[100] w-screen flex flex-col md:flex-row justify-between bg-[var(--brand-black)] py-3 md:px-5 xl:px-10'>


      <Link to={'/'} className='grid justify-center items-center pb-2 md:pb-0'>
        <img id='img' src={LOGO} className='w-[120px] h-[90px] bg-slate-600' />
      </Link>


      <div className='relative flex flex-col md:flex-row'>

        <button onClick={handleClickedBurger} className='md:hidden grid justify-center items-center'>
          {
            burgerClicked? 
            <TbMenuDeep className='text-4xl text-[var(--brand-white)]'/> :
              <TbMenu2 className='text-4xl text-[var(--brand-white)]'/>
          }
        </button>

        <div className={`absolute w-screen ${burgerClicked? " top-10 translate-y-0 duration-700 transition-transform" : "-top-32 -translate-y-full transition-transform duration-500"} md:top-0 md:translate-y-0 md:duration-0 md:relative md:w-auto grid text-center md:flex items-center gap-2 bg-[var(--brand-black)]`}>
          <HeaderButton Text={"Accueil"} Path={"/"} />
          <HeaderButton Text={"A propos"} Path={"/a-propos"} />
          <HeaderButton Text={"Gallerie"} Path={"/gallerie"} />
          <HeaderButton Text={"Rendez-vous"} Path={"/rendez-vous"} />
        </div>

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
