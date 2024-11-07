import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app'
import { getAuth,createUserWithEmailAndPassword,deleteUser } from "firebase/auth"

import { addDoc, collection, getFirestore, doc, getDoc, getDocs, updateDoc, deleteDoc, Timestamp, setDoc, arrayUnion, onSnapshot } from "firebase/firestore"; 

import { ref,list,listAll, getDownloadURL, getStorage, uploadBytes } from 'firebase/storage'


const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_REACT_APP_FIREBASE_API_ID,
  measurementId: import.meta.env.VITE_REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// const analytics = getAnalytics(app);

export const auth = getAuth(app)

export const firestore_db = getFirestore(app)

const firestore = getStorage(app)

// IMAGE CONFIG

export async function uploadImage(image,imageName){
  const imgRef = ref(firestore,`photos/${imageName}`)
  return uploadBytes(imgRef,image)
}

export async function getImageByPath(path){
  const imgRef = ref(firestore,`photos/${path}`)
  return(await getDownloadURL(imgRef))
  
}

// DB Structure : 

// appointments -> day(YYYY,MM,DD) -> barber_name_1,locked? ->  appointments -> 
// profiles -> barber_name_1 -> barber_data
// admin -> barber_name
// schedule -> monday -> actual_schedule,new_schedule
// errors -> yyyy,mm,dd -> data + date & time

const appointments_collection_structure = [
  {
    "2024-10-24" : {
      locked : false,
      barbers : [
        {
          barber_id : 'PerrottaMirco',
          barber_locked : false,
          appointments : [
            {
              barber_id : "PerrottaMirco",
              appointment_id : "xyz",
              appointment_hour : "10:00",
              appointment_date : "2024-10-24",
              appointment_service : "modern haircut",
              appointment_user : {
                email : "bob_gigi@test.com",
                name : "Bob Gigi",
                phone : "0123456789"
              },
              registered_time : "yyyy-mm-dd at hh:mm:ss"
            }
          ] 
        }
      ]
    }
  }
]

const appointment_structure = {
  appointment : {
    barber_id : "GigelFrone",
    appointment_id : "xyz",
    appointment_hour : "10:00",
    appointment_date : "2024-10-24",
    appointment_service : "modern haircut",
    appointment_user : {
      email : "bob_gigi@test.com",
      name : "Bob Gigi",
      phone : "0123456789"
    },
    registered_time : "yyyy-mm-dd at hh:mm:ss"
  }
}


// APPOINTMENTS CONFIG

/*
  Input : barbar_id & appointments list
  Output : list of appointments for the given barber_id
*/
function getAppointmentsOfBarber(barber_id,appointments_list){  
  let response = []
  for (let index = 0; index < appointments_list.length; index++) {
    const element = appointments_list[index];
    if(element.barber_id == barber_id){
      response.push(element)
    }
  }  
  return(response)
} 

/*
  Input : wanted hour and a list appointments
  Output : true if given hour is taken in the list, else false
*/
function isHourTaken(hour,appointments_list){
  for (let index = 0; index < appointments_list.length; index++) {
    const element = appointments_list[index];
    if(element.appointment_hour === hour){
      return(true);
    }
  }

  return(false)
}


// data = {"day" : "2024-10-21", ...}
/*
  Input : appointment data (json format)
  Output : true if appointment has been successfully registered, else false
*/
export async function addAppointment2(data){
  
  // check if day-document already exists in the database
  const day_document = await getDocumentById('appointments',data.appointment_date)

  if(day_document !== null){
    console.log(`Document ${data.appointment_date} already exists.`);
    if(day_document.locked){
      console.log(`Given day is locked !`);
      return(false)
    }
    else{
      // TODO : check if there are any active locked days in profiles.barber_name.locked_days
      const profile_doc = await getDocumentById('profiles',data.barber_id)
      
      if(profile_doc.locked_days.includes(data.appointment_date)){
        console.log(`Profile ${profile_doc.profile_id} includes ${data.appointment_date} as LOCKED DAY.`);
        return(false)
      }
      else{
        console.log(`> Value of IsHourTaken : ${isHourTaken(data.appointment_hour,getAppointmentsOfBarber(data.barber_id,day_document.appointments))}
                    > variable_hour : ${data.appointment_hour}
                    > variable_appointment_list : ${getAppointmentsOfBarber(data.barber_id,day_document.appointments)}`);
        
        if(isHourTaken(data.appointment_hour,getAppointmentsOfBarber(data.barber_id,day_document.appointments))){
          console.log(`Wanted hour ${data.appointment_hour} is already taken for ${data.barber_id}.`);
          return(false)
        }
        else{
          const day_document_ref = doc(firestore_db, "appointments", data.appointment_date);
          await updateDoc(day_document_ref, {
            appointments: arrayUnion({ data })
            })
            console.log(`Array ${data.appointment_date}.appointments has been updated by adding new appointment.`);
            return(true)
        }
      }
    }
  }
  else{
    console.log('Document doesnt exist.');
    await setDoc(doc(firestore_db,'appointments',data.appointment_date),{
      locked: false,
      appointments: [data]
    })
    console.log(`New document ${data.appointment_date} has been created. Array ${data.appointment_date}.appointments has been created by adding new appointment.`);
    return(true)
    
  }

  //  if it does :
  //    check if day is locked
  //        if it is: return false
  //        else : 
  //            get the barber_name, verify if its locked,
  //            if it is : return false
  //            else : 
  //                 check if there is another appointment the same appointment_hour
  //                     if it is : return false
  //                     else : 
  //                        append new appointment & return true

}

export async function removeAppointment2(){}

/*
  Input : day and profile
  Output : list of appointments for the given day of the given profile
*/
export async function getAppointments(day,profile){
  //TODO
}

/*
  Input : day (yyyy-mm-dd)
  Output : list of available hours for the given day with a distance of HOURS_DISTANCE
  Structure of list : [ ..., [hour,is_taken] ]
*/
async function generateScheduleHours(day){
  const day_name = getDayOfWeek(day);
  const schedule_doc = await getDocumentById('schedule', day_name)
  const HOURS_DISTANCE = 30   // in minutes
  
  let response = [];

  // if the salon is closed on one day, then no schedule needs to be generated;
  if(schedule_doc.closed){
    return(response)
  }

  if(schedule_doc.new_schedule.starting_date.length > 0 && schedule_doc.new_schedule.starting_date <= day){
    const intervals =  generateTimeIntervals(schedule_doc.new_schedule.opening_hour,schedule_doc.new_schedule.closing_hour,HOURS_DISTANCE)
    intervals.forEach((hour) => {
      if((hour < schedule_doc.new_schedule.break_start) || (hour >= schedule_doc.new_schedule.break_end) ){
        response.push([hour,false])
      }
    })
  }
  else{
    const intervals =  generateTimeIntervals(schedule_doc.actual_schedule.opening_hour,schedule_doc.actual_schedule.closing_hour,HOURS_DISTANCE)
    intervals.forEach((hour) => {
      if((hour < schedule_doc.actual_schedule.break_start) || (hour >= schedule_doc.actual_schedule.break_end) ){
        response.push([hour,false])
      }
    })
  }

  console.log(`>> These are the generated hours by generateScheduleHours(${day_name}) : ${response}`);
  

  return(response)
}

/*
  Input : day 
  Output : schedule for the given day (hours and their availability)
  Structure : [...,[hour,is_taken]]
*/
export async function getSchedule(day,profile){  
  const generatedHoursFromDb = await generateScheduleHours(day)
  
  var response = []

  const dayDocument = await getDocumentById('appointments',day)

  if(dayDocument === null){

    if(profile.locked_days.includes(day)){
      generatedHoursFromDb.forEach(
        (element)=>{
          response.push([element[0],true])
        }
      )
      return(response)
    }
    else{
      return(generatedHoursFromDb)
    }
    
  }

  else{
    generatedHoursFromDb.forEach(
      (element) => {
        
        if(profile.locked_days.includes(String(day))){
          response.push([element[0],true])
        }
        else if(isHourTaken(element[0], dayDocument.appointments)){
          response.push([element[0],true])
        }
        else{
          response.push(element)
        }
      }
    )
    return(response)
    
    
  }
}



// USER CONFIG

export async function registerUser(data){
  const updated_data = {
    ...data,
    "uid" : "generated_uid_from_firebase_auth"
  }

  console.log(updated_data);
  
  // addProfile(data)
  return(false)


}

export async function removeUser(){
  return(false)
}

/*
  Checks if profile already exists,
    if not : it adds it to db and returns the given profile data,
    else : returns null
*/
async function addProfile(profileData){

  try{
    const myDocument = await getDocumentById('profiles',profileData.profile_id);

    // if profile doesn't exists, create it 
    if(myDocument === null){
      setDoc(doc(firestore_db,'profiles',profileData.profile_id),profileData)
      return(profileData)
    }

    // profile exists
    else{
      return(null)
    }

  }catch(e){
    addError({
      e_message: "Failed to add appointment to << appointments >> firestore table.",
      program_execution: "Failed to execute firebase.addAppointment(...)",
      program_function_error: `addAppointment(${user_name},${user_emai},${user_phone},${rdv_date},${rdv_time})`,
      program_page: "/rendez-vous",
    })
    return(e)
  }
}

export async function addProfileAndUploadImage(profileData,imageFile){
  const uploadImageResponse = await uploadImage(imageFile,profileData.image)

  if(uploadImageResponse){
    const imageUrl = await getImageByPath(profileData.image)
    profileData.image_url = imageUrl
    const addProfileRespose = await addProfile(profileData);
    const createdNewAuth =  await createUserWithEmailAndPassword(auth,profileData.email,"m77barber")
    if(addProfileRespose !== null && createdNewAuth !== null){
      return(true)
    }
    else{
      return(false)
    }
  }
}

export async function removeProfile(profileID){
  try {
      const docRef = doc(firestore_db, 'profiles', profileID);
      let response = await deleteDoc(docRef)
      //TODO await deleteUser(uid)
      console.log(response);
      
  } catch (error) {
      console.error('Error removing document: ', error);
  }
}

export async function getProfiles(){
  const myCollection = await collection(firestore_db,"profiles")
  const querySnapshot = await getDocs(myCollection)
  
  const profiles = []
  querySnapshot.forEach((doc) => {
    profiles.push({...doc.data()})
  })  

  return profiles;
}


// <dev_tools> 


export async function addNewDocument(collection_name,data){
  try{
    const myDocument = await getDocumentById(collection_name,data.doc_id);

    // if profile doesn't exists, create it 
    if(myDocument === null){
      setDoc(doc(firestore_db,collection_name,data.doc_id),data)
      return(data)
    }

    // profile exists
    else{
      return(null)
    }

  }catch(e){
    addError({
      e_message: "Failed to add appointment to << appointments >> firestore table.",
      program_execution: "Failed to execute firebase.addAppointment(...)",
      program_function_error: `addAppointment(${user_name},${user_emai},${user_phone},${rdv_date},${rdv_time})`,
      program_page: "/rendez-vous",
    })
    return(e)
  }
}

// Situational :

function removeImage(){}

function uploadVideo(){}

function removeVideo(){}


export async function getUserDocument(userEmail){
  const myCollection = await collection(firestore_db,"user_data")
  const querySnapshot = await getDocs(myCollection)
  
  const documentsData = []
  querySnapshot.forEach((doc) => {
    documentsData.push({id: doc.id, ...doc.data()})
  })  

  let searchedDocument = null
  documentsData.forEach((doc) => {
    if(doc.email === userEmail){
      searchedDocument = doc
      return false
    }
  })
  return searchedDocument;
}

const getDocumentById = async (collectionName, documentId) => {
  try {
    const docRef = doc(firestore_db, collectionName, documentId);
    const documentSnapshot = await getDoc(docRef);

    if (documentSnapshot.exists()) {
      // Document found, you can access its data using documentSnapshot.data()
      return documentSnapshot.data();
    } else {
      // Document does not exist
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

async function removeDocumentByID(docID) {
  try {
      const docRef = doc(firestore_db, 'appointments', docID);
      await deleteDoc(docRef);
      console.log(`Document with ID ${docID} successfully removed.`);
  } catch (error) {
      console.error('Error removing document: ', error);
  }
}


export async function removeAppointment(appointment_date,appointment_number){
  console.log(`Removing ${appointment_date},${appointment_number}`);
  try {
    // Get a reference to the appointments document
    const appointmentsRef = doc(firestore_db, 'appointments', appointment_date);

    // Get the current data of the appointments document
    const docSnap = await getDoc(appointmentsRef);
    if (docSnap.exists()) {
        const appointmentsData = docSnap.data();

        // Find the appointment to remove
        const updatedAppointments = appointmentsData.all_appointments.filter(appointment => {
            return appointment.data.appointment_number !== appointment_number 
                || appointment.data.rdv_date !== appointment_date;
        });

        // Update the appointments document with the updated appointments data
        await updateDoc(appointmentsRef, { all_appointments: updatedAppointments });
        console.log('Appointment removed successfully.');

        // check if the updated version has an empty array
        const db_appointments = await getDocumentById('appointments',appointment_date)
        if(db_appointments.all_appointments.length === 0 && db_appointments.locked === false){
          removeDocumentByID(appointment_date)
        }


    } else {
        console.log('Document does not exist.');
    }
} catch (error) {
    console.error('Error removing appointment: ', error);
}
}

export async function lockDays(days_list){
    days_list.forEach( day => {
    lockDay(day)
  } )
  return(true)
}

export async function unlockDays(days_list){
  days_list.forEach( day => {
  unlockDay(day)
} )
return(true)
}

async function lockDay(documentID) {
  try {
      const appointmentsRef = doc(firestore_db, 'appointments', documentID);
      const docSnap = await getDoc(appointmentsRef);

      if (docSnap.exists()) {
          // If document exists, update the 'locked' field to true
          await updateDoc(appointmentsRef, {
              locked: true
          });
          console.log(`Day ${documentID} locked successfully.`);
      } else {
          // If document doesn't exist, create a new document with 'all_appointments' and 'locked' fields
          await setDoc(appointmentsRef, {
              all_appointments: [],
              locked: true
          }, { merge: true });
          console.log(`New document created for day ${documentID} with 'locked' field set to true.`);
      }
  } catch (error) {
      console.error('Error locking day: ', error);
  }
}
async function unlockDay(documentID) {
  try {
      const appointmentsRef = doc(firestore_db, 'appointments', documentID);
      const docSnap = await getDoc(appointmentsRef);

      if (docSnap.exists()) {
          // If document exists, update the 'locked' field to true
            
          await updateDoc(appointmentsRef, {
              locked: false
          });
          console.log(`Day ${documentID} locked successfully.`);
      }

      // if document empty, remove it 
      const db_appointments = await getDocumentById('appointments',documentID)
      if(db_appointments.all_appointments.length === 0 && db_appointments.locked === false){
        removeDocumentByID(documentID)
      }


  } catch (error) {
      console.error('Error locking day: ', error);
  }
}

export async function addError(data){
    const error_data = {
      error_time: Timestamp.now(),
      error_message: data
    }
    addDoc(collection(firestore_db,"error_table"),error_data)
  }



// OTHER


  /*
    Input : date (yyyy-mm-dd);
    Return : name of the day (monday,sunday etc);
  */
  function getDayOfWeek(dateString) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    return days[dayIndex];
}

function generateTimeIntervals(hour1, hour2, step) {
  const times = [];
  const [hour1H, hour1M] = hour1.split(':').map(Number);
  const [hour2H, hour2M] = hour2.split(':').map(Number);

  // Convert start and end time to minutes
  let startTime = hour1H * 60 + hour1M;
  const endTime = hour2H * 60 + hour2M;

  while (startTime <= endTime) {
      const hours = Math.floor(startTime / 60);
      const minutes = startTime % 60;
      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      times.push(formattedTime);
      startTime += step;
  }

  return times;
}
