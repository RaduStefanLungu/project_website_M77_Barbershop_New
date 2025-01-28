import React, { useEffect, useState } from 'react'
import AppointmentsByDayChart from '../../../components/StatisticsRapport/Appointments/AppointmentsByDayChart'
import { getAppointments, getDataForChart, getProfileByEmail, getProfiles } from '../../../api/firebase'


export default function RapportRDVs() {

  const [allProfiles,setAllProfiles] = useState([])

  // TODO 
  /*

    * Create for each profile a pie-chart to compare the chosen month's ratio of appointments : unconfirmed,confirmed,absent,cancelled
    * Get $ made for the chosen month by profile, then total (+ % of total amount made by each profile)
    * Pie-chart to compare the chosen month's ratio of appointment's type (what type of appointment)
  */
  
  async function fetchProfiles() {
    try {
      const profiles = await getProfiles();
      setAllProfiles(profiles);
      return profiles; // Return profiles for chaining
    } catch (e) {
      console.error("Error fetching profiles:", e);
      return []; // Return an empty array in case of an error
    }
  }

  useEffect(()=>{
    fetchProfiles();
    
  },[])

  if(allProfiles.length <= 0){
    return(
      <div>Chargement ...</div>
    )
  }
  
  else{
    return (
      <div className='grid'>
        
        <div className='grid'>
            <QuantityChartsByMonth db_profiles={allProfiles} ></QuantityChartsByMonth>
        </div>

        <div>
          WORKING IN PROGRESS
        </div>
      </div>
    )
  }
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

function QuantityChartsByMonth({db_profiles}){
  const [allProfiles,setAllProfiles] = useState([])
  const [allDataForCharts,setAllDataForCharts] = useState([])
  
  const [chosenMonth,setChosenMonth] = useState("01")
  const [chosenYear,setChosenYear] = useState(2025)

  function handleOnSelectYear(year){
    setChosenYear(year)
  }

  async function fetchAllProfilesDataForChart(profiles) {
    if (!profiles || profiles.length === 0) return; // Skip if no profiles
  
    const DATE = `${chosenYear}-${chosenMonth}-01`;
  
    try {
      const chartDataPromises = profiles.map((profile) =>
        getDataForChart(profile, DATE)
      );
  
      // Wait for all chart data to resolve in parallel
      const allChartData = await Promise.all(chartDataPromises);
      setAllDataForCharts(allChartData); // Set all data at once
    } catch (e) {
      console.error("Error fetching chart data:", e);
    }
  }

  useEffect(()=>{
    if(db_profiles.length > 0){
      fetchAllProfilesDataForChart(db_profiles)
    }
  },[])

  return(
    <div>
      <div className='grid'>
        <h2 className='text-design-h2'>Rapport quantitatif par mois</h2>

        <div className='grid gap-5'>
          <div className='grid'>
            <YearSelector minYear={2024} onSelectYear={handleOnSelectYear} title={"Choisisez l'année"} />  
          </div>

          <div className='grid grid-cols-6 gap-3'>
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

          <button onClick={()=>{fetchAllProfilesDataForChart(db_profiles)}} className='button-1'>Voir</button>

        </div>

        <div className='py-10 grid gap-5'>
          {
            allDataForCharts.map((tuple,key) => {
              return(
                <div key={key} className='grid'>
                  <label className='text-xl font-bold'>{tuple[0]}</label>
                  <AppointmentsByDayChart data={tuple[1]} />
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}