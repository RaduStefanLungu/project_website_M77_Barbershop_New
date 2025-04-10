import { initializeApp } from 'firebase/app'
import { getAuth,createUserWithEmailAndPassword, updatePassword, signOut } from "firebase/auth"

import { addDoc, collection, getFirestore, doc, getDoc, getDocs, updateDoc, deleteDoc, Timestamp, setDoc, arrayUnion, onSnapshot } from "firebase/firestore"; 

import { ref, getDownloadURL, getStorage, uploadBytes, deleteObject } from 'firebase/storage'
import { v4 as uuidv4, v4 } from 'uuid';

import APPOINTMENT_STATES from '../data/appointmentStates.json'

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

// APPOINTMENTS CONFIG

/*
  Input : barbar_id & appointments list
  Output : list of appointments for the given barber_id
*/
function getAppointmentsOfBarber(barber_id,appointments_list){  
  let response = []
  if(appointments_list === undefined || appointments_list ===null){
    appointments_list = []
  }
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
    if(element.appointment_hour === hour && element.confirmed !== APPOINTMENT_STATES.negative_state){
      return(true);
    }
  }

  return(false)
}

/**
 * Checks if the given appointment ID exists in the list of appointments.
 * If it does, generates a new unique ID that does not exist in the list.
 *
 * @param {string} appointment_id - The appointment ID to check.
 * @param {Array<Object>} appointments_list - The list of appointment objects.
 * @returns {string} - The original appointment ID if it does not exist in the list, otherwise a new unique ID.
 */
function checkAppointmentsIds(appointment_id,appointments_list){
  let ids = []
  for (let index = 0; index < appointments_list.length; index++) {
    const element = appointments_list[index];
    ids.push(element.appointment_id)
  }

  if(ids.includes(appointment_id)){
    let new_id = v4();
    while(ids.includes(new_id)){
      new_id = v4();
    }
    return(new_id)
  }
  else{
    return(appointment_id)
  }
}

// data = {"day" : "2024-10-21", ...}
/*
  Input : appointment data (json format)
  Output : true if appointment has been successfully registered, else false
*/
export async function addAppointment2(data){
  // check if day-document already exists in the database
  const day_document = await getDocumentById('appointments',data.appointment_date)

  // day hasn't been initiated
  if(day_document === null) {
    console.log('Document doesnt exist.');
    await setDoc(doc(firestore_db,'appointments',data.appointment_date),{
      locked: false,                      // used for e.g. : holidays 
      appointments : [data]
    })
    console.log(`New document ${data.appointment_date} has been created. Array ${data.appointment_date}.appointments has been created by adding new appointment.`);
    return(true)
  }

  // day has been initiated
  else{
    console.log(`Document ${data.appointment_date} already exists.`);
    if(day_document.locked){
      console.log(`Given day is locked !`);
      return(false)
    }
    else{
      // check if there are any active locked days in profiles.barber_name.locked_days
      const profile_doc = await getDocumentById('profiles',data.barber_id)
      
      if(profile_doc.locked_days.includes(data.appointment_date)){
        console.log(`Profile ${profile_doc.profile_id} includes ${data.appointment_date} as LOCKED DAY.`);
        return(false)
      }
      // profile has not the given day locked 
      else{
        // check if the appointment_id is unique and update it if necessary 
        data.appointment_id = checkAppointmentsIds(data.appointment_id,day_document.appointments)

        // check if the wanted hour is already taken        
        if(isHourTaken(data.appointment_hour,getAppointmentsOfBarber(data.barber_id,day_document.appointments))){
          console.log(`Wanted hour ${data.appointment_hour} is already taken for ${data.barber_id}.`);
          return(false)
        }
        else{
          const day_document_ref = doc(firestore_db, "appointments", data.appointment_date);
          await updateDoc(day_document_ref, {
            appointments: arrayUnion(data)
            })
            console.log(`Array ${data.appointment_date}.appointments has been updated by adding new appointment.`);
            return(true)
        }
      }
    }
  }

}

/*
  Input : day and profile
  Output : list of appointments for the given day of the given profile
*/
export async function getAppointments(day,profile){
  const dayDocument = await getDocumentById('appointments',day)
  if(dayDocument===null){
    return([])
  }
  else{
    return(getAppointmentsOfBarber(profile.profile_id,dayDocument.appointments))
  }
}

export async function updateAppointment(day,appointment_id,confirmation_state){
  if(!APPOINTMENT_STATES.states.includes(confirmation_state)){
    return(false)
  }

  const dayDocument = await getDocumentById('appointments',day)
  if(dayDocument === null){
    return(false)
  }
  else{
    const updatedAppointments = dayDocument.appointments.map((appointment) => {
      if(appointment.appointment_id === appointment_id){
        appointment.confirmed = confirmation_state
      }
      return(appointment)
    })
    const dayDocumentRef = doc(firestore_db, "appointments", day);
    await updateDoc(dayDocumentRef, {
      appointments: updatedAppointments
    })
    return(true)
  }
}

export async function updateAppointmentService(day, appointment_id, new_service) {
  try {
    const appointmentDocRef = doc(firestore_db, "appointments", day); // Reference to the document

    // 🔍 Fetch the document
    const appointmentDocSnap = await getDoc(appointmentDocRef);

    if (!appointmentDocSnap.exists()) {
      return false;
    }

    // Get the current appointments list
    const appointments = appointmentDocSnap.data().appointments;

    // 🔍 Find the specific appointment by `appointment_id`
    const updatedAppointments = appointments.map((appt) =>
      appt.appointment_id === appointment_id
        ? { ...appt, appointment_service: new_service.name } // Update service
        : appt
    );

    // 🔄 Update Firestore
    await updateDoc(appointmentDocRef, { appointments: updatedAppointments });

    return true;
  } catch (error) {
    console.error("🚨 Error updating appointment service:", error);
    return { success: false, message: "Failed to update appointment service." };
  }
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

    if(dayDocument.locked){
      generatedHoursFromDb.forEach(
        (element)=> {
          response.push([element[0],true]);
        }
      )
    }

    else{
      generatedHoursFromDb.forEach(
        (element) => {
          
          if(profile.locked_days.includes(String(day))){
            response.push([element[0],true])
          }
          else if(isHourTaken(element[0], getAppointmentsOfBarber(profile.profile_id,dayDocument.appointments))){
            response.push([element[0],true])
          }
          else{
            response.push(element)
          }
        }
      )
    }
    
    
    return(response)
    
    
  }
}

export async function getScheduleFooter() {
  // Weekday translation and order mapping
  const dayTranslation = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  const weekOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Fetch the schedule collection
  let schedule_collection = await collection(firestore_db, "schedule");
  let querySnapshot = await getDocs(schedule_collection);

  // Create response array
  let response = [];

  querySnapshot.forEach((doc) => {
    if (!doc.data().closed) {
      response.push({
        day: dayTranslation[doc.id], // Translate weekday to French
        schedule: `${doc.data().actual_schedule.opening_hour} - ${doc.data().actual_schedule.closing_hour}`,
      });
    } else {
      response.push({
        day: dayTranslation[doc.id], // Translate weekday to French
        schedule: `Fermé`,
      });
    }
  });

  // Sort response based on the weekOrder array
  response.sort(
    (a, b) => weekOrder.indexOf(Object.keys(dayTranslation).find(key => dayTranslation[key] === a.day)) - 
              weekOrder.indexOf(Object.keys(dayTranslation).find(key => dayTranslation[key] === b.day))
  );
  return response;
}

// STATISTICS

export async function getDataForChart(profile,chosenDate){
  // date format yyyy-mm-dd
  // const profile = await getProfileByEmail(profileEmail);
  const month = chosenDate.split("-")[1]

  const days_of_chosen_month = getAllDaysOfMonth(month,chosenDate.split("-")[0])
  
  let all_appointments = [["Date","nbr rdvs"]];

  for(let i = 0; i < days_of_chosen_month.length; i++){
    const dayDate = days_of_chosen_month[i];
    await getAppointments(dayDate,profile).then(
      (response) => {
        all_appointments.push([dayDate,response.length])
      }
    )
  }
  return([profile.profile_id,all_appointments]);
}

export async function getMonthAppointments(profile,chosenDate){
  const month = chosenDate.split("-")[1]
  const days_of_chosen_month = getAllDaysOfMonth(month,chosenDate.split("-")[0])

  let appointments = []

  for(let i = 0; i < days_of_chosen_month.length;i++){
    const dayDate = days_of_chosen_month[i]
    await getAppointments(dayDate,profile).then(
      (response) => {
        appointments.push(response)
      }
    )
  }

  return([profile.profile_id,appointments])

}


function getAllDaysOfMonth(month,year) {
  const response = []; // List to store the dates
  // const year = new Date().getFullYear(); // Get the current year

  // Get the total number of days in the given month
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-indexed here

  // Loop through the days of the month
  for (let day = 2; day <= daysInMonth+1; day++) {
    const date = new Date(year, month - 1, day); // month is 0-indexed here
    const formattedDate = date.toISOString().split("T")[0];
    response.push(formattedDate);
  }

  return response;
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
      setDoc(doc(firestore_db,'profiles',profileData.profile_id),
    {
      ...profileData,
      admin : false
    })
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

// export async function addProfileAndUploadImage(profileData,imageFile){
//   const uploadImageResponse = await uploadImage(imageFile,profileData.image)

//   if(uploadImageResponse){
//     const imageUrl = await getImageByPath(profileData.image)
//     profileData.image_url = imageUrl
//     const addProfileRespose = await addProfile(profileData);
//     const createdNewAuth =  await createUserWithEmailAndPassword(auth,profileData.email,"m77barber")
//     if(addProfileRespose !== null && createdNewAuth !== null){
//       return(true)
//     }
//     else{
//       return(false)
//     }
//   }
// }


export async function addProfileAndUploadImage(profileData,imageFile){
  const app2 = initializeApp(firebaseConfig,"Secondary");
  const auth2 = getAuth(app2)

  const uploadImageResponse = await uploadImage(imageFile,profileData.image)

  if(uploadImageResponse){
    const imageUrl = await getImageByPath(profileData.image)
    profileData.image_url = imageUrl
    const addProfileRespose = await addProfile(profileData);
    const createdNewAuth =  await createUserWithEmailAndPassword(auth2,profileData.email,"m77barber")
    signOut(auth2)
    if(addProfileRespose !== null && createdNewAuth !== null){
      return(true)
    }
    else{
      return(false)
    }
  }
}

export async function updateImage(profileData,newImageFile){

  // image id : profileData.image
  // image url : profileData.image_url

  const randomImageName = uuidv4();
  const uploadImageResponse = await uploadImage(newImageFile, randomImageName);
  

  const oldImageId = profileData.image

  if(uploadImageResponse){
    const newImageUrl = await getImageByPath(randomImageName)
    
    // update profileData.image_url
    profileData.image_url = newImageUrl
    // update profieData.image 
    profileData.image = randomImageName
    // update profile in db
    const updatedProfile = await updateProfile(profileData)
    if(updatedProfile !== null){
      // remove old image
      const removeImageResponse = await removeImage(oldImageId)
      return(true);
    }
    else{
      return(false)
    }
  }

}

export async function updateDescription(profileData,newDescription) {
  try{
    const myDocument = await getDocumentById('profiles',profileData.profile_id);

    // if profile exists, update it 
    if(myDocument !== null){
      setDoc(doc(firestore_db,'profiles',profileData.profile_id),{...profileData,profile_description:newDescription})
      return({...profileData,profile_description:newDescription})
    }

    // profile doesn't exists
    else{
      return(null)
    }

  }catch(e){
    addError({
      e_message: "Failed to update profile in << profiles >> firestore table.",
      program_execution: "Failed to execute firebase.updateProfile(...)",
      program_function_error: `updateProfile(${profileData})`,
      program_page: "/profile",
    })
    return(e)
  }
}

export async function changePassword(currentUser,newPassword) {
    try {
        // const user = auth.currentUser;
        if (currentUser) {
            await updatePassword(currentUser,newPassword);
            return true;
        } else {
            console.error('No user is currently signed in.');
            return false;
        }
    } catch (error) {
        console.error('Error changing password:', error);
        return false;
    }
    
  }

export async function updateProfile(profileData){
  try{
    const myDocument = await getDocumentById('profiles',profileData.profile_id);

    // if profile exists, update it 
    if(myDocument !== null){
      setDoc(doc(firestore_db,'profiles',profileData.profile_id),profileData)
      return(profileData)
    }

    // profile doesn't exists
    else{
      return(null)
    }

  }catch(e){
    addError({
      e_message: "Failed to update profile in << profiles >> firestore table.",
      program_execution: "Failed to execute firebase.updateProfile(...)",
      program_function_error: `updateProfile(${profileData})`,
      program_page: "/profile",
    })
    return(e)
  }
}

export async function removeProfile(profileID){
  try {
      const docRef = doc(firestore_db, 'profiles', profileID);
      let response = await deleteDoc(docRef)
      
  } catch (error) {
      console.error('Error removing document: ', error);
  }
}

export async function getProfiles(){
  const myCollection = await collection(firestore_db,"profiles")
  const querySnapshot = await getDocs(myCollection)
  
  const profiles = []
  querySnapshot.forEach((doc) => {
    if(doc.data()){
      profiles.push({...doc.data()})
    }
  })
  return profiles;
}

export async function getVisibleProfiles(){
  const all_profiles = await getProfiles();
  const visible_profiles = all_profiles.filter((profile) => profile.visible === true)
  return(visible_profiles)
}

export async function getProfileByEmail(email){
  const all_profiles = await getProfiles();
  
  for(let i = 0; i < all_profiles.length; i++){
    if(all_profiles[i].email === email){
      return(all_profiles[i]);
    }
  }

  return null;
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

async function removeImage(imageID) {
  const imgRef = ref(firestore, `photos/${imageID}`);
  try {
    const response = await deleteObject(imgRef);
    console.log(`Image ${imageID} removed successfully.`);
    return(true);
    
  } catch (error) {
    console.error('Error removing image:', error);
  }
}

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

export async function getAllGeneralLockedDays() {
  const appointmentsCollection = collection(firestore_db, 'appointments');
  const querySnapshot = await getDocs(appointmentsCollection);
  const lockedDays = [];

  querySnapshot.forEach((doc) => {
    if (doc.data().locked) {
      lockedDays.push(doc.id);
    }
  });
  
  return lockedDays;
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
          console.log(`Day ${documentID} unlocked successfully.`);
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

export async function lockProfileDay(profile_id,day){
  const profile_doc = await getDocumentById('profiles',profile_id)
  
  if(profile_doc.locked_days.includes(day)){
    return([false,'Journée déjà bloquée !'])
  }
  else{
    const updatedLockedDays = [...profile_doc.locked_days,day]
    await updateProfile({...profile_doc,locked_days:updatedLockedDays})
    return([true,'Journée bloquée avec succès !'])
  }
}

export async function unlockProfileDay(profile_id,day){
  const profile_doc = await getDocumentById('profiles',profile_id)
  if(profile_doc.locked_days.includes(day)){
    const updatedLockedDays = profile_doc.locked_days.filter((locked_day) => locked_day !== day)
    await updateProfile({...profile_doc,locked_days:updatedLockedDays})
    return([true,'Journée débloquée avec succès !'])
  }
  else{
    return([false,'Journée déjà débloquée !'])
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
  const [hour1H, hour1M] = hour1.split(":").map(Number);
  const [hour2H, hour2M] = hour2.split(":").map(Number);

  // Convert start and end time to minutes
  let startTime = hour1H * 60 + hour1M;
  const endTime = hour2H * 60 + hour2M - step; // Adjust end time to stop at hour2 - step

  while (startTime <= endTime) {
    const hours = Math.floor(startTime / 60);
    const minutes = startTime % 60;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    times.push(formattedTime);
    startTime += step;
  }

  return times;
}