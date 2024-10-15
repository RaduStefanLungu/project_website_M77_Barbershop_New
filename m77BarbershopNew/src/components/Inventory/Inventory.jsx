import React, { useEffect, useState } from 'react'
import Stock from './components/Stock'

import { FaBoxes,FaQuestion,FaTrash } from "react-icons/fa";
import { MdShoppingCartCheckout } from "react-icons/md";
import { getItems, updateQuantity } from './inventoryAPI';


export default function Inventory() {

    const [selection,setSelection] = useState('checkout')

    const dico = {
        "stock" : <Stock/>,
        "checkout" : <Checkout/>
    }

  return (
    <div>

        <div id='buttons' className=''>
            <button onClick={()=>{setSelection('stock')}} className={`text-4xl p-5 ${selection=='stock'? "bg-blue-500" : "bg-blue-700"} hover:bg-blue-500 text-white border-y-transparent border-l-transparent border-r-white border-[0.15rem]`}>
                <FaBoxes/>
            </button>
            <button onClick={()=>{setSelection('checkout')}} className={`text-4xl p-5 ${selection=='checkout'? "bg-blue-500" : "bg-blue-700"} hover:bg-blue-500 text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <MdShoppingCartCheckout/>
            </button>
            <button className={`text-4xl p-5 bg-blue-700 hover:bg-blue-500 text-white border-y-transparent border-x-white border-[0.15rem]`}>
                <FaQuestion/>
            </button>
        </div>

        <div id='container' className='grid pb-5 bg-slate-300'>
            {dico[selection]}
        </div>

    </div>
  )
}


const Checkout = () => {
    const [itemsFromDB, setItemsFromDB] = useState([]);

    const [selectedItems,setSelectedItems] = useState([]);

    const [message,setMessage] = useState(['test',true]);

    // [
    //     [item,quantity]
    // ]


    async function fetchItems() {
        setItemsFromDB(await getItems());
    }

    function addItemToCart(e, item) {
        e.preventDefault();
    
        const existingItemIndex = selectedItems.findIndex(
            (selectedItem) => selectedItem[0] === item
        );
    
        // If item is already in the cart
        if (existingItemIndex !== -1) {
            const updatedItems = selectedItems.map((selectedItem, index) => 
                index === existingItemIndex
                    ? [selectedItem[0], selectedItem[1] + 1]
                    : selectedItem
            );
            setSelectedItems(updatedItems);
        } else {
            // If item is not in the cart, add it with quantity 1
            setSelectedItems([...selectedItems, [item, 1]]);
        }
    }
    
    function removeItemFromCart(e, item) {
        e.preventDefault();
    
        const existingItemIndex = selectedItems.findIndex(
            (selectedItem) => selectedItem[0] === item
        );
    
        // If item exists in the cart
        if (existingItemIndex !== -1) {
            const updatedItems = selectedItems
                .map((selectedItem, index) => {
                    if (index === existingItemIndex) {
                        const newQuantity = selectedItem[1] - 1;
                        // If quantity is greater than 0, update it
                        if (newQuantity > 0) {
                            return [selectedItem[0], newQuantity];
                        }
                        // Otherwise, we return null, to filter it out later
                        return null;
                    }
                    return selectedItem;
                })
                .filter(Boolean); // Remove any null values (items with 0 quantity)
    
            setSelectedItems(updatedItems);
        }
    }
    
    // function confirmTiket(e){
    //     e.preventDefault();

    //  try {

    //     selectedItems.map(
    //         async (value,key) => {

    //             const dbItemIndex = itemsFromDB.findIndex(
    //                 (dbItem) => dbItem.data.item_id === value[0].data.item_id
    //             );
                
    //             await updateQuantity(value[0].data.item_id,itemsFromDB[dbItemIndex].data.item_quantity - value[1])
    //         }
    //     )
    //     setMessage(['Confirmation du tiket réussie !',false])

    //     //TODO add 3 seconds delay?

    //     setSelectedItems([])
    //     setMessage([])

    //     // TODO :  send to a history DB the confirmation to keep track of each sale to avoid problems 

    //  } catch (error) {
    //     setMessage([error.message,true])
    //  }

    // }

    async function confirmTiket(e) {
        e.preventDefault();
    
        try {
            await Promise.all(
                selectedItems.map(async (value, key) => {
                    const dbItemIndex = itemsFromDB.findIndex(
                        (dbItem) => dbItem.data.item_id === value[0].data.item_id
                    );
    
                    if (dbItemIndex !== -1) {
                        const newQuantity = itemsFromDB[dbItemIndex].data.item_quantity - value[1];
    
                        // Call updateQuantity without client-side validation
                        await updateQuantity(value[0].data.item_id, newQuantity);
                    } else {
                        throw new Error(`Item ${value[0].data.item_id} not found`);
                    }
                })
            );
    
            setMessage(['Confirmation du tiket réussie !', false]);
    
            // Add 3 seconds delay
            await new Promise((resolve) => setTimeout(resolve, 3000));
    
            setSelectedItems([]);
            setMessage([]);
    
            // TODO :
            // await saveToHistory(selectedItems);
    
        } catch (error) {
            console.log(error);
            
            setMessage([error.message, true]);
        }
    }
    

    useEffect(() => {
        fetchItems();
    }, []);

    const CheckoutItem = ({itemData}) => {
        return(
            <div className='bg-blue-300 flex flex-col'>
                <label className='text-lg text-center'>{itemData.data.item_name}</label>
            </div>
        )
    }

    return(
        <div>``
            <div className='flex flex-col bg-blue-500 px-2 py-3 rounded-tr-xl'>
                {/* <h1 className='text-6xl'>{Icon}</h1> */}
                <h1 className='text-start my-auto pb-5 text-4xl font-bold text-white'>Ventes</h1>

                <div id='item_grid' className='grid grid-cols-3'>
                    {
                        itemsFromDB.map(
                            (value,key) => {
                                return(
                                    <div key={key} className='grid' onClick={(e)=>{addItemToCart(e,value)}}>
                                        <CheckoutItem itemData={value} />
                                    </div>
                                )
                            }
                        )
                    }
                </div>

                <div id='tiket' className='bg-gray-200 py-5 grid'>
                    <label className=' text-2xl font-bold pb-2 px-2 border-b-black border-[0.15rem]'>Ticket</label>
                    
                    <div className='grid'>
                        {
                            selectedItems.map(
                                (value,key)=>{
                                    return(
                                        <div key={key} className='flex py-5'>
                                            <label className='px-2 font-bold'>x{value[1]}</label>
                                            <label className='text-xl'>{value[0].data.item_name}</label>

                                            <div className='grid ml-auto mr-5'>
                                                <button onClick={(e)=>{removeItemFromCart(e,value[0])}} className='text-2xl text-red-600'><FaTrash/></button>
                                            </div>

                                        </div>
                                    )
                                }
                            )
                        }
                    </div>

                </div>

                <div className='bg-white p-5 grid'>
                    <label className={`${message[1]? "text-red-500 font-bold" : "text-green-500"} py-5 text-center`}>{message}</label>
                    <button onClick={(e)=>{confirmTiket(e)}} className='px-5 py-2 m-auto text-xl text-white bg-blue-500 border-blue-500 border-[0.15rem] rounded-xl' > Confirmer </button>
                </div>

            </div>
        </div>
    )
}