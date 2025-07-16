// frontend/src/pages/Feedback.jsx
import React, { useState, useEffect } from 'react';
import { Star, Send, MessageCircle, User, Calendar, CheckCircle } from 'lucide-react';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    nom: '',
    email: '',
    contenu: '',
    note: 5
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Simulation des feedbacks existants
  useEffect(() => {
    const mockFeedbacks = [
      {
        id: 1,
        nom: "Ahmed El Yazidi",
        contenu: "Excellent service et équipe très professionnelle. Je recommande vivement ce cabinet.",
        note: 5,
        date: "2024-01-15"
      },
      {
        id: 2,
        nom: "Fatima Rifai",
        contenu: "Prise de rendez-vous facile et médecins à l'écoute. Très satisfaite du suivi.",
        note: 5,
        date: "2024-01-10"
      },
      {
        id: 3,
        nom: "Youssef Benali",
        contenu: "Service de qualité avec un système moderne. L'accès en ligne est très pratique.",
        note: 4,
        date: "2024-01-05"
      }
    ];
    setFeedbacks(mockFeedbacks);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulation de l'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ajouter le nouveau feedback
      const newId = feedbacks.length + 1;
      const feedbackToAdd = {
        id: newId,
        ...newFeedback,
        date: new Date().toISOString().split('T')[0]
      };
      
      setFeedbacks([feedbackToAdd, ...feedbacks]);
      setNewFeedback({ nom: '', email: '', contenu: '', note: 5 });
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const renderInteractiveStars = (rating, onChange) => {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={24}
            className={`cursor-pointer transition-colors ${
              i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={() => onChange(i + 1)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Votre Avis Compte
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Partagez votre expérience avec notre cabinet médical. 
            Vos commentaires nous aident à améliorer nos services.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulaire de feedback */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
              <MessageCircle className="mr-3 text-blue-600" />
              Laissez votre avis
            </h2>

            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                <CheckCircle className="mr-2" size={20} />
                Merci pour votre retour ! Votre avis a été envoyé avec succès.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={newFeedback.nom}
                  onChange={(e) => setNewFeedback({...newFeedback, nom: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre nom"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newFeedback.email}
                  onChange={(e) => setNewFeedback({...newFeedback, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note *
                </label>
                {renderInteractiveStars(newFeedback.note, (rating) => 
                  setNewFeedback({...newFeedback, note: rating})
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {newFeedback.note}/5 étoiles
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre commentaire *
                </label>
                <textarea
                  value={newFeedback.contenu}
                  onChange={(e) => setNewFeedback({...newFeedback, contenu: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                  placeholder="Partagez votre expérience avec notre cabinet..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="mr-2" size={20} />
                )}
                {loading ? 'Envoi en cours...' : 'Envoyer mon avis'}
              </button>
            </form>
          </div>

          {/* Liste des feedbacks */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
              <User className="mr-3 text-green-600" />
              Avis de nos patients
            </h2>

            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {feedback.nom.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{feedback.nom}</h3>
                        <div className="flex items-center space-x-2">
                          {renderStars(feedback.note)}
                          <span className="text-sm text-gray-500">({feedback.note}/5)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      {new Date(feedback.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{feedback.contenu}</p>
                </div>
              ))}
            </div>

            {feedbacks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Statistiques de Satisfaction
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">4.7/5</div>
              <div className="text-gray-600">Note Moyenne</div>
              <div className="flex justify-center mt-2">
                {renderStars(5)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Patients Satisfaits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{feedbacks.length}</div>
              <div className="text-gray-600">Avis Reçus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;