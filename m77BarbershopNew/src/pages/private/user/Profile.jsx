import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { getProfileByEmail, updateImage } from '../../../api/firebase'

export default function Profile() {
  
  const [profile,setProfile] = useState(null)

  const [activeView,setActiveView] = useState(null)
  const [showView,setShowView] = useState(false)

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

  function handleBackButtonForViews(e){
    e.preventDefault()
    setShowView(false)
    setActiveView(null)
  }

  function handleChangeDescription(e){
    e.preventDefault()
    setActiveView(<ChangeDescriptionView profile={profile} backButton={<button onClick={handleBackButtonForViews} className='bg-red-300'>Retour</button>}/>)
    setShowView(true)
  }

  function handleChangeImage(e){
    e.preventDefault()
    setActiveView(<ChangeImageView profile={profile} backButton={<button onClick={handleBackButtonForViews} className='bg-red-300'>Retour</button>}/>)
    setShowView(true)
  }
  

  if(profile === null ){
    return(
      <div className='font-bold text-4xl'>
        This profile isn't registered
      </div>
    )
  }

  return (
    <div className='relative container mx-auto grid py-10 px-5 xl:px-0'>
      
      {
        showView ? 
          <div className='absolute top-0 left-0 bg-blue-300 w-screen h-screen grid'>
            {activeView}
          </div> :
          <></>
      }

      <h2 className='text-design-h2'>Profile</h2>

      <div className='grid'>

        <div className='flex flex-col justify-center items-center pb-5'>
          <img src={profile.image_url} alt='user-image-used-for-clients-in-appointment-form' 
              className='w-[250px] h-[450px] hover:backdrop-grayscale' ></img>
          <h4>{profile.email}</h4>
        </div>

        <div className='grid grid-cols-2 gap-5 justify-center'>
          <button onClick={handleChangeImage} className='bg-red-300'>Changer l'image</button>
          <button onClick={handleChangeDescription} className='bg-red-300'>Changer la description</button>
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


const ChangeDescriptionView = ({profile,backButton}) => {
  const [userDescription,setUserDescription] = useState('')
  const descriptionRef = useRef()
  return(
    <div className='flex flex-col p-5'>
      <label className='font-custom_1 font-bold text-3xl'>Nouvelle Description</label>
      <label className='text-[var(--brand-gray-75)]'>Conseil : maximum 20 mots.</label>
      <textarea placeholder={profile.profile_description} ref={descriptionRef} className='h-[500px] px-3 py-1'></textarea>
      <div className='flex justify-center gap-5 pt-5'>
        {backButton}
        <button className='bg-red-300'>Sauvegarder</button>
      </div>
    </div>
  )
}

const ChangeImageView = ({profile,backButton}) => {
  const [img,setImg] = useState(null)

  const [message,setMessage] = useState(["",false])
  const [saveClicked,setSaveClicked] = useState(false)

  async function handleSave(e){
    e.preventDefault();
    if(img === null){
      setMessage(["Pas d'image sélectionnée !",true])
      return(false);
    }
    await updateImage(profile,img).then((response) => {
      if(response){
        setSaveClicked(true)
        setMessage(["Image mise à jour avec succès !",false])
        return(true)
      }
    }).catch((error) => {
      setMessage(["Erreur lors de la mise à jour de l'image !",true])
      return(false)
    })
  }

  return(
    <div className='flex flex-col p-5'>
      <label className='font-custom_1 font-bold text-3xl'>Nouvelle Image</label>
      <label className='text-[var(--brand-gray-75)]'>Conseil : dimension de 250x450 pixels.</label>
      <div className='grid py-10'>
        <input type='file' onChange={(e)=>{setImg(e.target.files[0])}}></input>
        <div className='grid justify-center py-5'>
          {
            img !== null ? 
              <img src={URL.createObjectURL(img)} alt='user-image-used-for-clients-in-appointment-form' 
                className='w-[250px] h-[450px]' ></img> :
              <div className='w-[250px] h-[450px] bg-white grid items-center justify-center font-medium'>Prévisualisation d'Image</div>
          }
          <button onClick={()=>{setImg(null)}} className='bg-red-300 p-3 mt-5'>Supprimer séléction</button>
        </div>
      </div>
      <div className='grid text-center justify-center'>
        <p className={`font-bold ${message[1]? "text-red-500" : "text-green-500"}`}>{message}</p>
      </div>
      <div className='flex justify-center gap-5 pt-5'>
        {backButton}
        <button onClick={handleSave} disabled={saveClicked} className='bg-red-300 disabled:bg-gray-300'>Sauvegarder</button>
      </div>
    </div>
  )
}