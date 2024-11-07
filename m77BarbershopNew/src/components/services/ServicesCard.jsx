const ServicesCard = ({Services}) => {
    return(
      <div className='font-custom_1 border-[0.15rem] border-[var(--brand-white)] pt-10 pb-5 px-5 grid relative'>
  
        <label className='bg-[var(--brand-white)] text-slate-950 py-3 px-5 absolute -top-10 left-10 text-2xl '>
          {Services.group}
        </label>
  
        <div className='grid gap-3 items-start'>
  
          {
            Services.services.map(
              (value,key) => {
                return(
                  <div key={key} className='grid'>
                    <div className='grid grid-flow-col justify-between border-b-[0.05rem] border-[var(--brand-white)] text-2xl '>
                      <label className=''>{value.name}</label>
                      <label className='text-end mt-auto px-5'>{value.price} €</label>
                    </div>
                    <p className='text-[var(--brand-white-80)] text-base'>{value.description}</p>
                  </div>
                )
              }
            )
          }
  
        </div>
  
      </div>
    )
  }

export default ServicesCard;
  