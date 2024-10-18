import React, { useEffect, useState } from 'react'
import '../inventory.css'

import { FaPlus } from "react-icons/fa";
import { addItem, getItems, removeItem, updateQuantity } from '../inventoryAPI';

import { IoIosCloseCircleOutline  } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { FaArrowUp,FaArrowDown } from "react-icons/fa";
import { CiCirclePlus,CiCircleMinus  } from "react-icons/ci";


import { v4 } from 'uuid';

// TODO : add 'buying price / item  && selling price / item ==> make a sales rapport?'


const Stock = () => {

    const [clickedAddItem, setClickedAdditem] = useState(false);
    const [activatedPopup, setActivatedPopup] = useState(false);
    const [popup, setPopup] = useState(null);
    const [itemsFromDB, setItemsFromDB] = useState([]);

    const [updateDBItems,setUpdateDBItems] = useState(false);

    async function fetchItems() {
        setItemsFromDB(await getItems());
    }

    async function handleAddItem(e) {
        e.preventDefault();
        setClickedAdditem(true);
        setActivatedPopup(true);
        setPopup(<AddItemInterface UpdateItemsList={[updateDBItems,setUpdateDBItems]} PopupSetters={[activatedPopup, setActivatedPopup]} PopupHolder={[popup, setPopup]} ClickedAddItemSetters={[clickedAddItem, setClickedAdditem]} />);
    }

    async function handleClosePopup(e){
        e.preventDefault();
        setActivatedPopup(false)
        setPopup(null)
        setClickedAdditem(false)
    }

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(()=> {
        if(updateDBItems === true){
            fetchItems();
            setUpdateDBItems(false);
        }
    },[updateDBItems])

    return (
        <div className={`relative ${clickedAddItem ? "overflow-hidden" : ""} w-full`}>
            
            {/* Popup container */}
            {activatedPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 w-[350px] md:w-[500px] rounded-lg shadow-lg z-50 flex flex-col">
                        <button onClick={handleClosePopup} className='text-red-500 text-end text-3xl font-bold ml-auto'>
                            <IoIosCloseCircleOutline></IoIosCloseCircleOutline>
                        </button>
                        {popup}
                    </div>
                </div>
            )}

            <div className='flex text-4xl font-bold text-white bg-blue-500 px-2 py-3 rounded-tr-xl'>
                {/* <h1 className='text-6xl'>{Icon}</h1> */}
                <h1 className='text-center my-auto'>Stock</h1>
            </div>

            <div id='item-list' className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 bg-white py-10 px-5 border-blue-500 border-[0.25rem]'>

                <div className='inventoryListCard'>
                    <button
                        disabled={clickedAddItem}
                        onClick={handleAddItem}
                        className='text-gray-600 hover:text-white disabled:bg-gray-600 grid justify-center items-center text-3xl card cardBorder cardAnimation'
                    >
                        <FaPlus />
                    </button>
                </div>

                {itemsFromDB.map((value, key) => (
                    <div key={key} className='inventoryListCard'>
                        <Item
                            itemData={value}
                            PopupSetters={[activatedPopup, setActivatedPopup]}
                            PopupHolder={[popup, setPopup]}
                            UpdateItemsList={[updateDBItems,setUpdateDBItems]}
                        />
                    </div>
                ))}

            </div>
        </div>
    );
}


const Item = ({itemData,PopupSetters,PopupHolder,UpdateItemsList}) => {
    
    const ItemDetailsInterface = ({itemData,UpdateItemsList,PopupSetters,PopupHolder}) => {
        const [showDetails,setShowDetails] = useState(false)

        const [message,setMessage] = useState(["",false])
        
        const [stockValue,setStockValue] = useState(Number(itemData.data.item_quantity))

        const [deleteConfirmation,setDeleteConfirmation] = useState(false)

        function handleQuantityChange(e) {
            setStockValue(e.target.value);
        }
        function handleAddStock(e){
            e.preventDefault()
            setStockValue(stockValue+1)
            
        }
        function handleSubstractStock(e){
            e.preventDefault()
            setStockValue(stockValue-1)
        }


        async function handleSave(e){
            e.preventDefault();
            try {
                await updateQuantity(itemData.data.item_id,stockValue).then(
                    (resp) => {
                        setMessage(["Nouvelle quantité sauvegardée",true])
                        UpdateItemsList[1](true)
                    }
                )
            } catch (error) {
                setMessage([`Une erreur est parvenue, esseyez encore.\n\n${toString(error)}`,false])
            }

        }

        async function handleUserDeleteConfirmation(e){
            e.preventDefault();
            
            try {
                await removeItem(itemData.data.item_id).then(
                    (resp) => {
                        UpdateItemsList[1](true)
                        setDeleteConfirmation(false);
                        PopupSetters[1](false);
                        PopupHolder[1](null)
                    }
                )
            } catch (error) {
                setMessage([`Une erreur est parvenue, esseyez encore !\n\n${error}`,false])
            }
        }

        return(
            <div className=''>

                {
                    deleteConfirmation?
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 w-[400px] md:w-[700px] rounded-lg shadow-lg z-50 flex flex-col">
                            <span className='text-center py-5 text-3xl font-bold'>Etez-vous sûr de supprimer l'objet?</span>
                            <div className='flex justify-center items-center gap-5'>
                                <button onClick={handleUserDeleteConfirmation} className='px-2 py-1 text-md border-[0.10rem] md:text-lg bg-red-500 border-red-500 text-white rounded-xl'>Supprimer</button>
                                <button onClick={()=>{setDeleteConfirmation(false)}} className='px-2 py-1 text-md border-[0.10rem] md:text-lg text-blue-500 border-blue-500 rounded-xl'>Annuler</button>
                            </div>
                        </div>
                    </div> : <></>
                }

                <div id='holder' className='flex flex-col overflow-hidden'>
                    
                    <h3 className='font-bold text-3xl pb-3 max-h-[100px] overflow-auto'>{itemData.data.item_name}</h3>

                    <img src={itemData.data.item_image_url} className='max-w-[350px] max-h-[350px] md:mx-auto'></img>

                    <div id='details tab' className='grid '>
                        <button onClick={()=>{setShowDetails(!showDetails)}} className='bg-gray-200 p-2'>
                            <div className='grid grid-flow-col justify-between'>
                                <span>Détails</span>
                                <span className='m-auto text-xl'>{showDetails? <FaArrowUp/> : <FaArrowDown/>}</span>
                            </div>
                        </button>
                        {
                            showDetails? 
                            <div id='details' className='grid'>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item ID : </label>
                                    <label className='overflow-auto'>{itemData.data.item_id}</label>
                                </div>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item Quantity : </label>
                                    <label>{itemData.data.item_quantity}</label>
                                </div>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item Buy Price : </label>
                                    <label>{itemData.data.item_buy_price}€</label>
                                </div>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item Sell Price : </label>
                                    <label>{itemData.data.item_sell_price}€</label>
                                </div>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item Added Time : </label>
                                    <label>{itemData.data.item_added_time}</label>
                                </div>
                                <div className='grid grid-cols-2 border-b-[0.05rem] border-gray-400'>
                                    <label>Item Image URL : </label>
                                    <label className='overflow-auto max-h-14'>{itemData.data.item_image_url}</label>
                                </div>
                            </div> : <></>
                        }
                    </div>
                    <div className='flex justify-center items-center gap-5'>
                        <button onClick={handleSubstractStock} className='text-red-700 text-3xl md:text-5xl rounded-full'>
                            <CiCircleMinus/>
                        </button>
                        <div className='flex py-2'>
                            <label className='text-xl p-2'>Stock :</label>
                            <input type='number' value={stockValue} onChange={handleQuantityChange} className='font-bold border-blue-500 border-[0.10rem] rounded-lg px-1 mx-5 w-[50px] text-center'></input>
                        </div>
                        <button onClick={handleAddStock} className='text-green-700 text-3xl md:text-5xl rounded-full'>
                            <CiCirclePlus/>
                        </button>
                    </div>
                    <div className='flex justify-center items-center gap-5 pb-5'>
                        <div className='grid'>
                            <label className='text-xl p-2'>Prix Achat :</label>
                            <label className='font-medium px-1 text-center'>{itemData.data.item_buy_price}€</label>
                        </div>
                        <div className='grid'>
                            <label className='text-xl p-2'>Prix Vente :</label>
                            <label className='font-medium px-1 text-center'>{itemData.data.item_sell_price}€</label>
                        </div>
                    </div>
                    
                    <p className={`${message[1]? "text-green-500" : "text-red-500"} px-2 text-center`}>{message}</p>

                    <div className='flex justify-center py-2'>
                        <button onClick={handleSave} className='px-5 py-2 m-auto text-xl text-white bg-blue-500 border-blue-500 border-[0.15rem] rounded-xl'>Sauvegarder</button>
                        <button onClick={()=>{setDeleteConfirmation(true)}} className='px-2 py-1 m-auto text-md border-[0.10rem] border-red-500 text-red-500 rounded-xl'>Supprimer</button>
                    </div>
                    
                </div>

            </div>
        )
    }

    function handleClicked(e){
        e.preventDefault();

        PopupSetters[1](true);
        PopupHolder[1](<ItemDetailsInterface itemData={itemData} UpdateItemsList={UpdateItemsList} PopupSetters={PopupSetters} PopupHolder={PopupHolder} />)
    }

    return(
        <div onClick={handleClicked} className={`card grid overflow-hidden ${itemData.data.item_quantity<=0 ? "border-red-500 border-[0.25rem]" : "cardBorder"}`}>
            {/* <div id='image' className='bg-pink-300 w-full h-[150px] xl:h-[250px]'></div> */}
            <img src={itemData.data.item_image_url} className='mx-auto w-[100px] h-[100px] lg:w-[225px] lg:h-[225px] xl:w-[250px] xl:h-[250px]' ></img>
            <div className='grid'>
                <label className='max-h-[50px] overflow-auto text-center font-bold pt-1 lg:text-2xl'>{itemData.data.item_name}</label>
                {/* <label className='text-center italic py-2 text-xs'>{itemData.data.item_id}</label> */}
                <label className='border-t-[0.05rem] border-blue-500 text-center lg:text-xl'>Stock : <span className='font-medium'>{itemData.data.item_quantity}</span></label>
            </div>
        </div>
    )
}


const AddItemInterface = ({UpdateItemsList,PopupSetters,PopupHolder,ClickedAddItemSetters}) => {
    const [uploadedItemImage,setUploadedItemImage] = useState(null)

    const [itemName,setItemName] = useState("")
    const [itemQuantity,setItemQuantity] = useState(0)
    const [itemBuyPrice,setItemBuyPrice] = useState(0)
    const [itemSellPrice,setItemSellPrice] = useState(0)

    const [message,setMessage] = useState([])

    async function handleSubmit(e){
        e.preventDefault()

        const itemData = {
            item_id : itemName.split(" ").join("_"),
            item_name : itemName,
            item_quantity : itemQuantity,
            item_buy_price : itemBuyPrice,
            item_sell_price : itemSellPrice,
            item_image_url : '',
            item_added_time : new Date().toLocaleString('en-GB',{timeZone:'UTC'})
        }
        
        // add item to db with image and image ref

        if(uploadedItemImage!== null){
            try {
                const resp = await addItem(itemData,uploadedItemImage)
                console.log(resp);
                UpdateItemsList[1](true)
                ClickedAddItemSetters[1](false)
                PopupSetters[1](false)
                PopupHolder[1](null)
            } catch (error) {
                setMessage([`Une erreur est parvenue, esseyez encore !\n\n${error}`,false])
            }
        }
        else{
            setMessage([`Selectionnez une image !`,false])    
        }
    }

    return(
        <div className=''>
            <div id='holder' className='flex flex-col'>

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
                        <label className='px-2'>Prix d'<span className='font-bold'>achat</span> par unité (€) : </label>
                        <input type='decimal' placeholder={`${itemBuyPrice}€`} onChange={(e)=>{setItemBuyPrice(e.target.value)}} className='border-blue-500 border-[0.15rem] rounded-lg px-1'></input>
                    </div>

                    <div className='grid grid-cols-2 text-end'>
                        <label className='px-2'>Prix de <span className="font-bold">vente</span> par unité (€) : </label>
                        <input type='decimal' placeholder={`${itemSellPrice}€`} onChange={(e)=>{setItemSellPrice(e.target.value)}} className='border-blue-500 border-[0.15rem] rounded-lg px-1'></input>
                    </div>

                    <div className='grid grid-cols-2 text-end'>
                        <label className='px-2'>Photo (500x500) : </label>
                        <input type='file' onChange={(e)=>{setUploadedItemImage(e.target.files[0])}} ></input>
                    </div>
                    
                    <p className={`${message[1]? "text-green-500" : "text-red-500 font-bold"} px-2 text-center`}>{message}</p>

                    <button type='submit' className='bg-blue-500 rounded-xl px-5 py-2 mt-3 hover:bg-blue-400 font-bold text-white'>Submit</button>

                </form>

                
            </div>
        </div>
    )
}

export default Stock;