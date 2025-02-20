import React from 'react'
import AppointmentForm from '../components/AppointmentForm'

export default function RendezVous() {
  return (
    <div className='bg-[var(--brand-black)] flex min-h-screen'>

      <div className='bg-[var(--brand-white)] m-auto flex flex-col justify-center md:px-10 py-10'>
        
        <h2 className="font-custom_1 text-5xl pb-5">Rendez-Vous</h2>
        
        <AppointmentForm/>
        
      </div>

    </div>
  )
}


