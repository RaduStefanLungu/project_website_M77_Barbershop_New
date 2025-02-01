import { useEffect, useState } from "react"
import { getTickets } from "../inventoryAPI"
import TicketsChart from "./charts/TicketsCharts";
import DailySalesAndBenefitsChart from "./charts/DailyBenefitsChart";
import MonthlySalesAndBenefitsChart from "./charts/MonthlySalesAndBenefitsChart";
import UserBalancePieChart from "./charts/UserBalancePieChart";

export default function Statistics() {

  // Statistics of inventory sales
  const MIN_YEAR = "2024"

  const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
      timeZone: 'Europe/Brussels', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    }).split('/').reverse().join('-'))

  const [dbTickets,setDbTickets] = useState([])
  const [selectedYear,setSelectedYear] = useState(today.split('-')[0])
  const [chosenMonth,setChosenMonth] = useState(today.split('-')[1])


  async function fetchTickets(){
    const result = await getTickets();
    const grouped_tickets = groupTicketsByDate(result)
    setDbTickets(grouped_tickets)
  }

  function handleYearSelected(year){
    setSelectedYear(String(year))
  }

  useEffect(()=>{
    fetchTickets();
  },[])

  useEffect(()=>{},[selectedYear,chosenMonth])

  return (
    <div className="font-custom_1 py-5">
      
      <h2 className="text-design-h2">Rapport Financier</h2>
      
      <div className="grid">
        <YearSelector minYear={MIN_YEAR} onSelectYear={handleYearSelected} title="Selectionnez l'année" ></YearSelector>
        <div id="chosen month selector" className='grid grid-cols-6 gap-3'>
          <MonthButton text={"Janv"} value={"01"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Fèvr"} value={"02"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Mars"} value={"03"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Avrl"} value={"04"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Mai"} value={"05"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Juin"} value={"06"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Juil"} value={"07"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Aôut"} value={"08"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Sept"} value={"09"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Oct"} value={"10"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Nov"} value={"11"} setters={[chosenMonth,setChosenMonth]} />
          <MonthButton text={"Dec"} value={"12"} setters={[chosenMonth,setChosenMonth]} />
        </div>
      </div>

      <div>
        <TicketsChart organizedTickets={dbTickets} selectedDate={`${selectedYear}-${chosenMonth}-01`} />
      </div>

      <div>
        <DailySalesAndBenefitsChart organizedTickets={dbTickets} selectedDate={`${selectedYear}-${chosenMonth}-01`} />
      </div>

      <div>
        <MonthlySalesAndBenefitsChart organizedTickets={dbTickets} wantedYear={selectedYear}/>
      </div>

      <div>
        <UserBalancePieChart organizedTickets={dbTickets} selectedDate={`${selectedYear}-${chosenMonth}-01`} />
      </div>

    </div>
  )
}

function groupTicketsByDate(tickets) {
  const groupedTickets = {};

  tickets.forEach(ticket => {
    const timestamp = ticket.data.meta.timestamp; // Example: "19/12/2024 16:13:32"
    const [day, month, year] = timestamp.split(" ")[0].split("/"); // Extract "dd/mm/yyyy"
    const formattedDate = `${year}-${month}-${day}`; // Convert to "yyyy-mm-dd" for sorting

    if (!groupedTickets[formattedDate]) {
      groupedTickets[formattedDate] = [];
    }
    groupedTickets[formattedDate].push(ticket);
  });

  // Sort dates chronologically (oldest to newest)
  const sortedDates = Object.keys(groupedTickets).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Convert into the required array format
  return sortedDates.map(date => ({
    date: date.split("-").reverse().join("/"), // Converts back to "dd/mm/yyyy"
    tickets: groupedTickets[date]
  }));
}

function YearSelector({ minYear = 2024, onSelectYear,title = 'Select A Year'}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - minYear + 1 }, (_, i) => currentYear - i);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const handleChange = (event) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    if (onSelectYear) {
      onSelectYear(year); // Notify parent component about the selected year
    }
  };

  return (
    <div className="flex gap-5 items-center py-4 font-custom_1">
      <label htmlFor="year-selector" className="text-lg my-auto text-gray-700 mb-2">
        {title}
      </label>
      <select
        id="year-selector"
        value={selectedYear}
        onChange={handleChange}
        className="px-4 py-2 border border-[var(--brand-black)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}


function MonthButton({text,value,setters}) {

  function handleClicked(e){
    e.preventDefault();
    setters[1](value);
  }

  return(
    <button onClick={handleClicked} className={`px-3 py-1 text-base ${setters[0] === value ? "button-2" : "button-1"} `} >{text}</button>
  )
}