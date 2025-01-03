import React from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function UserDashboard() {
    const {currentUser} = useAuth()

    
  return (
    <div className='container min-h-screen mx-auto py-20'>
        
        <div className='grid justify-center'>
            <h2 className='text-design-h2 text-center'>Bienvenue <br/>{currentUser.email}</h2>
        </div>

        <div className='grid md:grid-cols-2 gap-5 py-10 px-5 text-center'>
            <Link to={'/user/profile'} className='button-1'>
                Mon Profile
            </Link>
            <Link to={'/user/rdvs'} className='button-1'>
                Mes RDVs
            </Link>
            <Link to={'/admin/inventory'} className='button-1'>
                Inventaire
            </Link>
            <Link to={'/admin/rapport'} className='button-1'>
                Rapport
            </Link>
        </div>

    </div>
  )
}
