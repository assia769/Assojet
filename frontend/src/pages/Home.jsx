// frontend/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Heart, Shield, Clock, MapPin, Phone, Mail, Star, ChevronRight, Activity, Award, FileText } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Cabinet de Médecine <span className="text-emerald-300">Générale</span>
            </h1>
            <p className="text-xl mb-12 leading-relaxed opacity-90">
              Votre santé, notre priorité. Un service médical moderne et personnalisé 
              pour vous accompagner dans votre bien-être quotidien.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/login" 
                className="group bg-white text-emerald-600 px-10 py-4 rounded-full font-semibold hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                Se connecter
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link 
                to="/register" 
                className="group border-2 border-white text-white px-10 py-4 rounded-full font-semibold hover:bg-white hover:text-emerald-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                S'inscrire
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Nos Services <span className="text-emerald-600">Médicaux</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Des soins complets et personnalisés pour toute la famille
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Heart className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 text-center">
                Consultations Générales
              </h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Consultations médicales complètes avec des médecins expérimentés 
                pour tous vos besoins de santé et un suivi personnalisé.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Calendar className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 text-center">
                Gestion des Rendez-vous
              </h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Système de prise de rendez-vous en ligne simple et efficace 
                avec rappels automatiques et planning flexible.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Shield className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 text-center">
                Dossiers Sécurisés
              </h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Gestion sécurisée de vos dossiers médicaux avec accès 
                personnalisé, confidentiel et disponible 24h/24.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Nos Résultats en <span className="text-emerald-300">Chiffres</span>
            </h2>
            <p className="text-xl opacity-90">
              La confiance de nos patients, notre plus grande réussite
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm">
              <div className="text-5xl font-bold mb-3">500+</div>
              <div className="text-emerald-200 text-lg">Patients Satisfaits</div>
            </div>
            <div className="text-center p-6 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm">
              <div className="text-5xl font-bold mb-3">3</div>
              <div className="text-emerald-200 text-lg">Médecins Experts</div>
            </div>
            <div className="text-center p-6 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm">
              <div className="text-5xl font-bold mb-3">2000+</div>
              <div className="text-emerald-200 text-lg">Consultations</div>
            </div>
            <div className="text-center p-6 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm">
              <div className="text-5xl font-bold mb-3">24/7</div>
              <div className="text-emerald-200 text-lg">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Pourquoi <span className="text-emerald-600">Nous Choisir</span> ?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une approche moderne et humaine de la médecine
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-full flex-shrink-0">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">Équipe Professionnelle</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Des médecins qualifiés et une équipe dévouée à votre service, 
                    formés aux dernières techniques médicales.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full flex-shrink-0">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">Horaires Flexibles</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Ouvert 7j/7 avec des créneaux adaptés à vos besoins, 
                    y compris les urgences et consultations d'urgence.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-3 rounded-full flex-shrink-0">
                  <Activity className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">Soins Personnalisés</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Approche personnalisée pour chaque patient avec un 
                    suivi médical adapté à vos besoins spécifiques.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-10 rounded-3xl shadow-xl border border-emerald-100">
              <h3 className="text-3xl font-bold mb-8 text-slate-800 flex items-center">
                <MapPin className="text-emerald-600 mr-3" size={32} />
                Informations Pratiques
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <MapPin className="text-emerald-600" size={20} />
                  </div>
                  <span className="text-slate-700 font-medium">123 Rue de la Santé, Casablanca</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Phone className="text-blue-600" size={20} />
                  </div>
                  <span className="text-slate-700 font-medium">+212 5 22 XX XX XX</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <Mail className="text-teal-600" size={20} />
                  </div>
                  <span className="text-slate-700 font-medium">contact@cabinet-medical.ma</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="text-orange-600" size={20} />
                  </div>
                  <span className="text-slate-700 font-medium">Lun-Ven: 8h-18h | Sam: 8h-14h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Témoignages de nos <span className="text-emerald-600">Patients</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Leur confiance et satisfaction sont notre plus belle récompense
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                  ))}
                </div>
                <div className="ml-3 bg-emerald-100 px-3 py-1 rounded-full">
                  <span className="text-emerald-600 font-semibold text-sm">Excellent</span>
                </div>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed italic">
                "Excellent service et équipe très professionnelle. 
                Je recommande vivement ce cabinet pour la qualité des soins."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold">AE</span>
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-slate-800">Ahmed El Yazidi</div>
                  <div className="text-slate-500 text-sm">Patient depuis 2 ans</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                  ))}
                </div>
                <div className="ml-3 bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-blue-600 font-semibold text-sm">Excellent</span>
                </div>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed italic">
                "Prise de rendez-vous facile et médecins à l'écoute. 
                Très satisfaite du suivi et de la disponibilité."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">FR</span>
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-slate-800">Fatima Rifai</div>
                  <div className="text-slate-500 text-sm">Patient depuis 1 an</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                  ))}
                  <Star size={20} className="text-slate-300" />
                </div>
                <div className="ml-3 bg-teal-100 px-3 py-1 rounded-full">
                  <span className="text-teal-600 font-semibold text-sm">Très bien</span>
                </div>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed italic">
                "Service de qualité avec un système moderne. 
                L'accès en ligne est très pratique et efficace."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold">YB</span>
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-slate-800">Youssef Benali</div>
                  <div className="text-slate-500 text-sm">Patient depuis 6 mois</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à Prendre Soin de <span className="text-emerald-300">Votre Santé</span> ?
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
            Rejoignez nos patients satisfaits et bénéficiez d'un suivi médical personnalisé 
            avec notre équipe d'experts dédiée à votre bien-être.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/register" 
              className="group bg-white text-emerald-600 px-10 py-4 rounded-full font-bold hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <Award className="mr-3" size={20} />
              Commencer Maintenant
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link 
              to="/about" 
              className="group border-2 border-white text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-emerald-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <FileText className="mr-3" size={20} />
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;