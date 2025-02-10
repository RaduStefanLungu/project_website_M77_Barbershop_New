import React, { useEffect, useState } from 'react'
import { getScheduleFooter } from '../api/firebase'

import { FaInstagram,FaFacebook } from "react-icons/fa6";
import { Link } from 'react-router-dom';

export default function Footer() {

  const ADDRESS = "Avenue Eugène Mascaux 657 , 6001 Marcinelle"

  return (
    <footer className='bg-[var(--brand-black)] text-[var(--brand-white)] grid pt-20'>

      <SocialMedia/>  

      <div className='grid md:grid-cols-3'>

        {/* <div className='font-bold px-5'>
          Adresse : <a target='_blank' className="text-blue-500 underline" href={'https://www.google.com/maps/dir//Rue+des+Hauchies+64,+6010+Charleroi/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x47c22660e2283655:0x36de5e52a32eb5e4?sa=X&ved=1t:707&ictx=111'}>{ADDRESS}</a>
        </div> */}

        <div className='grid px-5 mb-auto'>
          <h3 className='font-bold py-1'>Adresse</h3>
          <a target='_blank' className="text-blue-500 underline px-5" href={'https://maps.app.goo.gl/G5rHu41etaLL17XU9'}>{ADDRESS}</a>
        </div>

        <Schedule/>

        <Links/>

      </div>

      <div className='py-5 text-center'>
        <Link to={'/termes-et-conditions'} className='text-blue-500 underline'>Termes et Conditions</Link>
      </div>

      <div className='py-5 text-center'>
        Website Created by <a href="https://www.prowebsolutions.online/#/fr/home" target='_blank' className="text-blue-500 underline">Pro Web Solutions</a>
      </div>

    </footer>
  )
}

const SocialMedia = () => {

  const LINK_FB = "https://www.facebook.com/profile.php?id=61571996394439&mibextid=wwXIfr&rdid=OyX2Kxn9sZFNocu8&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F15ZRVrHNAH%2F%3Fmibextid%3DwwXIfr";
  const LINK_INSTA = "https://www.instagram.com/m77_barber/?igsh=MTgwMGo4YzE2ODZ6YQ%3D%3D&utm_source=qr&fbclid=IwAR2RvqvmOxylku8yBSVg_5gKjkGnK-PZbiOW929NFX70AQoeSlje9oA9Z10"

  return(
    <div className='grid py-3 mb-3 mx-5 border-b-[0.15rem]'>
      <label className='text-center text-xl py-3'>Suivez nous :</label>
      <div className='grid grid-flow-col justify-center gap-20 text-5xl'>

        <a href={LINK_INSTA} target='_blank' className=''><FaInstagram/></a>

        <a href={LINK_FB} target='_blank' className=''><FaFacebook/></a>

      </div>
    </div>
  )
}

const Schedule = () => {

  const [scheduleData,setScheduleData] = useState([])

  async function setData(){
    
    await getScheduleFooter().then(
      (response)=>{
        setScheduleData(response)
      }
    ) 
  }

  useEffect(()=>{
    setData()
  },[])

  return(
    <div className='grid'>
      
      <h3 className='font-bold py-1 px-5'>Horaire</h3>

      <div className='grid'>

        {
          scheduleData.map(
            (value,key) => {
              return(
                <div key={key} className='grid grid-cols-2'>
                  <label className='text-right px-5'> {value.day} : </label>
                  <label className={`${value.schedule==="Fermé"? "text-red-500" : "text-green-500"}`}> {value.schedule} </label>
                </div>
              )
            }
          )
        }

      </div>


    </div>
  )
}

const Links = () => {
  return(
    <div className='grid mb-auto px-5'>

      <h3 className='font-bold py-1'>Liens Rapids</h3>

      <div className='grid grid-cols-2'>

        <a href={'/'} className='text-blue-500 underline'>Accueil</a>
        <a href={'/a-propos'} className='text-blue-500 underline'>A propos</a>
        <a href={'/gallerie'} className='text-blue-500 underline'>Gallerie</a>
        <a href={'/rendez-vous'} className='text-blue-500 underline'>Rendez-vous</a>
        <a href={'/admin/login'} className='text-blue-500 underline'>Admin</a>

      </div>

    </div>
  )
}