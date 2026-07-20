import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, MessageSquare, Clock } from 'lucide-react';

export default function Contact() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // WhatsApp Chat Simulation
  const [showChatSimulator, setShowChatSimulator] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { sender: 'bot', text: 'Shalom bien-aimé ! Soyez le bienvenu sur la messagerie officielle de Christ Army. Comment le secrétariat pastoral peut-il vous assister aujourd\'hui ?', time: '09:00' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const faqs = [
    {
      q: 'Quels sont les jours et heures de culte à l\'Auditorium Central ?',
      a: 'Nous avons trois réunions majeures par semaine : le culte d\'enseignement doctrinal le Mercredi de 18h30 à 21h00, la grande veillée de combat spirituel le Vendredi de 22h00 à 02h00, et le culte d\'impact pastoral et miracles le Dimanche de 08h00 à 12h30.'
    },
    {
      q: 'Comment prendre un rendez-vous pastoral avec le Prophète Kader Josué Fadika ?',
      a: 'Les rendez-vous pastoraux et d\'écoute spirituelle ont lieu les mardis et jeudis de 09h00 à 15h00. Vous pouvez enregistrer votre demande de consultation en vous adressant directement au secrétariat via l\'outil de chat WhatsApp ou en appelant le bureau d\'accueil.'
    },
    {
      q: 'Les enseignements et livrets PDF sont-ils payants ?',
      a: 'Non, tous nos livrets d\'études bibliques, résumés prophétiques de prédications et podcasts audio sont mis gratuitement à disposition de tous les fidèles sur cette plateforme afin de nourrir la foi du plus grand nombre.'
    },
    {
      q: 'Comment sont gérés les dons et offrandes collectés ?',
      a: 'La transparence comptable est une de nos exigences fondamentales. 100% des contributions financières collectées sont affectées au loyer et à la maintenance technique de l\'auditorium, au financement des missions d\'évangélisation en brousse, et aux programmes d\'aide alimentaire pour les orphelins et les veuves.'
    }
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMessage = {
      sender: 'user',
      text: inputMsg,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');

    // Simulated reply
    setTimeout(() => {
      let botReply = 'Merci pour votre message. Un membre de notre équipe d\'accueil protocolaire ou un pasteur de permanence va traiter votre demande sous peu. Demeurez béni !';
      
      const lower = inputMsg.toLowerCase();
      if (lower.includes('prière') || lower.includes('prier')) {
        botReply = 'Votre requête de prière a bien été transférée à notre département d\'Intercession (La Colonne de Feu). Nous prions immédiatement pour votre cas. Croyez seulement !';
      } else if (lower.includes('rendez-vous') || lower.includes('voir le prophète')) {
        botReply = 'Pour fixer un rendez-vous spirituel avec le Prophète Kader Josué, merci de nous transmettre votre Nom complet, Numéro WhatsApp et la nature de votre requête. Le secrétariat vous répondra sous 24h.';
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  return (
    <section id="contact" className="relative py-24 bg-deep-green border-t border-gold-rich/10">
      <div className="absolute top-1/2 right-1/10 w-[450px] h-[450px] rounded-full bg-gold-rich/3 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-rich font-semibold">Communion Fraternelle</span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold mt-2 text-pristine-white">
            CONTACT & FOIRE AUX QUESTIONS
          </h2>
          <p className="text-sm text-neutral-gray max-w-xl mx-auto mt-4 font-light">
            Une question spirituelle ou administrative ? Écrivez au secrétariat ou parcourez nos réponses rapides.
          </p>
          <div className="w-16 h-[2px] bg-gold-rich mx-auto mt-4" />
        </div>

        {/* Contact info grid and Chat Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start">
          
          {/* Left panel: Info */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="font-cinzel text-2xl font-bold text-pristine-white tracking-wide">
              Nos Canaux de Communication
            </h3>
            <p className="text-sm text-neutral-gray leading-relaxed font-light">
              Le secrétariat général du ministère Christ Army centralise l'ensemble des courriers, requêtes de prières, signalements de témoignages et propositions de partenariats. N'hésitez pas à nous écrire directement.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary-green/10 border border-gold-rich/5 hover:border-gold-rich/15 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-rich shrink-0 border border-gold-rich/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-gold-bright uppercase tracking-wider block mb-0.5">Adresse Physique</span>
                  <span className="text-sm text-pristine-white">Auditorium Central, Zone Industrielle, Abidjan, Côte d'Ivoire</span>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary-green/10 border border-gold-rich/5 hover:border-gold-rich/15 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-rich shrink-0 border border-gold-rich/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-gold-bright uppercase tracking-wider block mb-0.5">Courriel Électronique</span>
                  <span className="text-sm text-pristine-white">secretariat@christarmy-ministry.org</span>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary-green/10 border border-gold-rich/5 hover:border-gold-rich/15 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-rich shrink-0 border border-gold-rich/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-gold-bright uppercase tracking-wider block mb-0.5">Ligne Directe</span>
                  <span className="text-sm text-pristine-white">+225 07 89 45 12 36 • +33 6 45 12 89 56</span>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary-green/10 border border-gold-rich/5 hover:border-gold-rich/15 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-rich shrink-0 border border-gold-rich/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-gold-bright uppercase tracking-wider block mb-0.5">Heures de Permanence</span>
                  <span className="text-sm text-pristine-white">Mardi au Dimanche : 08:30 - 18:00 (GMT)</span>
                </div>
              </div>
            </div>

            {/* Launch chat shortcut */}
            <button
              onClick={() => setShowChatSimulator(!showChatSimulator)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              {showChatSimulator ? "Masquer la messagerie" : "Lancer le Chat WhatsApp"}
            </button>
          </div>

          {/* Right panel: FAQ lists or WhatsApp Chat Sim */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {showChatSimulator ? (
                /* --- LIVE WHATSAPP CHAT SIMULATOR --- */
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/90 shadow-2xl h-[520px] flex flex-col justify-between"
                >
                  {/* Chat header */}
                  <div className="bg-emerald-700 p-4 flex items-center justify-between text-white border-b border-emerald-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white font-serif">
                        CA
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-mono tracking-wide">Secrétariat Christ Army</h4>
                        <span className="text-[9px] text-emerald-100 block">En ligne actuellement</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowChatSimulator(false)}
                      className="text-xs font-mono text-emerald-200 hover:text-white"
                    >
                      Fermer
                    </button>
                  </div>

                  {/* Messages box */}
                  <div className="flex-grow p-4 overflow-y-auto space-y-3 flex flex-col scrollbar-thin">
                    {messages.map((m, idx) => {
                      const isBot = m.sender === 'bot';
                      return (
                        <div
                          key={idx}
                          className={`max-w-[80%] rounded-xl p-3.5 text-xs leading-relaxed relative ${
                            isBot
                              ? 'bg-[#121b22] text-pristine-white self-start rounded-tl-none border border-neutral-800'
                              : 'bg-emerald-800 text-white self-end rounded-tr-none'
                          }`}
                        >
                          <p>{m.text}</p>
                          <span className="block text-[8px] text-neutral-400 text-right mt-1.5 font-mono">{m.time}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input bar */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-[#121b22] flex gap-2">
                    <input
                      type="text"
                      value={inputMsg}
                      onChange={e => setInputMsg(e.target.value)}
                      placeholder="Écrivez votre message ici..."
                      className="flex-grow px-4 py-2.5 rounded bg-black/50 border border-neutral-800 text-xs text-white outline-none focus:border-emerald-600"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs"
                    >
                      Envoyer
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* --- ACCORDION FAQS --- */
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <h3 className="font-cinzel text-2xl font-bold text-pristine-white tracking-wide mb-6">
                    Foire aux Questions
                  </h3>

                  <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                      const isOpen = activeFaq === idx;

                      return (
                        <div
                          key={idx}
                          className="luxury-glass rounded-xl overflow-hidden transition-all duration-300"
                        >
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full p-5 flex justify-between items-center text-left text-sm font-semibold text-pristine-white hover:text-gold-bright transition-colors"
                          >
                            <span className="font-serif tracking-wide">{faq.q}</span>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-gold-rich" /> : <ChevronDown className="w-4 h-4 text-gold-rich" />}
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="p-5 pt-0 border-t border-gold-rich/5 text-xs text-neutral-gray leading-relaxed font-light">
                                  {faq.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
