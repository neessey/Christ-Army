import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, MessageSquare, Clock } from 'lucide-react';

export default function Contact() {
  const WHATSAPP_NUMBER = "2250767835670"; // sans le +
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // WhatsApp Chat Simulation
  const [showChatSimulator, setShowChatSimulator] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { sender: 'bot', text: 'Shalom bien-aimé ! Soyez le bienvenu sur la messagerie officielle de Christ Army. Comment le secrétariat pastoral peut-il vous assister aujourd\'hui ?', time: '09:00' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const faqs = [
  {
    q: "Quels sont les horaires des cultes ?",
    a: "Nos principaux rendez-vous sont organisés chaque semaine. Consultez la rubrique « Programme » de notre site ou nos réseaux sociaux pour connaître les horaires mis à jour des cultes, veillées et programmes spéciaux/du mois."
  },
  {
    q: "Comment devenir membre de Christ Army ?",
    a: "Vous pouvez rejoindre Christ Army en remplissant le formulaire d'adhésion disponible sur notre plateforme ou directement auprès de l'accueil après un programme. Un responsable prendra ensuite contact avec vous pour vous accompagner dans votre intégration."
  },
  {
    q: "Comment puis-je faire un don ou une offrande ?",
    a: "Les dons et les offrandes peuvent être effectués directement depuis la plateforme via les moyens de paiement proposés ou pendant les différents programmes. "
  },
  {
    q: "Comment rejoindre un département de service ?",
    a: "Après votre inscription en tant que membre, vous pouvez demander à intégrer un département (Intercession, Chorale, Protocole, Évangélisation, Communication, etc.). Le responsable concerné prendra contact avec vous après validation de votre demande."
  },

];
  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

 const handleSendMessage = (e: React.FormEvent) => {
  e.preventDefault();

  if (!inputMsg.trim()) return;

  const message = encodeURIComponent(inputMsg);

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
    "_blank"
  );

  setInputMsg("");
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
           

            <div className="space-y-6">
              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary-green/10 border border-gold-rich/5 hover:border-gold-rich/15 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-rich shrink-0 border border-gold-rich/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-gold-bright uppercase tracking-wider block mb-0.5">Adresse Physique</span>
                  <span className="text-sm text-pristine-white">Abidjan, Côte d'Ivoire</span>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary-green/10 border border-gold-rich/5 hover:border-gold-rich/15 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-rich shrink-0 border border-gold-rich/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-gold-bright uppercase tracking-wider block mb-0.5">Ligne Directe</span>
                  <span className="text-sm text-pristine-white">+225 07 67 83 56 70 <br /> +225 07 16 40 01 22 <br /> +225 01 43 35 59 21</span>
                </div>
              </div>
                          </div>


            {/* Launch chat shortcut */}
            <button
onClick={() => {
  const message = encodeURIComponent(
    "Shalom, je souhaite contacter l'accueil de Christ Army."
  );

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
    "_blank"
  );
}}              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/20 transition-all"
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
