// frontend/src/pages/About.jsx
import React from 'react';
import { Heart, Users, Shield, Clock, Award, Target, CheckCircle, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">À Propos de Notre Cabinet</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Depuis plus de 10 ans, nous nous engageons à offrir des soins de qualité 
              avec une approche moderne et personnalisée de la médecine.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Notre Mission</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Fournir des soins médicaux de haute qualité, accessibles et personnalisés 
                à tous nos patients. Nous croyons que chaque personne mérite des soins 
                médicaux respectueux, efficaces et adaptés à ses besoins spécifiques.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">Soins personnalisés et attentifs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">Technologie moderne et sécurisée</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">Accessibilité et proximité</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-green-100 p-8 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <Heart className="text-red-500 mx-auto mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-800">500+</div>
                  <div className="text-sm text-gray-600">Patients suivis</div>
                </div>
                <div className="text-center">
                  <Users className="text-blue-500 mx-auto mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-800">3</div>
                  <div className="text-sm text-gray-600">Médecins experts</div>
                </div>
                <div className="text-center">
                  <Award className="text-yellow-500 mx-auto mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-800">10+</div>
                  <div className="text-sm text-gray-600">Années d'expérience</div>
                </div>
                <div className="text-center">
                  <Clock className="text-purple-500 mx-auto mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-800">24/7</div>
                  <div className="text-sm text-gray-600">Support disponible</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Nos Valeurs
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Compassion</h3>
              <p className="text-gray-600">
                Nous traitons chaque patient avec empathie, respect et attention. Chaque interaction compte pour nous.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Intégrité</h3>
              <p className="text-gray-600">
                La transparence et l’éthique guident toutes nos décisions médicales et relationnelles.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Excellence</h3>
              <p className="text-gray-600">
                Nous nous efforçons de dépasser les attentes grâce à notre expertise et à notre passion pour la santé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement mondial */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Globe className="text-blue-500 mx-auto mb-4" size={40} />
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Engagement Communautaire</h2>
            <p className="text-lg text-gray-600">
              En plus de nos services cliniques, nous participons à des campagnes de sensibilisation,
              des journées de dépistage gratuit et des programmes éducatifs pour promouvoir une meilleure santé publique.
            </p>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default About;
