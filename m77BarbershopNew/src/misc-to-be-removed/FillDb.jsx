import React from 'react'
import { v4 } from 'uuid';
import { addAppointment2, getProfileByEmail, getSchedule } from '../api/firebase';
import APPOINTMENT_STATES from '../data/appointmentStates.json'
import { getItems, uploadTicket } from '../components/Inventory/inventoryAPI';

export default function FillDb() {

    function generateRandomUser(){
        let data_structure = {
            email : 'example@example.com',
            name : 'My Example',
            phone : '0123456789'
        }
        return(data_structure);
    }

    function createAppointment(barberID,date,time,serviceName){
        const appointment = {
                    barber_id : barberID,
                    appointment_id : v4(),
                    appointment_hour : time,
                    appointment_date : date,
                    appointment_service : serviceName,
                    appointment_user : generateRandomUser(),
                    confirmed : APPOINTMENT_STATES.neutral_state,
                    registered_time : new Date().toLocaleString()
                  }
        return(appointment);
    }

    function getAllDaysOfMonth(month) {
        const response = []; // List to store the dates
        const year = new Date().getFullYear(); // Get the current year
      
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

    async function getDispoHoursPerDay(day,barberProfile){
        const hours_list = await getSchedule(day,barberProfile);
        return hours_list;
    }
      

    async function getAvailableHoursPerMonthFor(wantedMonth,barberProfile){

        let list_of_day_and_hours = []

        const days_of_month = getAllDaysOfMonth(wantedMonth);
        for (let index = 0; index < days_of_month.length; index++) {
            let response = {
                day : '',
                hours : []
            }
            const day = days_of_month[index];
            const hours_of_day = await getDispoHoursPerDay(day,barberProfile);
            response.day = day;
            
            for(let y=0;y<hours_of_day.length;y++){
                const tuple =hours_of_day[y]; 
                if(!tuple[1]){
                    response.hours.push(tuple[0]);
                }
            }
            list_of_day_and_hours.push(response);
        }
        return(list_of_day_and_hours)
    }

    function getRandomService(){
        //todo
        const services = [
            "Coupe Classique",
            "Coupe Moderne",
            "Coupe Etudiant",
            "Coupe Enfant",
            "Taille de barbe",
            "Cheveux + Barbe"
        ]

        let random = Math.floor(Math.random() * services.length)
        return(services[random])
    }

    function randomGenerateAppointments(barberProfile,data){
        const barber_id = barberProfile.profile_id
        // select random numbers between 0 and length of data
        let result = []
        for(let i=0;i<data.length;i++){
            const element = data[i];
            let select_day = Math.round(Math.random())
            
            let rdv = {
                day : element.day,
                appointments : []
            }

            if(select_day === 1){
                for(let j=0;j<element.hours.length;j++){
                    const hour = element.hours[j]
                    let select_hour = Math.round(Math.random())
                    if(select_hour === 1){
                        rdv.appointments.push(createAppointment(barber_id,element.day,hour,getRandomService()))
                    }
                }
            }
            result.push(rdv);
        }

        return(result);
    }

    async function handleFillAppointmentsMG(e){
        e.preventDefault();
        console.log(`Please Wait, filling appointments...`);

        const WANTED_MONTH = 6 // change this to change the wanted month;

        const barberProfile = await getProfileByEmail("maitregims@test.com")
        const january_data_mg = await getAvailableHoursPerMonthFor(WANTED_MONTH,barberProfile)
        
        const generated_appointments = randomGenerateAppointments(barberProfile,january_data_mg);

        console.log(`Appointments : ${generated_appointments.length}`);
        

        for(let j=0;j<generated_appointments.length;j++){
            const element = generated_appointments[j]
            const appointments = element.appointments;
            for(let index=0; index<appointments.length;index++){
                const appointment = appointments[index];
                console.log(appointment);
                await addAppointment2(appointment).then(
                    (response)=>{
                        if(response){
                            console.log(`Appointment: ${appointment.appointment_id} SUCCESSFULLY added.`)
                        }
                        else{
                            console.log(`Appointment: ${appointment.appointment_id} FAILED to be added.`)
                        }
                    }
                );
            }
        }

        console.log(`\nFinished adding appointments to db.`);
        
        
    }

  return (
    <div className='bg-[var(--brand-black)] min-h-screen flex flex-col'>
        
        <div id='holder' className='max-w-[750px] bg-[var(--brand-white)] grid mx-auto p-10 gap-5'>
            <button type='button' onClick={handleFillAppointmentsMG} className='button-1 '>Fill Appointments of MaitreGims</button>
            <button type='button' onClick={()=>{generateAndUploadTickets('admin@test.com',20,'01','2025')}} className='button-1 '>Fill Tickets of Admin</button>
        </div>

    </div>
  )
}

async function generateAndUploadTickets(userEmail, ticketCount, month, year) {
  try {
    // Fetch available items
    const items = await getItems();

    if (!items || items.length === 0) {
      console.error("❌ No items available in the database.");
      return;
    }

    for (let i = 0; i < ticketCount; i++) {
      const ticketItems = [];
      let totalAmount = 0;

      // Generate 1 to 5 random items per ticket
      const numItems = Math.floor(Math.random() * 5) + 1;

      for (let j = 0; j < numItems; j++) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity between 1-3

        ticketItems.push({
          item: {
            item_id: randomItem.data.item_id,
            item_buy_price: randomItem.data.item_buy_price,
            item_sell_price: randomItem.data.item_sell_price,
            item_name: randomItem.data.item_name,
          },
          quantity: quantity,
        });

        // Calculate total price
        totalAmount += parseFloat(randomItem.data.item_sell_price) * quantity;
      }

      // Generate a random day in the given month & year
      const lastDayOfMonth = new Date(year, month, 0).getDate();
      const randomDay = Math.floor(Math.random() * lastDayOfMonth) + 1;

      // Format day & month correctly (ensure 2-digit format)
      const formattedDay = String(randomDay).padStart(2, "0");
      const formattedMonth = String(month).padStart(2, "0");

      // Generate random timestamp (random hour, min, sec)
      const randomHour = String(Math.floor(Math.random() * 24)).padStart(2, "0");
      const randomMinute = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      const randomSecond = String(Math.floor(Math.random() * 60)).padStart(2, "0");

      const timestamp = `${formattedDay}/${formattedMonth}/${year} ${randomHour}:${randomMinute}:${randomSecond}`;

      // Ticket structure
      const ticketData = {
        total_amount: totalAmount.toFixed(2),
        meta: {
          timestamp: timestamp,
          created_by: userEmail,
        },
        items: ticketItems,
      };

      // Upload ticket
      await uploadTicket(ticketData);
      console.log(`✅ Ticket ${i + 1} uploaded successfully for ${timestamp}`);
    }
  } catch (error) {
    console.error("❌ Error generating tickets:", error);
  }
}
