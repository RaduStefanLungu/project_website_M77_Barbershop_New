import React from 'react'

import { HiScissors } from "react-icons/hi";
import { TbBottle } from "react-icons/tb";
import { LuHeartHandshake } from "react-icons/lu";
import { SlLocationPin } from "react-icons/sl";
import { Link } from 'react-router-dom';




const About = () => {
  return (
    <div className="bg-gray-50 text-gray-800 py-12 font-custom_1">
      {/* SEO Metadata */}
      <head>
        <title>À propos de M77 Barber - Salon de coiffure et barbier premium à Charleroi</title>
        <meta
          name="description"
          content="Découvrez M77 Barber, un salon de coiffure et barbier premium à Charleroi. Expertise, style, et service exceptionnel pour hommes modernes."
        />
        <meta
          name="keywords"
          content="barbier Charleroi, salon de coiffure hommes, barbier premium, coiffure tendance, coupe homme, grooming, barbier traditionnel, soins pour barbe"
        />
        <meta name="author" content="M77 Barber" />
      </head>

      {/* Page Header */}
      <div className="container mx-auto text-center mb-8">
        <h1 className="text-size-large font-bold">À propos de M77 Barber</h1>
        <p className="text-design-h4 pt-3">
          Découvrez l’art du grooming masculin
        </p>
      </div>

      {/* About Section */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6 md:px-12">
        {/* Image */}
        <div className="w-full">
          <img
            src="https://via.placeholder.com/600x400"
            alt="Barbier en action chez M77 Barber"
            className="rounded-lg shadow-lg"
          />



        </div>

        {/* Text Content */}
        <div className=''>
          <h2 className="section-title tracking-normal">
            Une expertise dédiée à votre style
          </h2>
          <p className="mb-4  text-design-p px-0 leading-relaxed">
            Chez <strong className='text-[var(--brand-black)]'>M77 Barber</strong>, nous nous engageons à offrir une expérience unique et haut de gamme à
            chaque client. Que vous soyez à la recherche d’une coupe moderne, d’un soin traditionnel de la barbe, ou d’un
            moment de détente, notre équipe d’experts est là pour répondre à vos attentes. Nous combinons techniques
            traditionnelles et tendances modernes pour créer un style qui vous correspond parfaitement.
          </p>
          <p className="mb-4  text-design-p px-0 leading-relaxed">
            Fort de plusieurs années d’expérience, notre salon est conçu pour offrir un équilibre parfait entre confort
            et élégance. Nous utilisons des produits de haute qualité pour garantir des résultats impeccables, tout en
            prenant soin de votre peau et de vos cheveux.
          </p>
          <p className="mb-4  text-design-p px-0 leading-relaxed">
            Nos barbiers ne se contentent pas de suivre les tendances — ils les créent. En restant constamment à jour
            sur les dernières techniques et en collaborant avec des marques renommées, nous nous assurons que chaque
            visite chez M77 Barber dépasse vos attentes. Notre mission est de vous faire sentir et paraître à votre
            meilleur, tout en vous offrant un service exceptionnel.
          </p>
          <p className="mb-4  text-design-p px-0 leading-relaxed">
            Dans un monde où l’apparence compte de plus en plus, nous croyons qu’une coupe de cheveux ou une barbe
            parfaitement entretenue est bien plus qu’un simple soin. C’est une déclaration de confiance, un reflet de
            votre personnalité et un outil pour atteindre vos objectifs, qu’ils soient personnels ou professionnels.
          </p>
          <p className=" text-design-p px-0 leading-relaxed">
            En tant que lieu emblématique de grooming à Charleroi, <strong>M77 Barber</strong> s’efforce de cultiver une
            ambiance conviviale où chacun se sent valorisé et respecté. Vous méritez un barbier qui comprend vos besoins,
            s’adapte à votre style de vie, et vous aide à toujours mettre en avant votre meilleur visage.
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-[var(--brand-black)] py-12 mt-12">
        <div className="container mx-auto text-center">
          <h3 className="text-design-h2 text-[var(--brand-white)]">
            Pourquoi choisir M77 Barber ?
          </h3>
          {/* <ul className="space-y-4">
            <li className="text-gray-700">
              ✂️ Des coupes adaptées à chaque style, de la tradition au moderne.
            </li>
            <li className="text-gray-700">
              🧴 Utilisation de produits professionnels respectueux de votre peau.
            </li>
            <li className="text-gray-700">
              💈 Une ambiance chaleureuse et accueillante dans un salon au design élégant.
            </li>
            <li className="text-gray-700">
              🎯 Situé au cœur de Charleroi, facilement accessible et convivial.
            </li>
          </ul> */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-5 px-5 py-5'>
            <Card icon={<HiScissors/>} text={"Des coupes adaptées à chaque style, de la tradition au moderne."} />
            <Card icon={<TbBottle/>} text={"Utilisation de produits professionnels respectueux de votre peau."} />
            <Card icon={<LuHeartHandshake/>} text={"Une ambiance chaleureuse et accueillante dans un salon au design élégant."} />
            <Card icon={<SlLocationPin/>} text={"Situé à la limite de Couillet et Marcinelle, facilement accessible et convivial."} />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[var(--brand-white)] text-[var(--brand-black)] py-12 mt-12">
        <div className="container mx-auto text-center">
          <h4 className="text-design-h2">Prêt à découvrir l’expérience M77 Barber ?</h4>
          <p className="mb-6 text-size-normal">
            Prenez rendez-vous dès aujourd’hui et laissez notre équipe vous offrir le meilleur du grooming masculin.
          </p>
          <Link to="/rendez-vous" className="button-1">
            Prendre un rendez-vous
          </Link>
        </div>
      </div>
    </div>
  );
};


const Card = ({icon,text}) => {
  return(
    <div className='grid grid-rows-3 pt-5 pb-10 bg-[var(--brand-white)] text-[var(--brand-black)]'>
      <div className='row-span-1 text-5xl mx-auto'>{icon}</div>
      <p className='row-span-2 pt-0 lg:pt-5 px-5 text-center mb-auto text-size-normal'>{text}</p>
    </div>
  )
}


export default About;