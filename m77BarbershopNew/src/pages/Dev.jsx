import { useEffect, useState } from 'react'
import { addAppointment, addAppointment2, addNewDocument, addProfileAndUploadImage, getProfiles, getScheduleHours, populateProfile, removeProfile } from '../api/firebase'
import { v4 } from 'uuid'
import { PhoneAuthCredential } from 'firebase/auth'
import AppointmentForm from '../components/AppointmentForm'

export default function Dev() {

    const [messages,setMessages] = useState([]) 
    

    function handleClearLog(e){
        e.preventDefault()
        setMessages([])
    }

  return (
    <div>
        
        <h1 className='font-bold text-4xl py-5'> Appointment System </h1>
        
        <div className='grid' >

            <div className='bg-orange-200 pt-5 pb-20 px-20 mb-auto grid'>
                <h2 className='font-bold text-3xl py-3'> Dev Page </h2>

                <div className='grid gap-5'>

                    <AddBarber messagesLog={[messages,setMessages]}></AddBarber>

                    <AddDaysToSchedule/>

                    <AppointmentForm/>

                    {/* <PopulateProfile messagesLog={[messages,setMessages]} ></PopulateProfile> */}

                    <div>
                        ...
                    </div>

                </div>
            
            </div>

            <div className='bg-emerald-200 pt-5 px-10 flex flex-col gap-10'> 
                <div id='log' className='flex flex-col p-3 bg-slate-100'>
                    <h2 className='font-bold text-3xl py-3'> LOG </h2>
                    <div className='flex flex-col border-[0.15] border-blue-500 min-h-[200px] max-h-[300px] lg:max-h-[350px] overflow-y-scroll'>
                        {
                            messages.map((value) => {
                                return(
                                value
                                )         
                            })
                        }
                    </div>
                    <button onClick={handleClearLog} className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Clear Log</button>
                </div>

                <CreatedProfilesList messagesLog={[messages,setMessages]} />

                {/* <ListAppointmentByUser messagesLog={[messages,setMessages]} /> */}


            </div>
        </div>

    </div>
  )
}


const AddDaysToSchedule = () => {
    const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
        timeZone: 'Europe/Brussels', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
      }).split('/').reverse().join('-'))
    
    const [dayName,setDayName] = useState("")
    const [aso,setAso] = useState("")
    const [asc,setAsc] = useState("")
    const [nso,setNso] = useState("")
    const [nsc,setNsc] = useState("")
    const [nssd,setNssd] = useState("")


    async function handleSubmit(e){
        e.preventDefault();
        const data = {
            doc_id : dayName,
            actual_schedule: {
                opening_hour: aso,
                closing_hour: asc,
            },
            new_schedule : {
                opening_hour: nso,
                closing_hour: nsc,
                starting_date: nssd
            },
            locked: false
        }

        await addNewDocument('schedule',data).then(
            (response) => {
                if(response !== null){
                    console.log("Sucessfully added new document to 'schedule' collection.");
                    
                }
            }
        )
        
    }

    return(
        <div>
            <h2 className='font-bold text-3xl py-3'> AddDaysToSchedule</h2>

            <form onSubmit={handleSubmit} className='grid gap-2'>
                <input onChange={(e)=>{setDayName(e.target.value)}} required type='text' placeholder='day name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                <div className='flex'>
                    <label className='text-center my-auto pr-2'>actual schedule opening </label>
                    <input onChange={(e)=>{setAso(e.target.value)}} required type='time' placeholder='actual schedule opening' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                </div>
                <div className='flex'>
                    <label className='text-center my-auto pr-2'>actual schedule closing</label>
                    <input onChange={(e)=>{setAsc(e.target.value)}} required type='time' placeholder='actual schedule closing' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                </div>
                <div className='flex'>
                    <label className='text-center my-auto pr-2'>new schedule opening</label>
                    <input onChange={(e)=>{setNso(e.target.value)}} required type='time' placeholder='new schedule opening' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                </div>
                <div className='flex'>
                    <label className='text-center my-auto pr-2'>new schedule closing</label>
                    <input onChange={(e)=>{setNsc(e.target.value)}} required type='time' placeholder='' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />                
                </div>
                <div className='flex'>
                    <label className='text-center my-auto pr-2'>new schedule starting date :</label>
                    <input onChange={(e)=>{setNssd(e.target.value)}} required type='date' min={today} placeholder='' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                </div>
                <button type='submit' className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Submit</button>
            </form>
        </div>
    )
}

const AddBarber = ({messagesLog}) => {
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
            profile_description : "NaN"
        }

        if(img !== null){
            await addProfileAndUploadImage(data,img).then(
                (response) =>{
                    if(response){
                        setMessage({message: "Sucessfully uploaded profile & image !",isError: false});                    
                    }
                }
            )
        }
        else{
            setMessage({message: "Failed to upload profile & image ! No image chosen",isError: true});
        }
    }

    return(
        <form className='flex flex-col gap-1 max-w-[350px]' onSubmit={handleCreateTable}>
            <label className='text-md'>Add Barber</label>
            <div className='grid grid-cols-2'>
                <input onChange={(e)=>{setFirstName(e.target.value)}} required type='text' placeholder='first name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
                <input onChange={(e)=>{setLastName(e.target.value)}} required type='text' placeholder='last name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
            </div>
            <input onChange={(e)=>{setEmail(e.target.value)}} required type='email' placeholder='email' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
            <div className='flex flex-col'>
                <label>Starting Contract Date</label>
                <input onChange={(e)=>{setStartingContract(e.target.value)}} required type='date' min={today} placeholder='starting contract' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
            </div>
            <div className='flex gap-5'>
                <label className='text-lg'>CDI</label>
                <input onClick={()=>{setIsCDI(!isCDI)}} type='checkbox' className='w-4' />
            </div>
            <div className={`flex-col ${isCDI? "hidden" : "flex" }`}>
                <label>Ending Contract Date</label>
                <input onChange={(e)=>{setEndingContract(e.target.value)}} type='date' min={today} placeholder='ending contract' disabled={isCDI} required={isCDI} className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
            </div>

            <div className='flex flex-col'>
                <label className='pb-1'>Upload Profile Image <span className='text-xs'>(250x450px)</span></label>
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

            <button type='submit' className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Add</button>
        </form>
    )
}

const PopulateProfile = ({messagesLog}) => {

    function handlePopulateProfile(e){
        e.preventDefault();
        console.log('Populating profile ...');
        populateProfile('profile_id','fromDate','toDate').then(
            (response) => {
                console.log(response);
            }
        )

        messagesLog[1]([messagesLog,<Message key={messagesLog[0].length-1} message={`Populated profile ${'profile_name'}`}/>])
    }
    
    

    return(
        <div className='flex flex-col max-w-[350px]'>
            <label className='text-md'>Populate Profile</label>
            <div className='grid gap-2'>
                <input type='text' placeholder='profile name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' ></input>
                <input type='text' placeholder='from date' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' ></input>
                <input type='text' placeholder='to date' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' ></input>
            </div>
            <button onClick={handlePopulateProfile} className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Populate</button>
        </div>
    )
}

const CreatedProfilesList = ({messagesLog}) => {


    const [profiles,setProfiles] = useState([])

    useEffect(()=>{
        async function fetchProfiles(){
            await getProfiles().then(
                (response) => {
                    setProfiles(response)
                }
            )
        } 

        fetchProfiles()
    },[])

    const ProfileTab = ({data,Key,messagesLog}) => {
        // TODO : you should remove the deletion button if not accessed by admin

        const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
            timeZone: 'Europe/Brussels', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit'
          }).split('/').reverse().join('-'))

        async function handleRemove(e){
            e.preventDefault()
            await removeProfile(data.profile_id).then(
                (response) => {
                    messagesLog[1]([messagesLog,<Message key={messagesLog[0].length-1} message={`Removed profile ${data.profile_id}`}/>])                    
                }
            )
        }

        return(
            <div className={` ${(Key % 2 ===0) ? 'bg-slate-200' : 'bg-slate-100' } flex`}>
                <div className="flex flex-col">
                    <div className='grid grid-cols-2'>
                        <label className='font-medium text-xl'>{data.last_name} {data.first_name}</label>
                        <label className='text-md overflow-x-auto'>{data.email}</label>
                    </div>
                    <div className='flex flex-col'>
                        <label>profile_id : {data.profile_id}</label>
                        <label>visible : <input type='checkbox' checked readOnly={true} className={`${data.visible? "accent-green-500" : "accent-red-500"}`} /></label>
                    </div>
                    <div className='grid grid-cols-2 gap-5'>
                        <label>Starting Contract : {data.starting_contract}</label>
                        <label className={`${today >= data.ending_contract && !['/','cdi'].includes(data.ending_contract)? "underline font-medium text-red-500" : " " }`}>Ending Contract : {data.ending_contract}</label>
                    </div>
                    <div>
                        <img src={data.image_url} className='w-[250px]' />
                    </div>
                </div>
                <button onClick={handleRemove} className='bg-red-500 text-white font-semibold py-2 px-10 rounded-xl m-auto'>Remove</button>
            </div>
        )
    }

    return(
        <div id='profiles' className='flex flex-col p-3 bg-slate-100'>
            <h2 className='font-bold text-3xl py-3'> Existing Profiles </h2>
            <div className='flex flex-col border-[0.15] border-blue-500 min-h-[200px] max-h-[300px] lg:max-h-[350px] overflow-y-scroll'>
                {
                    profiles.length>0 && profiles.map((value,key) => {
                        return(<ProfileTab key={key} Key={key} data={value} messagesLog={messagesLog} />)    
                    })
                }
            </div>
            <button className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Clear Log</button>
        </div>
    )
}

// const AppointmentForm = ({messagesLog}) => {
//     const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
//         timeZone: 'Europe/Brussels', 
//         year: 'numeric', 
//         month: '2-digit', 
//         day: '2-digit'
//       }).split('/').reverse().join('-'))

//     const [profiles,setProfiles] = useState([])

//     const [chosenProfile,setChosenProfile] = useState(null)

//     const [clientFirstName,setClientFirstName] = useState('')
//     const [clientLastName,setClientLastName] = useState('')
//     const [clientEmail,setClientEmail] = useState('')
//     const [clientPhone,setClientPhone] = useState('')
//     const [clientAppointmentDate,setClientAppointmentDate] = useState('')
//     const [clientAppointmentTime,setClientAppointmentTime] = useState('hh:mm')
//     const [clientAppointmentService,setClientAppointmentService] = useState('test service')
    
//     useEffect(()=>{
//         async function fetchProfiles(){
//             await getProfiles().then(
//                 (response) => {
//                     setProfiles(response)
//                 }
//             )
//         } 

//         fetchProfiles()
//     },[])

    
//     async function handleSubmit(e){
//         e.preventDefault();

//         const response = await addAppointment2({
//             barber_id : chosenProfile.profile_id,
//             appointment_id : v4(),
//             appointment_hour : "10:30",
//             appointment_date : clientAppointmentDate,
//             appointment_service : "modern haircut",
//             appointment_user : {
//               email : clientEmail,
//               name : `${clientLastName} ${clientFirstName}`,
//               phone : clientPhone
//             },
//             registered_time : new Date().toLocaleString()
//           })
//     }

//     const ProfileCard = ({ profile,setter, clickable=false }) => {

//         function handleClickedProfile(e) {
//             e.preventDefault();         
//             if(clickable){
//                 setter(profile)
//             }
            
//         }
        
//         return (
//             <button onClick={handleClickedProfile}>
//                 <div className="relative container m-auto w-[250px] h-[450px] overflow-hidden">
//                     <div className="absolute overflow-hidden bottom-0 backdrop-grayscale bg-black/35 hover:bg-transparent hover:backdrop-grayscale-0 transition-all duration-500 z-20 w-[250px] h-[550px] flex">
//                         <div className='text-white text-start flex flex-col w-full h-full px-5 pt-[425px] transform translate-y-0 hover:translate-y-[100px] transition-transform duration-500 ease-in-out'>
//                             <label className="font-bold text-xl pb-2">
//                                 {profile.last_name + " " + profile.first_name}
//                             </label>
//                             <p className='text-sm italic'>
//                                 {profile.profile_description}
//                             </p>
//                         </div>
                        
//                     </div>
//                     <img src={profile.image_url} className="w-[250px] h-[450px] absolute top-0 z-0" alt="Profile"/>
//                 </div>
//             </button>
//         );
//     };
    

//     async function handleDateChosen(e){
//         e.preventDefault();

//         setClientAppointmentDate(e.target.value);
//         await getScheduleHours(e.target.value)

//     }
    
//     return(
//         <div>
//             <h2 className='font-bold text-3xl py-3'> Appointment Form </h2>
//             <form onSubmit={handleSubmit}>

//                 {
//                     chosenProfile === null? 
//                     <div id='chose_user' className='flex flex-col lg:flex-row gap-10'>
//                         {
//                             profiles.map((profile,key) => {                            
//                                 return(
//                                     <ProfileCard key={key} profile={profile} setter={setChosenProfile} clickable={true} ></ProfileCard>
//                                 )
//                             })
//                         }
//                     </div> :
//                     <div className='flex flex-col justify-center'>
//                         <ProfileCard profile={chosenProfile} setter={setChosenProfile} clickable={false}></ProfileCard>
//                         <div className='pt-10 pb-5 grid gap-2'>
//                             <div className='grid grid-cols-2 gap-2'>
//                                 <input onChange={(e)=>{setClientFirstName(e.target.value)}} required type='text' placeholder='first name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
//                                 <input onChange={(e)=>{setClientLastName(e.target.value)}} required type='text' placeholder='last name' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
//                             </div>
//                             <input onChange={(e)=>{setClientEmail(e.target.value)}} required type='email' placeholder='email' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />
//                             <input onChange={(e)=>{setClientPhone(e.target.value)}} required type='tel' placeholder='phone' className='px-1 py-2 rounded-xl border-blue-500 border-[0.15rem]' />

//                             <div className='flex flex-col gap-5'>
//                                 <div className='flex gap-10'>
//                                     <label>Chose a date : </label>
//                                     <input type='date' min={today} onChange={handleDateChosen} ></input>
//                                 </div>
//                                 <div id='list of hours and appointments of that day'>
//                                     ...list of available hours
//                                 </div>
//                             </div>
                        
//                         </div>
//                     </div>
//                 }

//                 <button type='submit' className='bg-blue-500 text-white font-semibold py-2 px-10 rounded-xl mr-auto mt-2'>Add Apointment</button>
//             </form>
//         </div>
//     )
// }

const ListAppointmentByUser = ({messagesLog}) => {

    const [users,setUsers] = useState([])   // format {'username' : 'xyz', appointments = [...]}

    return(
        <div className='flex flex-col p-3 bg-slate-100'>
            <h2 className='font-bold text-3xl py-3'> Appointments By User </h2>
            <div className='grid'>
                <div>
                    <label>User_name</label>
                    <div className=''>
                        list of User_name
                    </div>
                </div>
            </div>
        </div>
    )
}

const Message = ({message,error}) => {
    return(
        <span className={`${error? "text-red-600" : ""} `}>
            {"> "}{message}
        </span>
    )
}
