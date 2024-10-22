import { useEffect, useState } from "react";
import { getItems, updateQuantity } from "../inventoryAPI";

import { FaTrash } from "react-icons/fa";


export default function Checkout(){
    const [itemsFromDB, setItemsFromDB] = useState([]);

    const [selectedItems,setSelectedItems] = useState([]);

    const [message,setMessage] = useState([]);

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
    
    function ticketSum(){
        let sum = 0
        selectedItems.map(
            (tuple,key) => {
                sum = sum + ( tuple[0].data.item_sell_price * tuple[1] )
            }
        )
        return(sum.toFixed(2))
    }

    useEffect(() => {
        fetchItems();
    }, []);

    const CheckoutItem = ({itemData}) => {
        return(
            <div className='bg-white shadow-md shadow-black/25 flex flex-col p-3 rounded-xl'>
                <div className='w-[75px] h-[75px] grid m-auto md:w-[100px] md:h-[100px] xl:w-[150px] xl:h-[150px]'>
                    <img src={itemData.data.item_image_url} className='w-fit' />
                </div>
                <div className='grid py-2 h-[150px]'>
                    <label className='overflow-auto max-h-[75px] my-auto text-xl font-bold text-center lg:text-2xl '>{itemData.data.item_name}</label>
                    <label className='font-medium px-1 my-auto text-center text-lg md:text-xl lg:text-2xl'>{itemData.data.item_sell_price}€</label>
                </div>
            </div>
        )
    }

    return(
        <div>
            <div className='flex flex-col bg-blue-500 px-2 py-3 rounded-tr-xl'>
                <h1 className='text-start my-auto pb-5 text-4xl font-bold text-white'>Vente</h1>
                <div className='flex flex-col md:flex-row'>

                    <div id='item_grid' className='md:rounded-br-3xl special-vente-shadow-1 bg-blue-300 py-5 px-5 gap-2 h-[750px] overflow-y-auto grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                        {
                            itemsFromDB.map(
                                (value,key) => {
                                    return(
                                        <button key={key} className='grid' onClick={(e)=>{addItemToCart(e,value)}}>
                                            <CheckoutItem itemData={value} />
                                        </button>
                                    )
                                }
                            )
                        }
                    </div>

                    <div id='ticket + confirm button' className='flex flex-col special-vente-shadow-1 mb-auto rounded-br-3xl'>
                        <div id='tiket' className='bg-gray-100 py-5 grid '>
                                <label className=' text-2xl font-bold pb-2 px-2 '>Ticket</label>
                                
                                <div id='list of items' className='border-y-black border-[0.15rem] flex flex-col h-[450px] md:w-[250px] xl:w-[350px] 2xl:w-[450px] overflow-y-auto'>
                                    {
                                        selectedItems.map(
                                            (value,key)=>{
                                                return(
                                                    <div key={key} className='flex py-5'>
                                                        <label className='px-2 font-bold text-lg'>x{value[1]}</label>
                                                        <label className='max-w-[250px] max-h-[50px] overflow-auto text-lg'>{value[0].data.item_name}</label>

                                                        <div className='grid ml-auto mr-5'>
                                                            <button onClick={(e)=>{removeItemFromCart(e,value[0])}} className='text-2xl text-red-600'><FaTrash/></button>
                                                        </div>

                                                    </div>
                                                )
                                            }
                                        )
                                    }
                                </div>
                                
                                <div className='grid'>
                                    <label className='px-3 py-1 font-bold text-xl md:text-2xl '>
                                        Total : {ticketSum()} €
                                    </label>
                                </div>

                            </div>

                            <div className='bg-gray-100 p-5 grid rounded-br-3xl'>
                                <label className={`${message[1]? "text-red-500 font-bold" : "text-green-500"} py-5 text-center`}>{message}</label>
                                <button onClick={(e)=>{confirmTiket(e)}} className='px-5 py-2 m-auto text-xl text-white bg-blue-500 border-blue-500 border-[0.15rem] rounded-xl' > Confirmer </button>
                            </div>
                    </div>
                </div>

            </div>
        </div>
    )
}