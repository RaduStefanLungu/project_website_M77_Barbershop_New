import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app'
import { getAuth } from "firebase/auth"
import { addDoc, collection, getFirestore, doc, getDoc, getDocs, updateDoc, deleteDoc, Timestamp, setDoc, arrayUnion, onSnapshot } from "firebase/firestore"; 


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


// DB Structure : 

// appointments -> barber_name_1 -> day(YYYY,MM,DD) -> locked?,appointments
// profiles -> barber_name_1 -> barber_data
// admin -> barber_name
// schedule -> monday -> actual_schedule,new_schedule
// errors -> yyyy,mm,dd -> data + date & time

// data = {"day" : "2024-10-21", ...}
function addAppointment2(data){}

function removeAppointment2(){}

// date = date of the day (used as id in db)
// creates the day inside a given profile to add appointments
function addDay(date,profile){}

// used to create db document for a profile
export function addProfile(data){
  try{
      
    // check if document already existst:

    const myDocument = await getDocumentById('profiles',rdv_date);
    
    let number_of_existing_appointments = 0

    // if it doesn't exists, create document 
    if(myDocument === null){
      setDoc(doc(firestore_db,'appointments',rdv_date),{
        all_appointments : [],
        locked : false
      })
    }

    // document exists
    else{
      // check if hour of appointment has been taken :
      let appointment_hour_taken = false;
      myDocument.all_appointments.forEach((rezervation) => {
        if(rezervation.data.rdv_time === rdv_time){
          appointment_hour_taken = true
          return  // stop loop
        }
      })

      // if appointment hour is taken then don't continue
      if(appointment_hour_taken){
        console.log(`Appointment hour(${rdv_time}) is taken on ${rdv_date}.`);
        return(false);
      }
      // appointment hour is available
      else{
        //get # of existing appointments 
        number_of_existing_appointments = myDocument.all_appointments.length
        // get last appointment number
        if(number_of_existing_appointments > 0 ) {
          const last_appoint = myDocument.all_appointments[number_of_existing_appointments-1].data.appointment_number
          const last_appoint_number =  parseInt(last_appoint.split("_")[1])
          data.appointment_number = `appointment_${last_appoint_number+1}`
        }

        // add new appointment to array after the document has been fetched/created & data object has been filled.
        // all verifications has been done before (locked in UI & line 198)
        const appointmentRef = doc(firestore_db, "appointments", rdv_date);
        updateDoc(appointmentRef, {
        all_appointments: arrayUnion({ data })
        });
        return(true)

      }

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

function getAppointments(day){}

function getProfiles(){}

// gets hours for the given day (ex : day_name = "monday")
function getScheduleHours(day_name){}

function getScheduleFull(){}

// <dev_tools> 

function createTable(table_name){

}

// creates empty days for the given profile
export async function populateProfile(barber_name,fromDate,toDate){
    return("> Executed populateProfile")
}


// Situational :

function uploadImage(){}

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

export async function getTakenHoursOfDay(day){
  let result = []

  // check if document exists : 

  let document_from_db = await getDocumentById('appointments',day)

  if(document_from_db === null){
    return result
  }
  else{
    const given_day_appointments = await getAppointmentDate(day)
    given_day_appointments.all_appointments.forEach(
      (element) => {
        const appointmentKeys = Object.keys(element)

        appointmentKeys.forEach(key => {
          const appointmentData = element[key];
          result.push(appointmentData['rdv_time'])
      });
    })
    return result
  }

  
}

export async function getAppointmentDate(documentID) {
    try{
        return getDocumentById("appointments",documentID)
    }catch(e){
        addError({
            e_message: "Failed to get appointment from << appointments >> firestore table.",
            program_execution: "Failed to execute firebase.getAppointmentDate(...)",
            program_function_error: `addAppointment(${documentID})`,
            program_page: "/rendez-vous",
          })
          return(e)
    }
}

export async function getAllAppointments(setter) {
  const collectionRef = collection(firestore_db, 'appointments');
  const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort newData by ID
      newData.sort((a, b) => {
          const [dayA, monthA, yearA] = a.id.split('_').map(Number);
          const [dayB, monthB, yearB] = b.id.split('_').map(Number);
          
          // Compare years
          if (yearA !== yearB) {
              return yearA - yearB;
          }
          
          // Compare months if years are equal
          if (monthA !== monthB) {
              return monthA - monthB;
          }
          
          // Compare days if months are equal
          return dayA - dayB;
      });

      setter(newData);
  });
  return () => unsubscribe();
}

export async function getAllAppointmentsMonotone() {
  const myCollection = await collection(firestore_db,"appointments")
  const querySnapshot = await getDocs(myCollection)
  
  const appointmentsByDay = []
  querySnapshot.forEach((doc) => {
    appointmentsByDay.push({id: doc.id, ...doc.data()})
  })  

  return appointmentsByDay;
}

// TODO : when adding a new appointment to document, check if it exists already !!!  
export async function addAppointment(user_name,user_emai,user_phone,rdv_date,rdv_time,service_type){
    const data = {
        appointment_number : "appointment_0",
        user_name: user_name,
        user_email: user_emai,
        user_phone: user_phone,
        rdv_date: rdv_date,
        rdv_time: rdv_time,
        service_type: service_type,
        rdv_taken_time : Timestamp.now()
    }

    try{
      
      // check if document already existst:

      const myDocument = await getDocumentById('appointments',rdv_date);
      
      let number_of_existing_appointments = 0

      // if it doesn't exists, create document 
      if(myDocument === null){
        setDoc(doc(firestore_db,'appointments',rdv_date),{
          all_appointments : [],
          locked : false
        })
      }

      // document exists
      else{
        // check if hour of appointment has been taken :
        let appointment_hour_taken = false;
        myDocument.all_appointments.forEach((rezervation) => {
          if(rezervation.data.rdv_time === rdv_time){
            appointment_hour_taken = true
            return  // stop loop
          }
        })

        // if appointment hour is taken then don't continue
        if(appointment_hour_taken){
          console.log(`Appointment hour(${rdv_time}) is taken on ${rdv_date}.`);
          return(false);
        }
        // appointment hour is available
        else{
          //get # of existing appointments 
          number_of_existing_appointments = myDocument.all_appointments.length
          // get last appointment number
          if(number_of_existing_appointments > 0 ) {
            const last_appoint = myDocument.all_appointments[number_of_existing_appointments-1].data.appointment_number
            const last_appoint_number =  parseInt(last_appoint.split("_")[1])
            data.appointment_number = `appointment_${last_appoint_number+1}`
          }

          // add new appointment to array after the document has been fetched/created & data object has been filled.
          // all verifications has been done before (locked in UI & line 198)
          const appointmentRef = doc(firestore_db, "appointments", rdv_date);
          updateDoc(appointmentRef, {
          all_appointments: arrayUnion({ data })
          });
          return(true)

        }

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

export async function isDayLocked(day){
  const myDocument = await getDocumentById('appointments',day)

  if(myDocument === null){
    return(false)
  }
  else{
    return(myDocument.locked)
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