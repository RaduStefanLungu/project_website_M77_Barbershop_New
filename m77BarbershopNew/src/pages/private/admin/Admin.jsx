import React, { useEffect, useState } from 'react'
import AddBarberForm from '../../../components/AddBarberForm'
import { getProfiles, removeProfile, updateProfile } from '../../../api/firebase'

export default function Admin() {

    const [popUpView,setPopUpView] = useState(<></>)
    const [showPopup,setShowPopup] = useState(true)

    const [profiles,setProfiles] = useState([])

    async function fetchProfiles(){
        await getProfiles().then(
            (response) => {
                setProfiles(response)
            }
        )
    }

    useEffect(()=>{
        fetchProfiles()
    },[])


  return (
    <div className='grid relative'>

        <div className={`${showPopup? "grid" : "hidden"}`}>
            {
                popUpView
            }
        </div>

        <div className='grid'>
            <CreatedProfilesList profiles={profiles} fetcher={fetchProfiles} popupSetters={[popUpView,setPopUpView]} popupShowSetters={[setShowPopup]} />
        </div>

        <div className='py-10 grid justify-start '>
            <AddBarberForm fetcher={fetchProfiles} />
        </div>

      

    </div>
  )
}


const CreatedProfilesList = ({profiles,fetcher, popupSetters,popupShowSetters}) => {

    const ProfileTab = ({data,fetcher}) => {
        // TODO : you should remove the deletion button if not accessed by admin

        const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
            timeZone: 'Europe/Brussels', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit'
          }).split('/').reverse().join('-'))



        async function handleChangeVisibility(e){
            e.preventDefault();

            data.visible = !data.visible
            await updateProfile(data).then(
                ()=>{
                    fetcher();
                }
            )
        }

        return(
            <div className={` grid`}>
                <div className="grid grid-cols-2 gap-1">
                    <div className='flex flex-col'>
                        <label className='font-bold text-2xl'>{data.last_name} {data.first_name}</label>
                        <label className='text-md overflow-x-auto'>Email : {data.email}</label>
                        <label>Id : {data.profile_id}</label>
                        <label>Visible? : <span className={`${data.visible? "text-green-500" : "text-red-500"} font-bold`}>{data.visible? "Oui" : "Non"}</span></label>
                        <label>Début Contract : {data.starting_contract}</label>
                        <label className={`${today >= data.ending_contract && !['/','cdi'].includes(data.ending_contract)? "underline font-medium text-red-500" : " " }`}>Fin Contract : {data.ending_contract}</label>
                        <div className='flex pt-5'>
                            <button type='button' onClick={handleChangeVisibility} className='button-1'> Changer Visibilité </button>
                        </div>
                    </div>
                    <div className='grid justify-center'>
                        <img src={data.image_url} className='w-[250px] h-[450px]' />
                    </div>
                </div>
            </div>
        )
    }

    async function handleRemove(e,profileID){
        e.preventDefault()
        try{
            await removeProfile(profileID).then(
                (response) => {
                    fetcher();                   
                }
            )
        }catch(e){
            console.log(e);
            
        }
    }

    const PopUpSecurityRemove = ({profileID,removeFunction}) => {
        scrollToTop();

        function handleYes(e){
            e.preventDefault();
            removeFunction(e,profileID);

            popupSetters[1](<></>)
            popupShowSetters[0](false)
        }

        function handleNo(e){
            e.preventDefault();
            popupSetters[1](<></>)
            popupShowSetters[0](false)
        }

        return(
            <div className='absolute top-0 grid bg-[var(--brand-black-75)] text-[var(--brand-white)] w-screen h-full'>
                <div className='flex flex-col mx-auto pt-32 px-5'>
                    <label className='text-bold text-2xl text-center'>Etez vous certain de supprimer '{profileID}' ? </label>
                    <div className='flex justify-center gap-5 pt-5'>
                        <button type='button' onClick={handleYes} className='button-2'>Oui</button>
                        <button type='button' onClick={handleNo}  className='button-1' >Non</button>
                    </div>
                </div>
            </div>
        )
    }

    function handlePopupSecurity(e,profileID){
        e.preventDefault();
        popupSetters[1](<PopUpSecurityRemove profileID={profileID} removeFunction={handleRemove} />)
        popupShowSetters[0](true)

    }

    if(!profiles){
        return(
            <label className='font-custom_1 text-xl'>
                Chargement...
            </label>
        )
    }

    else{
       return(
        <div id='profiles' className='flex flex-col font-custom_1 py-5'>
            <h2 className='text-design-h2'>Utilisateurs</h2>
            <div className='flex flex-col min-h-[200px] max-h-[750px] lg:max-h-[750px] overflow-y-scroll'>
                {
                    profiles.length>0 && profiles.map((value,key) => {
                        return(
                            <div key={key} className='grid border-y-[0.15rem] border-[var(--brand-black)] py-5'>
                                <ProfileTab key={key} Key={key} data={value} fetcher={fetcher} />
                                <div className='flex justify-start pt-3'>
                                    <button type='button' onClick={(e) => {handlePopupSecurity(e,value.profile_id)}} className='button-1 bg-red-500 border-red-500 hover:border-red-500 hover:text-red-500'>Supprimer</button>
                                </div>
                            </div>
                    )    
                    })
                }
            </div>
        </div>
    ) 
    }

    
}


const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth", // Optional: "smooth" for animated scroll or "auto" for instant scroll
    });
  };