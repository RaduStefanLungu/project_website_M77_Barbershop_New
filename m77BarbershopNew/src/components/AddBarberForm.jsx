import { useState } from "react"
import { v4 } from "uuid"
import { addProfileAndUploadImage } from "../api/firebase"

export default function AddBarberForm() {
    const [message,setMessage] = useState(null)

    const [firstName,setFirstName] = useState('')
    const [lastName,setLastName] = useState('')
    const [email,setEmail] = useState('') 
    const [startingContract,setStartingContract] = useState('')
    const [isCDI,setIsCDI] = useState(false)
    const [endingContract,setEndingContract] = useState('CDI')
    const [imageName,setImageName] = useState(v4())

    const [img,setImg] = useState(null)

    const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
        timeZone: 'Europe/Brussels', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
      }).split('/').reverse().join('-'))

      function handleIsCDI(e){
        const checked = e.target.checked;
        setIsCDI(checked);

        if (checked) {
            setEndingContract('CDI');
        }

      }

    async function handleCreateTable(e){
        e.preventDefault();

        const data = {
            profile_id: lastName + firstName,
            first_name : firstName,
            last_name : lastName,
            email: email,
            starting_contract : startingContract,
            ending_contract : endingContract,
            is_cdi : isCDI,
            visible: false,
            image : imageName,
            image_url : "",
            profile_description : "NaN",
            locked_days : []
        }

        if(img !== null){
            await addProfileAndUploadImage(data,img).then(
                (response) =>{
                    if(response){
                        setMessage({message: "Nouveau barbier introduit avec success !",isError: false});
                        // TODO: refresh form here 
                        setFirstName('')
                        setLastName('')
                        setEmail('')
                        setStartingContract('')
                        setIsCDI(false)
                        setEndingContract('CDI')
                        setImageName(v4())
                        setImg(null)

                        e.target.reset()
                    }
                }
            )
        }
        else{
            setMessage({message: "Choisisez une image !",isError: true});
        }
    }

    return(
        <form className='font-custom_1 flex flex-col gap-1 max-w-[400px] bg-white p-5 border-[var(--brand-black)] border-[0.15rem]' onSubmit={handleCreateTable}>
            <label className='text-2xl font-bold text-white bg-[var(--brand-black)] px-2 py-2 mb-2'>Nouveau Barber</label>
            <div className='grid grid-cols-2'>
                <input onChange={(e)=>{setLastName(e.target.value)}} required type='text' placeholder='Nom de famille' className='px-1 py-2 border-[var(--brand-black)] border-[0.15rem]' />
                <input onChange={(e)=>{setFirstName(e.target.value)}} required type='text' placeholder='Prénom' className='px-1 py-2 border-[var(--brand-black)] border-[0.15rem]' />
            </div>
            <input onChange={(e)=>{setEmail(e.target.value)}} required type='email' placeholder='Email' className='px-1 py-2 border-[var(--brand-black)] border-[0.15rem]' />
            <div className='flex flex-col'>
                <label className='pb-1'>Date du début de contrat</label>
                <input onChange={(e)=>{setStartingContract(e.target.value)}} required type='date' min={today} placeholder='starting contract' className='px-1 py-2 border-[var(--brand-black)] border-[0.15rem]' />
            </div>
            {/* <input type='checkbox' onClick={handleIsCDI} className='w-4'/> */}
            <div className='flex gap-5'>
                <label className='text-lg'>CDI</label>
                <input onClick={handleIsCDI} type='checkbox' className='w-4'/>
            </div>
            <div className={`flex-col ${isCDI? "hidden" : "flex" }`}>
                <label className='pb-1'>Date de fin de contrat</label>
                <input onChange={(e)=>{setEndingContract(e.target.value)}} type='date' min={today} placeholder='ending contract' disabled={isCDI} required={isCDI} className='px-1 py-2 border-[var(--brand-black)] border-[0.15rem]' />
            </div>

            <div className='flex flex-col'>
                <label className='pb-1'>Téléchargez une photo <span className='text-xs'>(250x450px)</span></label>
                <input type='file' onChange={(e)=>{setImg(e.target.files[0])}}></input>
            </div>

            <div className=''>
                {
                    message!==null? 
                    <p className={`${message.isError? "text-red-500" : "text-green-500"}`}>
                        {message.message}
                    </p> : <></>
                }
            </div>

            <button type='submit' className='bg-[var(--brand-black)] text-white font-semibold py-2 px-10 mr-auto mt-2'>Rajouter</button>
        </form>
    )
}