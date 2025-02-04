import React, { useCallback, useEffect, useState } from 'react'
import AppointmentsByDayChart from '../../../components/StatisticsRapport/Appointments/AppointmentsByDayChart'
import { getAppointments, getDataForChart, getMonthAppointments, getProfileByEmail, getProfiles } from '../../../api/firebase'
import PieChart from '../../../components/StatisticsRapport/Appointments/PieChart'
import RevenueChart from '../../../components/StatisticsRapport/Appointments/RevenueChart'


export default function RapportRDVs() {
  const [today,setToday] = useState(new Date().toLocaleString('en-GB', { 
    timeZone: 'Europe/Brussels', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  }).split('/').reverse().join('-'))

  const [allProfiles,setAllProfiles] = useState([])
  const [monthAppointments,setMonthAppointments] = useState([])

  const [chosenMonth,setChosenMonth] = useState(today.split('-')[1])
  const [chosenYear,setChosenYear] = useState(today.split('-')[0])


  // Fetch profiles
  const fetchProfiles = useCallback(async () => {
    try {
      const profiles = await getProfiles();
      setAllProfiles(profiles);
    } catch (e) {
      console.error("Error fetching profiles:", e);
    }
  }, []);

  // Fetch appointments when profiles are available
  const fetchMonthAppointments = useCallback(async () => {
    if (allProfiles.length === 0) return; // Avoid fetching if no profiles

    try {
      const date = `${chosenYear}-${chosenMonth}-01`;
      const appointmentsPromises = allProfiles.map((profile) =>
        getMonthAppointments(profile, date)
      );

      const appointmentsResults = await Promise.all(appointmentsPromises);
      setMonthAppointments(appointmentsResults);
    } catch (e) {
      console.error(`Error fetching ${today} appointments`, e);
    }
  }, [allProfiles, chosenYear, chosenMonth, today]);

  // Fetch profiles when component mounts
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Fetch appointments when profiles are updated
  useEffect(() => {
    fetchMonthAppointments();
  }, [fetchMonthAppointments]);

  function handleOnSelectYear(year){
    setChosenYear(year)
    console.log(`Changed Year to : ${year}`);
    
  }



  if(allProfiles.length <= 0){
    return(
      <div>Chargement ...</div>
    )
  }
  
  else{
    return (
      <div className='grid'>

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

          {/* <button onClick={()=>{fetchAllProfilesDataForChart(db_profiles)}} className='button-1'>Voir</button> */}

        </div>

        <div className='grid pt-5'>
          <PieChartsComparison monthlyAppointments={monthAppointments} title={'Comparatif états des rendez-vous'} groupBy={'confirmed'} />
        </div>
        
        <div className='grid'>
            <QuantityChartsByMonth db_profiles={allProfiles} year={chosenYear} month={chosenMonth} ></QuantityChartsByMonth>
        </div>

        <div className='grid pt-5'>
          <PieChartsComparison monthlyAppointments={monthAppointments} title={'Comparatif types des rendez-vous'} groupBy={'appointment_service'} />
        </div>

        <div>
          <RevenueChartsComparison monthlyAppointments={monthAppointments} title={'Comparatif revenus mensuels'}/>
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

function QuantityChartsByMonth({db_profiles,year,month}){
  const [allDataForCharts,setAllDataForCharts] = useState([])

  async function fetchAllProfilesDataForChart(profiles) {
    if (!profiles || profiles.length === 0) return; // Skip if no profiles
  
    const DATE = `${year}-${month}-01`;
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
  },[year,month])

  return(
    <div>
      <div className='grid'>
        <h2 className='text-design-h2'>Rapport quantitatif par mois</h2>
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

function PieChartsComparison({monthlyAppointments,title,groupBy}){
  return(
    <div>
      <div className='grid'>
        <h2 className='text-design-h2'>{title}</h2>
        <div className='py-10 grid md:grid-cols-2 gap-5'>
          {
            monthlyAppointments.map((tuple,key) => {
              const flatted_list = tuple[1]?.flat() || [];
              return(
                <div key={key} className='grid'>
                  <label className='text-xl font-bold'>{tuple[0]}</label>
                  <PieChart appointments={flatted_list} groupBy={groupBy} />
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

function RevenueChartsComparison({monthlyAppointments,title}){
  return(
    <div>
      <div className='grid'>
        <h2 className='text-design-h2'>{title}</h2>
        <div className='py-10 grid md:grid-cols-2 gap-5'>
          {
            monthlyAppointments.map((tuple,key) => {
              const flatted_list = tuple[1]?.flat() || [];
              return(
                <div key={key} className='grid'>
                  <label className='text-xl font-bold'>{tuple[0]}</label>
                  <RevenueChart appointments={flatted_list} />
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}