import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, CreditCard, ShieldAlert, CheckCircle2, Download, Printer, 
  Send, ShieldCheck, Mail, Phone, Globe, Star, Award 
} from 'lucide-react';

interface DonationsProps {
  onAddDonation: (donation: any) => void;
}

export default function Donations({ onAddDonation }: DonationsProps) {
  // ------------------------------------------
  // STATE: DONATIONS
  // ------------------------------------------
  const [amount, setAmount] = useState<string>('5000');
  const [donorName, setDonorName] = useState('');
  const [donateEmail, setDonateEmail] = useState('');
  const [donatePhone, setDonatePhone] = useState('');
const paymentMethod = 'Wave';
  const [receipt, setReceipt] = useState<any | null>(null);
  const [donateSubmitted, setDonateSubmitted] = useState(false);

const handleDonateSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount) || numericAmount <= 0) return;


  const reference = `CA-WAVE-${Math.floor(Math.random() * 900000) + 100000}`;


  const newDonation = {
    id: reference,
    amount: numericAmount,
    paymentMethod: 'Wave',
    date: new Date().toLocaleDateString('fr-FR'),
    status: 'En attente',
    referenceCode: reference
  };


  onAddDonation(newDonation);


  // Lien Wave de paiement
  const wavePaymentLink = `https://pay.wave.com/m/M_ci_waw-9EveeQZb/c/ci/`;


  window.open(
    wavePaymentLink,
    '_blank'
  );


  setReceipt({
    id: reference,
    amount: numericAmount,
    paymentMethod: 'Wave',
    donorName: donorName || 'Anonyme',
    email: donateEmail || 'non-renseigne@gmail.com',
    phone: donatePhone || 'N/A',
    date: new Date().toLocaleDateString('fr-FR') +
      ' à ' +
      new Date().toLocaleTimeString('fr-FR'),
    status: 'En attente'
  });


  setDonateSubmitted(true);
};

  const handleDonateReset = () => {
    setDonateSubmitted(false);
    setReceipt(null);
    setDonorName('');
    setDonateEmail('');
    setDonatePhone('');
    setAmount('5000');
  };

  return (
    <section id="donations" className="relative py-24 bg-deep-green border-t border-gold-rich/10">
      <div className="absolute top-1/2 left-1/10 w-[500px] h-[500px] rounded-full bg-gold-rich/3 blur-[125px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-rich font-semibold">
            Semence Spirituelle
          </span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold mt-2 text-pristine-white tracking-wider">
            SOUTENIR L'ŒUVRE
          </h2>
          <p className="text-sm text-neutral-gray max-w-2xl mx-auto mt-4 font-light leading-relaxed">
            Soutenez l'œuvre d'évangélisation, le fonctionnement technique de Christ Army.
          </p>
          <div className="w-16 h-[2px] bg-gold-rich mx-auto mt-4" />
        </div>

        {/* Donation Form Container */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* ==============================================================
               DONATE (cotisationS / CONTRIBUTION)
               ============================================================== */}
            {!donateSubmitted ? (
              /* --- CHECKOUT FORM --- */
              <motion.div
                key="donate-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="luxury-glass p-8 md:p-12 rounded-2xl border border-gold-rich/25 bg-gradient-to-br from-deep-green to-primary-green/10"
              >
                <div className="flex items-center gap-3 mb-8 border-b border-gold-rich/10 pb-5">
                  <Heart className="w-6 h-6 text-gold-bright animate-pulse" />
                  <div>
                    <h3 className="font-cinzel text-xl font-bold text-pristine-white">Cotisation & Dîme Sécurisée</h3>
                    <p className="text-xs text-neutral-gray mt-0.5 font-light">Semez avec joie sous l'onction prophétique.</p>
                  </div>
                </div>

                <form onSubmit={handleDonateSubmit} className="space-y-6">
                  {/* Select Amount */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono uppercase text-neutral-gray">Montant de la cotisation</label>
                    
                    <div className="relative mt-2">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-gold-bright font-bold">FCFA</span>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Saisir un autre montant libre..."
                        className="w-full px-4 py-3 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

               {/* Paiement Wave uniquement */}
<div className="space-y-3">

  <label className="block text-xs font-mono uppercase text-neutral-gray">
    Moyen de paiement
  </label>

  <div className="p-5 rounded-xl border border-cyan-500/30 flex items-center  gap-4">

    <img src="/assets/wave.jpg" alt="Wave" className="w-8 h-8 object-contain rounded-2xl" />

    <div>
      <p className="text-white font-bold font-mono text-sm">
        Wave
      </p>

      <p className="text-xs text-neutral-gray">
        Paiement sécurisé via lien Wave
      </p>
    </div>

  </div>

</div>

                  {/* Donor Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Nom complet (Optionnel)</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={e => setDonorName(e.target.value)}
                        placeholder="Ex: Anonyme ou votre nom"
                        className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">N° de Téléphone (Mobile Money)</label>
                      <input
                        type="tel"
                        required
                        value={donatePhone}
                        onChange={e => setDonatePhone(e.target.value)}
                        placeholder="Ex: +225 07 11 22 33 44"
                        className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Adresse Email (Reçu de paiement)</label>
                    <input
                      type="email"
                      value={donateEmail}
                      onChange={e => setDonateEmail(e.target.value)}
                      placeholder="Ex: fidele@gmail.com"
                      className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-deep-green/60 border border-gold-rich/10 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-gold-rich shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-gray font-light leading-relaxed">
Votre contribution est effectuée exclusivement via Wave grâce à un lien de paiement sécurisé. Après validation, vous serez redirigé vers Wave pour finaliser votre cotisation.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold uppercase text-xs tracking-widest rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
Payer avec Wave - {parseFloat(amount || '0').toLocaleString()} FCFA
                  </button>
                </form>
              </motion.div>
            ) : (
              /* --- PRINTABLE RECEIPT --- */
              <motion.div
                key="donate-receipt"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="luxury-glass p-8 md:p-12 rounded-2xl border border-gold-bright/35 bg-gradient-to-br from-deep-green to-primary-green/10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gold-rich/10 border border-gold-rich/30 flex items-center justify-center text-gold-bright mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <h3 className="font-cinzel text-2xl font-bold text-pristine-white">Semence Enregistrée !</h3>
                <p className="text-sm text-neutral-gray max-w-sm mx-auto mt-2 leading-relaxed">
                  Que le Dieu de Christ Army se souvienne de votre cotisation et arrose abondamment vos greniers en cette saison de grâce.
                </p>

                <div className="my-8 p-6 rounded-xl border border-gold-rich/20 bg-deep-green/90 text-left font-mono text-xs text-neutral-gray relative overflow-hidden shadow-inner max-w-md mx-auto">
                  <div className="absolute -right-10 -bottom-10 text-gold-rich/5 text-8xl font-cinzel font-bold select-none pointer-events-none">
                    CA
                  </div>

                  <div className="text-center border-b border-gold-rich/15 pb-4 mb-4">
                    <span className="font-cinzel text-sm font-bold text-pristine-white tracking-widest block uppercase">CHRIST ARMY MINISTRY</span>
                    <span className="text-[10px] uppercase text-gold-rich block mt-1">Reçu Officiel de Contribution</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span>Réf. Transaction :</span>
                      <span className="text-pristine-white font-bold">{receipt?.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Donateur :</span>
                      <span className="text-pristine-white">{receipt?.donorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Téléphone mobile :</span>
                      <span className="text-pristine-white">{receipt?.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email :</span>
                      <span className="text-pristine-white">{receipt?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Méthode de Paiement :</span>
                      <span className="text-pristine-white">{receipt?.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Heure :</span>
                      <span className="text-pristine-white">{receipt?.date}</span>
                    </div>
                    <div className="flex justify-between border-t border-gold-rich/10 pt-3 mt-3 text-sm">
                      <span className="font-bold text-gold-rich">MONTANT SEMÉ :</span>
                      <span className="text-gold-bright font-bold text-base">{receipt?.amount.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="border-t border-gold-rich/10 pt-4 mt-4 text-center text-[10px] leading-relaxed">
                    « Dieu aime celui qui donne avec joie. » — 2 Co 9:7
                  </div>
                </div>

                <div className="flex gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => window.print()}
                    className="w-1/2 py-2.5 border border-gold-rich/20 text-gold-bright hover:bg-gold-rich hover:text-deep-green font-mono text-xs uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer Reçu
                  </button>
                  <button
                    onClick={handleDonateReset}
                    className="w-1/2 py-2.5 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold font-mono text-xs uppercase tracking-widest rounded transition-all"
                  >
                    Nouveau Don
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}