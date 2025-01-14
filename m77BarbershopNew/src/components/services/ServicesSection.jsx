import ServicesCard from "./ServicesCard";

import SERVICES from '../../data/services.json'

const ServicesSection = () => {
    return(
      <div className='bg-[var(--brand-black)] text-[var(--brand-white)] px-10'>
  
        <h3 className='section-title pt-10'>
          Services
        </h3>
  
        <div className=' grid lg:grid-cols-2 justify-center py-20 gap-20'>
          <ServicesCard Services={SERVICES.services_by_group[0]} />
  
          <div className='grid md:justify-center pt-5 pb-10 gap-20'>
            <ServicesCard Services={SERVICES.services_by_group[1]} />
            <ServicesCard Services={SERVICES.packages[0]} />
          </div>
  
        </div>

        <div className="grid md:justify-center pt-5 pb-10 gap-20">
          <ServicesCard Services={SERVICES.special[0]} />
        </div>
        
      </div>
    )
  }


  export default ServicesSection;