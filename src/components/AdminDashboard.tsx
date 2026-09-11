import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  TrendingUp,
  Award,
  CheckCircle,
  Send,
  Flame,
  AlertCircle,
  Loader2,
  ImagePlus,
  Video,
  Music,
  ChevronRight,
  Search,
  Download,
  UserRound,
  MoreVertical,
  Globe,
  Activity,
  ShieldCheck,
} from 'lucide-react';

import { MOCK_ADMIN_METRICS } from '../mockData';
import { uploadImageToCloudinary } from '../lib/cloudinaryService';
import {
  subscribeToGlobalStats,
  GlobalStats,
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

const NOTIFICATIONS_API_URL = (
  import.meta as ImportMetaWithEnv
).env.VITE_NOTIFICATIONS_API_URL;

const NOTIF_TEMPLATES = [
  {
    label: 'Rappel Mercredi',
    title: "Culte d'enseignement ce soir",
    body: "Rendez-vous à 18h30 à l'Auditorium Central pour le culte d'enseignement doctrinal. Soyez ponctuel !",
  },
  {
    label: 'Rappel Vendredi',
    title: 'Grande veillée de combat spirituel',
    body: "La veillée débute à 22h00 ce soir jusqu'à 02h00. Venez avec un cœur en position de combat !",
  },
  {
    label: 'Rappel Dimanche',
    title: "Culte d'impact et de miracles",
    body: "Le culte du dimanche commence à 08h00. Ne manquez pas ce temps de gloire !",
  },
  {
    label: 'Bilan Hebdomadaire',
    title: 'Bilan de la semaine — Christ Army',
    body: "Découvrez le résumé des activités, enrôlements et enseignements publiés cette semaine.",
  },
];

export default function AdminDashboard({
  onAddTeaching,
  onAddEvent,
  onApproveTestimony,
  onExportExcel,
  testimonies,
  registeredEvents,
  teachings,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    | 'stats'
    | 'temoignages'
    | 'enseignements'
    | 'evenements'
    | 'notifications'
    | 'rapports'
  >('stats');

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

  /* ============================================================
     TEACHING
  ============================================================ */

  const [teachTitle, setTeachTitle] = useState('');
  const [teachCat, setTeachCat] = useState<
    'audio' | 'pdf' | 'video'
  >('pdf');
  const [teachSize, setTeachSize] = useState('2.4 MB');
  const [teachDesc, setTeachDesc] = useState('');
  const [teachAdded, setTeachAdded] = useState(false);

  const [teachMediaFile, setTeachMediaFile] =
    useState<File | null>(null);

  const [teachMediaPreview, setTeachMediaPreview] =
    useState<string | null>(null);

  const [isUploadingTeachMedia, setIsUploadingTeachMedia] =
    useState(false);

  const [teachMediaError, setTeachMediaError] =
    useState<string | null>(null);

  /* ============================================================
     EVENTS
  ============================================================ */

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState(
    '19:00 - 21:00 GMT'
  );
  const [eventLoc, setEventLoc] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventAdded, setEventAdded] = useState(false);

  const [eventMediaFile, setEventMediaFile] =
    useState<File | null>(null);

  const [eventMediaPreview, setEventMediaPreview] =
    useState<string | null>(null);

  const [isUploadingEventMedia, setIsUploadingEventMedia] =
    useState(false);

  const [eventMediaError, setEventMediaError] =
    useState<string | null>(null);

  /* ============================================================
     EXPORT
  ============================================================ */

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  /* ============================================================
     NOTIFICATIONS
  ============================================================ */

  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  const [notifAudience, setNotifAudience] = useState<
    'all-members' | 'departements'
  >('all-members');

  const [isSendingNotif, setIsSendingNotif] =
    useState(false);

  const [notifSent, setNotifSent] = useState(false);

  const [notifError, setNotifError] =
    useState<string | null>(null);

  /* ============================================================
     SEARCH
  ============================================================ */

  const [searchTerm, setSearchTerm] = useState('');

  /* ============================================================
     FIREBASE STATS
  ============================================================ */

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToGlobalStats((newStats) => {
      setStats(newStats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ============================================================
     EXPORT
  ============================================================ */

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      onExportExcel();

      setIsExporting(false);
      setExportSuccess(true);

      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    }, 1500);
  };

  /* ============================================================
     TEACHING MEDIA
  ============================================================ */

  const handleTeachMediaSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  /* ============================================================
     EVENT MEDIA
  ============================================================ */

  const handleEventMediaSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  /* ============================================================
     CREATE TEACHING
  ============================================================ */

  const handleCreateTeaching = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setTeachMediaError(null);

    let mediaUrl =
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400';

    if (teachMediaFile) {
      setIsUploadingTeachMedia(true);

      try {
        mediaUrl =
          await uploadImageToCloudinary(teachMediaFile);
      } catch (err) {
        setIsUploadingTeachMedia(false);

        setTeachMediaError(
          err instanceof Error
            ? err.message
            : 'Échec du téléversement du média.'
        );

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
      durationOrPages:
        teachCat === 'pdf' ? '24 Pages' : '1h 15m',
      fileSize: teachSize,
      description: teachDesc,
      playsCount: 0,
      downloadsCount: 0,
      coverImage:
        teachCat === 'video' || teachCat === 'audio'
          ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400'
          : mediaUrl,
      videoUrl:
        teachCat === 'video' ? mediaUrl : '#',
      fileUrl:
        teachCat === 'audio' ? mediaUrl : '#',
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

  /* ============================================================
     CREATE EVENT
  ============================================================ */

  const handleCreateEvent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setEventMediaError(null);

    let imageUrl =
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800';

    if (eventMediaFile) {
      setIsUploadingEventMedia(true);

      try {
        imageUrl =
          await uploadImageToCloudinary(eventMediaFile);
      } catch (err) {
        setIsUploadingEventMedia(false);

        setEventMediaError(
          err instanceof Error
            ? err.message
            : 'Échec du téléversement de la photo/vidéo.'
        );

        return;
      }

      setIsUploadingEventMedia(false);
    }

    const newEvent = {
      id: `ev-admin-${Date.now()}`,
      title: eventTitle,
      date: eventDate,
      time: eventTime,
      location: eventLoc,
      speaker: 'Prophète Kader Josué Fadika',
      imageUrl,
      description: eventDesc,
      fullProgram: [
        "19h00 : Accueil spirituel et introduction",
        "19h30 : Louange d'impact prophétique",
        '20h00 : Message de puissance du Prophète Kader Josué',
        '21h00 : Clôture et déclarations',
      ],
      isFree: true,
      countdownTarget: `${eventDate}T19:00:00`,
      registeredCount: 0,
      maxCapacity: 1000,
    };

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
  };

  /* ============================================================
     NOTIFICATIONS
  ============================================================ */

  const applyTemplate = (
    tpl: typeof NOTIF_TEMPLATES[number]
  ) => {
    setNotifTitle(tpl.title);
    setNotifBody(tpl.body);
  };

  const handleSendNotification = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setNotifError(null);

    if (!NOTIFICATIONS_API_URL) {
      setNotifError(
        "VITE_NOTIFICATIONS_API_URL n'est pas configurée. Déployez le petit serveur Node puis renseignez son URL."
      );

      return;
    }

    setIsSendingNotif(true);

    try {
      const res = await fetch(
        `${NOTIFICATIONS_API_URL}/api/send-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: notifTitle,
            body: notifBody,
            topic: notifAudience,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('send-failed');
      }

      setNotifSent(true);

      setTimeout(() => {
        setNotifSent(false);
      }, 3500);

      setNotifTitle('');
      setNotifBody('');
    } catch {
      setNotifError(
        "L'envoi a échoué. Vérifiez que le serveur de notifications est bien démarré."
      );
    } finally {
      setIsSendingNotif(false);
    }
  };

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const navItems = [
    {
      id: 'stats' as const,
      label: 'Vue d’ensemble',
      icon: LayoutDashboard,
      description: 'Vision globale',
    },
    {
      id: 'temoignages' as const,
      label: 'Témoignages',
      icon: Heart,
      description: 'Actions de grâce',
      badge: testimonies.filter(
        (t) => !t.isApproved
      ).length,
    },
    {
      id: 'enseignements' as const,
      label: 'Enseignements',
      icon: BookOpen,
      description: 'Bibliothèque spirituelle',
    },
    {
      id: 'evenements' as const,
      label: 'Événements',
      icon: Calendar,
      description: 'Programme du ministère',
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      icon: Bell,
      description: 'Communication',
    },
    {
      id: 'rapports' as const,
      label: 'Rapports',
      icon: FileSpreadsheet,
      description: 'Données & exports',
    },
  ];

  /* ============================================================
     PAGE INFORMATION
  ============================================================ */

  const pageInfo = {
    stats: {
      eyebrow: 'Centre de commandement',
      title: 'Vue d’ensemble du ministère',
      description:
        'Une vision globale de la vie, de la croissance et de l’activité du ministère.',
    },

    temoignages: {
      eyebrow: 'Communauté',
      title: 'Témoignages',
      description:
        'Examinez, validez et gérez les actions de grâce soumises par la communauté.',
    },

    enseignements: {
      eyebrow: 'Bibliothèque spirituelle',
      title: 'Enseignements',
      description:
        'Publiez et gérez les enseignements, prédications et ressources du Prophète.',
    },

    evenements: {
      eyebrow: 'Agenda du ministère',
      title: 'Événements',
      description:
        'Planifiez et organisez les cultes, séminaires, veillées et rassemblements.',
    },

    notifications: {
      eyebrow: 'Communication',
      title: 'Notifications',
      description:
        'Communiquez directement avec les membres et départements du ministère.',
    },

    rapports: {
      eyebrow: 'Administration',
      title: 'Rapports',
      description:
        'Consultez les données du ministère et exportez les rapports nécessaires.',
    },
  };

  const currentPage = pageInfo[activeTab];

  /* ============================================================
     QUICK STATS
  ============================================================ */

  const quickStats = [
    {
      label: 'Membres totaux',
      value: stats.totalMembers.toLocaleString(),
      change: `+${stats.membersGrowth || 0}%`,
      icon: Users,
    },
    {
      label: 'Départements',
      value:
        MOCK_ADMIN_METRICS.totalDepartments.toString(),
      change: `+${stats.departmentsGrowth || 0}%`,
      icon: TrendingUp,
    },
    {
      label: 'Caisse de solidarité',
      value: `${stats.solidarityFund.toLocaleString()} FCFA`,
      change: `+${stats.fundGrowth || 0}%`,
      icon: Award,
    },
    {
      label: 'Témoignages',
      value: testimonies.length.toString(),
      change: `${
        testimonies.filter((t) => t.isApproved).length
      } approuvés`,
      icon: Heart,
    },
  ];

  /* ============================================================
     RECENT ACTIVITIES
  ============================================================ */

  const recentActivities = [
    {
      icon: Users,
      action: 'Nouveau membre enrôlé',
      time: 'Il y a 2 min',
      user: 'Marie Kouadio',
    },
    {
      icon: Heart,
      action: 'Témoignage approuvé',
      time: 'Il y a 15 min',
      user: 'Jean Assouan',
    },
    {
      icon: BookOpen,
      action: 'Nouvel enseignement publié',
      time: 'Il y a 1h',
      user: 'Prophète Kader',
    },
    {
      icon: Calendar,
      action: 'Événement programmé',
      time: 'Il y a 3h',
      user: 'Secrétariat',
    },
  ];

  /* ============================================================
     SELECT TAB
  ============================================================ */

  const selectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <section
      id="admin"
      className="min-h-screen bg-[#06170d] text-pristine-white"
    >
      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Fermer le menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          FIXED SIDEBAR
      ====================================================== */}
<aside
  className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-gold-rich/10 bg-[#04130a] shadow-2xl transition-transform duration-300 ${
    sidebarOpen
      ? 'translate-x-0'
      : '-translate-x-full lg:translate-x-0'
  }`}
>
  <div className="flex h-full min-h-0 flex-col">

    {/* LOGO / HEADER */}
    <div className="shrink-0 border-b border-gold-rich/10 px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-rich/30 bg-gold-rich/10">
            <Flame className="h-5 w-5 text-gold-bright" />
          </div>

          <div className="min-w-0">
            <h1 className="font-cinzel text-[17px] font-bold text-pristine-white">
              Christ Army
            </h1>
            <p className="mt-0.5 text-[11px] text-neutral-gray">
              Console du Leader
            </p>
          </div>
        </div>

        {/* Mobile close */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-2 text-neutral-gray transition hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* STATUS */}
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] font-medium text-emerald-300/80">
          Session sécurisée
        </span>
      </div>
    </div>

    {/* NAVIGATION */}
    <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 lg:overflow-visible">

      <p className="mb-2 px-3 text-[9px] font-mono font-semibold uppercase tracking-[0.22em] text-neutral-gray/60">
        Navigation
      </p>

      <div className="space-y-1">

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                isActive
                  ? 'bg-gold-rich/[0.10] text-gold-bright'
                  : 'text-neutral-gray hover:bg-white/[0.035] hover:text-pristine-white'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-gold-bright" />
              )}

              {/* Icon */}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                  isActive
                    ? 'bg-gold-rich/15 text-gold-bright'
                    : 'bg-white/[0.025] text-neutral-gray group-hover:bg-white/[0.06] group-hover:text-white'
                }`}
              >
                <Icon className="h-[17px] w-[17px]" />
              </span>

              {/* Text */}
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[13px] font-medium ${
                    isActive
                      ? 'text-gold-bright'
                      : 'text-pristine-white/90'
                  }`}
                >
                  {item.label}
                </span>

                <span className="mt-0.5 block truncate text-[9px] text-neutral-gray/60">
                  {item.description}
                </span>
              </span>

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/15 px-1.5 text-[9px] font-bold text-red-400">
                  {item.badge}
                </span>
              )}

              {/* Active arrow */}
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gold-rich" />
              )}
            </button>
          );
        })}

      </div>
    </nav>

    {/* FOOTER */}
    <div className="shrink-0 border-t border-gold-rich/10 p-3">

      {/* Leader profile */}
      <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-rich/10">
          <UserRound className="h-4 w-4 text-gold-bright" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-pristine-white">
            Prophète Kader Josué Fadika
          </p>
          <p className="mt-0.5 text-[9px] text-neutral-gray">
            Administrateur principal
          </p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          // ton système de déconnexion ici
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-neutral-gray transition hover:bg-red-500/[0.06] hover:text-red-400"
      >
        <LogOut className="h-4 w-4" />
        <span>Se déconnecter</span>
      </button>
    </div>

  </div>
</aside>

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

<main className="min-w-0 flex-1 lg:ml-[280px]">        
  {/* ====================================================
            TOPBAR
        ==================================================== */}

        <header className="sticky top-0 z-[60] flex h-[76px] items-center justify-between border-b border-gold-rich/10 bg-[#06170d]/90 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* MOBILE MENU */}

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-gold-rich/10 bg-primary-green/10 p-2.5 text-neutral-gray transition hover:border-gold-rich/20 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* PAGE TITLE */}

            <div className="min-w-0">
              <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-gold-rich">
                Centre d’administration
              </p>

              <h1 className="truncate font-cinzel text-base font-bold sm:text-lg">
                {currentPage.title}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* SEARCH */}

            <div className="hidden items-center gap-2 rounded-xl border border-gold-rich/10 bg-primary-green/10 px-3 py-2 md:flex">
              <Search className="h-4 w-4 text-neutral-gray" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Rechercher..."
                className="w-32 bg-transparent text-xs text-pristine-white outline-none placeholder:text-neutral-gray lg:w-48"
              />
            </div>

            {/* EXPORT */}

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="hidden items-center gap-2 rounded-xl bg-gold-rich px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest text-deep-green transition hover:bg-gold-bright disabled:opacity-50 sm:flex"
            >
              <FileSpreadsheet className="h-4 w-4" />

              {isExporting ? '...' : 'Export'}
            </button>

            {/* PROFILE */}

            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-rich/15 bg-gold-rich/10 transition hover:bg-gold-rich/15">
              <UserRound className="h-4 w-4 text-gold-bright" />
            </button>
          </div>
        </header>

        {/* EXPORT TOAST */}

        <AnimatePresence>
          {exportSuccess && (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 20,
              }}
              className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-[#092116]/95 px-4 py-3 text-xs text-emerald-300 shadow-2xl backdrop-blur-xl"
            >
              <CheckCircle className="h-4 w-4" />

              Rapport exporté avec succès !
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="p-4 sm:p-6 lg:p-8">
          {/* PAGE HEADER */}

          <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-gold-rich">
                {currentPage.eyebrow}
              </p>

              <h2 className="font-cinzel text-2xl font-bold sm:text-3xl">
                {currentPage.title}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-gray">
                {currentPage.description}
              </p>
            </div>

            {/* MOBILE EXPORT */}

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 rounded-xl bg-gold-rich px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-deep-green transition hover:bg-gold-bright disabled:opacity-50 md:hidden"
            >
              <Download className="h-4 w-4" />

              {isExporting
                ? 'Exportation...'
                : 'Exporter'}
            </button>
          </div>

          {/* ==================================================
              STATS CARDS
              UNIQUEMENT SUR LA VUE D'ENSEMBLE
          ================================================== */}

          {activeTab === 'stats' && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={index}
                    className="group rounded-2xl border border-gold-rich/10 bg-[#0a2113] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-rich/20 hover:bg-[#0c2616]"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-neutral-gray">
                        {stat.label}
                      </span>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-rich/10 bg-gold-rich/5">
                        <Icon className="h-4 w-4 text-gold-bright" />
                      </div>
                    </div>

                    <p className="font-cinzel text-xl font-bold sm:text-2xl">
                      {stat.value}
                    </p>

                    <p className="mt-1.5 text-[10px] text-emerald-400">
                      {stat.change}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ==================================================
              MAIN PANEL
          ================================================== */}

          <div className="overflow-hidden rounded-2xl border border-gold-rich/10 bg-[#071b0f] shadow-2xl">
            {/* PANEL HEADER */}

            <div className="border-b border-gold-rich/10 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                {(() => {
                  const current = navItems.find(
                    (n) => n.id === activeTab
                  );

                  const Icon =
                    current?.icon || LayoutDashboard;

                  return (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-rich/10 bg-gold-rich/5">
                      <Icon className="h-4 w-4 text-gold-bright" />
                    </div>
                  );
                })()}

                <div>
                  <h3 className="font-cinzel text-sm font-bold">
                    {activeTab === 'stats' &&
                      "Activité du ministère"}

                    {activeTab === 'temoignages' &&
                      'Modération des témoignages'}

                    {activeTab === 'enseignements' &&
                      "Publication d'enseignements"}

                    {activeTab === 'evenements' &&
                      "Programmation d'événements"}

                    {activeTab === 'notifications' &&
                      'Communication communautaire'}

                    {activeTab === 'rapports' &&
                      'Rapports et exportations'}
                  </h3>

                  <p className="mt-0.5 text-[10px] text-neutral-gray">
                    {activeTab === 'stats' &&
                      'Statistiques globales et activité récente.'}

                    {activeTab === 'temoignages' &&
                      `${
                        testimonies.filter(
                          (t) => !t.isApproved
                        ).length
                      } témoignage(s) en attente.`}

                    {activeTab === 'enseignements' &&
                      'Ajoutez des ressources audio, vidéo ou PDF.'}

                    {activeTab === 'evenements' &&
                      'Créez et planifiez les prochains rassemblements.'}

                    {activeTab === 'notifications' &&
                      'Envoyez des alertes aux membres.'}

                    {activeTab === 'rapports' &&
                      'Exportez les données du ministère.'}
                  </p>
                </div>
              </div>
            </div>

            {/* PANEL CONTENT */}

            <div className="p-5 sm:p-6 lg:p-7">
              <AnimatePresence mode="wait">

                {/* ==================================================
                    STATS
                ================================================== */}

                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="space-y-6"
                  >
                    {loading ? (
                      <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-gold-bright" />

                        <span className="ml-3 text-sm text-neutral-gray">
                          Chargement des statistiques...
                        </span>
                      </div>
                    ) : (
                      <>
                        

                      </>
                    )}
                  </motion.div>
                )}

                {/* ==================================================
                    TEMOIGNAGES
                ================================================== */}

                {activeTab === 'temoignages' && (
                  <motion.div
                    key="temoignages"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="space-y-4"
                  >
                    {testimonies.length === 0 ? (
                      <div className="py-16 text-center">
                        <Heart className="mx-auto mb-3 h-12 w-12 text-neutral-gray/30" />

                        <p className="text-sm text-neutral-gray">
                          Aucun témoignage à modérer
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {testimonies.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-4 transition-all hover:border-gold-rich/25"
                          >
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded px-2 py-0.5 text-[9px] font-mono uppercase ${
                                      t.isApproved
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-amber-500/20 text-amber-400'
                                    }`}
                                  >
                                    {t.isApproved
                                      ? 'Publié'
                                      : 'En attente'}
                                  </span>

                                  <span className="text-[10px] text-neutral-gray">
                                    •
                                  </span>

                                  <span className="text-[10px] font-mono uppercase text-gold-bright">
                                    {t.category}
                                  </span>
                                </div>

                                <h4 className="truncate font-serif text-sm font-semibold italic text-pristine-white">
                                  « {t.title} »
                                </h4>

                                <p className="mt-1 line-clamp-2 text-xs font-light text-neutral-gray">
                                  {t.content}
                                </p>

                                <p className="mt-1.5 text-[10px] font-mono text-neutral-gray/60">
                                  {t.authorName} •{' '}
                                  {new Date(
                                    t.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>

                              <div className="flex shrink-0 gap-2 self-end sm:self-center">
                                {t.isApproved ? (
                                  <button
                                    onClick={() =>
                                      onApproveTestimony(
                                        t.id,
                                        false
                                      )
                                    }
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-[9px] font-mono uppercase tracking-wider text-red-400 transition-all hover:bg-red-500 hover:text-white"
                                  >
                                    Retirer
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      onApproveTestimony(
                                        t.id,
                                        true
                                      )
                                    }
                                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[9px] font-mono uppercase tracking-wider text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white"
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

                {/* ==================================================
                    ENSEIGNEMENTS
                ================================================== */}

                {activeTab === 'enseignements' && (
                  <motion.div
                    key="enseignements"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="mx-auto max-w-2xl"
                  >
                    {teachAdded ? (
                      <div className="flex flex-col items-center gap-4 py-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          <CheckCircle className="h-8 w-8" />
                        </div>

                        <h4 className="font-cinzel text-xl font-bold">
                          Enseignement publié !
                        </h4>

                        <p className="max-w-sm text-sm text-neutral-gray">
                          Le média a été ajouté à la bibliothèque spirituelle.
                        </p>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleCreateTeaching}
                        className="space-y-5"
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                              Titre de l'enseignement
                            </label>

                            <input
                              type="text"
                              required
                              value={teachTitle}
                              onChange={(e) =>
                                setTeachTitle(e.target.value)
                              }
                              placeholder="Ex: Le Timing de la Grâce Prophétique"
                              className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                                Type de média
                              </label>

                              <select
                                value={teachCat}
                                onChange={(e) =>
                                  setTeachCat(
                                    e.target.value as
                                      | 'audio'
                                      | 'pdf'
                                      | 'video'
                                  )
                                }
                                className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                              >
                                <option value="audio">
                                  Prédication Audio
                                </option>

                                <option value="video">
                                  Session Vidéo
                                </option>

                                <option value="pdf">
                                  Support PDF
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                                Taille / Durée
                              </label>

                              <input
                                type="text"
                                required
                                value={teachSize}
                                onChange={(e) =>
                                  setTeachSize(e.target.value)
                                }
                                placeholder="Ex: 15 MB"
                                className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                              Résumé
                            </label>

                            <textarea
                              required
                              rows={3}
                              value={teachDesc}
                              onChange={(e) =>
                                setTeachDesc(e.target.value)
                              }
                              placeholder="Décrivez les lois ou révélations enseignées..."
                              className="w-full resize-none rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                              {teachCat === 'video' &&
                                'Fichier Vidéo ou Photo'}

                              {teachCat === 'audio' &&
                                'Fichier Audio ou Photo'}

                              {teachCat === 'pdf' &&
                                'Photo de couverture'}
                            </label>

                            {teachMediaPreview ? (
                              <div className="relative overflow-hidden rounded-xl border border-gold-rich/25 bg-black/40 p-2">
                                {teachCat === 'video' ? (
                                  <video
                                    src={teachMediaPreview}
                                    className="h-48 w-full rounded object-cover"
                                    controls
                                  />
                                ) : teachCat === 'audio' ? (
                                  <div className="flex items-center justify-center gap-3 py-8 text-gold-bright">
                                    <Music className="h-8 w-8 animate-pulse" />

                                    <span className="text-sm font-mono">
                                      Fichier Audio prêt
                                    </span>
                                  </div>
                                ) : (
                                  <img
                                    src={teachMediaPreview}
                                    alt="Aperçu"
                                    className="h-48 w-full rounded object-cover"
                                  />
                                )}

                                <button
                                  type="button"
                                  onClick={clearTeachMedia}
                                  className="absolute right-3 top-3 rounded-full bg-black/80 p-1.5 text-white transition hover:bg-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold-rich/20 bg-primary-green/5 text-neutral-gray transition-colors hover:border-gold-rich/40 hover:bg-primary-green/10">
                                {teachCat === 'video' && (
                                  <Video className="h-8 w-8 text-gold-rich" />
                                )}

                                {teachCat === 'audio' && (
                                  <Music className="h-8 w-8 text-gold-rich" />
                                )}

                                {teachCat === 'pdf' && (
                                  <ImagePlus className="h-8 w-8 text-gold-rich" />
                                )}

                                <span className="text-xs font-mono uppercase tracking-wider">
                                  Cliquez pour sélectionner
                                </span>

                                <span className="text-[9px] text-neutral-gray/50">
                                  {teachCat === 'video' &&
                                    'MP4, MOV, JPG, PNG'}

                                  {teachCat === 'audio' &&
                                    'MP3, WAV, JPG, PNG'}

                                  {teachCat === 'pdf' &&
                                    'JPG, PNG'}
                                </span>

                                <input
                                  type="file"
                                  accept={
                                    teachCat === 'video'
                                      ? 'video/*,image/*'
                                      : teachCat ===
                                        'audio'
                                      ? 'audio/*,image/*'
                                      : 'image/*'
                                  }
                                  onChange={
                                    handleTeachMediaSelect
                                  }
                                  className="hidden"
                                />
                              </label>
                            )}

                            {teachMediaError && (
                              <p className="mt-1.5 text-xs font-mono text-red-400">
                                {teachMediaError}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isUploadingTeachMedia}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-rich to-gold-bright py-3 text-xs font-bold uppercase tracking-widest text-deep-green transition-all hover:shadow-lg disabled:opacity-60"
                        >
                          {isUploadingTeachMedia ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}

                          {isUploadingTeachMedia
                            ? 'Téléversement...'
                            : "Publier l'enseignement"}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}

                {/* ==================================================
                    EVENEMENTS
                ================================================== */}

                {activeTab === 'evenements' && (
                  <motion.div
                    key="evenements"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="mx-auto max-w-2xl"
                  >
                    {eventAdded ? (
                      <div className="flex flex-col items-center gap-4 py-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          <CheckCircle className="h-8 w-8" />
                        </div>

                        <h4 className="font-cinzel text-xl font-bold">
                          Événement programmé !
                        </h4>

                        <p className="max-w-sm text-sm text-neutral-gray">
                          Le rassemblement a été créé avec son visuel.
                        </p>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleCreateEvent}
                        className="space-y-5"
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                              Nom de l'événement
                            </label>

                            <input
                              type="text"
                              required
                              value={eventTitle}
                              onChange={(e) =>
                                setEventTitle(e.target.value)
                              }
                              placeholder="Ex: École de l'Onction Apostolique"
                              className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                                Date
                              </label>

                              <input
                                type="date"
                                required
                                value={eventDate}
                                onChange={(e) =>
                                  setEventDate(e.target.value)
                                }
                                className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                                Lieu
                              </label>

                              <input
                                type="text"
                                required
                                value={eventLoc}
                                onChange={(e) =>
                                  setEventLoc(e.target.value)
                                }
                                placeholder="Ex: Auditorium Abidjan"
                                className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                              Horaire
                            </label>

                            <input
                              type="text"
                              required
                              value={eventTime}
                              onChange={(e) =>
                                setEventTime(e.target.value)
                              }
                              placeholder="19:00 - 21:00 GMT"
                              className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                              Description
                            </label>

                            <textarea
                              required
                              rows={3}
                              value={eventDesc}
                              onChange={(e) =>
                                setEventDesc(e.target.value)
                              }
                              placeholder="Expliquez la vision spirituelle de ce séminaire..."
                              className="w-full resize-none rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                              Photo / Visuel
                            </label>

                            {eventMediaPreview ? (
                              <div className="relative overflow-hidden rounded-xl border border-gold-rich/20">
                                <img
                                  src={eventMediaPreview}
                                  alt="Aperçu"
                                  className="h-48 w-full object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={clearEventMedia}
                                  className="absolute right-3 top-3 rounded-full bg-black/80 p-1.5 text-white transition hover:bg-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold-rich/20 bg-primary-green/5 text-neutral-gray transition-colors hover:border-gold-rich/40 hover:bg-primary-green/10">
                                <ImagePlus className="h-8 w-8 text-gold-rich" />

                                <span className="text-xs font-mono uppercase tracking-wider">
                                  Choisir une photo
                                </span>

                                <span className="text-[9px] text-neutral-gray/50">
                                  JPG, PNG, WEBP
                                </span>

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={
                                    handleEventMediaSelect
                                  }
                                  className="hidden"
                                />
                              </label>
                            )}

                            {eventMediaError && (
                              <p className="mt-1.5 text-xs font-mono text-red-400">
                                {eventMediaError}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isUploadingEventMedia}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-rich to-gold-bright py-3 text-xs font-bold uppercase tracking-widest text-deep-green transition-all hover:shadow-lg disabled:opacity-60"
                        >
                          {isUploadingEventMedia ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Calendar className="h-4 w-4" />
                          )}

                          {isUploadingEventMedia
                            ? 'Téléversement...'
                            : "Planifier l'événement"}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}

                {/* ==================================================
                    NOTIFICATIONS
                ================================================== */}

                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="mx-auto max-w-2xl space-y-6"
                  >
                    <div className="flex flex-wrap gap-2">
                      {NOTIF_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.label}
                          type="button"
                          onClick={() =>
                            applyTemplate(tpl)
                          }
                          className="rounded-full border border-gold-rich/20 bg-primary-green/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-gold-bright transition-all hover:bg-gold-rich hover:text-deep-green"
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
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>{notifError}</span>
                      </div>
                    )}

                    <form
                      onSubmit={handleSendNotification}
                      className="space-y-4"
                    >
                      <div>
                        <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                          Audience
                        </label>

                        <select
                          value={notifAudience}
                          onChange={(e) =>
                            setNotifAudience(
                              e.target.value as
                                | 'all-members'
                                | 'departements'
                            )
                          }
                          className="w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-pristine-white outline-none"
                        >
                          <option value="all-members">
                            Tous les membres
                          </option>

                          <option value="departements">
                            Membres des départements
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                          Titre
                        </label>

                        <input
                          type="text"
                          required
                          value={notifTitle}
                          onChange={(e) =>
                            setNotifTitle(e.target.value)
                          }
                          placeholder="Ex: Rappel du culte de ce soir"
                          className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                          Message
                        </label>

                        <textarea
                          required
                          rows={4}
                          value={notifBody}
                          onChange={(e) =>
                            setNotifBody(e.target.value)
                          }
                          placeholder="Rédigez le contenu du message..."
                          className="w-full resize-none rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingNotif}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-rich to-gold-bright py-3 text-xs font-bold uppercase tracking-widest text-deep-green transition-all hover:shadow-lg disabled:opacity-60"
                      >
                        {isSendingNotif ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}

                        {isSendingNotif
                          ? 'Envoi en cours...'
                          : 'Envoyer la notification'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* ==================================================
                    RAPPORTS
                ================================================== */}

                {activeTab === 'rapports' && (
                  <motion.div
                    key="rapports"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* SUMMARY */}

                      <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-gold-bright" />

                          <h4 className="font-cinzel text-sm font-bold">
                            Résumé des données
                          </h4>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-gray">
                              Membres
                            </span>

                            <span className="font-mono text-pristine-white">
                              {stats.totalMembers.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-gray">
                              Départements
                            </span>

                            <span className="font-mono text-pristine-white">
                              {
                                MOCK_ADMIN_METRICS.totalDepartments
                              }
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-gray">
                              Témoignages
                            </span>

                            <span className="font-mono text-pristine-white">
                              {testimonies.length}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-gray">
                              Enseignements
                            </span>

                            <span className="font-mono text-pristine-white">
                              {teachings.length}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-gray">
                              Événements
                            </span>

                            <span className="font-mono text-pristine-white">
                              {registeredEvents.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <Download className="h-4 w-4 text-gold-bright" />

                          <h4 className="font-cinzel text-sm font-bold">
                            Actions rapides
                          </h4>
                        </div>

                        <div className="space-y-2">
                          <button className="flex w-full items-center gap-3 rounded-xl border border-gold-rich/15 px-4 py-2.5 text-left text-sm text-pristine-white transition-all hover:bg-gold-rich/5">
                            <FileSpreadsheet className="h-4 w-4 text-gold-rich" />

                            Exporter les membres
                          </button>

                          <button className="flex w-full items-center gap-3 rounded-xl border border-gold-rich/15 px-4 py-2.5 text-left text-sm text-pristine-white transition-all hover:bg-gold-rich/5">
                            <FileSpreadsheet className="h-4 w-4 text-gold-rich" />

                            Exporter les témoignages
                          </button>

                          <button className="flex w-full items-center gap-3 rounded-xl border border-gold-rich/15 px-4 py-2.5 text-left text-sm text-pristine-white transition-all hover:bg-gold-rich/5">
                            <FileSpreadsheet className="h-4 w-4 text-gold-rich" />

                            Exporter les enseignements
                          </button>

                          <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-rich px-4 py-2.5 text-sm font-bold text-deep-green transition-all hover:bg-gold-bright disabled:opacity-50"
                          >
                            <Download className="h-4 w-4" />

                            {isExporting
                              ? 'Exportation...'
                              : 'Exporter tout (Excel)'}
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
    </section>
  );
}