import React, { useState,useEffect, useRef } from 'react'

import { Link } from 'react-router-dom'
import emailjs from '@emailjs/browser';

import { FaPhoneAlt } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import ServicesSection from '../components/services/ServicesSection';


import IMAGE_1 from '../assets/gallery/image00001.jpeg';
import IMAGE_5 from '../assets/gallery/image00005.jpeg';
import IMAGE_6 from '../assets/gallery/image00006.jpeg';
import IMAGE_8 from '../assets/gallery/image00008.jpeg';
import Carousel from '../components/Carousel';

import INFO_DATA from '../data/data.json'



export default function Home() {
  return (
    <div className='grid bg-white'>
      
      <HERO/>

      <div className='container mx-auto'>
        <TextBelt/>
      </div>

      <ImageBelt/>

      <div className='bg-[var(--brand-black)] md:px-32'>
        <ServicesSection/>
      </div>

      <div className='container mx-auto'>
        
        <PourcentageBelt />
        <GallerySection imageList={[IMAGE_1,IMAGE_5,IMAGE_6,IMAGE_8]} />
        <ContactSection/>
      </div>

    </div>
  )
}

const HERO = () => {
  return(
    <div className='grid relative w-screen h-[500px] md:h-[700px] bg-[var(--brand-black)]'>

      <div id='image + filter' className='absolute top-0 z-10 grid w-screen h-full'>
        <div className='hero-image w-full h-full'/>
      </div>

      <div id='text + cta' className='flex justify-center z-20 items-center bg-black/40'>

        <div className='flex flex-col'>
          <h1 className=' font-custom_1 text-size-hero text-[var(--brand-white)] tracking-wide uppercase text-center  md:mx-auto md:w-[450px] lg:w-[750px]'>
            Nouveau concept, plus qu'un barbier
          </h1>

          <div className='grid py-2 lg:py-5 justify-center items-center'>
            <Link to={'/rendez-vous'} className='button-2'>Réserver Maintenant</Link>
          </div>
        </div>
      
      </div>


    </div>
  )
}
const TextBelt = () => {
  return(
    <div className='grid justify-center font-custom_1 text-center pt-5 pb-10'>

      <h4 className='text-design-h4'>Expérience premium</h4>

      <h2 className='text-design-h2'>Dévouement au style</h2>

      <p className='text-design-p'>
      Nous croyons que chaque coupe est une œuvre d’art et chaque client mérite une attention personnalisée.
       Forts d’une expertise raffinée et d’un œil pour le détail, nous combinons techniques traditionnelles et tendances modernes pour sublimer votre style.
        Notre salon, conçu pour offrir confort et élégance, est plus qu’un lieu de soin : c’est une expérience où qualité et passion se rencontrent. 
         Faites l’expérience d’un service premium et laissez-nous redéfinir votre routine de grooming avec dévouement et style.
      </p>

    </div>
  )
}

const ImageBelt = () => {
  return(
    <div className='relative grid belt-image'>

      {/* <div id='image holder' className='absolute top-0 z-10 grid w-screen h-full'>
        <div className='belt-image w-full h-full absolute top-0 z-'/>
      </div> */}

      <div className='font-custom_1 text-center text-[var(--brand-white)] grid justify-center items-center pt-5 pb-10 backdrop-blur-[2px] backdrop-grayscale bg-black/40'>

        <h4 className='text-design-h4 text-white'>Pourquoi Nous?</h4>
        <h2 className='text-design-h2 text-white'>Car vous méritez le meilleur</h2>

      </div>

      

    </div>
  )
}

const PourcentageBelt = () => {
  return(
    <div className='font-custom_1 grid gap-5 justify-center items-center pt-20 pb-20'>

      <div className='grid gap-5 md:grid-cols-2'>
        <label className='text-center text-size-large'>
          <span className='font-bold'>+ 300</span> Clients fidèles
        </label>

        <label className='text-center text-size-large'>
          Satisfaction à <span className='font-bold'>100%</span>
        </label>

      </div>

      {/* <div className='text-center border-b-[0.05rem] border-[var(--brand-black)] mx-14 mt-10 mb-5'></div> */}


      <div className='grid md:mx-32 mt-5 md:mt-10'>
        <Link to={'/a-propos'} className='button-1 text-center'>Savoir plus</Link>
      </div>

    </div>  
  )
}

const GallerySection = ({imageList}) => {
  return(
    <div className='grid px-10 pb-20 bg-[var(--brand-black)] text-[var(--brand-white)]'>

      <h3 className='section-title'>
        Galerie
      </h3>
{/* 
      <div className='grid grid-cols-2 gap-5'>
        <div className='grid justify-center'>
          <img src={IMAGE_1} className='max-w-[350px]'/>
        </div>
          
        <div className='grid justify-center'>
          <img src={IMAGE_5} className='max-w-[350px]'/>
        </div>
          
        <div className='grid justify-center'>
          <img src={IMAGE_6} className='max-w-[350px]'/>
        </div>
          
        <div className='grid justify-center'>
          <img src={IMAGE_8} className='max-w-[350px]'/>
        </div>
      </div> */}

      <div className='mx-auto grid lg:w-[500px]'>
        <Carousel imageList={[IMAGE_1,IMAGE_5,IMAGE_6,IMAGE_8]} autoPlay={10} />
      </div>

      {/* <div className='grid md:mx-32 mt-5 md:mt-10'>
        <Link to={'/gallerie'} className='button-2 text-center'>Découvrir d'avance</Link>
      </div> */}

    </div>
  )
}

const ContactSection = () => {

  const [fullName,setFullName] = useState('')
  const [email,setEmail] = useState('')
  const [phone,setPhone] = useState('')
  const [message,setMessage] = useState('')
  const [requestMessage,setRequestMessage] = useState('')

  const contactFormRef = useRef()

  function handleSubmit(e){
    e.preventDefault();
    
    emailjs.sendForm(import.meta.env.VITE_REACT_APP_EMAILJS_SERVICE_ID, "template_hivji9c", e.target,import.meta.env.VITE_REACT_APP_EMAILJS_USER_ID)
    .then((result) => {
      setRequestMessage("Votre email a bien été envoyé !")
      // Add any success message or logic here
  }, (error) => {
      console.error('Email sending failed:', error);
      
      setRequestMessage("Erreur lors de l'envois de votre email")
      // Add any error handling logic here
  });

  }

  const ContactCard = ({Icon,Text_1,Text_2}) => {
    return(
      <div className='flex justify-start border-[0.15rem] border-[var(--brand-black)] bg-[var(--brand-black)] '>

        <div className='text-3xl xl:text-5xl p-5 mr-auto text-[var(--brand-white)] bg-[var(--brand-black)] '>
          {Icon}
        </div>

        <div className='w-full grid'>
          <label className='pl-1 text-xl xl:text-3xl text-start my-auto bg-[var(--brand-white)]'>{Text_1}</label>
          <label className='pl-1 text-base xl:text-xl tracking-wider text-[var(--brand-white)]'>{Text_2}</label>
        </div>

      </div>
    )
  }

  return(
    <div className='font-custom_1 grid pb-20'>

      <h3 className='section-title'>
        Contactez-nous
      </h3>

      <p className='pb-5 px-3 md:px-5 text-size-normal xl:w-[1000px]'>
      Nous sommes là pour répondre à toutes vos questions dans le but de vous offrir la meilleure expérience.
      Vous pouvez remplir le formulaire, nous appeler ou nous envoyer un e-mail.
      <br/><br/>À très bientôt,<br/>
      M77
      </p>

      <div className='flex flex-col items-center gap-5 lg:flex-row lg:items-start'>
        <div className='grid gap-5'>
          <ContactCard Icon={<FaPhoneAlt/>} Text_1={'Contactez-nous par téléphone'} Text_2={INFO_DATA.mirco.contact_phone} />
          <ContactCard Icon={<TfiEmail/>} Text_1={'Envoyez-nous un email'} Text_2={INFO_DATA.mirco.contact_email} />
        </div>

        <form ref={contactFormRef} onSubmit={handleSubmit} className='grid gap-3 w-[350px] md:w-[450x] lg:w-[550px] xl:text-xl'>

          <input id='user_name' name='user_name' onChange={(e)=>{setFullName(e.target.value)}} type='text' placeholder='Nom et Prénom' className='input-designed-1 '/>
          <input id='user_email' name='user_email' onChange={(e)=>{setEmail(e.target.value)}} type='email' placeholder='example@email.com' className='input-designed-1 ' />
          <input id='user_phone' name='user_phone' onChange={(e)=>{setPhone(e.target.value)}} type='tel' placeholder='Numéro Téléphone' className='input-designed-1' />
          <textarea id='user_message' name='user_message' onChange={(e)=>{setMessage(e.target.value)}} type='text' placeholder='Votre message ici...' className='input-designed-1 lg:h-[100px]' />

          <div className='grid'>
            <button type='submit' className='button-1'>Envoyer</button>
          </div>

        </form>
        <label className='font-custom_1 text-lg text-center'>{requestMessage}</label>
      </div>

    </div>
  )
}



