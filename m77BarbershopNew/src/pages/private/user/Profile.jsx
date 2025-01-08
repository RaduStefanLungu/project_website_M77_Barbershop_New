import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { changePassword, getProfileByEmail, updateDescription, updateImage } from '../../../api/firebase'
import { Link } from 'react-router-dom'

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

  const BACKBUTTON = <button onClick={handleBackButtonForViews} className='-button-2'>Retour</button>

  function handleBackButtonForViews(e){
    e.preventDefault()
    setShowView(false)
    setActiveView(null)
  }

  function handleChangeDescription(e){
    e.preventDefault()
    setActiveView(<ChangeDescriptionView profile={profile} backButton={BACKBUTTON}/>)
    setShowView(true)
  }

  function handleChangeImage(e){
    e.preventDefault()
    setActiveView(<ChangeImageView profile={profile} backButton={BACKBUTTON}/>)
    setShowView(true)
  }

  function handleChangePassword(e){
    e.preventDefault()
    setActiveView(<ChangePasswordView currentUser={currentUser} backButton={BACKBUTTON}/>)
    setShowView(true)
  }
  

  if(profile === null ){
    return(
      <div className='font-bold text-4xl font-custom_1'>
        This profile isn't registered
      </div>
    )
  }

  return (
    <div className='font-custom_1 relative grid py-10 px-5 xl:px-20 2xl:px-40'>
      
      {
        showView ? 
          <div className='absolute top-0 left-0 bg-black/90 text-white w-full h-full grid'>
            {activeView}
          </div> :
          <></>
      }

      <h2 className='text-design-h2'>Profile</h2>

      <div className='grid'>

        <div className='flex flex-col justify-center items-center pb-5 '>
          <div className="border-[var(--brand-black)] border-[0.15rem] p-5">
            <img src={profile.image_url} alt='user-image-used-for-clients-in-appointment-form' 
                className='w-[250px] h-[450px]' ></img>
          </div>
          <h4>{profile.email}</h4>
        </div>

        <div className='grid gap-5 justify-center'>
          <div className='grid grid-cols-2 gap-5 justify-center'>
            <button onClick={handleChangeImage} className='button-1'>Changer l'image</button>
            <button onClick={handleChangeDescription} className='button-1'>Changer la description</button>
          </div>
          <div className='grid justify-center'>
            <button onClick={handleChangePassword} className='button-1'>Changer Mot de Pass</button>
          </div>
        </div>

        <div className='flex gap-5 mx-auto py-10'>
          <Link to={'/user/dashboard'} className='button-2'>Retour</Link>
        </div>
        
      </div>

    </div>
  )
}


const ChangeDescriptionView = ({profile,backButton}) => {
  // const [userDescription,setUserDescription] = useState('')
  const descriptionRef = useRef()
  const [clickedSaved,setClickedSaved] = useState(false)
  const [message,setMessage] = useState(["",false])

  async function handleSave(e){
    e.preventDefault();
    if(descriptionRef.current.value === ''){
      return(false)
    }
    await updateDescription(profile,descriptionRef.current.value).then((response) => {
      if(response !== null){
        // setUserDescription(descriptionRef.current.value)
        setClickedSaved(true)
        setMessage(["Description mise à jour avec succès !",false])
        return(true)
      }
    }).catch((error) => {
      setMessage(["Erreur lors de la mise à jour de la description !",true])
      return(false)
    })
  }

  return(
    <div className='flex flex-col p-5 max-w-[500px] mx-auto'>
      <label className='font-custom_1 font-bold text-3xl'>Nouvelle Description</label>
      <label className='text-[var(--brand-white-80)]'>Conseil : maximum 20 mots.</label>
      <textarea placeholder={profile.profile_description} ref={descriptionRef} className='h-[500px] px-3 py-1 text-[var(--brand-black)]'></textarea>
      <div className='p-3 grid text-center justify-center'>
        <p className={`font-bold ${message[1]? "text-red-500" : "text-green-500"}`}>{message[0]}</p>
      </div>
      <div className='flex justify-center gap-5 pt-5'>
        {backButton}
        <button onClick={handleSave} disabled={clickedSaved} className='button-2 disabled:bg-gray-300'>Sauvegarder</button>
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
    else{
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
    
  }

  return(
    <div className='flex flex-col p-5 max-w-[500px] mx-auto'>
      <label className='font-custom_1 font-bold text-3xl'>Nouvelle Image</label>
      <label className='text-[var(--brand-white-80)]'>Conseil : dimension de 250x450 pixels.</label>
      <div className='grid py-10'>
        <input type='file' onChange={(e)=>{setImg(e.target.files[0])}}></input>
        <div className='grid justify-center py-5'>
          {
            img !== null ? 
              <img src={URL.createObjectURL(img)} alt='user-image-used-for-clients-in-appointment-form' 
                className='w-[250px] h-[450px] mx-auto border-white border-[0.05rem]' ></img> :
              <div className='w-[250px] h-[450px] bg-white text-[var(--brand-black)] grid items-center justify-center font-medium mx-auto border-white border-[0.05rem]'>Prévisualisation d'Image</div>
          }
          <button onClick={()=>{setImg(null)}} className='-button-2 mt-5'>Supprimer séléction</button>
        </div>
      </div>
      <div className='grid text-center justify-center'>
        <p className={`font-bold ${message[1]? "text-red-500" : "text-green-500"}`}>{message[0]}</p>
      </div>
      <div className='flex justify-center gap-5 pt-5'>
        {backButton}
        <button onClick={handleSave} disabled={saveClicked} className='button-2 disabled:bg-gray-300'>Sauvegarder</button>
      </div>
    </div>
  )
}

const ChangePasswordView = ({currentUser,backButton}) => {
  // const [userDescription,setUserDescription] = useState('')
  const passwordRef = useRef()
  const confirmPasswordRef = useRef()
  const [clickedSaved,setClickedSaved] = useState(false)
  const [message,setMessage] = useState(["",false])

  async function handleSave(e){
    e.preventDefault();
    if(passwordRef.current.value !== confirmPasswordRef.current.value){
      setMessage(["Les mots de pass ne correspondent pas !",true])
      return(false)
    }
    await changePassword(currentUser,passwordRef.current.value).then((response) => {
      if(response !== null){
        // setUserDescription(passwordRef.current.value)
        setClickedSaved(true)
        setMessage(["Mot de pass mis à jour avec succès !",false])
        return(true)
      }
    }).catch((error) => {
      setMessage(["Erreur lors de la mise à jour de la description !",true])
      return(false)
    })
  }

  return(
    <div className='flex flex-col p-5 max-w-[500px] mx-auto'>
      <label className='font-custom_1 font-bold text-3xl'>Nouveau Mot de Pass</label>
      <label className='text-[var(--brand-white-80)]'>Conseil : minimum 9 caractères, contenant des letters et chiffres</label>
      <div className='grid gap-3 py-5 px-3'>
        <input type='password' placeholder='Nouveau mot de pass' ref={passwordRef} className='px-1 py-3'></input>
        <input type='password' placeholder='Confirmer le mot de pass' ref={confirmPasswordRef} className='px-1 py-3'></input>
      </div>
      <div className='p-3 grid text-center justify-center'>
        <p className={`font-bold ${message[1]? "text-red-500" : "text-green-500"}`}>{message[0]}</p>
      </div>
      <div className='flex justify-center gap-5 pt-5'>
        {backButton}
        <button onClick={handleSave} disabled={clickedSaved} className='button-2 disabled:bg-gray-300'>Sauvegarder</button>
      </div>
    </div>
  )
}