import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import APPOINTMENT_STATES from '../data/appointmentStates.json'
import { v4 } from "uuid";
import { addAppointment2 } from "../api/firebase";


// 🔥 Firebase Configuration for Source Database
const sourceFirebaseConfig = {
  apiKey: "AIzaSyAwmQ80RMqD6LF6OkWGDav2mF2089LfMuA",
  authDomain: "m77barbershop-ff2bc.firebaseapp.com",
  projectId: "m77barbershop-ff2bc",
  storageBucket: "m77barbershop-ff2bc.appspot.com",
  messagingSenderId: "185046751012",
  appId: "1:185046751012:web:f315d3c7e729206a5c05b1",
  measurementId: "G-YN07YLJQP9"
};


// Initialize Firebase apps
const sourceApp = initializeApp(sourceFirebaseConfig, "sourceDB");

// Initialize Firestore
const sourceDb = getFirestore(sourceApp);

// Function to transform data
function transformData(oldData) {
    const appointment = {
        barber_id : 'PerrottaMirco',
        appointment_id : v4(),
        appointment_hour : oldData.rdv_time,
        appointment_date : convertOldDateFormat(oldData.rdv_date),
        appointment_service : convertOldServiceType(oldData.service_type),
        appointment_user : {
          email : oldData.user_email,
          name : `${oldData.user_name}`,
          phone : oldData.user_phone
        },
        confirmed : APPOINTMENT_STATES.neutral_state,
        registered_time : new Date().toLocaleString()
      }

  return(appointment)
}

function convertFirebaseTimestamp(firebaseTimestamp) {
    // Convert to JavaScript Date object
    const date = new Date(firebaseTimestamp);
  
    // Format month, day, and year
    const month = date.getMonth() + 1; // JS months are 0-based
    const day = date.getDate();
    const year = date.getFullYear();
  
    // Format hours, minutes, and seconds
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
  
    // Convert to 12-hour format and determine AM/PM
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  
    // Return formatted string
    return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  }
function convertOldDateFormat(date){
    const splitted = date.split('_')
    return(`${splitted[2]}-${splitted[1]}-${splitted[0]}`)
}

function convertOldServiceType(service){
    switch(service){
        case undefined:
            return('UNKNOWN');
        case 'Coupe Tondeuse':
            return('Coupe Moderne');
        case 'Contours Taper':
            return('Coupe Moderne');
        case "Kid's Price":
            return('Coupe Enfant');
        case "Traçage contours de barbe":
            return("Taille de barbe");
        case 'Taille + Traçage de barbe':
            return('Taille de barbe');
        case 'Rasage Express':
            return('Taille de barbe');
        case 'Rasage Traditionnel':
            return('Taille de barbe');
        case 'Rasage Shaver':
            return('Taille de barbe');
        case 'cheveux + traçage':
            return('Cheveux + Barbe');
        case 'cheveux + taille et traçage':
            return('Cheveux + Barbe');
        default:
            return(service)
        
    }
}

// Function to migrate data
export async function migrateData() {
  try {
    // Fetch data from source collection
    const querySnapshot = await getDocs(collection(sourceDb, 'appointments'));

    // Loop through each document
    for (const doc of querySnapshot.docs) {
      const oldData = doc.data();

      for(let i = 0; i<oldData.all_appointments.length; i++) {
        
        const appointment = oldData.all_appointments[i];
        
        const transformedData = transformData(appointment.data); // Transform the data

        console.log(transformedData);
        

            // Add transformed data to target collection
            await addAppointment2(transformedData).then(
                ()=>{
                    console.log(`Pushed oldAppointment of ${transformedData.appointment_date} at ${transformedData.appointment_hour}`); 
                }
            )
        
      }
      

      
      
    }

    console.log("✅ Data migration completed successfully!");
  } catch (error) {
    console.error("❌ Error migrating data:", error);
  }
}