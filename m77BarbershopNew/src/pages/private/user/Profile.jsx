import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { getProfileByEmail } from '../../../api/firebase'

export default function Profile() {
  
  const [profile,setProfile] = useState(null)

  const {currentUser} = useAuth()

  async function fetchData(){
    await getProfileByEmail(currentUser.email).then(
      (response)=>{
        setProfile(response)
      }
    )
  }

  useEffect(()=>{
    fetchData();
  },[])

  function handleSave(e){
    e.preventDefault()

  }
  

  if(profile === null ){
    return(
      <div>
        This profile isn't registered
      </div>
    )
  }

  return (
    <div className='container mx-auto grid py-10 px-5 xl:px-0'>


      <h2 className='text-design-h2'>Profile</h2>

      <div className='grid'>

        <div className='flex flex-col justify-center items-center pb-5'>
          <img src={profile.image_url} alt='user-image-used-for-clients-in-appointment-form' 
              className='w-[250px] h-[450px] hover:backdrop-grayscale' ></img>
          <h4>{profile.email}</h4>
        </div>

        <div className='grid grid-cols-2 gap-5 justify-center'>
          <button className='bg-red-300'>Changer l'image</button>
          <button className='bg-red-300'>Changer la description</button>
          <button className='bg-red-300'>Mot de passe oublié</button>
          <button className='bg-red-300'>Change Image</button>

        </div>

        <div className='flex gap-5 mx-auto py-10'>
          <button className='bg-red-300'>Annuler</button>
          <button onClick={handleSave} className='bg-red-300'>Sauvegarder</button>
        </div>
        
      </div>

    </div>
  )
}


