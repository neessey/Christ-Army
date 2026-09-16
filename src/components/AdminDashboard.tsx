import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Heart,
  BookOpen,
  Calendar,
  Bell,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  RefreshCw,
  TrendingUp,
  Eye,
  Globe,
  Share2,
  Plus,
  Trash2,
  CheckCircle,
  Send,
  ShieldCheck,
  Flame,
  AlertCircle,
  Loader2,
  ImagePlus,
  Video,
  Music,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Download,
  UserRound,
  Target,
  ClipboardList,
  Award,
  BarChart3,
  Activity,
  Zap,
  Clock
} from 'lucide-react';
import { uploadImageToCloudinary } from '../lib/cloudinaryService';
import {
  subscribeToGlobalStats,
  saveEvent,
  GlobalStats,
  FirestoreEvent,
} from '../lib/firestoreService';

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
    label: 'Rappel Mercredi (Reunion)',
    title: 'Culte d\'enseignement ce soir',
    body: 'Rendez-vous à 18h30 à l\'Auditorium Central pour le culte d\'enseignement doctrinal. Soyez ponctuel !',
  },
  {
    label: 'Rappel Vendredi (V.Champion)',
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
  const [activeTab, setActiveTab] = useState<'stats' | 'temoignages' | 'enseignements' | 'evenements' | 'notifications' | 'rapports'>('stats');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<GlobalStats>({
    totalMembers: 0,
    membersGrowth: 0,
    totalDepartments: 0,
    departmentsGrowth: 0,
    totalDiaspora: 0,
    diasporaGrowth: 0,
    solidarityFund: 0,
    fundGrowth: 0,
    countriesMap: [],
    departmentsList: [],
  } as GlobalStats);
  
  // Teaching form state
  const [teachTitle, setTeachTitle] = useState('');
  const [teachCat, setTeachCat] = useState<'audio' | 'pdf' | 'video'>('pdf');
  const [teachSize, setTeachSize] = useState('2.4 MB');
  const [teachDesc, setTeachDesc] = useState('');
  const [teachAdded, setTeachAdded] = useState(false);
  
  // Teaching Media File state
  const [teachMediaFile, setTeachMediaFile] = useState<File | null>(null);
  const [teachMediaPreview, setTeachMediaPreview] = useState<string | null>(null);
  const [isUploadingTeachMedia, setIsUploadingTeachMedia] = useState(false);
  const [teachMediaError, setTeachMediaError] = useState<string | null>(null);

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('19:00 - 21:00 GMT');
  const [eventLoc, setEventLoc] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventAdded, setEventAdded] = useState(false);
  
  // Event Media File state
  const [eventMediaFile, setEventMediaFile] = useState<File | null>(null);
  const [eventMediaPreview, setEventMediaPreview] = useState<string | null>(null);
  const [isUploadingEventMedia, setIsUploadingEventMedia] = useState(false);
  const [eventMediaError, setEventMediaError] = useState<string | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Notification composer state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifAudience, setNotifAudience] = useState<'all-members' | 'departements'>('all-members');
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [notifSent, setNotifSent] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToGlobalStats((newStats) => {
      setStats(newStats);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      onExportExcel();
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  // Handlers for Teaching Media Selection
  const handleTeachMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTeachMediaError(null);
    setTeachMediaFile(file);
    setTeachMediaPreview(URL.createObjectURL(file));
  };

  const clearTeachMedia = () => {
    setTeachMediaFile(null);
    setTeachMediaPreview(null);
    setTeachMediaError(null);
  };

  // Handlers for Event Media Selection
  const handleEventMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEventMediaError(null);
    setEventMediaFile(file);
    setEventMediaPreview(URL.createObjectURL(file));
  };

  const clearEventMedia = () => {
    setEventMediaFile(null);
    setEventMediaPreview(null);
    setEventMediaError(null);
  };

  const handleCreateTeaching = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeachMediaError(null);

    let mediaUrl = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400';

    if (teachMediaFile) {
      setIsUploadingTeachMedia(true);
      try {
        mediaUrl = await uploadImageToCloudinary(teachMediaFile);
      } catch (err) {
        setIsUploadingTeachMedia(false);
        setTeachMediaError(err instanceof Error ? err.message : 'Échec du téléversement du média.');
        return;
      }
      setIsUploadingTeachMedia(false);
    }

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
      coverImage: teachCat === 'video' || teachCat === 'audio' ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400' : mediaUrl,
      videoUrl: teachCat === 'video' ? mediaUrl : '#',
      fileUrl: teachCat === 'audio' ? mediaUrl : '#'
    };

    onAddTeaching(newTeaching);
    setTeachAdded(true);
    setTimeout(() => {
      setTeachAdded(false);
      setTeachTitle('');
      setTeachDesc('');
      clearTeachMedia();
    }, 2500);
  };

 const handleCreateEvent = async (e: React.FormEvent) => {
  e.preventDefault();
  setEventMediaError(null);

  let imageUrl =
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800';

  if (eventMediaFile) {
    setIsUploadingEventMedia(true);

    try {
      imageUrl = await uploadImageToCloudinary(eventMediaFile);
    } catch (err) {
      setIsUploadingEventMedia(false);

      setEventMediaError(
        err instanceof Error
          ? err.message
          : 'Échec du téléversement de la photo.'
      );

      return;
    }

    setIsUploadingEventMedia(false);
  }

  const newEvent: FirestoreEvent = {
    id: `ev-admin-${Date.now()}`,
    title: eventTitle.trim(),
    date: eventDate,
    time: eventTime,
    location: eventLoc.trim(),

    speaker: 'Prophète Kader Josué Fadika',

    imageUrl,

    description: eventDesc.trim(),

    fullProgram: [
      "19h00 : Accueil spirituel et introduction",
      "19h30 : Louange d'impact prophétique",
      "20h00 : Message de puissance du Prophète Kader Josué",
      "21h00 : Clôture et déclarations",
    ],

    isFree: true,

    countdownTarget: `${eventDate}T19:00:00`,

    registeredCount: 0,

    maxCapacity: 1000,
  };

  try {
    await saveEvent(newEvent);

    // On conserve le callback existant si le parent
    // l'utilise encore pour son propre état local.
    onAddEvent(newEvent);

    setEventAdded(true);

    setTimeout(() => {
      setEventAdded(false);

      setEventTitle('');
      setEventDate('');
      setEventLoc('');
      setEventDesc('');

      clearEventMedia();
    }, 2500);
  } catch (error) {
    console.error(
      "Impossible de créer l'événement :",
      error
    );

    setEventMediaError(
      "L'événement n'a pas pu être enregistré dans Firestore."
    );
  }
};

  const applyTemplate = (tpl: typeof NOTIF_TEMPLATES[number]) => {
    setNotifTitle(tpl.title);
    setNotifBody(tpl.body);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifError(null);

    if (!NOTIFICATIONS_API_URL) {
      setNotifError('VITE_NOTIFICATIONS_API_URL n\'est pas configurée. Déployez le petit serveur Node puis renseignez son URL.');
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

  // Navigation items
  const navItems = [
    { id: 'stats' as const, label: 'Tableau de Bord', icon: LayoutDashboard, description: 'Vue d\'ensemble' },
    { id: 'temoignages' as const, label: 'Témoignages', icon: Heart, description: 'Modérer les actions de grâces', badge: testimonies.filter(t => !t.isApproved).length },
    { id: 'enseignements' as const, label: 'Enseignements', icon: BookOpen, description: 'Publier des ressources' },
    { id: 'evenements' as const, label: 'Événements', icon: Calendar, description: 'Programmer des réunions' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, description: 'Envoyer des alertes' },
    { id: 'rapports' as const, label: 'Rapports', icon: FileSpreadsheet, description: 'Exporter les données' },
  ];

  // Quick stats
  const quickStats = [
    { 
      label: 'Membres Totaux', 
      value: stats.totalMembers.toLocaleString(), 
      change: `+${stats.membersGrowth || 0}%`,
      icon: Users,
    },
    { 
      label: 'Départements', 
      value: stats.totalDepartments.toString(), 
      change: `+${stats.departmentsGrowth || 0}%`,
      icon: TrendingUp,
    },
    { 
      label: 'Caisse de Solidarité', 
      value: `${stats.solidarityFund.toLocaleString()} FCFA`, 
      change: `+${stats.fundGrowth || 0}%`,
      icon: Award,
    },
    { 
      label: 'Témoignages', 
      value: testimonies.length.toString(), 
      change: `${testimonies.filter(t => t.isApproved).length} approuvés`,
      icon: Heart,
    },
  ];

  // Recent activity
  const recentActivities = [
    { icon: Users, action: 'Nouveau membre enrôlé', time: 'Il y a 2 min', user: 'Marie Kouadio' },
    { icon: Heart, action: 'Témoignage approuvé', time: 'Il y a 15 min', user: 'Jean Assouan' },
    { icon: BookOpen, action: 'Nouvel enseignement publié', time: 'Il y a 1h', user: 'Prophète Kader' },
    { icon: Calendar, action: 'Événement programmé', time: 'Il y a 3h', user: 'Secrétariat' },
  ];

  const selectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <section id="admin" className="min-h-screen bg-[#06170d] text-pristine-white">
      <div className="flex min-h-screen">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <button
            aria-label="Fermer le menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}

        {/* SIDEBAR */}
        <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 border-r border-gold-rich/15 bg-[#04130a] transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex h-full flex-col">

            {/* Sidebar Header */}
            <div className="border-b border-gold-rich/10 px-5 py-5">
              <div className="flex items-center gap-3 rounded-xl bg-primary-green/10 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-rich/15 border border-gold-rich/25">
                  <Flame className="h-5 w-5 text-gold-bright" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Christ Army</p>
                  <p className="truncate text-[10px] text-neutral-gray">Console d'administration</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-4 py-5 overflow-y-auto">
              <p className="px-3 pb-3 text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-gray">Navigation</p>

              {navItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                const hasBadge = item.badge && item.badge > 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => selectTab(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? 'bg-primary-green/25 text-gold-bright border border-gold-rich/15'
                        : 'border border-transparent text-neutral-gray hover:bg-primary-green/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-gold-bright' : ''}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.label}</p>
                        {hasBadge && (
                          <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-rich/20 px-1.5 text-[9px] font-mono font-bold text-gold-bright">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[9px] text-neutral-gray">{item.description}</p>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 transition ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-gold-rich/10 p-4">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-neutral-gray hover:bg-red-500/10 hover:text-red-300 transition">
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          {/* TOPBAR */}
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gold-rich/10 bg-[#06170d]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-gold-rich/15 p-2 text-neutral-gray hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gold-rich">Administration</p>
                <h1 className="font-cinzel text-lg font-bold sm:text-xl">
                  {navItems.find(n => n.id === activeTab)?.label || 'Tableau de Bord'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-green/10 border border-gold-rich/10">
                <Search className="h-4 w-4 text-neutral-gray" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="bg-transparent text-xs text-pristine-white placeholder-neutral-gray outline-none w-32 lg:w-48"
                />
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gold-rich text-deep-green hover:bg-gold-bright font-mono text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {isExporting ? '...' : 'Export'}
              </button>

              {/* Profile */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-rich/20 bg-gold-rich/10">
                <UserRound className="h-4 w-4 text-gold-bright" />
              </div>
            </div>
          </header>

          {/* Export Success Toast */}
          {exportSuccess && (
            <div className="fixed bottom-4 right-4 z-50 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-sm">
              <CheckCircle className="h-4 w-4" />
              Rapport exporté avec succès !
            </div>
          )}

          {/* CONTENT */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
           <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
  <div>
    <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-gold-rich">
      {activeTab === 'stats' ? 'Vue d’ensemble' : 'Gestion du ministère'}
    </p>

    <h2 className="font-cinzel text-2xl font-bold sm:text-3xl">
      {activeTab === 'stats' && 'Vue d’ensemble du ministère'}
      {activeTab === 'temoignages' && 'Témoignages'}
      {activeTab === 'enseignements' && 'Enseignements'}
      {activeTab === 'evenements' && 'Événements'}
      {activeTab === 'notifications' && 'Notifications'}
      {activeTab === 'rapports' && 'Rapports'}
    </h2>

    <p className="mt-2 text-sm text-neutral-gray">
      {activeTab === 'stats' &&
        'Une vision globale de la vie et de l’activité du ministère.'}

      {activeTab === 'temoignages' &&
        'Examinez et modérez les témoignages soumis par la communauté.'}

      {activeTab === 'enseignements' &&
        'Publiez et gérez les enseignements du Prophète.'}

      {activeTab === 'evenements' &&
        'Planifiez et gérez les événements à venir.'}

      {activeTab === 'notifications' &&
        'Communiquez directement avec la communauté.'}

      {activeTab === 'rapports' &&
        'Consultez et exportez les données du ministère.'}
    </p>
  </div>

  <button
    onClick={handleExport}
    disabled={isExporting}
    className="flex items-center gap-2 rounded-xl bg-gold-rich px-4 py-2.5 text-xs font-bold font-mono uppercase tracking-widest text-deep-green hover:shadow-lg transition-all md:hidden"
  >
    <Download className="h-4 w-4" />
    {isExporting ? 'Exportation...' : 'Exporter'}
  </button>
</div>

           {/* STATS CARDS — UNIQUEMENT SUR LA VUE D'ENSEMBLE */}
{activeTab === 'stats' && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4"
  >
    {quickStats.map((stat, index) => {
      const Icon = stat.icon;

      return (
        <div
          key={index}
          className="rounded-2xl border border-gold-rich/10 bg-[#0a2113] p-5 transition-all hover:border-gold-rich/20 hover:bg-[#0c2616]"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-gray">
              {stat.label}
            </span>

            <Icon className="h-4 w-4 text-gold-rich" />
          </div>

          <p className="text-2xl font-bold">
            {stat.value}
          </p>

          <p className="mt-1 text-[10px] text-emerald-400">
            {stat.change}
          </p>
        </div>
      );
    })}
  </motion.div>
)}

            {/* MAIN PANEL */}
            <div className="rounded-2xl border border-gold-rich/10 bg-[#071b0f] shadow-2xl overflow-hidden">
              <div className="border-b border-gold-rich/10 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  {(() => {
                    const current = navItems.find(n => n.id === activeTab);
                    const Icon = current?.icon || LayoutDashboard;
                    return <Icon className="h-5 w-5 text-gold-bright" />;
                  })()}
                  <div>
                    <h3 className="font-cinzel text-base font-bold">
                      {activeTab === 'stats' && 'Vue d\'ensemble du ministère'}
                      {activeTab === 'temoignages' && 'Modération des témoignages'}
                      {activeTab === 'enseignements' && 'Publication d\'enseignements'}
                      {activeTab === 'evenements' && 'Programmation d\'événements'}
                      {activeTab === 'notifications' && 'Envoi de notifications'}
                      {activeTab === 'rapports' && 'Rapports et exportations'}
                    </h3>
                    <p className="text-[10px] text-neutral-gray">
                      {activeTab === 'stats' && 'Statistiques globales et activité récente.'}
                      {activeTab === 'temoignages' && `${testimonies.filter(t => !t.isApproved).length} en attente d\'approbation.`}
                      {activeTab === 'enseignements' && 'Ajoutez des ressources audio, vidéo ou PDF.'}
                      {activeTab === 'evenements' && 'Créez et planifiez les réunions.'}
                      {activeTab === 'notifications' && 'Envoyez des alertes à tous les membres.'}
                      {activeTab === 'rapports' && 'Exportez les données du ministère.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-7">
                <AnimatePresence mode="wait">
                  {/* STATS TAB */}
                  {activeTab === 'stats' && (
                    <motion.div
                      key="stats"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-6"
                    >
                      {loading ? (
                        <div className="flex justify-center py-16">
                          <Loader2 className="h-8 w-8 animate-spin text-gold-bright" />
                          <span className="ml-3 text-sm text-neutral-gray">Chargement des statistiques...</span>
                        </div>
                      ) : (
                        <>
                          {/* Activity Chart */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2 rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-cinzel text-sm font-bold">Activité Hebdomadaire</h4>
                                <div className="flex gap-1">
                                  {['Semaine', 'Mois', 'Année'].map((period) => (
                                    <button key={period} className={`px-2 py-1 text-[9px] font-mono rounded ${period === 'Semaine' ? 'bg-gold-rich/20 text-gold-bright' : 'text-neutral-gray hover:text-white'}`}>
                                      {period}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="h-48 flex items-end justify-between gap-2">
                                {[65, 45, 80, 55, 70, 90, 60].map((height, i) => (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                    <div className="w-full rounded-t bg-gradient-to-t from-gold-rich/50 to-gold-bright/50" style={{ height: `${height}%` }} />
                                    <span className="text-[8px] font-mono text-neutral-gray">J{i+1}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                              <h4 className="font-cinzel text-sm font-bold mb-4">Répartition</h4>
                              <div className="space-y-3">
                                {[
                                  { label: 'Membres Actifs', value: '68%', color: 'bg-gold-rich' },
                                  { label: 'Départements', value: '22%', color: 'bg-emerald-500' },
                                  { label: 'Diaspora', value: '10%', color: 'bg-blue-500' },
                                ].map((item) => (
                                  <div key={item.label}>
                                    <div className="flex justify-between text-xs font-mono">
                                      <span className="text-neutral-gray">{item.label}</span>
                                      <span className="text-pristine-white">{item.value}</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-primary-green/20 mt-1 overflow-hidden">
                                      <div className={`h-full rounded-full ${item.color}`} style={{ width: item.value }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* TEMOIGNAGES TAB */}
                  {activeTab === 'temoignages' && (
                    <motion.div
                      key="temoignages"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      {testimonies.length === 0 ? (
                        <div className="text-center py-12">
                          <Heart className="h-12 w-12 text-neutral-gray/30 mx-auto mb-3" />
                          <p className="text-sm text-neutral-gray">Aucun témoignage à modérer</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {testimonies.map(t => (
                            <div key={t.id} className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-4 hover:border-gold-rich/25 transition-all">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                                      t.isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                      {t.isApproved ? 'Publié' : 'En attente'}
                                    </span>
                                    <span className="text-[10px] font-mono text-neutral-gray">•</span>
                                    <span className="text-[10px] font-mono text-gold-bright uppercase">{t.category}</span>
                                  </div>
                                  <h4 className="font-serif italic text-sm text-pristine-white font-semibold truncate">
                                    « {t.title} »
                                  </h4>
                                  <p className="text-xs text-neutral-gray font-light mt-1 line-clamp-2">{t.content}</p>
                                  <p className="text-[10px] font-mono text-neutral-gray/60 mt-1.5">
                                    {t.authorName} • {new Date(t.createdAt).toLocaleDateString()}
                                  </p>
                                </div>

                                <div className="shrink-0 flex gap-2 self-end sm:self-center">
                                  {t.isApproved ? (
                                    <button
                                      onClick={() => onApproveTestimony(t.id, false)}
                                      className="px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-[9px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all"
                                    >
                                      Retirer
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => onApproveTestimony(t.id, true)}
                                      className="px-3.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                      Approuver
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ENSEIGNEMENTS TAB */}
                  {activeTab === 'enseignements' && (
                    <motion.div
                      key="enseignements"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="max-w-2xl mx-auto"
                    >
                      {teachAdded ? (
                        <div className="text-center py-16 flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle className="h-8 w-8" />
                          </div>
                          <h4 className="font-cinzel text-xl font-bold">Enseignement Publié !</h4>
                          <p className="text-sm text-neutral-gray max-w-sm">Le média a été indexé dans la bibliothèque spirituelle.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleCreateTeaching} className="space-y-5">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Titre de l'enseignement</label>
                              <input
                                type="text"
                                required
                                value={teachTitle}
                                onChange={e => setTeachTitle(e.target.value)}
                                placeholder="Ex: Le Timing de la Grâce Prophétique"
                                className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Type de média</label>
                                <select
                                  value={teachCat}
                                  onChange={e => setTeachCat(e.target.value as any)}
                                  className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                                >
                                  <option value="audio">Prédication Audio</option>
                                  <option value="video">Session Vidéo</option>
                                  <option value="pdf">Support PDF</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Taille / Durée</label>
                                <input
                                  type="text"
                                  required
                                  value={teachSize}
                                  onChange={e => setTeachSize(e.target.value)}
                                  placeholder="Ex: 15 MB"
                                  className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Résumé</label>
                              <textarea
                                required
                                rows={3}
                                value={teachDesc}
                                onChange={e => setTeachDesc(e.target.value)}
                                placeholder="Décrivez les lois ou révélations enseignées..."
                                className="w-full resize-none rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">
                                {teachCat === 'video' && 'Fichier Vidéo ou Photo'}
                                {teachCat === 'audio' && 'Fichier Audio ou Photo'}
                                {teachCat === 'pdf' && 'Photo de couverture'}
                              </label>
                              {teachMediaPreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-gold-rich/25 bg-black/40 p-2">
                                  {teachCat === 'video' ? (
                                    <video src={teachMediaPreview} className="w-full h-48 object-cover rounded" controls />
                                  ) : teachCat === 'audio' ? (
                                    <div className="flex items-center justify-center gap-3 py-8 text-gold-bright">
                                      <Music className="h-8 w-8 animate-pulse" />
                                      <span className="text-sm font-mono">Fichier Audio prêt</span>
                                    </div>
                                  ) : (
                                    <img src={teachMediaPreview} alt="Aperçu" className="w-full h-48 object-cover rounded" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={clearTeachMedia}
                                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/80 text-white hover:bg-red-500 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center gap-2 h-40 rounded-xl border-2 border-dashed border-gold-rich/20 hover:border-gold-rich/40 bg-primary-green/5 hover:bg-primary-green/10 cursor-pointer text-neutral-gray transition-colors">
                                  {teachCat === 'video' && <Video className="h-8 w-8 text-gold-rich" />}
                                  {teachCat === 'audio' && <Music className="h-8 w-8 text-gold-rich" />}
                                  {teachCat === 'pdf' && <ImagePlus className="h-8 w-8 text-gold-rich" />}
                                  <span className="text-xs font-mono uppercase tracking-wider">Cliquez pour sélectionner</span>
                                  <span className="text-[9px] text-neutral-gray/50">
                                    {teachCat === 'video' && 'MP4, MOV, JPG, PNG'}
                                    {teachCat === 'audio' && 'MP3, WAV, JPG, PNG'}
                                    {teachCat === 'pdf' && 'JPG, PNG'}
                                  </span>
                                  <input
                                    type="file"
                                    accept={teachCat === 'video' ? 'video/*,image/*' : teachCat === 'audio' ? 'audio/*,image/*' : 'image/*'}
                                    onChange={handleTeachMediaSelect}
                                    className="hidden"
                                  />
                                </label>
                              )}
                              {teachMediaError && (
                                <p className="text-xs text-red-400 font-mono mt-1.5">{teachMediaError}</p>
                              )}
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isUploadingTeachMedia}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-rich to-gold-bright py-3 text-xs font-bold font-mono uppercase tracking-widest text-deep-green hover:shadow-lg disabled:opacity-60 transition-all"
                          >
                            {isUploadingTeachMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {isUploadingTeachMedia ? 'Téléversement...' : 'Publier l\'Enseignement'}
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}

                  {/* EVENEMENTS TAB */}
                  {activeTab === 'evenements' && (
                    <motion.div
                      key="evenements"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="max-w-2xl mx-auto"
                    >
                      {eventAdded ? (
                        <div className="text-center py-16 flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle className="h-8 w-8" />
                          </div>
                          <h4 className="font-cinzel text-xl font-bold">Événement Programmé !</h4>
                          <p className="text-sm text-neutral-gray max-w-sm">Le rassemblement a été créé avec son visuel.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleCreateEvent} className="space-y-5">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Nom de l'événement</label>
                              <input
                                type="text"
                                required
                                value={eventTitle}
                                onChange={e => setEventTitle(e.target.value)}
                                placeholder="Ex: École de l'Onction Apostolique"
                                className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Date</label>
                                <input
                                  type="date"
                                  required
                                  value={eventDate}
                                  onChange={e => setEventDate(e.target.value)}
                                  className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Lieu</label>
                                <input
                                  type="text"
                                  required
                                  value={eventLoc}
                                  onChange={e => setEventLoc(e.target.value)}
                                  placeholder="Ex: Auditorium Abidjan"
                                  className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Description</label>
                              <textarea
                                required
                                rows={3}
                                value={eventDesc}
                                onChange={e => setEventDesc(e.target.value)}
                                placeholder="Expliquez la vision spirituelle de ce séminaire..."
                                className="w-full resize-none rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Photo / Visuel</label>
                              {eventMediaPreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-gold-rich/20">
                                  <img src={eventMediaPreview} alt="Aperçu" className="w-full h-48 object-cover" />
                                  <button
                                    type="button"
                                    onClick={clearEventMedia}
                                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/80 text-white hover:bg-red-500 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center gap-2 h-40 rounded-xl border-2 border-dashed border-gold-rich/20 hover:border-gold-rich/40 bg-primary-green/5 hover:bg-primary-green/10 cursor-pointer text-neutral-gray transition-colors">
                                  <ImagePlus className="h-8 w-8 text-gold-rich" />
                                  <span className="text-xs font-mono uppercase tracking-wider">Choisir une photo</span>
                                  <span className="text-[9px] text-neutral-gray/50">JPG, PNG, WEBP</span>
                                  <input type="file" accept="image/*" onChange={handleEventMediaSelect} className="hidden" />
                                </label>
                              )}
                              {eventMediaError && (
                                <p className="text-xs text-red-400 font-mono mt-1.5">{eventMediaError}</p>
                              )}
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isUploadingEventMedia}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-rich to-gold-bright py-3 text-xs font-bold font-mono uppercase tracking-widest text-deep-green hover:shadow-lg disabled:opacity-60 transition-all"
                          >
                            {isUploadingEventMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                            {isUploadingEventMedia ? 'Téléversement...' : 'Planifier l\'Événement'}
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}

                  {/* NOTIFICATIONS TAB */}
                  {activeTab === 'notifications' && (
                    <motion.div
                      key="notifications"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="max-w-2xl mx-auto space-y-6"
                    >
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
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                          <CheckCircle className="h-4 w-4 shrink-0" />
                          Notification envoyée avec succès !
                        </div>
                      )}

                      {notifError && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{notifError}</span>
                        </div>
                      )}

                      <form onSubmit={handleSendNotification} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Audience</label>
                          <select
                            value={notifAudience}
                            onChange={e => setNotifAudience(e.target.value as any)}
                            className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                          >
                            <option value="all-members">Tous les membres</option>
                            <option value="departements">Membres des départements</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Titre</label>
                          <input
                            type="text"
                            required
                            value={notifTitle}
                            onChange={e => setNotifTitle(e.target.value)}
                            placeholder="Ex: Rappel du culte de ce soir"
                            className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Message</label>
                          <textarea
                            required
                            rows={3}
                            value={notifBody}
                            onChange={e => setNotifBody(e.target.value)}
                            placeholder="Rédigez le contenu du message..."
                            className="w-full resize-none rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSendingNotif}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-rich to-gold-bright py-3 text-xs font-bold font-mono uppercase tracking-widest text-deep-green hover:shadow-lg disabled:opacity-60 transition-all"
                        >
                          {isSendingNotif ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                          {isSendingNotif ? 'Envoi en cours...' : 'Envoyer la Notification'}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* RAPPORTS TAB */}
                  {activeTab === 'rapports' && (
                    <motion.div
                      key="rapports"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                          <h4 className="font-cinzel text-sm font-bold mb-3">Résumé des Données</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-gray">Membres</span>
                              <span className="text-pristine-white font-mono">{stats.totalMembers.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-gray">Départements</span>
                              <span className="text-pristine-white font-mono">{stats.totalDepartments}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-gray">Témoignages</span>
                              <span className="text-pristine-white font-mono">{testimonies.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-gray">Enseignements</span>
                              <span className="text-pristine-white font-mono">{teachings.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-gray">Événements</span>
                              <span className="text-pristine-white font-mono">{registeredEvents.length}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                          <h4 className="font-cinzel text-sm font-bold mb-3">Actions Rapides</h4>
                          <div className="space-y-2">
                            <button className="w-full px-4 py-2.5 rounded-xl border border-gold-rich/15 text-sm text-pristine-white hover:bg-gold-rich/5 transition-all text-left flex items-center gap-3">
                              <FileSpreadsheet className="h-4 w-4 text-gold-rich" />
                              Exporter les membres
                            </button>
                            <button className="w-full px-4 py-2.5 rounded-xl border border-gold-rich/15 text-sm text-pristine-white hover:bg-gold-rich/5 transition-all text-left flex items-center gap-3">
                              <FileSpreadsheet className="h-4 w-4 text-gold-rich" />
                              Exporter les témoignages
                            </button>
                            <button className="w-full px-4 py-2.5 rounded-xl border border-gold-rich/15 text-sm text-pristine-white hover:bg-gold-rich/5 transition-all text-left flex items-center gap-3">
                              <FileSpreadsheet className="h-4 w-4 text-gold-rich" />
                              Exporter les enseignements
                            </button>
                            <button
                              onClick={handleExport}
                              disabled={isExporting}
                              className="w-full px-4 py-2.5 rounded-xl bg-gold-rich text-deep-green font-bold text-sm text-center hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              {isExporting ? 'Exportation...' : 'Exporter tout (Excel)'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

