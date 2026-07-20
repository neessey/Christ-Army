import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, Users, Award, Map, ArrowRight, Printer, ShieldCheck, Ticket } from 'lucide-react';
import { EVENTS_DATA } from '../mockData';
import { Event } from '../types';

interface EventsProps {
  onRegisterEvent: (eventId: string) => void;
  registeredEventIds: string[];
}

export default function Events({ onRegisterEvent, registeredEventIds }: EventsProps) {
  const [activeEvent, setActiveEvent] = useState<Event>(EVENTS_DATA[0]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [numTickets, setNumTickets] = useState(1);

  // Countdown timer State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(activeEvent.countdownTarget) - +new Date();
      let calculatedTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        calculatedTime = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      setTimeLeft(calculatedTime);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [activeEvent]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onRegisterEvent(activeEvent.id);

    // Generate simulated ticket details
    const seatNumber = `Z-${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 200) + 10}`;
    const qrData = `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=CHRIST_ARMY_${activeEvent.id}_${seatNumber}_TICKET`;

    setTicketDetails({
      id: `CA-${Math.floor(Math.random() * 900000) + 100000}`,
      name,
      email,
      phone,
      seatNumber,
      eventName: activeEvent.title,
      eventDate: activeEvent.date,
      eventTime: activeEvent.time,
      eventLocation: activeEvent.location,
      qrUrl: qrData
    });

    // Reset Form
    setName('');
    setEmail('');
    setPhone('');
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <section id="events" className="relative py-24 bg-deep-green border-t border-gold-rich/10">
      <div className="absolute top-1/2 left-1/10 w-[500px] h-[500px] rounded-full bg-primary-green/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-rich font-semibold">Calendrier du Ministère</span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold mt-2 text-pristine-white">
            NOTRE PROGRAMME DU MOIS
          </h2>
          <p className="text-sm text-neutral-gray max-w-xl mx-auto mt-4 font-light">
            Participez physiquement ou connectez-vous en direct à notre programme pour vivre d'authentiques moments dans la présences de Dieu.
          </p>
          <div className="w-16 h-[2px] bg-gold-rich mx-auto mt-4" />
        </div>

        {/* Highlighted Event Panel with Countdown */}
        <div className="luxury-glass p-8 md:p-12 rounded-2xl border border-gold-rich/25 bg-gradient-to-br from-deep-green to-primary-green/10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Event Media Banner & Timer */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-xl overflow-hidden border border-gold-rich/15">
                <img
                  src={activeEvent.imageUrl}
                  alt={activeEvent.title}
                  className="w-full h-auto object-cover aspect-[4/3]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-green/90 via-transparent to-transparent" />
              </div>

              {/* Spectacular Countdown Box */}
              <div className="p-5 rounded-xl border border-gold-rich/20 bg-deep-green/80 shadow-md">
                <span className="text-[10px] font-mono uppercase text-gold-rich tracking-widest text-center block mb-3">
                  Début de l'événement dans :
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-primary-green/20 p-2.5 rounded border border-gold-rich/10">
                    <span className="block font-mono text-xl md:text-2xl font-bold text-gold-bright">{timeLeft.days}</span>
                    <span className="text-[8px] uppercase tracking-wider text-neutral-gray font-mono">Jours</span>
                  </div>
                  <div className="bg-primary-green/20 p-2.5 rounded border border-gold-rich/10">
                    <span className="block font-mono text-xl md:text-2xl font-bold text-gold-bright">{timeLeft.hours}</span>
                    <span className="text-[8px] uppercase tracking-wider text-neutral-gray font-mono">Heures</span>
                  </div>
                  <div className="bg-primary-green/20 p-2.5 rounded border border-gold-rich/10">
                    <span className="block font-mono text-xl md:text-2xl font-bold text-gold-bright">{timeLeft.minutes}</span>
                    <span className="text-[8px] uppercase tracking-wider text-neutral-gray font-mono">Min</span>
                  </div>
                  <div className="bg-primary-green/20 p-2.5 rounded border border-gold-rich/10">
                    <span className="block font-mono text-xl md:text-2xl font-bold text-gold-bright">{timeLeft.seconds}</span>
                    <span className="text-[8px] uppercase tracking-wider text-neutral-gray font-mono">Sec</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Description details */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono text-gold-bright uppercase tracking-widest font-semibold">
                  Thème du Programme
                </span>
                <h3 className="font-cinzel text-3xl md:text-4xl font-bold text-pristine-white tracking-wide mt-1">
                  {activeEvent.title}
                </h3>
              </div>

              <p className="text-sm text-neutral-gray leading-relaxed font-light">
                {activeEvent.description}
              </p>

              {/* Meta information tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-gold-rich/5 py-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gold-rich shrink-0" />
                  <span className="text-xs text-neutral-gray">{activeEvent.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gold-rich shrink-0" />
                  <span className="text-xs text-neutral-gray">{activeEvent.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gold-rich shrink-0" />
                  <span className="text-xs text-neutral-gray">{activeEvent.location}</span>
                </div>
              </div>

              {/* Full program schedule */}
              <div className="space-y-2">
                <h4 className="font-cinzel text-xs font-bold text-gold-bright tracking-widest uppercase">Programme complet :</h4>
                <div className="space-y-1.5 pl-3 border-l-2 border-gold-rich">
                  {activeEvent.fullProgram.map((prog, i) => (
                    <p key={i} className="text-xs text-neutral-gray font-light">
                      {prog}
                    </p>
                  ))}
                </div>
              </div>

              {/* CTA Seat Registration */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">

                {registeredEventIds.includes(activeEvent.id) ? (
                  <div className="px-5 py-3 rounded-lg bg-gold-rich/10 border border-gold-rich/30 text-gold-bright font-medium flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-gold-bright" />
                    Inscrit avec succès !
                  </div>
                ) : (
                  <button
                    onClick={() => setShowFormModal(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold uppercase text-xs tracking-wider hover:shadow-lg transition-all"
                  >
                    Obtenir mon Ticket Gratuit
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* --- REGISTRATION AND TICKET GENERATION MODAL --- */}
        <AnimatePresence>
          {showFormModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowFormModal(false);
                  setTicketDetails(null);
                }}
                className="absolute inset-0 bg-deep-green/80 backdrop-blur-md"
              />

              {/* Form Content container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-lg luxury-glass p-8 rounded-2xl border border-gold-rich/35 shadow-2xl z-10 bg-deep-green"
              >
                {ticketDetails ? (
                  /* GORGEOUS TICKET REWARD CARD */
                  <div className="space-y-6 print:p-0">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gold-rich/10 border border-gold-rich/30 flex items-center justify-center text-gold-bright mx-auto mb-3">
                        <Ticket className="w-6 h-6 animate-pulse" />
                      </div>
                      <h3 className="font-cinzel text-xl font-bold text-pristine-white">Votre Ticket d'Accès</h3>
                      <p className="text-xs text-neutral-gray">Présentez ce QR Code au guichet d'accueil protocolairre.</p>
                    </div>

                    {/* Physical Ticket Simulation */}
                    <div className="p-6 rounded-xl border-2 border-dashed border-gold-rich/30 bg-primary-green/10 flex flex-col items-center text-center relative overflow-hidden">
                      {/* Left-right notch simulations */}
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-deep-green border-r border-gold-rich/30" />
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-deep-green border-l border-gold-rich/30" />

                      <div className="w-full pb-4 border-b border-gold-rich/10 mb-4">
                        <span className="text-[10px] font-mono text-gold-bright tracking-widest block uppercase">Billet Officiel</span>
                        <h4 className="font-cinzel text-base font-bold text-pristine-white truncate mt-1">
                          {ticketDetails.eventName}
                        </h4>
                      </div>

                      {/* QR Code */}
                      <div className="p-2.5 bg-white rounded-lg mb-4">
                        <img
                          src={ticketDetails.qrUrl}
                          alt="Ticket QR Code"
                          className="w-32 h-32"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full text-left font-mono text-[10px] text-neutral-gray mb-2">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-gold-rich">Date & Heure</span>
                          <span className="text-pristine-white text-xs">{ticketDetails.eventDate}</span>
                          <span className="block text-[9px] mt-0.5">{ticketDetails.eventTime}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-gold-rich">Lieu</span>
                          <span className="text-pristine-white text-xs block truncate">{ticketDetails.eventLocation}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-gold-rich">Bénéficiaire</span>
                          <span className="text-pristine-white text-xs block truncate">{ticketDetails.name}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-gold-rich">N° Siège</span>
                          <span className="text-gold-bright text-xs font-bold font-mono">{ticketDetails.seatNumber}</span>
                        </div>
                      </div>

                      <div className="w-full pt-4 border-t border-gold-rich/10 text-center font-mono text-[9px] text-neutral-gray">
                        Ref: {ticketDetails.id} • Christ Army Protocol Guard
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        onClick={handlePrintTicket}
                        className="w-1/2 py-2.5 border border-gold-rich/20 text-gold-bright rounded text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold-rich hover:text-deep-green transition-all"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimer
                      </button>
                      <button
                        onClick={() => {
                          setShowFormModal(false);
                          setTicketDetails(null);
                        }}
                        className="w-1/2 py-2.5 bg-gold-rich text-deep-green font-bold rounded text-xs font-mono uppercase tracking-widest text-center"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                ) : (
                  /* BOOKING FORM */
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gold-rich tracking-widest block">Réservation</span>
                      <h3 className="font-cinzel text-xl font-bold text-pristine-white">
                        S'enregistrer à l'événement
                      </h3>
                      <p className="text-xs text-neutral-gray mt-1">
                        Inscrivez-vous pour réserver votre siège et générer votre QR-Code d'accès gratuit.
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
                          placeholder="Ex: Sœur Jeanne Kouadio"
                          className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Adresse Email</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Ex: jeanne@gmail.com"
                            className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Téléphone mobile</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="Ex: +225 07 12 34 56 78"
                            className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Nombre de places réservées</label>
                        <select
                          value={numTickets}
                          onChange={e => setNumTickets(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded bg-primary-green/20 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none"
                        >
                          <option value="1">1 Place (Siège Personnel)</option>
                          <option value="2">2 Places (Duo Fraternel)</option>
                          <option value="3">3 Places (Famille de base)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowFormModal(false)}
                        className="w-1/2 py-2.5 border border-gold-rich/10 text-neutral-gray hover:text-pristine-white rounded text-xs font-mono uppercase tracking-widest transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-2.5 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold rounded text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-md transition-shadow"
                      >
                        <Ticket className="w-4 h-4" />
                        Générer mon Billet
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
