import React from "react";

const TaC = () => {
  const today = new Date().toLocaleDateString("fr-FR");

  scrollToTop();

  return (
    <div className="container mx-auto px-6 py-10 font-custom_1">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Termes et Conditions</h1>

      {/* Section 1 - Introduction */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">1. Introduction</h2>
        <p className="text-gray-600">
          Bienvenue sur notre site web. En accédant et en utilisant ce site, vous acceptez les présentes conditions générales. 
          Si vous n'acceptez pas ces termes, veuillez ne pas utiliser notre site.
        </p>
      </section>

      {/* Section 2 - Données personnelles */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">2. Collecte et Utilisation des Données Personnelles</h2>
        <p className="text-gray-600">
          Nous collectons des informations personnelles lorsque vous utilisez notre formulaire de **contact** 
          et notre système de **prise de rendez-vous**. Ces informations comprennent :
        </p>
        <ul className="list-disc pl-5 text-gray-600 mt-2">
          <li>Nom et prénom</li>
          <li>Adresse e-mail</li>
          <li>Numéro de téléphone</li>
          <li>Date et heure du rendez-vous</li>
          <li>Service sélectionné</li>
          <li>Message (dans la section Contact)</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-700 mt-4">2.1 Confidentialité des Données</h3>
        <p className="text-gray-600">
          - Nous nous engageons à protéger vos données et à ne pas les partager avec des tiers sans votre consentement.<br/>
          - Vos informations ne seront utilisées que pour vous contacter, confirmer vos rendez-vous ou répondre à vos demandes.<br/>
          - Vous avez le droit de demander la suppression de vos données en nous contactant via notre formulaire.
        </p>

        <h3 className="text-lg font-semibold text-gray-700 mt-4">2.2 Sécurité</h3>
        <p className="text-gray-600">
          Nous mettons en œuvre des **mesures de sécurité** pour protéger vos informations contre tout accès non autorisé.
        </p>
      </section>

      {/* Section 3 - Prise de rendez-vous */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">3. Prise de Rendez-Vous</h2>
        <p className="text-gray-600">
          Lorsque vous prenez rendez-vous via notre site :
        </p>
        <ul className="list-disc pl-5 text-gray-600 mt-2">
          <li>Vous acceptez que votre réservation soit confirmée par e-mail ou SMS.</li>
          <li>Les modifications ou annulations doivent être effectuées **au moins 24 heures à l’avance**.</li>
          <li>Nous nous réservons le droit d’annuler ou de refuser une réservation si nécessaire.</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-700 mt-4">3.1 Absences et Retards</h3>
        <p className="text-gray-600">
          - En cas d'absence **sans annulation préalable**, nous pouvons refuser de futures réservations.<br/>
          - Un retard de plus de **15 minutes** peut entraîner une annulation du rendez-vous.
        </p>
      </section>

      {/* Section 4 - Limitation de responsabilité */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">4. Limitation de Responsabilité</h2>
        <p className="text-gray-600">
          - Nous ne sommes pas responsables des erreurs techniques empêchant la prise de rendez-vous.<br/>
          - Nous ne garantissons pas la disponibilité des créneaux horaires demandés.<br/>
          - Notre site peut contenir des liens vers des services tiers (ex: réseaux sociaux), pour lesquels nous ne sommes pas responsables.
        </p>
      </section>

      {/* Section 5 - Propriété intellectuelle */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">5. Propriété Intellectuelle</h2>
        <p className="text-gray-600">
          - Tout le contenu du site (logos, textes, images) est **notre propriété** et ne peut être utilisé sans autorisation.<br/>
          - Toute reproduction ou utilisation sans autorisation peut faire l’objet de poursuites.
        </p>
      </section>

      {/* Section 6 - Modifications */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">6. Modification des Termes et Conditions</h2>
        <p className="text-gray-600">
          Nous nous réservons le droit de modifier ces termes à tout moment. Les modifications seront effectives dès leur publication sur le site.
        </p>
      </section>

      {/* Section 7 - Contact */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">7. Contact</h2>
        <p className="text-gray-600">
          Pour toute question, vous pouvez nous contacter via notre **formulaire de contact** ou par téléphone.
        </p>
      </section>

      {/* Date de mise à jour */}
      <p className="text-sm text-gray-500 mt-10 text-center">
        📅 Dernière mise à jour : {today}
      </p>
    </div>
  );
};


const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth", // Optional: "smooth" for animated scroll or "auto" for instant scroll
    })}

export default TaC;
