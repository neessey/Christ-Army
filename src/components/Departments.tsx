import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Compass, Music, Share2, Sliders, Shield, BookOpen, Video, Activity, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { DEPARTMENTS_DATA } from '../mockData';
import { Department } from '../types';

// Map icon name to Lucide Icon
const iconMap: Record<string, React.ComponentType<any>> = {
  Flame,
  Compass,
  Music,
  Share2,
  Sliders,
  Shield,
  BookOpen,
  Video,
  Activity
};

interface DepartmentsProps {
  onJoinDepartment: (departmentId: string, formData: any) => void;
  joinedDepartmentIds: string[];
}

export default function Departments({ onJoinDepartment, joinedDepartmentIds }: DepartmentsProps) {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Côte d\'Ivoire');
  const [motivation, setMotivation] = useState('');
  const [availability, setAvailability] = useState('Semaine et Week-end');

  const selectedDept = DEPARTMENTS_DATA.find(d => d.id === selectedDeptId);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;

    onJoinDepartment(selectedDeptId, {
      name,
      phone,
      email,
      country,
      motivation,
      availability
    });

    setSubmitted(true);
    setTimeout(() => {
      setShowJoinModal(false);
      setSubmitted(false);
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setMotivation('');
    }, 2500);
  };

  return (
    <section id="departments" className="relative py-24 bg-gradient-to-b from-primary-green/10 to-deep-green border-t border-gold-rich/10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-rich/3 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          {!selectedDeptId ? (
            /* --- GRID VIEW OF ALL DEPARTMENTS --- */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-16">
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-rich">Nos Départements</span>
                <h2 className="font-cinzel text-4xl md:text-5xl font-bold mt-2 text-pristine-white">
                  LES DÉPARTEMENTS 
                </h2>
                <p className="text-sm text-neutral-gray max-w-xl mx-auto mt-4 font-light">
                  Chaque département est un pilier actif du ministère. Découvrez leur mission, leurs exigences et rejoignez l'armée du Christ en service.
                </p>
                <div className="w-16 h-[2px] bg-gold-rich mx-auto mt-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {DEPARTMENTS_DATA.map((dept, idx) => {
                  const IconComponent = iconMap[dept.iconName] || Shield;
                  const isJoined = joinedDepartmentIds.includes(dept.id);

                  return (
                    <motion.div
                      key={dept.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="group luxury-glass rounded-2xl overflow-hidden hover:border-gold-rich/40 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="h-44 relative overflow-hidden">
                        <img
                          src={dept.image}
                          alt={dept.name}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/90 via-deep-green/45 to-transparent" />
                        <div className="absolute top-4 left-4 w-10 h-10 rounded-lg bg-gold-rich/20 backdrop-blur-md flex items-center justify-center text-gold-bright border border-gold-rich/30">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {isJoined && (
                          <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded bg-gold-rich text-deep-green text-xs font-bold tracking-widest uppercase">
                            Membre
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-cinzel text-lg font-bold text-pristine-white mb-2 tracking-wide group-hover:text-gold-bright transition-colors">
                            {dept.name}
                          </h3>
                          <p className="text-xs font-serif italic text-gold-rich/80 mb-3 block">
                            Resp: {dept.headOfDepartment}
                          </p>
                          <p className="text-sm text-neutral-gray font-light leading-relaxed mb-6">
                            {dept.description}
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedDeptId(dept.id)}
                          className="w-full py-2.5 rounded border border-gold-rich/20 bg-primary-green/20 hover:bg-gold-rich hover:text-deep-green text-xs text-gold-bright font-mono uppercase tracking-widest transition-all duration-300"
                        >
                         Rejoindre
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* --- IMMERSIVE DEDICATED DEPARTMENT PAGE VIEW --- */
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="luxury-glass p-8 md:p-12 rounded-2xl border border-gold-rich/25 bg-gradient-to-br from-deep-green/90 to-primary-green/10"
            >
              {/* Back button */}
              <button
                onClick={() => setSelectedDeptId(null)}
                className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-gold-bright hover:text-pristine-white transition-colors mb-8 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Retour aux départements
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Department Info & Image */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="relative rounded-xl overflow-hidden border border-gold-rich/20">
                    <img
                      src={selectedDept?.image}
                      alt={selectedDept?.name}
                      className="w-full h-auto object-cover aspect-[4/3]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-green/90 to-transparent" />
                  </div>

                  <div className="p-5 rounded-lg bg-deep-green/60 border border-gold-rich/10 text-center italic">
                    <p className="font-serif text-base text-neutral-gray mb-2">
                      {selectedDept?.verse}
                    </p>
                  </div>

                  <div className="p-5 rounded-lg bg-deep-green/60 border border-gold-rich/10">
                    <span className="text-xs font-mono text-gold-rich uppercase tracking-wider block mb-1">
                      Responsable du Département
                    </span>
                    <span className="text-lg font-cinzel font-bold text-pristine-white">
                      {selectedDept?.headOfDepartment}
                    </span>
                  </div>

                  {joinedDepartmentIds.includes(selectedDept?.id || '') ? (
                    <div className="p-4 rounded-lg bg-gold-rich/10 border border-gold-rich/30 text-center text-gold-bright font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-gold-bright" />
                      Vous avez déjà rejoint ce département !
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="w-full py-4 rounded-lg bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold uppercase text-sm tracking-wider hover:shadow-lg transition-all duration-300"
                    >
                       Rejoindre ce Département
                    </button>
                  )}
                </div>

                {/* Requirements & Responsibilities */}
                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <span className="text-xs font-mono text-gold-rich uppercase tracking-widest block mb-1">Département</span>
                    <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-pristine-white tracking-wide">
                      {selectedDept?.name}
                    </h2>
                    <div className="w-12 h-[1px] bg-gold-rich mt-3" />
                  </div>

                  <div>
                    <h3 className="font-cinzel text-lg font-semibold text-gold-bright mb-3">La Vocation Majeure</h3>
                    <p className="text-neutral-gray leading-relaxed font-light">
                      {selectedDept?.longDescription}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-cinzel text-lg font-semibold text-gold-bright mb-3">Critère</h3>
                    <ul className="space-y-2">
                      {selectedDept?.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-gray font-light">
                          <span className="text-gold-rich font-bold mr-1">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-cinzel text-lg font-semibold text-gold-bright mb-3">Mission</h3>
                    <ul className="space-y-2">
                      {selectedDept?.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-gray font-light">
                          <span className="text-gold-rich font-bold mr-1">•</span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- APPLICATION / RECRUITMENT MODAL --- */}
        <AnimatePresence>
          {showJoinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowJoinModal(false)}
                className="absolute inset-0 bg-deep-green/80 backdrop-blur-md"
              />

              {/* Form card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative w-full max-w-lg luxury-glass p-8 rounded-2xl border border-gold-rich/35 shadow-2xl z-10 bg-deep-green"
              >
                {submitted ? (
                  <div className="text-center py-12 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gold-rich/10 border border-gold-rich/30 flex items-center justify-center text-gold-bright animate-bounce">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="font-cinzel text-2xl font-bold text-pristine-white">Candidature Envoyée !</h3>
                    <p className="text-sm text-neutral-gray max-w-xs leading-relaxed">
                      Votre demande pour rejoindre le département <strong>{selectedDept?.name}</strong> a bien été enregistrée. Le secrétariat du protocole prendra contact avec vous rapidement.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleJoinSubmit} className="space-y-5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gold-rich tracking-widest block">Candidature Département</span>
                      <h3 className="font-cinzel text-xl font-bold text-pristine-white">
                        Rejoindre {selectedDept?.name}
                      </h3>
                      <p className="text-xs text-neutral-gray mt-1">
                        Remplissez ce formulaire d'engagement avec intégrité.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Nom complet</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Ex: Frère Arthur Konan"
                          className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Téléphone WhatsApp</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="Ex: +225 07 00 00 00 00"
                            className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Adresse Email</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Ex: arthur@gmail.com"
                            className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Pays de résidence</label>
                          <select
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                            className="w-full px-4 py-2.5 rounded bg-primary-green/20 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none"
                          >
                            <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                            <option value="France">France</option>
                            <option value="Cameroun">Cameroun</option>
                            <option value="Sénégal">Sénégal</option>
                            <option value="Gabon">Gabon</option>
                            <option value="Canada">Canada</option>
                            <option value="États-Unis">États-Unis</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Disponibilité</label>
                          <select
                            value={availability}
                            onChange={e => setAvailability(e.target.value)}
                            className="w-full px-4 py-2.5 rounded bg-primary-green/20 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none"
                          >
                            <option value="Semaine et Week-end">Semaine & Week-end</option>
                            <option value="Uniquement le Week-end">Week-end Uniquement</option>
                            <option value="Uniquement en Semaine">Semaine Uniquement</option>
                            <option value="Selon les besoins">Selon les besoins</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Pourquoi souhaitez-vous servir ici ?</label>
                        <textarea
                          required
                          rows={3}
                          value={motivation}
                          onChange={e => setMotivation(e.target.value)}
                          placeholder="Décrivez brièvement votre appel ou motivation spirituelle..."
                          className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowJoinModal(false)}
                        className="w-1/2 py-2.5 border border-gold-rich/10 text-neutral-gray hover:text-pristine-white rounded text-xs font-mono uppercase tracking-widest transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-2.5 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold rounded text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-md transition-shadow"
                      >
                        <Send className="w-4 h-4" />
                        Soumettre
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
