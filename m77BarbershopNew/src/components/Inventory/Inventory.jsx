import React, { useEffect, useState } from 'react'
import './inventory.css'

import { FaPlus } from "react-icons/fa";
import { addItem, getItems } from './inventoryAPI';

import { IoIosCloseCircleOutline  } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { FaArrowUp,FaArrowDown } from "react-icons/fa";

import { v4 } from 'uuid';


export default function Inventory() {

    const [clickedAddItem,setClickedAdditem] = useState(false)

    const [activatedPopup,setActivatedPopup] = useState(false)
    const [popup,setPopup] = useState(null)

    const [itemsFromDB,setItemsFromDB] = useState([])

    async function handleAddItem(e){
        e.preventDefault()
        setClickedAdditem(true)
        
        setActivatedPopup(true)
        setPopup(<AddItemInterface ClickedAddItemSetters={[clickedAddItem,setClickedAdditem]} PopupSetters={[activatedPopup,setActivatedPopup]} PopupHolder={[popup,setPopup]} />)
    }

    useEffect( ()=>{
        async function fetchItems(){
            setItemsFromDB(await getItems())
        }

        fetchItems()
        
    },[])

    useEffect(()=>{
        console.log(`activatedPopup : ${activatedPopup}\npopup : ${popup}`);
        
    })


  return (
    <div className={`relative ${clickedAddItem? "overflow-hidden" : ""} min-h-screen `}>

        {
            activatedPopup? popup : <></>
        }

        <h1 className='text-4xl font-bold'>Inventory</h1>


        <div id='item-list' className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 bg-gray-100 py-10 px-5 gap-5'>

            <button disabled={clickedAddItem} onClick={handleAddItem} className='text-gray-600 hover:text-white disabled:bg-gray-600 grid justify-center items-center text-3xl card cardBorder cardAnimation' ><FaPlus/></button>
            
            {/* <Item image={null} itemName={'Shampoo'} quantity={6}></Item>
            <Item image={null} itemName={'Gel'} quantity={8}></Item>
            <Item image={null} itemName={'Cire'} quantity={10}></Item>
            <Item image={null} itemName={'Peine'} quantity={2}></Item>
            <Item image={null} itemName={'Ciseaux'} quantity={0}></Item>
            <Item image={null} itemName={'After Shave'} quantity={4}></Item> */}

            {
                itemsFromDB.map(
                    (value,key) => {
                        return(
                            <Item key={key} itemData={value} PopupSetters={[activatedPopup,setActivatedPopup]} PopupHolder={[popup,setPopup]}></Item>
                        )
                    }
                )
            }

        </div>


    </div>
  )
}


const Item = ({itemData,PopupSetters,PopupHolder}) => {
    
    const ItemDetailsInterface = ({itemData}) => {
        const [showDetails,setShowDetails] = useState(false)


        function handleClose(e){
            e.preventDefault();
            PopupSetters[1](false)
            PopupHolder[1](null)
        }
        
        return(
            <div className='absolute w-full h-screen bg-gray-500/50 flex justify-center items-center'>
                <div id='holder' className='flex flex-col bg-white py-7 px-3 mx-1 rounded-xl min-w-[250px] lg:w-[500px] min-h-[500px]'>
                    <button onClick={handleClose} className='text-red-500 text-end text-3xl font-bold ml-auto'>
                        <IoIosCloseCircleOutline></IoIosCloseCircleOutline>
                    </button>
                    
                    <h3 className='font-bold text-3xl pb-3'>{itemData.item_name}</h3>

                    <div className='grid'>
                        <button onClick={()=>{setShowDetails(!showDetails)}} className=''>
                            <div className='grid grid-flow-col justify-between'>
                                <span>Détails</span>
                                <span className='m-auto text-xl'>{showDetails? <FaArrowUp/> : <FaArrowDown/>}</span>
                            </div>
                        </button>
                        {
                            showDetails? 
                            <div id='details' className='grid max-w-[700px]'>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item ID : </label>
                                    <label>{itemData.item_id}</label>
                                </div>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item Quantity : </label>
                                    <label>{itemData.item_quantity}</label>
                                </div>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item Added Time : </label>
                                    <label>{itemData.item_added_time}</label>
                                </div>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item Image URL : </label>
                                    <label className='overflow-auto max-h-14'>{itemData.item_image_url}</label>
                                </div>
                            </div> : <></>
                        }
                    </div>

                    

                    
                </div>
            </div>
        )
    }

    function handleClicked(e){
        e.preventDefault();

        PopupSetters[1](true);
        PopupHolder[1](<ItemDetailsInterface itemData={itemData} />)
    }


    return(
        <div onClick={handleClicked} className={`card flex flex-col overflow-hidden ${itemData.item_quantity<=0? "border-red-500 border-[0.25rem]" : "cardBorder"}`}>
            <div id='image' className='bg-pink-300 w-full h-[150px] xl:h-[250px]'></div>
            <label className='text-center font-bold pt-1 lg:text-2xl'>{itemData.item_name}</label>
            <label className='text-center italic py-2 text-xs'>{itemData.item_id}</label>
            <label className='text-center lg:text-xl'>Stock : <span className='font-medium'>{itemData.item_quantity}</span></label>
        </div>
    )
}


const AddItemInterface = ({ClickedAddItemSetters,PopupSetters,PopupHolder}) => {
    const [uploadedItemImage,setUploadedItemImage] = useState(null)

    const [itemName,setItemName] = useState("")
    const [itemQuantity,setItemQuantity] = useState(0)

    async function handleSubmit(e){
        e.preventDefault()

        const itemData = {
            item_id : itemName.split(" ").join("_"),
            item_name : itemName,
            item_quantity : itemQuantity,
            item_image_url : '',
            item_added_time : new Date().toLocaleString('en-GB',{timeZone:'UTC'})
        }
        
        console.log(itemData);
        
        // add item to db with image and image ref

        if(uploadedItemImage!== null){
            const resp = await addItem(itemData,uploadedItemImage)
            console.log(resp);
            
        }
        else{
            console.log('Image not uploaded !');
            
        }

        // ClickedAddItemSetters[1](false)
    }

    function handleClose(e){
        e.preventDefault();
        ClickedAddItemSetters[1](false)
        PopupSetters[1](false)
        PopupHolder[1](null)
    }

    return(
        <div className='absolute w-full h-screen bg-gray-500/50 flex justify-center items-center'>
            <div id='holder' className='flex flex-col bg-white py-7 px-3 mx-1 rounded-xl'>
                <button onClick={handleClose} className='text-red-500 text-end text-3xl font-bold ml-auto'>
                    <IoIosCloseCircleOutline></IoIosCloseCircleOutline>
                </button>
                <h3 className='font-bold text-3xl pb-3'>Nouveau Objet</h3>

                <form id='input holder' className='py-5 px-2 grid gap-2' onSubmit={handleSubmit}>

                    <div className='grid grid-cols-2 text-end'>
                        <label className='px-2'>Nom Objet : </label>
                        <input type='text' required placeholder={itemName} onChange={(e)=>{setItemName(e.target.value)}} className='border-blue-500 border-[0.15rem] rounded-lg px-1'></input>
                    </div>
                    
                    <div className='grid grid-cols-2 text-end'>
                        <label className='px-2'>Quantité de départ : </label>
                        <input type='number' placeholder={itemQuantity} onChange={(e)=>{setItemQuantity(e.target.value)}} className='border-blue-500 border-[0.15rem] rounded-lg px-1'></input>
                    </div>

                    <div className='grid grid-cols-2 text-end'>
                        <label className='px-2'>Photo (500x500) : </label>
                        <input type='file' onChange={(e)=>{setUploadedItemImage(e.target.files[0])}} ></input>
                    </div>

                    <button type='submit' className='bg-blue-500 rounded-xl px-5 py-2 mt-3 hover:bg-blue-400 font-bold text-white'>Submit</button>

                </form>

                
            </div>
        </div>
    )
}