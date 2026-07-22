import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Bell, BellOff, Calendar, Heart, Loader2, AlertCircle, CheckCircle2, LogIn, UserPlus, Printer } from 'lucide-react';
import { TEACHINGS_DATA, EVENTS_DATA } from '../mockData';
import { User as UserType } from '../types';
import {
  registerMember,
  loginMember,
  logoutMember,
  sendResetPasswordEmail,
  translateAuthError,
} from '../lib/authService';
import { enableNotificationsForMember, disableNotificationsForMember } from '../lib/messaging';
import { saveDonationToFirestore, addDonationToHistory } from '../lib/firestoreService';

interface UserAccountProps {
  user: UserType | null;
}

type AuthMode = 'login' | 'register';

export default function UserAccount({ user }: UserAccountProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const [notifBusy, setNotifBusy] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'favoris' | 'agenda' | 'dons'>('profil');

  // État interne pour les paiements / dons intégrés
  const [amount, setAmount] = useState<string>('5000');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donateEmail, setDonateEmail] = useState(user?.email || '');
  const [donatePhone, setDonatePhone] = useState('');
  const [receipt, setReceipt] = useState<any | null>(null);
  const [donateSubmitted, setDonateSubmitted] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (authMode === 'register') {
        if (!name.trim()) throw new Error('Veuillez indiquer votre nom complet.');
        await registerMember({ name: name.trim(), email, password });
      } else {
        await loginMember(email, password);
      }
    } catch (err) {
      setErrorMsg(translateAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Saisissez votre email ci-dessus, puis cliquez à nouveau sur "Mot de passe oublié".');
      return;
    }
    try {
      await sendResetPasswordEmail(email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      setErrorMsg(translateAuthError(err));
    }
  };

  const handleToggleNotifications = async () => {
    if (!user) return;
    setNotifBusy(true);
    try {
      if (user.notificationsEnabled) {
        const token = user.fcmTokens?.[user.fcmTokens.length - 1];
        if (token) await disableNotificationsForMember(user.id, token);
      } else {
        const departmentTopics = (user.joinedDepartments || []).map(d => `dept-${d}`);
        await enableNotificationsForMember(user.id, departmentTopics);
      }
    } catch (err) {
      console.error('Erreur notifications:', err);
    } finally {
      setNotifBusy(false);
    }
  };

  // Soumission d'un don intégré
  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const reference = `CA-WAVE-${Math.floor(Math.random() * 900000) + 100000}`;
      const newDonation = {
        id: reference,
        amount: numericAmount,
        paymentMethod: 'Wave',
        date: new Date().toISOString(),
        status: 'Confirmé' as const,
        referenceCode: reference,
        donorName: donorName || user?.name || 'Anonyme',
        donorEmail: donateEmail || user?.email || 'non-renseigne@gmail.com',
        donorPhone: donatePhone || 'N/A',
        createdAt: new Date().toISOString()
      };

      // Sauvegarde globale et dans l'historique de l'utilisateur connecté s'il y en a un
      await saveDonationToFirestore(newDonation);
      if (user) {
        await addDonationToHistory(user.id, newDonation);
      }

      window.open(`https://pay.wave.com/m/M_ci_waw-9EveeQZb/c/ci/`, '_blank');

      setReceipt({
        id: reference,
        amount: numericAmount,
        paymentMethod: 'Wave',
        donorName: donorName || user?.name || 'Anonyme',
        email: donateEmail || user?.email || 'non-renseigne@gmail.com',
        phone: donatePhone || 'N/A',
        date: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR'),
        status: 'Confirmé'
      });

      setDonateSubmitted(true);
    } catch (error) {
      console.error('Erreur don:', error);
      alert('Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDonateReset = () => {
    setDonateSubmitted(false);
    setReceipt(null);
    setAmount('5000');
  };

  const favoritedTeachings = TEACHINGS_DATA.filter(t => user?.favorites?.includes(t.id));
  const registeredEvents = EVENTS_DATA.filter(e => user?.eventsRegistered?.includes(e.id));

  return (
    <section id="account" className="relative py-24 bg-deep-green border-t border-gold-rich/10">
      <div className="absolute top-1/2 left-1/10 w-[450px] h-[450px] rounded-full bg-gold-rich/3 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-rich font-semibold">Messager Personnel</span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold mt-2 text-pristine-white">
            ESPACE MEMBRE
          </h2>
          <p className="text-sm text-neutral-gray max-w-xl mx-auto mt-4 font-light">
            Connectez-vous pour suivre votre historique spirituel, vos dons enregistrés, vos favoris et vos événements.
          </p>
          <div className="w-16 h-[2px] bg-gold-rich mx-auto mt-4" />
        </div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="luxury-glass p-8 md:p-12 rounded-2xl border border-gold-rich/25 bg-gradient-to-br from-deep-green to-primary-green/10 max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-gold-rich/10 border border-gold-rich/30 flex items-center justify-center text-gold-bright mx-auto mb-3">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-cinzel text-xl font-bold text-pristine-white">
                    {authMode === 'login' ? 'Authentification Sécurisée' : 'Créer mon Espace Membre'}
                  </h3>
                </div>

                <div className="flex mb-6 rounded-lg border border-gold-rich/15 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                    className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                      authMode === 'login' ? 'bg-gold-rich text-deep-green font-bold' : 'text-neutral-gray hover:text-white'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" /> Connexion
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
                    className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                      authMode === 'register' ? 'bg-gold-rich text-deep-green font-bold' : 'text-neutral-gray hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Inscription
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-5">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Nom complet</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: Arthur Kouadio"
                        className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Adresse email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Ex: arthur@gmail.com"
                      className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Mot de passe</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {resetSent && (
                    <div className="flex items-start gap-2 p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Email de réinitialisation envoyé.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold uppercase text-xs tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {authMode === 'login' ? 'Se Connecter' : 'Créer mon Compte'}
                  </button>

                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="w-full text-center text-[10px] font-mono text-neutral-gray hover:text-gold-bright underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="luxury-glass p-6 md:p-8 rounded-2xl border border-gold-rich/25 bg-gradient-to-br from-deep-green to-primary-green/10"
              >
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-gold-rich/10 pb-6 mb-8">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h3 className="font-cinzel text-xl font-bold text-pristine-white">{user.name}</h3>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-gold-rich/10 text-gold-bright border border-gold-rich/20 uppercase">
                          {user.role === 'admin' ? 'ADMINISTRATEUR' : 'CHRISTWALKER'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-gray font-mono mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleNotifications}
                      disabled={notifBusy}
                      className={`p-2.5 rounded border transition-colors flex items-center gap-2 ${
                        user.notificationsEnabled ? 'bg-gold-rich/10 border-gold-rich/30 text-gold-bright' : 'bg-primary-green/5 text-neutral-gray'
                      }`}
                    >
                      {notifBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : user.notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => logoutMember()}
                      className="px-4.5 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-[10px] uppercase"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 border-b border-gold-rich/5 pb-4 mb-6 overflow-x-auto">
                  {(['profil', 'favoris', 'agenda', 'dons'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                        activeSubTab === tab ? 'bg-gold-rich/10 text-gold-bright font-bold border border-gold-rich/30' : 'text-neutral-gray hover:text-white'
                      }`}
                    >
                      {tab === 'profil' && 'Profil Personnel'}
                      {tab === 'favoris' && 'Mes Favoris'}
                      {tab === 'agenda' && 'Agenda Culte'}
                      {tab === 'dons' && 'Dons & Cotisations'}
                    </button>
                  ))}
                </div>

                <div>
                  {activeSubTab === 'profil' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-5 rounded-xl bg-deep-green/60 border border-gold-rich/10">
                        <span className="text-[10px] font-mono text-gold-rich uppercase block mb-2">Rôle & Engagement</span>
                        <p className="text-xs text-neutral-gray font-light">Enregistré au registre officiel des ChristWalkers.</p>
                      </div>
                      <div className="p-5 rounded-xl bg-deep-green/60 border border-gold-rich/10">
                        <span className="text-[10px] font-mono text-gold-rich uppercase block mb-2">Statut d'Enrôlement</span>
                        <span className="text-sm font-semibold text-pristine-white">Départements : {user.joinedDepartments?.length || 0} rejoint</span>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'favoris' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {favoritedTeachings.length === 0 ? (
                        <p className="text-xs text-neutral-gray italic">Aucun enseignement favori.</p>
                      ) : (
                        favoritedTeachings.map(t => (
                          <div key={t.id} className="p-4 rounded-xl border border-gold-rich/10 bg-primary-green/10 flex justify-between items-center">
                            <div>
                              <span className="text-[8px] font-mono text-gold-rich uppercase">{t.category}</span>
                              <h4 className="text-xs font-bold text-pristine-white mt-0.5">{t.title}</h4>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeSubTab === 'agenda' && (
                    <div className="space-y-3">
                      {registeredEvents.length === 0 ? (
                        <p className="text-xs text-neutral-gray italic">Aucune inscription à un événement.</p>
                      ) : (
                        registeredEvents.map(ev => (
                          <div key={ev.id} className="p-4 rounded-xl border border-gold-rich/10 bg-primary-green/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-gold-rich" />
                              <div>
                                <h4 className="text-xs font-bold text-pristine-white">{ev.title}</h4>
                                <span className="text-[10px] font-mono text-neutral-gray">{ev.date} • {ev.time}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeSubTab === 'dons' && (
                    <div className="space-y-6">
                      {!donateSubmitted ? (
                        <div className="p-6 rounded-xl border border-gold-rich/20 bg-primary-green/10">
                          <h4 className="font-cinzel text-lg font-bold text-pristine-white mb-4">Effectuer une semence (Wave)</h4>
                          <form onSubmit={handleDonateSubmit} className="space-y-4">
                            <div>
                              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1">Montant (FCFA)</label>
                              <input
                                type="number"
                                required
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full px-4 py-2.5 rounded bg-deep-green border border-gold-rich/15 text-pristine-white text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-mono uppercase text-neutral-gray mb-1">Téléphone</label>
                                <input
                                  type="tel"
                                  required
                                  value={donatePhone}
                                  onChange={e => setDonatePhone(e.target.value)}
                                  placeholder="+225..."
                                  className="w-full px-4 py-2.5 rounded bg-deep-green border border-gold-rich/15 text-pristine-white text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-mono uppercase text-neutral-gray mb-1">Email</label>
                                <input
                                  type="email"
                                  value={donateEmail}
                                  onChange={e => setDonateEmail(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded bg-deep-green border border-gold-rich/15 text-pristine-white text-sm"
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-3 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold uppercase text-xs tracking-widest rounded-lg"
                            >
                              {isSubmitting ? 'Traitement...' : `Payer avec Wave - ${parseFloat(amount || '0').toLocaleString()} FCFA`}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="p-6 rounded-xl border border-gold-bright/35 bg-deep-green text-center">
                          <CheckCircle2 className="w-10 h-10 text-gold-bright mx-auto mb-3 animate-bounce" />
                          <h4 className="font-cinzel text-xl font-bold text-pristine-white">Semence Enregistrée !</h4>
                          <p className="text-xs text-neutral-gray mt-1">Réf : {receipt?.id}</p>
                          <div className="my-4 p-4 rounded bg-primary-green/10 font-mono text-xs text-left space-y-1">
                            <div>Montant : <span className="text-gold-bright font-bold">{receipt?.amount} FCFA</span></div>
                            <div>Date : {receipt?.date}</div>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => window.print()} className="flex-1 py-2 border border-gold-rich/20 text-gold-bright font-mono text-xs uppercase rounded">
                              <Printer className="w-3.5 h-3.5 inline mr-1" /> Imprimer
                            </button>
                            <button onClick={handleDonateReset} className="flex-1 py-2 bg-gold-rich text-deep-green font-mono text-xs uppercase font-bold rounded">
                              Nouveau Don
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-gold-rich/10 pt-6">
                        <h5 className="font-cinzel text-sm font-bold text-pristine-white mb-3">Historique de vos contributions</h5>
                        {(!user.donationHistory || user.donationHistory.length === 0) ? (
                          <p className="text-xs text-neutral-gray italic">Aucun don enregistré sur votre profil.</p>
                        ) : (
                          <div className="space-y-2">
                            {user.donationHistory.map((don: any) => (
                              <div key={don.id} className="p-3 rounded bg-deep-green/60 border border-gold-rich/10 flex justify-between items-center font-mono text-[10px] text-neutral-gray">
                                <span>{don.date}</span>
                                <span className="text-gold-bright font-bold">{don.amount.toLocaleString()} FCFA</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}