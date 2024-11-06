import React from 'react'

export default function About() {
  return (
    <div className='background-about'>

        <div className='filtre box-parent m-y-auto'>
            <h1 className="enfant mes-titres text-grand">A propos</h1>
            <h2 className='enfant mes-sous-titres text-moyen-2'>L'endroit idéal pour apprendre sur nous</h2>

            <p className='mon-paragraph text-moyen'>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                Lorem Ipsum has been the industrys standard dummy text ever since the 1500s,
                when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </p>

            <div className='button-holder'>
                <button className='mon-button'> Voir nos prix </button>
                <button className='mon-button-2'> Contactez-nous </button>
            </div>
        </div>

    </div>
  )
}
