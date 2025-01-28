import { Chart } from 'react-google-charts';

export default function PieChart({data}) {
  // const [data,setData] = useState(null);

  const options = {
    title: `Rendez-vous / jour pour`,
    hAxis: { title: 'Date' },
    vAxis: { title: 'Nombre de rendez-vous' },
    // colors : ["#1b9e77", "#d95f02", "#7570b3"],
    bars : "horizontal",
    bar: {
      groupWidth : "75%"
    }
  };

  // useEffect(()=>{
  //   setData(generateDailyAppointmentStats(appointments))
  // },[])


  return <Chart chartType="ColumnChart" className='w-full h-[500px]' height="" data={data} options={options} />;  
}