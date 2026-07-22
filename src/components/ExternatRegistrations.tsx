import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Send, CheckCircle, Loader2 } from 'lucide-react';
import { db } from '../lib/firestoreService'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ExternalRegistrationProps {
  whatsappGroupUrl?: string;
}

export default function ExternalRegistration({ whatsappGroupUrl = 'https://chat.whatsapp.com/LteHADsUNnt51eygOqqOeQ?mode=gi_t' }: ExternalRegistrationProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    prayerRequest: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'external_registrations'), {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        prayerRequest: formData.prayerRequest,
        createdAt: serverTimestamp(),
      });

    setLoading(false);
setSuccess(true);

setTimeout(() => {
  window.open(whatsappGroupUrl, "_blank");
}, 2000);

    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setLoading(false);
      alert("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-deep-green py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full luxury-glass p-8 rounded-2xl border border-gold-rich/25 bg-gradient-to-br from-deep-green to-primary-green/10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold-rich/10 border border-gold-rich/30 text-gold-bright mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-pristine-white">Rejoignez Christ Army</h2>
          <p className="text-neutral-gray text-sm mt-2 font-light">
            Remplissez ce formulaire pour vous inscrire et intégrer notre groupe d'accueil.
          </p>
          <div className="w-12 h-[2px] bg-gold-rich mx-auto mt-4" />
        </div>

        {success ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-gold-rich/10 border border-gold-rich/30 flex items-center justify-center text-gold-bright mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-cinzel text-xl font-semibold text-pristine-white mb-2">Inscription réussie !</h3>
            <p className="text-neutral-gray text-sm mb-6 font-light">
              Vos informations ont bien été enregistrées. Vous allez être redirigé vers WhatsApp.
            </p>
            <a
              href={whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold font-mono text-xs uppercase tracking-widest rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Accéder au groupe WhatsApp
            </a>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Nom et Prénom *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ex: Jean Kouadio"
                className="w-full px-4 py-3 rounded-xl bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm placeholder-neutral-gray/50 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Numéro WhatsApp *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ex: +225 07 00 00 00 00"
                className="w-full px-4 py-3 rounded-xl bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm placeholder-neutral-gray/50 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Email (Optionnel)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jean.kouadio@email.com"
                className="w-full px-4 py-3 rounded-xl bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm placeholder-neutral-gray/50 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Ville de résidence *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Ex: Abidjan"
                className="w-full px-4 py-3 rounded-xl bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm placeholder-neutral-gray/50 outline-none transition-colors"
              />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3.5 px-4 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold font-mono text-xs uppercase tracking-widest rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>S'inscrire et rejoindre</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}