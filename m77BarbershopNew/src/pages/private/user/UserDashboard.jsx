import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Link } from 'react-router-dom'
import { getProfileByEmail } from '../../../api/firebase'

export default function UserDashboard() {
    const {currentUser,logout} = useAuth()
    const [profileData,setProfileData] = useState(null);

    async function handleLogout(e){
        e.preventDefault();

        await logout();
    }

    async function fetchProfile() {
          await getProfileByEmail(currentUser.email).then((response) => {
            setProfileData(response);
            console.log(response);
          });
        }

    useEffect(
        ()=>{
            fetchProfile();
        },[]
    )
    
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
            {
                profileData !== null && profileData.admin? <Link to={'/admin/rapport'} className='button-1'>
                Rapport
            </Link> : <></>
            }

            {
                profileData !== null && profileData.admin? <Link to={'/admin/management'} className='button-1'>Admin</Link> : <></>
            }

            <button type='button' onClick={handleLogout} className='button-2'>
                Déconnection
            </button>
        </div>

    </div>
  )
}
