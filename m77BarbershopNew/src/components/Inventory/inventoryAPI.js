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

// EXPORTED FUNCTIONS : 

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
  const itemFromDb = await getDocumentById(INVENTORY_COLLECTION,itemData.item_id)

  if(itemFromDb == null){
    // add new item
    console.log('adding new item');
    const IMAGE_NAME = `image_${itemData.item_id}` 
    const uploadImageResponse = await uploadImage(itemImage,IMAGE_NAME)

    if(uploadImageResponse){
      const imageUrl = await getImageByPath(IMAGE_NAME)
      itemData.item_image_url = imageUrl

      await setDoc(doc(firestore_db,INVENTORY_COLLECTION,itemData.item_id),itemData)
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

export function updateQuantity(itemID,newQuantity){
    addLog('updateQuantity',[itemID,newQuantity])
    // update quantity to 'newQuantity' of item 'itemID'
}

export function removeItem(itemID){
  removeDocumentByID(itemID,INVENTORY_COLLECTION)
    addLog('removeItem',[itemID])
    // remove item from collection 'items'
}

function addLog(functionName,params){
    // add log to collection 'logs' telling :
    // function called with params,
    // time of called function
    const logData = {
        function_name : functionName,
        function_params : params,
        function_call_time : new Date().toLocaleString('en-GB',{timeZone:'UTC'})
    }

    //addToDb(data,'logs')
    setDoc(doc(firestore_db,'logs',v4()),logData)
}



