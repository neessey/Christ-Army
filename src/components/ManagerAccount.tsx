import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, BellRing, Phone, Mail, Calendar, ShieldCheck, AlertCircle, CheckCircle, Loader2, Search } from 'lucide-react';
import { DEPARTMENTS_DATA } from '../mockData';
import { User as UserType } from '../types';
import { subscribeToDeptMembers, DeptInscriptionData } from '../lib/firestoreService';

interface ManagerAccountProps {
  user: UserType;
}

type ImportMetaWithEnv = ImportMeta & {
  readonly env: {
    readonly VITE_NOTIFICATIONS_API_URL?: string;
  };
};

const NOTIFICATIONS_API_URL = (import.meta as ImportMetaWithEnv).env.VITE_NOTIFICATIONS_API_URL;
export default function ManagerAccount({ user }: ManagerAccountProps) {
  const departmentId = user.managedDepartmentId;
  const department = DEPARTMENTS_DATA.find(d => d.id === departmentId);

  const [members, setMembers] = useState<DeptInscriptionData[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'membres' | 'notifications'>('membres');

  // Notification composer state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!departmentId) {
      setMembersLoading(false);
      return;
    }
    const unsubscribe = subscribeToDeptMembers(departmentId, list => {
      setMembers(list);
      setMembersLoading(false);
    });
    return () => unsubscribe();
  }, [departmentId]);

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.includes(searchTerm)
  );

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);

    if (!departmentId) return;

    if (!NOTIFICATIONS_API_URL) {
      setSendError('VITE_NOTIFICATIONS_API_URL n\'est pas configurée côté site.');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`${NOTIFICATIONS_API_URL}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notifTitle,
          body: notifBody,
          topic: `dept-${departmentId}`,
        }),
      });
      if (!res.ok) throw new Error('send-failed');

      setSentOk(true);
      setTimeout(() => setSentOk(false), 3500);
      setNotifTitle('');
      setNotifBody('');
    } catch (err) {
      setSendError('L\'envoi a échoué. Vérifiez que le serveur de notifications est bien démarré.');
    } finally {
      setIsSending(false);
    }
  };

  if (!departmentId || !department) {
    return (
      <section className="relative py-24 bg-deep-green border-t border-gold-rich/10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-pristine-white mb-2">Aucun département assigné</h2>
          <p className="text-sm text-neutral-gray font-light">
            Votre compte a le rôle "Responsable" mais aucun département ne vous est encore rattaché.
            Demandez à l'administrateur de renseigner le champ <code className="text-gold-bright">managedDepartmentId</code> sur votre profil dans Firestore.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="manager" className="relative py-24 bg-deep-green border-t border-gold-rich/10">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-gold-rich/3 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-rich font-semibold">Espace Responsable</span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold mt-2 text-pristine-white">
            DÉPARTEMENT {department.name.toUpperCase()}
          </h2>
          <p className="text-sm text-neutral-gray max-w-xl mx-auto mt-4 font-light">
            {user.name} — Responsable en charge de ce département. Suivez vos membres et communiquez directement avec eux.
          </p>
          <div className="w-16 h-[2px] bg-gold-rich mx-auto mt-4" />
        </div>

        <div className="luxury-glass rounded-2xl border border-gold-rich/25 bg-[#051d0d]/95 overflow-hidden shadow-2xl">

          {/* Header stats bar */}
          <div className="bg-primary-green/30 border-b border-gold-rich/15 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-rich/15 flex items-center justify-center text-gold-bright border border-gold-rich/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-pristine-white">{membersLoading ? '...' : members.length} membre(s) inscrit(s)</h3>
                <span className="text-[10px] font-mono text-neutral-gray uppercase tracking-wider">Liste mise à jour en temps réel</span>
              </div>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex bg-[#051d0d]/80 border-b border-gold-rich/10">
            {(['membres', 'notifications'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-6 py-4 font-mono text-xs uppercase tracking-wider font-semibold transition-all border-r border-gold-rich/5 ${
                  activeSubTab === tab
                    ? 'bg-primary-green/10 text-gold-bright border-b-2 border-b-gold-bright'
                    : 'text-neutral-gray hover:text-white hover:bg-primary-green/5'
                }`}
              >
                {tab === 'membres' && 'Liste des Membres'}
                {tab === 'notifications' && 'Envoyer une Notification'}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeSubTab === 'membres' && (
                <motion.div
                  key="membres"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Rechercher un membre par nom, email ou téléphone..."
                      className="w-full pl-10 pr-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                    />
                  </div>

                  {membersLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 text-gold-rich animate-spin" />
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <p className="text-xs text-neutral-gray font-light italic text-center py-8">
                      Aucun membre inscrit à ce département pour l'instant.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredMembers.map(m => (
                        <div key={m.id} className="p-4 rounded-xl border border-gold-rich/10 bg-primary-green/10 flex flex-col md:flex-row justify-between md:items-center gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-pristine-white">{m.name}</h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] font-mono text-neutral-gray">
                              <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gold-rich" /> {m.email}</span>
                              <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gold-rich" /> {m.phone}</span>
                              <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-gold-rich" /> {m.dateJoined}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-gold-bright font-bold bg-gold-rich/15 px-2 py-0.5 rounded uppercase self-start md:self-center shrink-0">
                            {m.country}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSubTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-xl mx-auto space-y-6"
                >
                  <div className="border-b border-gold-rich/10 pb-4">
                    <h4 className="font-cinzel text-base font-bold text-pristine-white uppercase tracking-wider flex items-center gap-2">
                      <BellRing className="w-4.5 h-4.5 text-gold-rich" /> Notifier les membres du département
                    </h4>
                    <p className="text-[10px] text-neutral-gray mt-1">
                      Seuls les membres du département {department.name} ayant activé les notifications recevront ce message.
                    </p>
                  </div>

                  {sentOk && (
                    <div className="flex items-center gap-2 p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      Notification envoyée aux membres du département !
                    </div>
                  )}

                  {sendError && (
                    <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{sendError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendNotification} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Titre</label>
                      <input
                        type="text"
                        required
                        value={notifTitle}
                        onChange={e => setNotifTitle(e.target.value)}
                        placeholder={`Ex: Réunion du département ${department.name}`}
                        className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Message</label>
                      <textarea
                        required
                        rows={3}
                        value={notifBody}
                        onChange={e => setNotifBody(e.target.value)}
                        placeholder="Rédigez votre message pour les membres de votre département..."
                        className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full py-3 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold text-xs font-mono uppercase tracking-widest rounded flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-60"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
                      {isSending ? 'Envoi en cours...' : 'Envoyer au Département'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
