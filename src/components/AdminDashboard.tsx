import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, TrendingUp, Users, Heart, Calendar, Eye, Globe, Share2, Plus, Trash2, CheckCircle, FileSpreadsheet, Send, ShieldCheck, Flame, BellRing, AlertCircle, Loader2 } from 'lucide-react';
import { MOCK_ADMIN_METRICS } from '../mockData';

interface AdminDashboardProps {
  onAddTeaching: (teaching: any) => void;
  onAddEvent: (event: any) => void;
  onApproveTestimony: (id: string, isApproved: boolean) => void;
  onExportExcel: () => void;
  testimonies: any[];
  registeredEvents: any[];
  teachings: any[];
}

type ImportMetaWithEnv = ImportMeta & {
  readonly env: {
    readonly VITE_NOTIFICATIONS_API_URL?: string;
  };
};

const NOTIFICATIONS_API_URL = (import.meta as ImportMetaWithEnv).env.VITE_NOTIFICATIONS_API_URL;
const NOTIF_TEMPLATES = [
  {
    label: 'Rappel Mercredi (Enseignement)',
    title: 'Culte d\'enseignement ce soir',
    body: 'Rendez-vous à 18h30 à l\'Auditorium Central pour le culte d\'enseignement doctrinal. Soyez ponctuel !',
  },
  {
    label: 'Rappel Vendredi (Veillée)',
    title: 'Grande veillée de combat spirituel',
    body: 'La veillée débute à 22h00 ce soir jusqu\'à 02h00. Venez avec un cœur en position de combat !',
  },
  {
    label: 'Rappel Dimanche (Culte)',
    title: 'Culte d\'impact et de miracles',
    body: 'Le culte du dimanche commence à 08h00. Ne manquez pas ce temps de gloire !',
  },
  {
    label: 'Bilan Hebdomadaire',
    title: 'Bilan de la semaine — Christ Army',
    body: 'Découvrez le résumé des activités, enrôlements et enseignements publiés cette semaine.',
  },
];

export default function AdminDashboard({
  onAddTeaching,
  onAddEvent,
  onApproveTestimony,
  onExportExcel,
  testimonies,
  registeredEvents,
  teachings
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'temoignages' | 'enseignements' | 'evenements' | 'notifications'>('stats');
  
  // Teaching form state
  const [teachTitle, setTeachTitle] = useState('');
  const [teachCat, setTeachCat] = useState<'audio' | 'pdf' | 'video'>('pdf');
  const [teachSize, setTeachSize] = useState('2.4 MB');
  const [teachDesc, setTeachDesc] = useState('');
  const [teachAdded, setTeachAdded] = useState(false);

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('19:00 - 21:00 GMT');
  const [eventLoc, setEventLoc] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventAdded, setEventAdded] = useState(false);

  // Simulation of Excel export
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Notification composer state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifAudience, setNotifAudience] = useState<'all-members' | 'departements'>('all-members');
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [notifSent, setNotifSent] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      onExportExcel();
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  const handleCreateTeaching = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeaching = {
      id: `t-admin-${Date.now()}`,
      title: teachTitle,
      author: 'Prophète Kader Josué Fadika',
      date: new Date().toISOString().split('T')[0],
      category: teachCat,
      durationOrPages: teachCat === 'pdf' ? '24 Pages' : '1h 15m',
      fileSize: teachSize,
      description: teachDesc,
      playsCount: 0,
      downloadsCount: 0,
      coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400',
      fileUrl: '#'
    };

    onAddTeaching(newTeaching);
    setTeachAdded(true);
    setTimeout(() => {
      setTeachAdded(false);
      setTeachTitle('');
      setTeachDesc('');
    }, 2500);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent = {
      id: `ev-admin-${Date.now()}`,
      title: eventTitle,
      date: eventDate,
      time: eventTime,
      location: eventLoc,
      speaker: 'Prophète Kader Josué Fadika',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
      description: eventDesc,
      fullProgram: [
        '19h00 : Accueil spirituel et introduction',
        '19h30 : Louange d\'impact prophétique',
        '20h00 : Message de puissance du Prophète Kader Josué',
        '21h00 : Clôture et déclarations'
      ],
      isFree: true,
      countdownTarget: `${eventDate}T19:00:00`,
      registeredCount: 0,
      maxCapacity: 1000
    };

    onAddEvent(newEvent);
    setEventAdded(true);
    setTimeout(() => {
      setEventAdded(false);
      setEventTitle('');
      setEventDate('');
      setEventLoc('');
      setEventDesc('');
    }, 2500);
  };

  const applyTemplate = (tpl: typeof NOTIF_TEMPLATES[number]) => {
    setNotifTitle(tpl.title);
    setNotifBody(tpl.body);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifError(null);

    if (!NOTIFICATIONS_API_URL) {
      setNotifError('VITE_NOTIFICATIONS_API_URL n\'est pas configurée. Déployez le petit serveur Node (dossier /server) puis renseignez son URL.');
      return;
    }

    setIsSendingNotif(true);
    try {
      const res = await fetch(`${NOTIFICATIONS_API_URL}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notifTitle,
          body: notifBody,
          topic: notifAudience,
        }),
      });
      if (!res.ok) throw new Error('send-failed');

      setNotifSent(true);
      setTimeout(() => setNotifSent(false), 3500);
      setNotifTitle('');
      setNotifBody('');
    } catch (err) {
      setNotifError('L\'envoi a échoué. Vérifiez que le serveur de notifications est bien démarré.');
    } finally {
      setIsSendingNotif(false);
    }
  };

  return (
    <section id="admin" className="relative py-24 bg-deep-green border-t border-gold-bright/10">
      {/* Golden halo lighting behind cockpit */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gold-rich/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-rich font-bold">Panneau d'Administration</span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold mt-2 text-pristine-white">
            COMMANDE GÉNÉRALE DU MINISTÈRE
          </h2>
          <p className="text-sm text-neutral-gray max-w-xl mx-auto mt-4 font-light">
            Espace de contrôle souverain réservé au secrétariat de Christ Army. Suivi des performances, modération de la foi, gestion logistique et exports fiduciaires.
          </p>
          <div className="w-16 h-[2px] bg-gold-rich mx-auto mt-4" />
        </div>

        {/* Dashboard Frame / Console layout */}
        <div className="luxury-glass rounded-2xl border border-gold-rich/25 bg-[#051d0d]/95 overflow-hidden shadow-2xl">
          
          {/* Header Bar */}
          <div className="bg-primary-green/30 border-b border-gold-rich/15 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-rich/15 flex items-center justify-center text-gold-bright border border-gold-rich/30 animate-pulse">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-pristine-white">Christ Army Central Command</h3>
                <span className="text-[10px] font-mono text-neutral-gray uppercase tracking-wider">Console de Supervision v1.0</span>
              </div>
            </div>

            {/* Actions: Export Excel */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4.5 py-2.5 bg-gold-rich text-deep-green hover:bg-gold-bright font-mono text-xs uppercase tracking-widest font-bold rounded flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {isExporting ? "Exportation..." : "Exporter Rapport Excel"}
            </button>
          </div>

          {exportSuccess && (
            <div className="bg-gold-rich/15 text-gold-bright text-xs font-mono p-3 text-center border-b border-gold-rich/20 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-gold-bright" />
              Fichier Excel exporté avec succès (christ_army_rapport.csv) !
            </div>
          )}

          {/* Navigation Control Tabs */}
          <div className="flex bg-[#051d0d]/80 border-b border-gold-rich/10 overflow-x-auto scrollbar-none">
            {(['stats', 'temoignages', 'enseignements', 'evenements', 'notifications'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4.5 font-mono text-xs uppercase tracking-wider font-semibold transition-all shrink-0 border-r border-gold-rich/5 ${
                  activeTab === tab
                    ? 'bg-primary-green/10 text-gold-bright border-b-2 border-b-gold-bright'
                    : 'text-neutral-gray hover:text-white hover:bg-primary-green/5'
                }`}
              >
                {tab === 'stats' && 'Statistiques Globales'}
                {tab === 'temoignages' && 'Approbation Témoignages'}
                {tab === 'enseignements' && 'Publier Enseignement'}
                {tab === 'evenements' && 'Créer Événement'}
                {tab === 'notifications' && 'Notifications Push'}
              </button>
            ))}
          </div>

          {/* Content Pane */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'stats' && (
                /* --- STATISTICS PANEL --- */
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 animate-fade-in"
                >
                  {/* Grid of 4 Core KPIs */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-5 rounded-xl bg-deep-green border border-gold-rich/10">
                      <div className="flex justify-between items-start mb-2">
                        <Users className="w-5 h-5 text-gold-bright" />
                        <span className="text-[10px] font-mono text-emerald-400">+{MOCK_ADMIN_METRICS.visitorsGrowth}%</span>
                      </div>
                      <span className="block text-2xl font-mono font-bold text-pristine-white">
                        {MOCK_ADMIN_METRICS.totalVisitors.toLocaleString()}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-gray block mt-0.5">Visiteurs Uniques</span>
                    </div>

                    <div className="p-5 rounded-xl bg-deep-green border border-gold-rich/10">
                      <div className="flex justify-between items-start mb-2">
                        <TrendingUp className="w-5 h-5 text-gold-bright" />
                        <span className="text-[10px] font-mono text-emerald-400">+{MOCK_ADMIN_METRICS.conversionsRate}%</span>
                      </div>
                      <span className="block text-2xl font-mono font-bold text-pristine-white">
                        {MOCK_ADMIN_METRICS.conversionsRate}%
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-gray block mt-0.5">Taux d'Engagement</span>
                    </div>

                    <div className="p-5 rounded-xl bg-deep-green border border-gold-rich/10">
                      <div className="flex justify-between items-start mb-2">
                        <Calendar className="w-5 h-5 text-gold-bright" />
                        <span className="text-[10px] font-mono text-emerald-400">+{MOCK_ADMIN_METRICS.registrationsGrowth}%</span>
                      </div>
                      <span className="block text-2xl font-mono font-bold text-pristine-white">
                        {MOCK_ADMIN_METRICS.totalRegistrations.toLocaleString()}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-gray block mt-0.5">Enrôlements Totaux</span>
                    </div>

                    <div className="p-5 rounded-xl bg-deep-green border border-gold-rich/10">
                      <div className="flex justify-between items-start mb-2">
                        <Heart className="w-5 h-5 text-gold-bright" />
                        <span className="text-[10px] font-mono text-emerald-400">+{MOCK_ADMIN_METRICS.donationsGrowth}%</span>
                      </div>
                      <span className="block text-xl font-mono font-bold text-pristine-white">
                        {MOCK_ADMIN_METRICS.totalDonations.toLocaleString()} FCFA
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-gray block mt-0.5">Fonds de Solidarité</span>
                    </div>
                  </div>

                  {/* Countries and Popular Content Splits */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Country mapping percentages */}
                    <div className="lg:col-span-5 p-6 rounded-xl border border-gold-rich/10 bg-deep-green/60">
                      <div className="flex items-center gap-2.5 mb-5 border-b border-gold-rich/5 pb-3">
                        <Globe className="w-4.5 h-4.5 text-gold-rich" />
                        <h4 className="font-cinzel text-sm font-bold text-pristine-white tracking-widest uppercase">Origine de la Diaspora</h4>
                      </div>

                      <div className="space-y-4">
                        {MOCK_ADMIN_METRICS.countriesMap.map((mapItem, i) => (
                          <div key={i} className="space-y-1.5 font-mono text-xs">
                            <div className="flex justify-between">
                              <span className="text-neutral-gray">{mapItem.country}</span>
                              <span className="text-pristine-white font-bold">{mapItem.count.toLocaleString()} ({mapItem.percentage}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#051d0d] rounded-full overflow-hidden border border-gold-rich/5">
                              <div className="h-full bg-gradient-to-r from-gold-rich to-gold-bright" style={{ width: `${mapItem.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Popular video broadcasts views */}
                    <div className="lg:col-span-7 p-6 rounded-xl border border-gold-rich/10 bg-deep-green/60">
                      <div className="flex items-center gap-2.5 mb-5 border-b border-gold-rich/5 pb-3">
                        <Eye className="w-4.5 h-4.5 text-gold-rich" />
                        <h4 className="font-cinzel text-sm font-bold text-pristine-white tracking-widest uppercase">Audience Christ Army TV</h4>
                      </div>

                      <div className="space-y-4">
                        {MOCK_ADMIN_METRICS.popularVideos.map((vid, i) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded bg-[#051d0d] border border-gold-rich/5">
                            <div>
                              <span className="block text-xs font-bold text-pristine-white">{vid.title}</span>
                              <span className="text-[10px] font-mono text-neutral-gray mt-0.5 block">Durée: {vid.duration}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-gold-bright block">{vid.views.toLocaleString()}</span>
                              <span className="text-[8px] font-mono uppercase text-neutral-gray block">Auditeurs cumulés</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'temoignages' && (
                /* --- APPROBATION DES TÉMOIGNAGES --- */
                <motion.div
                  key="temoignages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-cinzel text-sm font-bold text-pristine-white uppercase tracking-widest">
                      Modérer les actions de grâces ({testimonies.length})
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {testimonies.map(t => (
                      <div key={t.id} className="p-4 rounded-xl border border-gold-rich/15 bg-deep-green flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-gold-bright uppercase bg-gold-rich/10 px-2.5 py-0.5 rounded">
                              {t.category}
                            </span>
                            <span className="text-xs font-semibold text-pristine-white">{t.authorName}</span>
                          </div>
                          <h5 className="font-serif italic text-sm text-pristine-white font-semibold">« {t.title} »</h5>
                          <p className="text-xs text-neutral-gray font-light mt-1.5 line-clamp-2">{t.content}</p>
                        </div>

                        <div className="shrink-0 flex gap-2">
                          {t.isApproved ? (
                            <button
                              onClick={() => onApproveTestimony(t.id, false)}
                              className="px-3.5 py-1.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-[9px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all"
                            >
                              Retirer du flux
                            </button>
                          ) : (
                            <button
                              onClick={() => onApproveTestimony(t.id, true)}
                              className="px-3.5 py-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all"
                            >
                              Publier / Approuver
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'enseignements' && (
                /* --- ADD TEACHING FORM --- */
                <motion.div
                  key="enseignements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-xl mx-auto"
                >
                  {teachAdded ? (
                    <div className="text-center py-12 flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gold-rich/10 border border-gold-rich/30 flex items-center justify-center text-gold-bright animate-bounce">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <h4 className="font-cinzel text-xl font-bold text-pristine-white">Enseignement Publié !</h4>
                      <p className="text-xs text-neutral-gray max-w-xs">
                        Le document d'édification a bien été indexé dans la bibliothèque spirituelle. Les membres peuvent le lire ou l'écouter immédiatement.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateTeaching} className="space-y-5">
                      <div className="border-b border-gold-rich/10 pb-4">
                        <h4 className="font-cinzel text-base font-bold text-pristine-white uppercase tracking-wider">Indexation d'Enseignement</h4>
                        <p className="text-[10px] text-neutral-gray mt-1">Ajouter de la nourriture de foi au catalogue de Christ Army.</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Titre de l'enseignement</label>
                          <input
                            type="text"
                            required
                            value={teachTitle}
                            onChange={e => setTeachTitle(e.target.value)}
                            placeholder="Ex: Le Timing de la Grâce Prophétique"
                            className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Type de média</label>
                            <select
                              value={teachCat}
                              onChange={e => setTeachCat(e.target.value as any)}
                              className="w-full px-4 py-2.5 rounded bg-[#051d0d] border border-gold-rich/15 text-pristine-white text-xs outline-none"
                            >
                              <option value="pdf">Document PDF</option>
                              <option value="audio">Prédication Audio</option>
                              <option value="video">Session Vidéo</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Taille / Poids fichier</label>
                            <input
                              type="text"
                              required
                              value={teachSize}
                              onChange={e => setTeachSize(e.target.value)}
                              placeholder="Ex: 2.4 MB (ou 15 Pages)"
                              className="w-full px-4 py-2.5 rounded bg-[#051d0d] border border-gold-rich/15 text-pristine-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Résumé descriptif doctrinal</label>
                          <textarea
                            required
                            rows={3}
                            value={teachDesc}
                            onChange={e => setTeachDesc(e.target.value)}
                            placeholder="Décrivez précisément les lois ou révélations enseignées dans cette session..."
                            className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold text-xs font-mono uppercase tracking-widest rounded flex items-center justify-center gap-2 hover:shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                        Publier sous l'Autorité
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              {activeTab === 'evenements' && (
                /* --- ADD EVENT FORM --- */
                <motion.div
                  key="evenements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-xl mx-auto"
                >
                  {eventAdded ? (
                    <div className="text-center py-12 flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gold-rich/10 border border-gold-rich/30 flex items-center justify-center text-gold-bright animate-bounce">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <h4 className="font-cinzel text-xl font-bold text-pristine-white">Événement Programmé !</h4>
                      <p className="text-xs text-neutral-gray max-w-xs">
                        Le grand programme a bien été créé. Les invités peuvent s'y inscrire immédiatement.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateEvent} className="space-y-5">
                      <div className="border-b border-gold-rich/10 pb-4">
                        <h4 className="font-cinzel text-base font-bold text-pristine-white uppercase tracking-wider">Programmer une Réunion</h4>
                        <p className="text-[10px] text-neutral-gray mt-1">Gérer les dates et fiches logistiques des cultes et séminaires.</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Nom de l'événement</label>
                          <input
                            type="text"
                            required
                            value={eventTitle}
                            onChange={e => setEventTitle(e.target.value)}
                            placeholder="Ex: École de l'Onction Apostolique"
                            className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Date exacte</label>
                            <input
                              type="date"
                              required
                              value={eventDate}
                              onChange={e => setEventDate(e.target.value)}
                              className="w-full px-4 py-2.5 rounded bg-[#051d0d] border border-gold-rich/15 text-pristine-white text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Adresse / Lieu physique</label>
                            <input
                              type="text"
                              required
                              value={eventLoc}
                              onChange={e => setEventLoc(e.target.value)}
                              placeholder="Ex: Auditorium Abidjan"
                              className="w-full px-4 py-2.5 rounded bg-[#051d0d] border border-gold-rich/15 text-pristine-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Description et objectif de l'impact</label>
                          <textarea
                            required
                            rows={3}
                            value={eventDesc}
                            onChange={e => setEventDesc(e.target.value)}
                            placeholder="Expliquez la vision spirituelle de ce séminaire ou de cette nuit d'intercession..."
                            className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold text-xs font-mono uppercase tracking-widest rounded flex items-center justify-center gap-2 hover:shadow-lg"
                      >
                        <Calendar className="w-4 h-4" />
                        Planifier la Réunion
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                /* --- COMPOSITEUR DE NOTIFICATIONS PUSH (FCM) --- */
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-xl mx-auto space-y-6"
                >
                  <div className="border-b border-gold-rich/10 pb-4">
                    <h4 className="font-cinzel text-base font-bold text-pristine-white uppercase tracking-wider flex items-center gap-2">
                      <BellRing className="w-4.5 h-4.5 text-gold-rich" /> Envoyer une Notification Push
                    </h4>
                    <p className="text-[10px] text-neutral-gray mt-1">
                      Rappels de culte, bilans hebdomadaires ou annonces urgentes envoyés directement sur le téléphone des membres.
                    </p>
                  </div>

                  {/* Modèles rapides */}
                  <div className="flex flex-wrap gap-2">
                    {NOTIF_TEMPLATES.map(tpl => (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="px-3 py-1.5 rounded-full border border-gold-rich/20 bg-primary-green/10 text-[10px] font-mono text-gold-bright uppercase tracking-wider hover:bg-gold-rich hover:text-deep-green transition-all"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>

                  {notifSent && (
                    <div className="flex items-center gap-2 p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      Notification envoyée avec succès aux membres abonnés !
                    </div>
                  )}

                  {notifError && (
                    <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{notifError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendNotification} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Audience</label>
                      <select
                        value={notifAudience}
                        onChange={e => setNotifAudience(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded bg-[#051d0d] border border-gold-rich/15 text-pristine-white text-xs outline-none"
                      >
                        <option value="all-members">Tous les membres</option>
                        <option value="departements">Membres des départements uniquement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Titre de la notification</label>
                      <input
                        type="text"
                        required
                        value={notifTitle}
                        onChange={e => setNotifTitle(e.target.value)}
                        placeholder="Ex: Rappel du culte de ce soir"
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
                        placeholder="Rédigez le contenu du message poussé sur les téléphones des membres..."
                        className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingNotif}
                      className="w-full py-3 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold text-xs font-mono uppercase tracking-widest rounded flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-60"
                    >
                      {isSendingNotif ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
                      {isSendingNotif ? 'Envoi en cours...' : 'Envoyer la Notification'}
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