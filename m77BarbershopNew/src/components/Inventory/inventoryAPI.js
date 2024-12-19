import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app'
import { getAuth } from "firebase/auth"
import { addDoc, collection, getFirestore, doc, getDoc, getDocs, updateDoc, deleteDoc, Timestamp, setDoc, arrayUnion, onSnapshot } from "firebase/firestore"; 

import { ref,list,listAll, getDownloadURL, getStorage, uploadBytes } from 'firebase/storage'

import { v4 } from 'uuid'


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

const IMAGES_CONTAINER = 'items_images'
const INVENTORY_COLLECTION = 'inventoryItems'
const INVENTORY_UPDATES_COLLECTION = 'inventoryItemsUpdates'
const TICKET_COLLECTION = 'inventoryTickets'


// UTILITIES
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
    console.error(`Error getting document: ${documentId}`, error);
    throw error;
  }
};

async function removeDocumentByID(docID,collectionName) {
  try {
      const docRef = doc(firestore_db, collectionName, docID);
      await deleteDoc(docRef);
      console.log(`Document with ID ${docID} successfully removed.`);
  } catch (error) {
      console.error('Error removing document: ', error);
  }
}

async function uploadImage(image,imageName){
  const imgRef = ref(firestore,`${IMAGES_CONTAINER}/${imageName}`)
  return uploadBytes(imgRef,image)
}

async function getImageByPath(path){
  const imgRef = ref(firestore,`${IMAGES_CONTAINER}/${path}`)
  return(await getDownloadURL(imgRef)) 
}

async function isValidItem(itemID) {
  try {
      // Fetch the document from the INVENTORY_COLLECTION using the item_id
      const itemDoc = await getDocumentById(INVENTORY_COLLECTION,itemID);

      // Check if the document exists
      if (!itemDoc.exists) {
          return false; // Item does not exist in the inventory
      }

      // Optionally: You can add more validation logic based on the document data
      const itemData = itemDoc.data();
      
      // Check if the item is valid based on custom conditions (e.g., availability)
      if (itemData && itemData.available) {
          return true; // The item is valid
      } else {
          return false; // The item is not available or valid
      }
  } catch (error) {
      console.error("Error validating item:", error);
      return false; // In case of an error, consider the item invalid
  }
}

async function updateAvailability(itemID, bool) {
  addLog('updateAvailability', [itemID, bool]);

  // Get a reference to the document in Firestore based on itemID
  const itemRef = doc(firestore_db, INVENTORY_COLLECTION, itemID);

  try {
      // Update the availability field of the item
      await updateDoc(itemRef, {
          'availability': bool // Directly updating the 'availability' field
      });

      console.log(`Document ${itemID} availability successfully updated to ${bool}!`);

  } catch (error) {
      console.error('Error updating document: ', error);
      throw error; // Re-throw the error to handle it upstream
  }
}

// EXPORTED FUNCTIONS : 

  // INVENTORY MANAGEMENT
export async function addItem(itemData,itemImage){
  // real order :
  // check if item is already in inventory
  // if not then 
  //            upload image
  //            apply image path to new item
  //            upload new item
  //            return true 
  // else 
  //      return false

  // check if item already exists (with same ID aka name)

  const ITEM_DATA = {
    data : itemData,
    availability : true
  }

  const itemFromDb = await getDocumentById(INVENTORY_COLLECTION,ITEM_DATA.data.item_id)

  if(itemFromDb == null){
    // add new item
    console.log('adding new item');
    const IMAGE_NAME = `image_${ITEM_DATA.data.item_id}` 
    const uploadImageResponse = await uploadImage(itemImage,IMAGE_NAME)

    if(uploadImageResponse){
      const imageUrl = await getImageByPath(IMAGE_NAME)
      ITEM_DATA.data.item_image_url = imageUrl

      await setDoc(doc(firestore_db,INVENTORY_COLLECTION,ITEM_DATA.data.item_id),ITEM_DATA)
      return(true)
    }
    else{
      console.log(`uploadImageResponse was a fail? ${uploadImageResponse}`);
      
    }
    
  }
  else{
    // item already in inventory
    console.log('item already in inventory');
    
    return(false)
  }

}

export async function getItems(){
  const myCollection = await collection(firestore_db,INVENTORY_COLLECTION)
  const querySnapshot = await getDocs(myCollection)

  let items = []

  querySnapshot.forEach(
    (doc)=>{
      items.push(doc.data())
    }
  )
  return(items)
}

// export async function updateQuantity(itemID, newQuantity) {
//   addLog('updateQuantity', [itemID, newQuantity]);
  
//   // Get a reference to the document in Firestore based on itemID
//   const itemRef = doc(firestore_db, INVENTORY_COLLECTION, itemID);

//   try {
//       // Update the item_quantity field with the new value
//       await updateDoc(itemRef, {
//           item_quantity: newQuantity
//       });
//       console.log(`Document ${itemID} successfully updated!`);
//   } catch (error) {
//       console.error('Error updating document: ', error);
//   }
// }

export async function updateQuantity(itemID, newQuantity) {
  // addLog('updateQuantity', [itemID, newQuantity]);

  // Get a reference to the document in Firestore based on itemID
  const itemRef = doc(firestore_db, INVENTORY_COLLECTION, itemID);
  const itemSnapshop = await getDocumentById(INVENTORY_COLLECTION,itemID)

  const updateTracer = {
    item_id : itemID,
    item_name : itemSnapshop.data.item_name,
    made_by : 'test@test.com',
    timestamp : new Date().toLocaleString('fr-BE', { timeZone: 'Europe/Brussels' }),
    data : {
      new_quantity : newQuantity,
      old_quantity : itemSnapshop.data.item_quantity
    }
  }

  try {
          
      if(isValidItem(itemID)){
        updateAvailability(itemID,false);
  
        // Ensure the newQuantity is not less than 0
        if (newQuantity < 0) {
            throw new Error(`Cannot update quantity for item ${itemID}, insufficient stock.`);
        }
  
        // Update the item_quantity field with the new value
        await updateDoc(itemRef, {
          'data.item_quantity': newQuantity // Use dot notation to update the nested field
      }).then(
        // keep track of quantity updates
        await addItemUpdate(updateTracer)
      )
  
        console.log(`Document ${itemID} successfully updated!`);
  
        updateAvailability(itemID,true);
      }
      else{
        // wait for 2 seconds and try again (only once)
      }

      

  } catch (error) {
      console.error('Error updating document: ', error);
      throw error; // Re-throw the error to handle it upstream
  }
}

export async function removeItem(itemID){
  await removeDocumentByID(itemID,INVENTORY_COLLECTION)
  addLog('removeItem',[itemID])
}


async function addItemUpdate(data){
  const result = await addDoc(collection(firestore_db,INVENTORY_UPDATES_COLLECTION),data)
  return result;
}



  // TICKET MANAGEMENT

  export async function uploadTicket(data){
    //upload given ticket to db
    await addDoc(collection(firestore_db,TICKET_COLLECTION),data)

  }

  export async function getTickets(){
    const tickets_collection = await collection(firestore_db,TICKET_COLLECTION);
    const docs = await getDocs(tickets_collection)

    let response = []
    docs.forEach(
      (doc) => {
        response.push({
          id: doc.id,
          data : doc.data()
        })
      }
    )

    return response;

  }
  
  export async function getTicketsByMonth(wanted_month){
    //returns all tickets from with wanted_month 
  }


function addLog(functionName,params){
    // add log to collection 'logs' telling :
    // function called with params,
    // time of called function
    const logData = {
        function_name : functionName,
        function_params : params,
        function_call_time : new Date().toLocaleString('fr-BE', { timeZone: 'Europe/Brussels' })
    }

    //addToDb(data,'logs')
    setDoc(doc(firestore_db,'logs',v4()),logData)
}



