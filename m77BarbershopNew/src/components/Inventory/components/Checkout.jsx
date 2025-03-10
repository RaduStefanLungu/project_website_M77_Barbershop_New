import { useEffect, useState } from "react";
import { getItems, updateQuantity, uploadTicket } from "../inventoryAPI";

import { FaTrash } from "react-icons/fa";


const Checkout = ({ connectedUser }) => {
    const [itemsFromDB, setItemsFromDB] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [message, setMessage] = useState([]);
    const [isPersonalUsage, setIsPersonalUsage] = useState(false); // New state

    async function fetchItems() {
        setItemsFromDB(await getItems());
    }

    function addItemToCart(e, item) {
        e.preventDefault();
        const existingItemIndex = selectedItems.findIndex((selectedItem) => selectedItem[0] === item);
        if (existingItemIndex !== -1) {
            const updatedItems = selectedItems.map((selectedItem, index) =>
                index === existingItemIndex ? [selectedItem[0], selectedItem[1] + 1] : selectedItem
            );
            setSelectedItems(updatedItems);
        } else {
            setSelectedItems([...selectedItems, [item, 1]]);
        }
    }

    function removeItemFromCart(e, item) {
        e.preventDefault();
        const updatedItems = selectedItems
            .map(([selectedItem, quantity]) => selectedItem === item ? (quantity > 1 ? [selectedItem, quantity - 1] : null) : [selectedItem, quantity])
            .filter(Boolean);
        setSelectedItems(updatedItems);
    }

    function ticketSum() {
        if (isPersonalUsage) return "0.00"; // If personal usage, total is 0
        return selectedItems.reduce((sum, [item, qty]) => sum + item.data.item_sell_price * qty, 0).toFixed(2);
    }

    function createListOfItems() {
        return selectedItems.map(([item, quantity]) => ({
            item: {
                item_id: item.data.item_id,
                item_name: item.data.item_name,
                item_sell_price: item.data.item_sell_price,
                item_buy_price: item.data.item_buy_price,
            },
            quantity,
        }));
    }

    async function confirmTiket(e) {
        e.preventDefault();
        const ticket = {
            meta: {
                timestamp: new Date().toLocaleString('fr-BE', { timeZone: 'Europe/Brussels' }),
                created_by: connectedUser,
            },
            items: createListOfItems(),
            total_amount: isPersonalUsage ? "0.00" : ticketSum(),
        };

        try {
            await Promise.all(
                selectedItems.map(async ([item, qty]) => {
                    const dbItem = itemsFromDB.find((dbItem) => dbItem.data.item_id === item.data.item_id);
                    if (!dbItem) throw new Error(`Item ${item.data.item_id} not found`);

                    const newQuantity = dbItem.data.item_quantity - qty;
                    await updateQuantity(item.data.item_id, newQuantity, connectedUser);
                })
            );

            setMessage(['Confirmation du ticket réussie !', false]);
            await uploadTicket(ticket);

            await new Promise((resolve) => setTimeout(resolve, 3000));
            setSelectedItems([]);
            setMessage([]);
            setIsPersonalUsage(false); // Reset personal usage mode after confirmation
        } catch (error) {
            console.log(error);
            setMessage([error.message, true]);
        }
    }

    useEffect(() => { fetchItems(); }, []);

    return (
        <div>
            <div className='flex flex-col bg-[var(--brand-black)] px-2 py-3'>
                <h1 className='text-start my-auto pb-5 text-4xl font-bold text-white'>Vente</h1>
                <div className='grid md:grid-flow-col'>
                    {/* Items Grid */}
                    <div id='item_grid' className='md:ml-auto md:min-w-[350px] md:w-fit special-vente-shadow-1 bg-[var(--brand-white)] py-5 px-5 gap-2 h-[750px] overflow-y-auto grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                        {itemsFromDB.map((item, key) => (
                            <button key={key} disabled={item.data.item_quantity <= 0} onClick={(e) => addItemToCart(e, item)}>
                                <div className={`${item.data.item_quantity <= 0 ? "bg-gray-300" : "bg-white"} shadow-md shadow-black/25 flex flex-col p-3`}>
                                    <div className='w-[75px] h-[75px] grid m-auto md:w-[100px] md:h-[100px] xl:w-[150px] xl:h-[150px] overflow-hidden'>
                                        <img src={item.data.item_image_url} className='w-fit' />
                                    </div>
                                    <div className='grid py-2 h-[150px]'>
                                        <label className='overflow-auto max-h-[75px] my-auto text-xl font-bold text-center lg:text-2xl'>{item.data.item_name}</label>
                                        <label className='font-medium px-1 my-auto text-center text-lg md:text-xl lg:text-2xl'>{item.data.item_sell_price}€</label>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Ticket Section */}
                    <div id='ticket + confirm button' className='md:mr-auto flex flex-col special-vente-shadow-1 mb-auto'>
                        <div id='tiket' className='bg-gray-100 py-5 grid'>
                            <label className=' text-2xl font-bold pb-2 px-2 '>Ticket</label>
                            <div id='list of items' className='border-y-black border-[0.15rem] flex flex-col h-[450px] md:w-[250px] xl:w-[350px] 2xl:w-[450px] overflow-y-auto'>
                                {selectedItems.map(([item, qty], key) => (
                                    <div key={key} className='flex py-5'>
                                        <label className='px-2 font-bold text-lg'>x{qty}</label>
                                        <label className='max-w-[250px] max-h-[50px] overflow-auto text-lg'>{item.data.item_name}</label>
                                        <div className='grid ml-auto mr-5'>
                                            <button onClick={(e) => removeItemFromCart(e, item)} className='text-2xl text-red-600'><FaTrash /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className='grid'>
                                <label className='px-3 py-1 font-bold text-xl md:text-2xl '>
                                    Total : {ticketSum()} €
                                </label>
                            </div>
                        </div>

                        {/* Confirm & Personal Usage Buttons */}
                        <div className='bg-gray-100 p-5 grid'>
                            <label className={`${message[1] ? "text-red-500 font-bold" : "text-green-500"} py-5 text-center`}>{message}</label>
                            
                            <div className="grid px-3 gap-2">
                                    {/* Personal Usage Button */}
                                <button 
                                    onClick={() => setIsPersonalUsage(!isPersonalUsage)} 
                                    className={`px-5 py-2 text-xl border-[var(--brand-black)] border-[0.15rem] ${
                                        isPersonalUsage ? 'bg-gray-500 text-white' : 'bg-white text-black'
                                    }`}
                                >
                                    {isPersonalUsage ? "Annuler Usage Personnel" : "Usage Personnel"}
                                </button>

                                {/* Confirm Button */}
                                <button 
                                    onClick={(e) => confirmTiket(e)} 
                                    className='px-5 py-2 text-xl text-white bg-[var(--brand-black)] border-[var(--brand-black)] border-[0.15rem]'
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Checkout;