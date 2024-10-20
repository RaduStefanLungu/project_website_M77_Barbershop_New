import React from 'react'

import { Link } from 'react-router-dom'

import SERVICES from '../data/services.json'

export default function Home() {
  return (
    <div className='grid bg-white'>

      <HERO/>
      
      <div id='body' className='container mx-auto'>
        <TextBelt/>
      </div>

      <ImageBelt/>

      <div className='bg-slate-950'>
        <div className='container mx-auto'>
          <ServicesSection/>
        </div>
      </div>

    </div>
  )
}


const HERO = () => {
  return(
    <div className='grid relative h-[500px]'>

      <div id='image + filter' className='absolute top-0 z-10 grid w-screen h-full'>
        {/* <img src={IMG_HERO} className='h-full w-full' /> */}
        <div className='hero-image w-full h-full'/>
        {/* <div className='w-full h-full absolute top-0 bg-black/35' /> */}
      </div>

      <div id='text + cta' className='z-20 my-auto pb-10 lg:pb-5 flex flex-col'>

        <h1 className='font-custom_1 text-[var(--brand-white)] tracking-wide  uppercase text-center text-4xl lg:text-5xl 2xl:text-6xl md:mx-auto md:w-[450px] lg:w-[750px]'>
          Nouveau concept, plus qu'un barbier
        </h1>

        <div className='grid py-2 lg:py-5 justify-center items-center'>
          <Link to={'/rendez-vous'} className='button-1 2xl:text-xl'>Réserver Maintenant</Link>
        </div>
      </div>

    </div>
  )
}


const TextBelt = () => {
  return(
    <div className='grid justify-center font-custom_1 text-center py-10'>

      <h4 className='text-slate-600/75 uppercase tracking-wider text-sm xl:text-base'>Expérience prémium</h4>

      <h2 className='text-slate-950 uppercase tracking-wider text-2xl xl:text-3xl font-bold pt-1 pb-3'>Dévoument au style</h2>

      <p className='text-pretty text-md xl:text-lg text-slate-600/75 px-5 md:px-14 lg:px-32'>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sollicitudin maximus pulvinar. Duis nec sem commodo, scelerisque justo nec, eleifend quam. 
      Curabitur dictum ante ullamcorper mauris suscipit, semper condimentum nulla suscipit. 
      Interdum et malesuada fames ac ante ipsum primis in faucibus. 
      Donec aliquet lectus vel nunc sollicitudin sollicitudin. Ut ac quam ante. 
      Praesent eros nulla, euismod quis facilisis ac, tincidunt nec purus.
      </p>

    </div>
  )
}

const ImageBelt = () => {
  return(
    <div className='relative grid pt-5 pb-10'>

      <div id='image holder' className='absolute top-0 z-10 grid w-screen h-full'>
        <div className='belt-image w-full h-full absolute top-0 z-'/>
      </div>

      <div className='font-custom_1 z-20 text-center text-[var(--brand-white)] grid justify-center items-center'>

        <h4 className='uppercase tracking-wider text-xs lg:text-sm xl:text-base py-1'>Pourquoi Nous?</h4>
        <h2 className='uppercase tracking-wider lg:tracking-widest text-xl lg:text-2xl xl:text-3xl font-bold pt-1 pb-3'>Car vous méritez le meilleur</h2>

      </div>

      

    </div>
  )
}

const CardBelt = () => {
  return(
    <div>
      This will be a card belt.
    </div>
  )
}


const ServicesCard = ({Services}) => {
  return(
    <div className='font-custom_1 border-[0.15rem] border-[var(--brand-white)] pt-10 pb-5 px-5 grid relative'>

      <label className='bg-[var(--brand-white)] text-slate-950 py-3 px-5 absolute -top-10 left-10 text-2xl '>
        {Services.group}
      </label>

      <div className='grid gap-3'>

        {
          Services.services.map(
            (value,key) => {
              return(
                <div key={key} className='grid'>
                  <div className='grid grid-flow-col justify-between border-b-[0.05rem] border-[var(--brand-white)] text-2xl '>
                    <label className=''>{value.name}</label>
                    <label className='text-end mt-auto px-5'>{value.price} €</label>
                  </div>
                  <p className='text-[var(--brand-white-80)] text-base'>{value.description}</p>
                </div>
              )
            }
          )
        }

      </div>

    </div>
  )
}

const ServicesSection = () => {
  return(
    <div className='bg-[var(--brand-black)] text-[var(--brand-white)] px-10'>

      <h3 className='font-custom_1 text-4xl tracking-widest pt-10'>
        Services
      </h3>

      <div className=' grid lg:grid-cols-2 justify-center py-20 gap-20'>
        <ServicesCard Services={SERVICES.services_by_group[0]} />
        <ServicesCard Services={SERVICES.services_by_group[1]} />
      </div>
    </div>
  )
}