import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  BellRing,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Target,
  LayoutDashboard,
  Menu,
  LogOut,
  ChevronRight,
  UserRound,
  Activity,
  ClipboardList,
} from 'lucide-react';

import { User as UserType, Department } from '../types';

import {
  subscribeToDeptMembers,
  subscribeToDepartments,
  DeptInscriptionData,
  subscribeToDeptAttendance,
  saveAttendanceSession,
  toggleAttendancePresence,
  deleteAttendanceSession,
  AttendanceSessionData,
} from '../lib/firestoreService';

interface ManagerAccountProps {
  user: UserType;
}

interface TaskItem {
  id: string;
  text: string;
  category: 'jour' | 'semaine' | 'mois';
  completed: boolean;
}

type ImportMetaWithEnv = ImportMeta & {
  readonly env: {
    readonly VITE_NOTIFICATIONS_API_URL?: string;
  };
};

const NOTIFICATIONS_API_URL = (
  import.meta as ImportMetaWithEnv
).env.VITE_NOTIFICATIONS_API_URL;

export default function ManagerAccount({ user }: ManagerAccountProps) {
  const departmentId = user.managedDepartmentId;

  const [department, setDepartment] = useState<Department | null>(null);

  const [members, setMembers] = useState<DeptInscriptionData[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'membres' | 'presence' | 'objectifs' | 'notifications'
  >('overview');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---------------------------------------------------------
  // PRÉSENCES
  // ---------------------------------------------------------

  const [attendanceSessions, setAttendanceSessions] = useState<
    AttendanceSessionData[]
  >([]);

  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const [newSessionTitle, setNewSessionTitle] = useState('');

  // ---------------------------------------------------------
  // OBJECTIFS / TÂCHES
  // ---------------------------------------------------------

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(
      `dept_tasks_${departmentId}`
    );

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 't1',
            text: 'Préparer le programme de la semaine',
            category: 'semaine',
            completed: false,
          },
          {
            id: 't2',
            text: 'Accueillir les nouveaux membres',
            category: 'jour',
            completed: true,
          },
        ];
  });

  const [newTaskText, setNewTaskText] = useState('');

  const [newTaskCategory, setNewTaskCategory] = useState<
    'jour' | 'semaine' | 'mois'
  >('semaine');

  const [taskFilter, setTaskFilter] = useState<
    'tous' | 'jour' | 'semaine' | 'mois'
  >('tous');

  // ---------------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------------

  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // DÉPARTEMENT — FIRESTORE
  // ---------------------------------------------------------

  useEffect(() => {
    const unsubscribe = subscribeToDepartments(list => {
      setDepartment(list.find(d => d.id === departmentId) ?? null);
    });
    return () => unsubscribe();
  }, [departmentId]);

  // ---------------------------------------------------------
  // MEMBRES — FIRESTORE
  // ---------------------------------------------------------

  useEffect(() => {
    if (!departmentId) {
      setMembersLoading(false);
      return;
    }

    const unsubscribe = subscribeToDeptMembers(
      departmentId,
      list => {
        setMembers(list);
        setMembersLoading(false);
      }
    );

    return () => unsubscribe();
  }, [departmentId]);

  // ---------------------------------------------------------
  // PRÉSENCES — FIRESTORE
  // ---------------------------------------------------------

  useEffect(() => {
    if (!departmentId) {
      setAttendanceLoading(false);
      return;
    }

    setAttendanceLoading(true);

    const unsubscribe = subscribeToDeptAttendance(
      departmentId,
      list => {
        setAttendanceSessions(list);
        setAttendanceLoading(false);
      }
    );

    return () => unsubscribe();
  }, [departmentId]);

  // ---------------------------------------------------------
  // SAUVEGARDE DES TÂCHES
  // ---------------------------------------------------------

  useEffect(() => {
    if (departmentId) {
      localStorage.setItem(
        `dept_tasks_${departmentId}`,
        JSON.stringify(tasks)
      );
    }
  }, [tasks, departmentId]);

  // ---------------------------------------------------------
  // RECHERCHE MEMBRES
  // ---------------------------------------------------------

  const filteredMembers = members.filter(
    m =>
      m.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      m.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      m.phone?.includes(searchTerm)
  );

  // ---------------------------------------------------------
  // GESTION DES PRÉSENCES
  // ---------------------------------------------------------

  const handleToggleAttendance = async (
    sessionId: string,
    memberId: string
  ) => {
    const session = attendanceSessions.find(
      s => s.id === sessionId
    );

    if (!session) return;

    const isPresent =
      session.presentMemberIds.includes(memberId);

    // Mise à jour optimiste
    setAttendanceSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? {
              ...s,
              presentMemberIds: isPresent
                ? s.presentMemberIds.filter(
                    id => id !== memberId
                  )
                : [
                    ...s.presentMemberIds,
                    memberId,
                  ],
            }
          : s
      )
    );

    try {
      await toggleAttendancePresence(
        sessionId,
        memberId,
        isPresent
      );
    } catch (err) {
      console.error(
        'Erreur lors de la mise à jour de la présence:',
        err
      );
    }
  };

  const handleAddSession = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !newSessionTitle.trim() ||
      !departmentId ||
      !department
    ) {
      return;
    }

    const newSession: AttendanceSessionData = {
      id: `sess_${Date.now()}`,
      departmentId,
      departmentName: department?.name ?? departmentId,
      date: new Date().toLocaleDateString('fr-FR'),
      title: newSessionTitle.trim(),
      presentMemberIds: [],
      totalMembers: members.length,
    };

    setNewSessionTitle('');

    try {
      await saveAttendanceSession(newSession);
    } catch (err) {
      console.error(
        'Erreur lors de la création de la session de présence:',
        err
      );
    }
  };

  const handleDeleteSession = async (
    sessionId: string
  ) => {
    if (attendanceSessions.length <= 1) {
      alert(
        'Vous devez garder au moins une session de présence.'
      );
      return;
    }

    try {
      await deleteAttendanceSession(sessionId);
    } catch (err) {
      console.error(
        'Erreur lors de la suppression de la session:',
        err
      );
    }
  };

  // ---------------------------------------------------------
  // GESTION DES OBJECTIFS
  // ---------------------------------------------------------

  const handleAddTask = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newTaskText.trim()) return;

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      text: newTaskText.trim(),
      category: newTaskCategory,
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const handleToggleTask = (
    taskId: string
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };

  const handleDeleteTask = (
    taskId: string
  ) => {
    setTasks(prev =>
      prev.filter(task => task.id !== taskId)
    );
  };

  const filteredTasks = tasks.filter(task =>
    taskFilter === 'tous'
      ? true
      : task.category === taskFilter
  );

  // ---------------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------------

  const handleSendNotification = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSendError(null);

    if (!departmentId) return;

    if (!NOTIFICATIONS_API_URL) {
      setSendError(
        "VITE_NOTIFICATIONS_API_URL n'est pas configurée côté site."
      );
      return;
    }

    setIsSending(true);

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
            topic: `dept-${departmentId}`,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('send-failed');
      }

      setSentOk(true);

      setTimeout(() => {
        setSentOk(false);
      }, 3500);

      setNotifTitle('');
      setNotifBody('');
    } catch (err) {
      setSendError(
        "L'envoi a échoué. Vérifiez que le serveur de notifications est bien démarré."
      );
    } finally {
      setIsSending(false);
    }
  };

  // ---------------------------------------------------------
  // SÉCURITÉ
  // ---------------------------------------------------------

  if (!departmentId || !department) {
    return null;
  }

  // ---------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------

  const navItems = [
    {
      id: 'membres' as const,
      label: 'Membres',
      icon: Users,
      description: 'Gérer les membres',
    },
    {
      id: 'presence' as const,
      label: 'Présences',
      icon: Calendar,
      description: 'Suivre les présences',
    },
    {
      id: 'objectifs' as const,
      label: 'Objectifs',
      icon: Target,
      description: 'Suivre les tâches',
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      icon: BellRing,
      description: 'Contacter le département',
    },
  ];

  // ---------------------------------------------------------
  // STATISTIQUES
  // ---------------------------------------------------------

  const completedTasks = tasks.filter(
    task => task.completed
  ).length;

  const totalAttendance =
    attendanceSessions.reduce(
      (sum, session) =>
        sum +
        session.presentMemberIds.length,
      0
    );

  const attendanceRate =
    members.length && attendanceSessions.length
      ? Math.round(
          (totalAttendance /
            (members.length *
              attendanceSessions.length)) *
            100
        )
      : 0;

  // ---------------------------------------------------------
  // CHANGEMENT D'ONGLET
  // ---------------------------------------------------------

  const selectTab = (
    tab:
      | 'overview'
      | 'membres'
      | 'presence'
      | 'objectifs'
      | 'notifications'
  ) => {
    setActiveSubTab(tab);
    setSidebarOpen(false);
  };

  // ---------------------------------------------------------
  // HEADER DYNAMIQUE
  // ---------------------------------------------------------

  const pageInfo = {
    overview: {
      eyebrow: 'Vue d’ensemble',
      title: `Bonjour, ${user.name.split(' ')[0]}`,
      description:
        'Voici un aperçu de l’activité de votre département.',
    },

    membres: {
      eyebrow: 'Gestion du département',
      title: 'Membres',
      description:
        'Consultez et recherchez les membres inscrits dans votre département.',
    },

    presence: {
      eyebrow: 'Suivi du département',
      title: 'Présences',
      description:
        'Enregistrez et suivez la présence des membres à chaque rencontre.',
    },

    objectifs: {
      eyebrow: 'Organisation',
      title: 'Objectifs',
      description:
        'Organisez les tâches et les objectifs de votre département.',
    },

    notifications: {
      eyebrow: 'Communication',
      title: 'Notifications',
      description:
        'Envoyez directement des messages aux membres de votre département.',
    },
  }[activeSubTab];

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <section
      id="manager"
      className="min-h-screen bg-[#06170d] text-pristine-white"
    >
      <div className="flex min-h-screen">

        {/* ================================================= */}
        {/* MOBILE OVERLAY */}
        {/* ================================================= */}

        {sidebarOpen && (
          <button
            aria-label="Fermer le menu"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}

        {/* ================================================= */}
        {/* SIDEBAR */}
        {/* ================================================= */}

        <aside
          className={`fixed left-0 top-0 z-50 h-screen w-72 shrink-0 border-r border-gold-rich/15 bg-[#04130a] transition-transform duration-300 lg:sticky ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex h-full flex-col">

            {/* PROFIL */}

            <div className="border-b border-gold-rich/10 px-5 py-5">
              <div className="flex items-center gap-3 rounded-xl bg-primary-green/10 p-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-rich/25 bg-gold-rich/15">
                  <UserRound className="h-5 w-5 text-gold-bright" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {user.name}
                  </p>

                  <p className="truncate text-[10px] text-neutral-gray">
                    {department?.name ?? 'Département'}
                  </p>
                </div>

              </div>
            </div>

            {/* NAVIGATION */}

            <nav className="flex-1 space-y-1 px-4 py-5">

              <p className="px-3 pb-3 text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-gray">
                Navigation
              </p>

              {/* VUE D'ENSEMBLE */}

              <button
                onClick={() =>
                  selectTab('overview')
                }
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  activeSubTab === 'overview'
                    ? 'bg-gold-rich text-deep-green shadow-lg'
                    : 'text-neutral-gray hover:bg-primary-green/15 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    Vue d'ensemble
                  </p>

                  <p
                    className={`mt-0.5 text-[9px] ${
                      activeSubTab === 'overview'
                        ? 'text-deep-green/70'
                        : 'text-neutral-gray'
                    }`}
                  >
                    Aperçu du département
                  </p>
                </div>
              </button>

              {/* AUTRES ONGLETS */}

              {navItems.map(item => {
                const Icon = item.icon;

                const active =
                  activeSubTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      selectTab(item.id)
                    }
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? 'border border-gold-rich/15 bg-primary-green/25 text-gold-bright'
                        : 'border border-transparent text-neutral-gray hover:bg-primary-green/10 hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        active
                          ? 'text-gold-bright'
                          : ''
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {item.label}
                      </p>

                      <p className="mt-0.5 text-[9px] text-neutral-gray">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight
                      className={`h-3.5 w-3.5 transition ${
                        active
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-50'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* RETOUR */}

            <div className="border-t border-gold-rich/10 p-4">
              <button
                onClick={() =>
                  selectTab('overview')
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-neutral-gray transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />

                <span className="text-sm">
                  Retour
                </span>
              </button>
            </div>

          </div>
        </aside>

        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <main className="min-w-0 flex-1">

          {/* ================================================= */}
          {/* TOPBAR */}
          {/* ================================================= */}

          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gold-rich/10 bg-[#06170d]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-lg border border-gold-rich/15 p-2 text-neutral-gray hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gold-rich">
                  Département
                </p>

                <h1 className="font-cinzel text-lg font-bold sm:text-xl">
                  {department?.name ?? 'Département'}
                </h1>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  selectTab('notifications')
                }
                className="relative rounded-xl border border-gold-rich/15 p-2.5 text-neutral-gray hover:bg-primary-green/15 hover:text-gold-bright"
              >
                <BellRing className="h-4 w-4" />

                {sendError && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400" />
                )}
              </button>

              <div className="hidden h-8 w-px bg-gold-rich/10 sm:block" />

              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold">
                  {user.name}
                </p>

                <p className="text-[9px] uppercase tracking-wider text-neutral-gray">
                  Responsable
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-rich/20 bg-gold-rich/10">
                <UserRound className="h-4 w-4 text-gold-bright" />
              </div>

            </div>
          </header>

          {/* ================================================= */}
          {/* PAGE */}
          {/* ================================================= */}

          <div className="p-4 sm:p-6 lg:p-8">

            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-gold-rich">
                  {pageInfo.eyebrow}
                </p>

                <h2 className="font-cinzel text-2xl font-bold sm:text-3xl">
                  {pageInfo.title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-neutral-gray">
                  {pageInfo.description}
                </p>

              </div>

            </div>

            {/* ================================================= */}
            {/* STATS — UNIQUEMENT SUR LA VUE D'ENSEMBLE */}
            {/* ================================================= */}

            {activeSubTab === 'overview' && (
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
                className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4"
              >

                {/* MEMBRES */}

                <div className="rounded-2xl border border-gold-rich/10 bg-[#0a2113] p-5 transition-all hover:border-gold-rich/20 hover:bg-[#0c2616]">

                  <div className="mb-4 flex items-center justify-between">

                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-gray">
                      Membres
                    </span>

                    <Users className="h-4 w-4 text-gold-rich" />

                  </div>

                  <p className="text-2xl font-bold">
                    {membersLoading
                      ? '—'
                      : members.length}
                  </p>

                  <p className="mt-1 text-[10px] text-neutral-gray">
                    inscrits au département
                  </p>

                </div>

                {/* PRÉSENCE */}

                <div className="rounded-2xl border border-gold-rich/10 bg-[#0a2113] p-5 transition-all hover:border-gold-rich/20 hover:bg-[#0c2616]">

                  <div className="mb-4 flex items-center justify-between">

                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-gray">
                      Présence
                    </span>

                    <Calendar className="h-4 w-4 text-emerald-400" />

                  </div>

                  <p className="text-2xl font-bold">
                    {attendanceRate}%
                  </p>

                  <p className="mt-1 text-[10px] text-neutral-gray">
                    {attendanceSessions.length}{' '}
                    session(s) suivie(s)
                  </p>

                </div>

                {/* OBJECTIFS */}

                <div className="rounded-2xl border border-gold-rich/10 bg-[#0a2113] p-5 transition-all hover:border-gold-rich/20 hover:bg-[#0c2616]">

                  <div className="mb-4 flex items-center justify-between">

                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-gray">
                      Objectifs
                    </span>

                    <Target className="h-4 w-4 text-gold-rich" />

                  </div>

                  <p className="text-2xl font-bold">
                    {tasks.length}
                  </p>

                  <p className="mt-1 text-[10px] text-neutral-gray">
                    {completedTasks}{' '}
                    terminé(s)
                  </p>

                </div>

                {/* SESSIONS */}

                <div className="rounded-2xl border border-gold-rich/10 bg-[#0a2113] p-5 transition-all hover:border-gold-rich/20 hover:bg-[#0c2616]">

                  <div className="mb-4 flex items-center justify-between">

                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-gray">
                      Sessions
                    </span>

                    <ClipboardList className="h-4 w-4 text-gold-rich" />

                  </div>

                  <p className="text-2xl font-bold">
                    {attendanceSessions.length}
                  </p>

                  <p className="mt-1 text-[10px] text-neutral-gray">
                    feuilles de présence
                  </p>

                </div>

              </motion.div>
            )}

            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gold-rich/10 bg-[#071b0f] shadow-2xl">

              {/* CONTENT HEADER */}

              <div className="border-b border-gold-rich/10 px-5 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                  {(() => {
                    const current =
                      activeSubTab === 'overview'
                        ? {
                            icon: LayoutDashboard,
                          }
                        : navItems.find(
                            n =>
                              n.id ===
                              activeSubTab
                          );

                    const Icon =
                      current?.icon ||
                      LayoutDashboard;

                    return (
                      <Icon className="h-5 w-5 text-gold-bright" />
                    );
                  })()}

                  <div>

                    <h3 className="font-cinzel text-base font-bold">

                      {activeSubTab ===
                        'overview' &&
                        'Vue d’ensemble du département'}

                      {activeSubTab ===
                        'membres' &&
                        'Membres du département'}

                      {activeSubTab ===
                        'presence' &&
                        'Suivi des présences'}

                      {activeSubTab ===
                        'objectifs' &&
                        'Objectifs et tâches'}

                      {activeSubTab ===
                        'notifications' &&
                        'Notifications'}

                    </h3>

                    <p className="text-[10px] text-neutral-gray">

                      {activeSubTab ===
                        'overview' &&
                        'Suivez les principaux indicateurs de votre département.'}

                      {activeSubTab ===
                        'membres' &&
                        'Consultez et recherchez les membres inscrits.'}

                      {activeSubTab ===
                        'presence' &&
                        'Enregistrez les présences à chaque rencontre.'}

                      {activeSubTab ===
                        'objectifs' &&
                        'Organisez le travail de votre département.'}

                      {activeSubTab ===
                        'notifications' &&
                        'Envoyez un message aux membres de votre département.'}

                    </p>

                  </div>

                </div>

              </div>

              {/* CONTENT BODY */}

              <div className="p-5 sm:p-6 lg:p-7">

                <AnimatePresence mode="wait">

                  {/* ================================================= */}
                  {/* OVERVIEW */}
                  {/* ================================================= */}

                  {activeSubTab === 'overview' && (
                    <motion.div
                      key="overview"
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
                      className="space-y-5"
                    >

                      <div className="grid gap-4 lg:grid-cols-2">

                        {/* ACTIVITÉ */}

                        <div className="rounded-xl border border-gold-rich/10 bg-primary-green/10 p-5">

                          <div className="mb-5 flex items-center gap-3">

                            <div className="rounded-xl bg-gold-rich/10 p-3">
                              <Activity className="h-5 w-5 text-gold-bright" />
                            </div>

                            <div>
                              <h4 className="font-cinzel text-sm font-bold">
                                Activité du département
                              </h4>

                              <p className="mt-1 text-[10px] text-neutral-gray">
                                Indicateurs actuels de votre département.
                              </p>
                            </div>

                          </div>

                          <div className="space-y-4">

                            <div>
                              <div className="mb-2 flex justify-between text-[10px]">
                                <span className="text-neutral-gray">
                                  Membres inscrits
                                </span>

                                <span className="font-semibold text-gold-bright">
                                  {members.length}
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-primary-green/20">
                                <div
                                  className="h-full rounded-full bg-gold-rich transition-all"
                                  style={{
                                    width: `${Math.min(
                                      members.length * 5,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="mb-2 flex justify-between text-[10px]">
                                <span className="text-neutral-gray">
                                  Taux de présence
                                </span>

                                <span className="font-semibold text-emerald-400">
                                  {attendanceRate}%
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-primary-green/20">
                                <div
                                  className="h-full rounded-full bg-emerald-500 transition-all"
                                  style={{
                                    width: `${attendanceRate}%`,
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="mb-2 flex justify-between text-[10px]">
                                <span className="text-neutral-gray">
                                  Objectifs réalisés
                                </span>

                                <span className="font-semibold text-gold-bright">
                                  {tasks.length
                                    ? Math.round(
                                        (completedTasks /
                                          tasks.length) *
                                          100
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-primary-green/20">
                                <div
                                  className="h-full rounded-full bg-gold-rich transition-all"
                                  style={{
                                    width: `${
                                      tasks.length
                                        ? Math.round(
                                            (completedTasks /
                                              tasks.length) *
                                              100
                                          )
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>

                          </div>

                        </div>

                        {/* RÉSUMÉ */}

                        <div className="rounded-xl border border-gold-rich/10 bg-primary-green/10 p-5">

                          <div className="mb-5 flex items-center gap-3">

                            <div className="rounded-xl bg-gold-rich/10 p-3">
                              <ClipboardList className="h-5 w-5 text-gold-bright" />
                            </div>

                            <div>
                              <h4 className="font-cinzel text-sm font-bold">
                                Résumé
                              </h4>

                              <p className="mt-1 text-[10px] text-neutral-gray">
                                État général de votre département.
                              </p>
                            </div>

                          </div>

                          <div className="grid grid-cols-2 gap-3">

                            <button
                              onClick={() =>
                                selectTab(
                                  'membres'
                                )
                              }
                              className="rounded-xl border border-gold-rich/10 bg-[#071b0f] p-4 text-left transition hover:border-gold-rich/30 hover:bg-primary-green/15"
                            >
                              <Users className="mb-3 h-4 w-4 text-gold-rich" />

                              <p className="text-lg font-bold">
                                {members.length}
                              </p>

                              <p className="text-[10px] text-neutral-gray">
                                Membres
                              </p>
                            </button>

                            <button
                              onClick={() =>
                                selectTab(
                                  'presence'
                                )
                              }
                              className="rounded-xl border border-gold-rich/10 bg-[#071b0f] p-4 text-left transition hover:border-gold-rich/30 hover:bg-primary-green/15"
                            >
                              <Calendar className="mb-3 h-4 w-4 text-emerald-400" />

                              <p className="text-lg font-bold">
                                {attendanceSessions.length}
                              </p>

                              <p className="text-[10px] text-neutral-gray">
                                Sessions
                              </p>
                            </button>

                            <button
                              onClick={() =>
                                selectTab(
                                  'objectifs'
                                )
                              }
                              className="rounded-xl border border-gold-rich/10 bg-[#071b0f] p-4 text-left transition hover:border-gold-rich/30 hover:bg-primary-green/15"
                            >
                              <Target className="mb-3 h-4 w-4 text-gold-rich" />

                              <p className="text-lg font-bold">
                                {completedTasks}/
                                {tasks.length}
                              </p>

                              <p className="text-[10px] text-neutral-gray">
                                Objectifs
                              </p>
                            </button>

                            <button
                              onClick={() =>
                                selectTab(
                                  'notifications'
                                )
                              }
                              className="rounded-xl border border-gold-rich/10 bg-[#071b0f] p-4 text-left transition hover:border-gold-rich/30 hover:bg-primary-green/15"
                            >
                              <BellRing className="mb-3 h-4 w-4 text-gold-rich" />

                              <p className="text-lg font-bold">
                                →
                              </p>

                              <p className="text-[10px] text-neutral-gray">
                                Communiquer
                              </p>
                            </button>

                          </div>

                        </div>

                      </div>

                    </motion.div>
                  )}

                  {/* ================================================= */}
                  {/* MEMBRES */}
                  {/* ================================================= */}

                  {activeSubTab === 'membres' && (
                    <motion.div
                      key="membres"
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

                      <div className="relative">

                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-gray" />

                        <input
                          type="text"
                          value={searchTerm}
                          onChange={e =>
                            setSearchTerm(
                              e.target.value
                            )
                          }
                          placeholder="Rechercher par nom, email ou téléphone..."
                          className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 py-3 pl-10 pr-4 text-sm text-pristine-white outline-none transition focus:border-gold-rich/50"
                        />

                      </div>

                      {membersLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-gold-rich" />
                        </div>
                      ) : filteredMembers.length === 0 ? (
                        <p className="py-10 text-center text-xs italic text-neutral-gray">
                          Aucun membre inscrit à ce département pour l'instant.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-gold-rich/10">

                          <table className="w-full min-w-[700px] text-left">

                            <thead className="bg-primary-green/15 text-[9px] font-mono uppercase tracking-wider text-neutral-gray">

                              <tr>
                                <th className="px-4 py-3">
                                  Membre
                                </th>

                                <th className="px-4 py-3">
                                  Contact
                                </th>

                                <th className="px-4 py-3">
                                  Inscription
                                </th>

                                <th className="px-4 py-3">
                                  Pays
                                </th>
                              </tr>

                            </thead>

                            <tbody className="divide-y divide-gold-rich/10">

                              {filteredMembers.map(
                                m => (
                                  <tr
                                    key={m.id}
                                    className="hover:bg-primary-green/5"
                                  >

                                    <td className="px-4 py-4">
                                      <p className="text-sm font-semibold">
                                        {m.name}
                                      </p>
                                    </td>

                                    <td className="px-4 py-4">

                                      <div className="space-y-1 text-[11px] text-neutral-gray">

                                        <p className="flex items-center gap-2">
                                          <Mail className="h-3 w-3 text-gold-rich" />
                                          {m.email}
                                        </p>

                                        <p className="flex items-center gap-2">
                                          <Phone className="h-3 w-3 text-gold-rich" />
                                          {m.phone}
                                        </p>

                                      </div>

                                    </td>

                                    <td className="px-4 py-4 text-[11px] text-neutral-gray">
                                      {m.dateJoined}
                                    </td>

                                    <td className="px-4 py-4">

                                      <span className="rounded-md bg-gold-rich/10 px-2 py-1 text-[9px] font-mono font-bold uppercase text-gold-bright">
                                        {m.country}
                                      </span>

                                    </td>

                                  </tr>
                                )
                              )}

                            </tbody>

                          </table>

                        </div>
                      )}

                    </motion.div>
                  )}

                  {/* ================================================= */}
                  {/* PRESENCE */}
                  {/* ================================================= */}

                  {activeSubTab === 'presence' && (
                    <motion.div
                      key="presence"
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
                      className="space-y-5"
                    >

                      <div className="flex flex-col gap-3 rounded-xl border border-gold-rich/10 bg-primary-green/10 p-4 md:flex-row md:items-center md:justify-between">

                        <div>

                          <h4 className="font-cinzel text-sm font-bold">
                            Feuilles de présence
                          </h4>

                          <p className="mt-1 text-[11px] text-neutral-gray">
                            Cochez les membres présents pour chaque session.
                          </p>

                        </div>

                        <form
                          onSubmit={
                            handleAddSession
                          }
                          className="flex w-full gap-2 md:w-auto"
                        >

                          <input
                            type="text"
                            placeholder="Nom de la session..."
                            value={
                              newSessionTitle
                            }
                            onChange={e =>
                              setNewSessionTitle(
                                e.target.value
                              )
                            }
                            className="min-w-0 flex-1 rounded-lg border border-gold-rich/15 bg-primary-green/10 px-3 py-2 text-xs outline-none md:w-64"
                          />

                          <button
                            type="submit"
                            className="flex shrink-0 items-center gap-1 rounded-lg bg-gold-rich px-4 py-2 text-xs font-bold text-deep-green"
                          >
                            <Plus className="h-4 w-4" />
                            Ajouter
                          </button>

                        </form>

                      </div>

                      {attendanceLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-gold-rich" />
                        </div>
                      ) : members.length === 0 ? (
                        <p className="py-10 text-center text-xs italic text-neutral-gray">
                          Aucun membre dans ce département.
                        </p>
                      ) : attendanceSessions.length === 0 ? (
                        <p className="py-10 text-center text-xs italic text-neutral-gray">
                          Aucune session de présence pour l'instant. Créez-en une ci-dessus.
                        </p>
                      ) : (
                        <div className="space-y-5">

                          {attendanceSessions.map(
                            session => (
                              <div
                                key={session.id}
                                className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-4 sm:p-5"
                              >

                                <div className="mb-4 flex items-center justify-between border-b border-gold-rich/10 pb-3">

                                  <div>

                                    <h5 className="text-sm font-bold text-gold-bright">
                                      {session.title}
                                    </h5>

                                    <span className="text-[10px] font-mono text-neutral-gray">
                                      Date :{' '}
                                      {session.date}{' '}
                                      • Présents :{' '}
                                      {
                                        session
                                          .presentMemberIds
                                          .length
                                      }{' '}
                                      /{' '}
                                      {members.length}
                                    </span>

                                  </div>

                                  {attendanceSessions.length >
                                    1 && (
                                    <button
                                      onClick={() =>
                                        handleDeleteSession(
                                          session.id
                                        )
                                      }
                                      className="rounded-lg p-2 text-neutral-gray hover:bg-red-500/10 hover:text-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}

                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">

                                  {members.map(
                                    m => {
                                      const isPresent =
                                        session.presentMemberIds.includes(
                                          m.id
                                        );

                                      return (
                                        <button
                                          key={m.id}
                                          type="button"
                                          onClick={() =>
                                            handleToggleAttendance(
                                              session.id,
                                              m.id
                                            )
                                          }
                                          className={`flex items-center justify-between rounded-lg border p-3 text-left transition ${
                                            isPresent
                                              ? 'border-emerald-500/40 bg-emerald-500/10 text-white'
                                              : 'border-gold-rich/10 bg-primary-green/10 text-neutral-gray hover:border-gold-rich/30'
                                          }`}
                                        >

                                          <span className="truncate pr-2 text-xs font-medium">
                                            {m.name}
                                          </span>

                                          {isPresent ? (
                                            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                                          ) : (
                                            <Square className="h-4 w-4 shrink-0 text-neutral-gray" />
                                          )}

                                        </button>
                                      );
                                    }
                                  )}

                                </div>

                              </div>
                            )
                          )}

                        </div>
                      )}

                    </motion.div>
                  )}

                  {/* ================================================= */}
                  {/* OBJECTIFS */}
                  {/* ================================================= */}

                  {activeSubTab === 'objectifs' && (
                    <motion.div
                      key="objectifs"
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
                      className="space-y-5"
                    >

                      <form
                        onSubmit={handleAddTask}
                        className="flex flex-col gap-2 rounded-xl border border-gold-rich/10 bg-primary-green/10 p-4 sm:flex-row"
                      >

                        <input
                          type="text"
                          placeholder="Nouvel objectif ou tâche..."
                          value={newTaskText}
                          onChange={e =>
                            setNewTaskText(
                              e.target.value
                            )
                          }
                          className="min-w-0 flex-1 rounded-lg border border-gold-rich/15 bg-primary-green/10 px-3 py-2.5 text-xs outline-none"
                        />

                        <select
                          value={
                            newTaskCategory
                          }
                          onChange={e =>
                            setNewTaskCategory(
                              e.target
                                .value as
                                | 'jour'
                                | 'semaine'
                                | 'mois'
                            )
                          }
                          className="rounded-lg border border-gold-rich/15 bg-deep-green px-3 py-2.5 text-xs text-gold-bright outline-none"
                        >

                          <option value="jour">
                            Par Jour
                          </option>

                          <option value="semaine">
                            Par Semaine
                          </option>

                          <option value="mois">
                            Par Mois
                          </option>

                        </select>

                        <button
                          type="submit"
                          className="flex items-center justify-center gap-1 rounded-lg bg-gold-rich px-4 py-2.5 text-xs font-bold text-deep-green"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter
                        </button>

                      </form>

                      <div className="flex flex-wrap items-center gap-2 border-b border-gold-rich/10 pb-3">

                        <Target className="mr-1 h-4 w-4 text-gold-rich" />

                        {(
                          [
                            'tous',
                            'jour',
                            'semaine',
                            'mois',
                          ] as const
                        ).map(cat => (
                          <button
                            key={cat}
                            onClick={() =>
                              setTaskFilter(cat)
                            }
                            className={`rounded-lg px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition ${
                              taskFilter === cat
                                ? 'bg-gold-rich font-bold text-deep-green'
                                : 'bg-primary-green/10 text-neutral-gray hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}

                      </div>

                      {filteredTasks.length ===
                      0 ? (
                        <p className="py-10 text-center text-xs italic text-neutral-gray">
                          Aucune tâche enregistrée pour ce filtre.
                        </p>
                      ) : (
                        <div className="space-y-2">

                          {filteredTasks.map(
                            task => (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
                                  task.completed
                                    ? 'border-emerald-500/20 bg-primary-green/5 opacity-75'
                                    : 'border-gold-rich/10 bg-primary-green/10'
                                }`}
                              >

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleTask(
                                      task.id
                                    )
                                  }
                                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                >

                                  {task.completed ? (
                                    <CheckSquare className="h-5 w-5 shrink-0 text-emerald-400" />
                                  ) : (
                                    <Square className="h-5 w-5 shrink-0 text-neutral-gray" />
                                  )}

                                  <span
                                    className={`truncate text-sm ${
                                      task.completed
                                        ? 'text-neutral-gray line-through'
                                        : 'text-pristine-white'
                                    }`}
                                  >
                                    {task.text}
                                  </span>

                                </button>

                                <div className="flex shrink-0 items-center gap-2">

                                  <span className="rounded-md bg-gold-rich/10 px-2 py-1 text-[9px] font-mono uppercase text-gold-bright">
                                    {task.category}
                                  </span>

                                  <button
                                    onClick={() =>
                                      handleDeleteTask(
                                        task.id
                                      )
                                    }
                                    className="rounded-lg p-1.5 text-neutral-gray hover:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>

                                </div>

                              </div>
                            )
                          )}

                        </div>
                      )}

                    </motion.div>
                  )}

                  {/* ================================================= */}
                  {/* NOTIFICATIONS */}
                  {/* ================================================= */}

                  {activeSubTab ===
                    'notifications' && (
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
                      className="mx-auto max-w-2xl space-y-5"
                    >

                      {sentOk && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">

                          <CheckCircle className="h-4 w-4" />

                          Notification envoyée aux membres du département !

                        </div>
                      )}

                      {sendError && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">

                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                          <span>
                            {sendError}
                          </span>

                        </div>
                      )}

                      <div className="rounded-xl border border-gold-rich/10 bg-primary-green/10 p-5">

                        <div className="mb-5 flex items-center gap-3">

                          <div className="rounded-xl bg-gold-rich/10 p-3">
                            <BellRing className="h-5 w-5 text-gold-bright" />
                          </div>

                          <div>

                            <h4 className="font-cinzel text-sm font-bold">
                              Notifier les membres
                            </h4>

                            <p className="mt-1 text-[10px] text-neutral-gray">
                              Les membres ayant activé les notifications recevront votre message.
                            </p>

                          </div>

                        </div>

                        <form
                          onSubmit={
                            handleSendNotification
                          }
                          className="space-y-4"
                        >

                          <div>

                            <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                              Titre
                            </label>

                            <input
                              type="text"
                              required
                              value={
                                notifTitle
                              }
                              onChange={e =>
                                setNotifTitle(
                                  e.target
                                    .value
                                )
                              }
                              placeholder={`Ex: Réunion du département ${department?.name ?? 'Département'}`}
                              className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm outline-none transition focus:border-gold-rich/50"
                            />

                          </div>

                          <div>

                            <label className="mb-1.5 block text-xs font-mono uppercase text-neutral-gray">
                              Message
                            </label>

                            <textarea
                              required
                              rows={5}
                              value={
                                notifBody
                              }
                              onChange={e =>
                                setNotifBody(
                                  e.target
                                    .value
                                )
                              }
                              placeholder="Rédigez votre message..."
                              className="w-full resize-none rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm outline-none transition focus:border-gold-rich/50"
                            />

                          </div>

                          <button
                            type="submit"
                            disabled={isSending}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-rich to-gold-bright py-3 text-xs font-bold font-mono uppercase tracking-widest text-deep-green hover:shadow-lg disabled:opacity-60"
                          >

                            {isSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <BellRing className="h-4 w-4" />
                            )}

                            {isSending
                              ? 'Envoi en cours...'
                              : 'Envoyer au département'}

                          </button>

                        </form>

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