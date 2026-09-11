import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Heart,
  Calendar,
  Bell,
  BellRing,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Globe,
  Plus,
  CheckCircle,
  ShieldCheck,
  Crown,
  AlertCircle,
  Loader2,
  ChevronRight,
  Search,
  Download,
  UserRound,
  Award,
  BarChart3,
  Activity,
  Wallet,
  Building2,
  ClipboardCheck,
  CircleDollarSign,
  XCircle,
  Clock,
  Mail,
  Phone,
  Filter,
} from 'lucide-react';
import { DEPARTMENTS_DATA, MOCK_ADMIN_METRICS } from '../mockData';
import { User as UserType } from '../types';
import { logoutMember } from '../lib/authService';
import {
  subscribeToGlobalStats,
  GlobalStats,
  subscribeToDonations,
  updateDonationStatus,
  DonationData,
  subscribeToAllAttendance,
  AttendanceSessionData,
  subscribeToAllDeptInscriptions,
  DeptInscriptionData,
} from '../lib/firestoreService';

interface LeaderDashboardProps {
  user: UserType;
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

type LeaderTab = 'apercu' | 'membres' | 'departements' | 'presences' | 'finance' | 'notifications' | 'rapports';
type NotifAudience = 'all-members' | 'managers' | 'department';
type DonationFilter = 'tous' | 'En attente' | 'Confirmé' | 'Échoué';

export default function LeaderDashboard({
  user,
  onExportExcel,
  testimonies,
  registeredEvents,
  teachings,
}: LeaderDashboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderTab>('apercu');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---- Données temps réel : statistiques globales ----
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
  const [statsLoading, setStatsLoading] = useState(true);

  // ---- Données temps réel : dons / finance ----
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [donationFilter, setDonationFilter] = useState<DonationFilter>('tous');
  const [donationSearch, setDonationSearch] = useState('');
  const [updatingDonationId, setUpdatingDonationId] = useState<string | null>(null);

  // ---- Données temps réel : présences (tous départements) ----
  const [allAttendance, setAllAttendance] = useState<AttendanceSessionData[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceDeptFilter, setAttendanceDeptFilter] = useState<string>('tous');

  // ---- Données temps réel : membres inscrits par département ----
  const [allMembers, setAllMembers] = useState<DeptInscriptionData[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberDeptFilter, setMemberDeptFilter] = useState<string>('tous');

  // ---- Notification composer ----
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifAudience, setNotifAudience] = useState<NotifAudience>('all-members');
  const [notifDeptId, setNotifDeptId] = useState<string>(DEPARTMENTS_DATA[0]?.id ?? '');
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [notifSent, setNotifSent] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  // ---- Export ----
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    setStatsLoading(true);
    const unsubscribe = subscribeToGlobalStats(newStats => {
      setStats(newStats);
      setStatsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setDonationsLoading(true);
    const unsubscribe = subscribeToDonations(list => {
      setDonations(list);
      setDonationsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setAttendanceLoading(true);
    const unsubscribe = subscribeToAllAttendance(list => {
      setAllAttendance(list);
      setAttendanceLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setMembersLoading(true);
    const unsubscribe = subscribeToAllDeptInscriptions(list => {
      setAllMembers(list);
      setMembersLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ---------------- Dérivés : Finance ----------------
  const confirmedDonations = donations.filter(d => d.status === 'Confirmé');
  const pendingDonations = donations.filter(d => d.status === 'En attente');
  const failedDonations = donations.filter(d => d.status === 'Échoué');
  const totalCollected = confirmedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

  const now = new Date();
  const monthCollected = confirmedDonations
    .filter(d => {
      const date = new Date(d.createdAt);
      return !isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const paymentMethodBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    confirmedDonations.forEach(d => {
      const key = d.paymentMethod || 'Non spécifié';
      map.set(key, (map.get(key) || 0) + (d.amount || 0));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [confirmedDonations]);

  const filteredDonations = donations.filter(d => {
    const matchesStatus = donationFilter === 'tous' ? true : d.status === donationFilter;
    const term = donationSearch.toLowerCase();
    const matchesSearch = !term
      || d.donorName?.toLowerCase().includes(term)
      || d.donorEmail?.toLowerCase().includes(term)
      || d.referenceCode?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleUpdateDonationStatus = async (id: string, status: 'Confirmé' | 'Échoué') => {
    setUpdatingDonationId(id);
    try {
      await updateDonationStatus(id, status);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du don:', err);
    } finally {
      setUpdatingDonationId(null);
    }
  };

  // ---------------- Dérivés : Présences ----------------
  const filteredAttendance = allAttendance.filter(s =>
    attendanceDeptFilter === 'tous' ? true : s.departmentId === attendanceDeptFilter
  );

  const attendanceByDept = useMemo(() => {
    const map = new Map<string, { departmentName: string; sessions: number; present: number; total: number }>();
    allAttendance.forEach(s => {
      const entry = map.get(s.departmentId) || { departmentName: s.departmentName, sessions: 0, present: 0, total: 0 };
      entry.sessions += 1;
      entry.present += s.presentMemberIds?.length || 0;
      entry.total += s.totalMembers || 0;
      map.set(s.departmentId, entry);
    });
    return Array.from(map.entries()).map(([departmentId, v]) => ({
      departmentId,
      ...v,
      rate: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
    })).sort((a, b) => b.rate - a.rate);
  }, [allAttendance]);

  const overallAttendanceRate = useMemo(() => {
    const totalPresent = allAttendance.reduce((sum, s) => sum + (s.presentMemberIds?.length || 0), 0);
    const totalPossible = allAttendance.reduce((sum, s) => sum + (s.totalMembers || 0), 0);
    return totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
  }, [allAttendance]);

  // ---------------- Dérivés : Membres ----------------
  const filteredMembers = allMembers.filter(m => {
    const matchesDept = memberDeptFilter === 'tous' ? true : m.departmentId === memberDeptFilter;
    const term = memberSearch.toLowerCase();
    const matchesSearch = !term
      || m.name?.toLowerCase().includes(term)
      || m.email?.toLowerCase().includes(term)
      || m.phone?.includes(memberSearch);
    return matchesDept && matchesSearch;
  });

  const getDeptName = (id: string) => DEPARTMENTS_DATA.find((d: any) => d.id === id)?.name || id;

  // ---------------- Activité récente combinée (Aperçu) ----------------
  const recentActivity = useMemo(() => {
    const items: { icon: any; label: string; sub: string; ts: number }[] = [];

    donations.slice(0, 8).forEach(d => {
      const ts = new Date(d.createdAt).getTime() || 0;
      items.push({
        icon: CircleDollarSign,
        label: `Don de ${d.amount?.toLocaleString() || 0} FCFA — ${d.donorName || 'Anonyme'}`,
        sub: d.status,
        ts,
      });
    });

    allAttendance.slice(0, 8).forEach(s => {
      const ts = (s.createdAt as any)?.seconds ? (s.createdAt as any).seconds * 1000 : 0;
      items.push({
        icon: ClipboardCheck,
        label: `Présence "${s.title}" — ${s.departmentName}`,
        sub: `${s.presentMemberIds?.length || 0}/${s.totalMembers || 0} présents`,
        ts,
      });
    });

    return items.sort((a, b) => b.ts - a.ts).slice(0, 10);
  }, [donations, allAttendance]);

  // ---------------- Notifications ----------------
  const applyAudience = (audience: NotifAudience) => {
    setNotifAudience(audience);
    setNotifError(null);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifError(null);

    if (!NOTIFICATIONS_API_URL) {
      setNotifError('VITE_NOTIFICATIONS_API_URL n\'est pas configurée. Déployez le serveur de notifications puis renseignez son URL.');
      return;
    }

    let topic = 'all-members';
    if (notifAudience === 'managers') topic = 'managers-only';
    if (notifAudience === 'department') {
      if (!notifDeptId) {
        setNotifError('Veuillez choisir un département.');
        return;
      }
      topic = `dept-${notifDeptId}`;
    }

    setIsSendingNotif(true);
    try {
      const res = await fetch(`${NOTIFICATIONS_API_URL}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: notifTitle, body: notifBody, topic }),
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

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      onExportExcel();
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1200);
  };

  const navItems = [
    { id: 'apercu' as const, label: 'Aperçu Général', icon: LayoutDashboard, description: 'Vue sur toute l\'œuvre' },
    { id: 'membres' as const, label: 'Membres', icon: Users, description: 'Tous les départements' },
    { id: 'departements' as const, label: 'Départements', icon: Building2, description: 'Suivi par département' },
    { id: 'presences' as const, label: 'Présences', icon: ClipboardCheck, description: 'Feuilles en temps réel' },
    { id: 'finance' as const, label: 'Finance', icon: Wallet, description: 'Dons en temps réel', badge: pendingDonations.length },
    { id: 'notifications' as const, label: 'Notifications', icon: BellRing, description: 'Alerter qui vous voulez' },
    { id: 'rapports' as const, label: 'Rapports', icon: FileSpreadsheet, description: 'Exporter les données' },
  ];

  const selectTab = (tab: LeaderTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const tabTitles: Record<LeaderTab, { title: string; sub: string }> = {
    apercu: { title: 'Aperçu Général', sub: 'Tout ce qui se passe sur l\'ensemble de l\'œuvre, en un coup d\'œil.' },
    membres: { title: 'Membres', sub: 'Tous les membres inscrits, tous départements confondus.' },
    departements: { title: 'Départements', sub: 'Effectifs et responsables de chaque département.' },
    presences: { title: 'Présences', sub: 'Feuilles de présence enregistrées par les managers, en temps réel.' },
    finance: { title: 'Finance', sub: 'Tous les dons enregistrés en temps réel.' },
    notifications: { title: 'Notifications', sub: 'Envoyez un message à tout le monde, aux managers, ou à un département précis.' },
    rapports: { title: 'Rapports', sub: 'Résumé des données et exports.' },
  };

  return (
    <section id="leader" className="min-h-screen bg-[#06170d] text-pristine-white">
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

            <div className="border-b border-gold-rich/10 px-5 py-5">
              <div className="flex items-center gap-3 rounded-xl bg-primary-green/10 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-rich/15 border border-gold-rich/25">
                  <Crown className="h-5 w-5 text-gold-bright" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Christ Army</p>
                  <p className="truncate text-[10px] text-neutral-gray">Console du Leader</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
              <p className="px-3 pb-3 text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-gray">Navigation</p>
              {navItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                const hasBadge = 'badge' in item && item.badge && item.badge > 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectTab(item.id)}
                    className={`group mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
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

            <div className="border-t border-gold-rich/10 p-4">
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-primary-green/10 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-rich/20 bg-gold-rich/10">
                  <UserRound className="h-4 w-4 text-gold-bright" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{user.name}</p>
                  <p className="truncate text-[9px] uppercase tracking-wider text-neutral-gray">Leader</p>
                </div>
              </div>
          <button
                             onClick={() => logoutMember()}
                             className="px-4.5 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-[10px] uppercase"
                           >
                             Déconnexion
                           </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gold-rich/10 bg-[#06170d]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-gold-rich/15 p-2 text-neutral-gray hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gold-rich">Direction</p>
                <h1 className="font-cinzel text-lg font-bold sm:text-xl">{tabTitles[activeTab].title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => selectTab('notifications')}
                className="relative rounded-xl border border-gold-rich/15 p-2.5 text-neutral-gray hover:bg-primary-green/15 hover:text-gold-bright"
              >
                <BellRing className="h-4 w-4" />
                {pendingDonations.length > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400" />
                )}
              </button>
              <div className="hidden h-8 w-px bg-gold-rich/10 sm:block" />
            
             
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-7">
              <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-gold-rich">Tableau de bord</p>
              <h2 className="font-cinzel text-2xl font-bold sm:text-3xl">Bonjour, {user.name.split(' ')[0]}</h2>
              <p className="mt-2 text-sm text-neutral-gray">{tabTitles[activeTab].sub}</p>
            </div>

            <div className="rounded-2xl border border-gold-rich/10 bg-[#071b0f] shadow-2xl overflow-hidden">
              <div className="border-b border-gold-rich/10 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  {(() => {
                    const current = navItems.find(n => n.id === activeTab);
                    const Icon = current?.icon || LayoutDashboard;
                    return <Icon className="h-5 w-5 text-gold-bright" />;
                  })()}
                  <h3 className="font-cinzel text-base font-bold">{tabTitles[activeTab].title}</h3>
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-7">
                <AnimatePresence mode="wait">

                  {/* ================= APERÇU ================= */}
                  {activeTab === 'apercu' && (
                    <motion.div key="apercu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-7">
                      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                        <StatCard icon={Users} label="Membres Totaux" value={statsLoading ? '—' : stats.totalMembers.toLocaleString()} sub={`+${stats.membersGrowth || 0}% ce mois`} />
                        <StatCard icon={Building2} label="Départements" value={statsLoading ? '—' : stats.totalDepartments.toString()} sub={`${stats.totalDiaspora} membres diaspora`} />
                        <StatCard icon={Wallet} label="Caisse de Solidarité" value={statsLoading ? '—' : `${stats.solidarityFund.toLocaleString()} FCFA`} sub={`+${stats.fundGrowth || 0}% ce mois`} accent="emerald" />
                        <StatCard icon={ClipboardCheck} label="Présence Moyenne" value={attendanceLoading ? '—' : `${overallAttendanceRate}%`} sub={`${allAttendance.length} session(s) enregistrée(s)`} accent="gold" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <MiniStat icon={Heart} label="Témoignages" value={testimonies.length} sub={`${testimonies.filter((t: any) => t.isApproved).length} approuvés`} />
                        <MiniStat icon={Calendar} label="Événements" value={registeredEvents.length} sub="programmés" />
                        <MiniStat icon={FileSpreadsheet} label="Enseignements" value={teachings.length} sub="publiés" />
                        <MiniStat icon={CircleDollarSign} label="Dons en attente" value={pendingDonations.length} sub="à valider" accent={pendingDonations.length > 0 ? 'red' : undefined} />
                      </div>

                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="lg:col-span-2 rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                          <h4 className="mb-4 font-cinzel text-sm font-bold">Activité récente (toute l'œuvre)</h4>
                          {recentActivity.length === 0 ? (
                            <p className="py-8 text-center text-xs italic text-neutral-gray">Aucune activité récente.</p>
                          ) : (
                            <div className="space-y-3">
                              {recentActivity.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                  <div key={i} className="flex items-center gap-3 rounded-lg border border-gold-rich/5 bg-deep-green/40 p-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-rich/10">
                                      <Icon className="h-4 w-4 text-gold-bright" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-medium text-pristine-white">{item.label}</p>
                                      <p className="text-[10px] text-neutral-gray">{item.sub}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                          <h4 className="mb-4 font-cinzel text-sm font-bold">Répartition par pays</h4>
                          {stats.countriesMap.length === 0 ? (
                            <p className="py-8 text-center text-xs italic text-neutral-gray">Aucune donnée pour l'instant.</p>
                          ) : (
                            <div className="space-y-3">
                              {stats.countriesMap.slice(0, 6).map(c => (
                                <div key={c.country}>
                                  <div className="mb-1 flex items-center justify-between text-[11px]">
                                    <span className="flex items-center gap-1.5 text-neutral-gray"><Globe className="h-3 w-3 text-gold-rich" />{c.country}</span>
                                    <span className="font-mono text-pristine-white">{c.count}</span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-deep-green">
                                    <div className="h-full rounded-full bg-gradient-to-r from-gold-rich to-gold-bright" style={{ width: `${c.percentage}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ================= MEMBRES ================= */}
                  {activeTab === 'membres' && (
                    <motion.div key="membres" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-gray" />
                          <input
                            type="text"
                            value={memberSearch}
                            onChange={e => setMemberSearch(e.target.value)}
                            placeholder="Rechercher par nom, email ou téléphone..."
                            className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gold-rich/50"
                          />
                        </div>
                        <select
                          value={memberDeptFilter}
                          onChange={e => setMemberDeptFilter(e.target.value)}
                          className="rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-gold-bright outline-none sm:w-64"
                        >
                          <option value="tous">Tous les départements</option>
                          {DEPARTMENTS_DATA.map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-gray">
                        {filteredMembers.length} membre(s) trouvé(s) sur {allMembers.length} au total
                      </p>

                      {membersLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold-rich" /></div>
                      ) : filteredMembers.length === 0 ? (
                        <p className="py-10 text-center text-xs italic text-neutral-gray">Aucun membre ne correspond à ces critères.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-gold-rich/10">
                          <table className="w-full min-w-[760px] text-left">
                            <thead className="bg-primary-green/15 text-[9px] font-mono uppercase tracking-wider text-neutral-gray">
                              <tr>
                                <th className="px-4 py-3">Membre</th>
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Département</th>
                                <th className="px-4 py-3">Inscription</th>
                                <th className="px-4 py-3">Pays</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gold-rich/10">
                              {filteredMembers.map(m => (
                                <tr key={m.id} className="hover:bg-primary-green/5">
                                  <td className="px-4 py-4 text-sm font-semibold">{m.name}</td>
                                  <td className="px-4 py-4">
                                    <div className="space-y-1 text-[11px] text-neutral-gray">
                                      <p className="flex items-center gap-2"><Mail className="h-3 w-3 text-gold-rich" />{m.email}</p>
                                      <p className="flex items-center gap-2"><Phone className="h-3 w-3 text-gold-rich" />{m.phone}</p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className="rounded-md bg-gold-rich/10 px-2 py-1 text-[9px] font-mono font-bold uppercase text-gold-bright">{getDeptName(m.departmentId)}</span>
                                  </td>
                                  <td className="px-4 py-4 text-[11px] text-neutral-gray">{m.dateJoined}</td>
                                  <td className="px-4 py-4 text-[11px] text-neutral-gray">{m.country}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ================= DÉPARTEMENTS ================= */}
                  {activeTab === 'departements' && (
                    <motion.div key="departements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                      {statsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold-rich" /></div>
                      ) : stats.departmentsList.length === 0 ? (
                        <p className="py-10 text-center text-xs italic text-neutral-gray">Aucun département enregistré pour l'instant.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {stats.departmentsList.map(dept => {
                            const deptAttendance = attendanceByDept.find(a => a.departmentName === dept.name);
                            return (
                              <div key={dept.name} className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                                <div className="mb-3 flex items-center justify-between">
                                  <h4 className="font-cinzel text-sm font-bold">{dept.name}</h4>
                                  <Building2 className="h-4 w-4 text-gold-rich" />
                                </div>
                                <p className="mb-3 text-[11px] text-neutral-gray">Responsable : <span className="text-pristine-white">{dept.leader}</span></p>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-neutral-gray">Membres</span>
                                  <span className="font-mono font-bold text-pristine-white">{dept.members}</span>
                                </div>
                                {deptAttendance && (
                                  <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-neutral-gray">Présence moyenne</span>
                                    <span className="font-mono font-bold text-emerald-400">{deptAttendance.rate}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ================= PRÉSENCES ================= */}
                  {activeTab === 'presences' && (
                    <motion.div key="presences" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <StatCard icon={ClipboardCheck} label="Présence Globale" value={`${overallAttendanceRate}%`} sub="tous départements" accent="emerald" />
                        <StatCard icon={Activity} label="Sessions Enregistrées" value={allAttendance.length.toString()} sub="au total" />
                        <StatCard icon={Building2} label="Départements Actifs" value={attendanceByDept.length.toString()} sub="ayant enregistré une présence" />
                        <StatCard icon={Users} label="Total Présents" value={allAttendance.reduce((s, a) => s + (a.presentMemberIds?.length || 0), 0).toString()} sub="cumulés" />
                      </div>

                      <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                        <h4 className="mb-4 font-cinzel text-sm font-bold">Taux de présence par département</h4>
                        {attendanceByDept.length === 0 ? (
                          <p className="py-6 text-center text-xs italic text-neutral-gray">Aucune session enregistrée pour l'instant.</p>
                        ) : (
                          <div className="space-y-3">
                            {attendanceByDept.map(d => (
                              <div key={d.departmentId}>
                                <div className="mb-1 flex items-center justify-between text-[11px]">
                                  <span className="text-neutral-gray">{d.departmentName} <span className="text-gold-rich">({d.sessions} session{d.sessions > 1 ? 's' : ''})</span></span>
                                  <span className="font-mono text-pristine-white">{d.rate}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-deep-green">
                                  <div className={`h-full rounded-full ${d.rate >= 60 ? 'bg-emerald-400' : d.rate >= 30 ? 'bg-gold-rich' : 'bg-red-400'}`} style={{ width: `${d.rate}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="font-cinzel text-sm font-bold">Sessions récentes</h4>
                        <select
                          value={attendanceDeptFilter}
                          onChange={e => setAttendanceDeptFilter(e.target.value)}
                          className="rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-2.5 text-xs text-gold-bright outline-none sm:w-64"
                        >
                          <option value="tous">Tous les départements</option>
                          {DEPARTMENTS_DATA.map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      {attendanceLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold-rich" /></div>
                      ) : filteredAttendance.length === 0 ? (
                        <p className="py-10 text-center text-xs italic text-neutral-gray">Aucune session pour ce filtre.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-gold-rich/10">
                          <table className="w-full min-w-[640px] text-left">
                            <thead className="bg-primary-green/15 text-[9px] font-mono uppercase tracking-wider text-neutral-gray">
                              <tr>
                                <th className="px-4 py-3">Session</th>
                                <th className="px-4 py-3">Département</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Présence</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gold-rich/10">
                              {filteredAttendance.map(s => {
                                const rate = s.totalMembers > 0 ? Math.round(((s.presentMemberIds?.length || 0) / s.totalMembers) * 100) : 0;
                                return (
                                  <tr key={s.id} className="hover:bg-primary-green/5">
                                    <td className="px-4 py-4 text-sm font-semibold">{s.title}</td>
                                    <td className="px-4 py-4">
                                      <span className="rounded-md bg-gold-rich/10 px-2 py-1 text-[9px] font-mono font-bold uppercase text-gold-bright">{s.departmentName}</span>
                                    </td>
                                    <td className="px-4 py-4 text-[11px] text-neutral-gray">{s.date}</td>
                                    <td className="px-4 py-4 text-[11px]">
                                      <span className="text-pristine-white">{s.presentMemberIds?.length || 0}/{s.totalMembers || 0}</span>
                                      <span className="ml-2 font-mono text-emerald-400">({rate}%)</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ================= FINANCE ================= */}
                  {activeTab === 'finance' && (
                    <motion.div key="finance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <StatCard icon={Wallet} label="Total Collecté" value={`${totalCollected.toLocaleString()} FCFA`} sub="dons confirmés" accent="emerald" />
                        <StatCard icon={TrendingUp} label="Ce mois-ci" value={`${monthCollected.toLocaleString()} FCFA`} sub={now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} accent="gold" />
                        <StatCard icon={Clock} label="En Attente" value={pendingDonations.length.toString()} sub="à valider" accent={pendingDonations.length > 0 ? 'red' : undefined} />
                        <StatCard icon={XCircle} label="Échoués" value={failedDonations.length.toString()} sub="non aboutis" />
                      </div>

                      {paymentMethodBreakdown.length > 0 && (
                        <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                          <h4 className="mb-4 font-cinzel text-sm font-bold">Répartition par moyen de paiement</h4>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {paymentMethodBreakdown.map(([method, amount]) => (
                              <div key={method} className="rounded-lg border border-gold-rich/10 bg-deep-green/40 p-4">
                                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-gray">{method}</p>
                                <p className="mt-1 text-lg font-bold text-gold-bright">{amount.toLocaleString()} FCFA</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-gray" />
                          <input
                            type="text"
                            value={donationSearch}
                            onChange={e => setDonationSearch(e.target.value)}
                            placeholder="Rechercher par donateur, email ou référence..."
                            className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gold-rich/50"
                          />
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                          {(['tous', 'En attente', 'Confirmé', 'Échoué'] as DonationFilter[]).map(f => (
                            <button
                              key={f}
                              onClick={() => setDonationFilter(f)}
                              className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition ${
                                donationFilter === f ? 'bg-gold-rich font-bold text-deep-green' : 'bg-primary-green/10 text-neutral-gray hover:text-white'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      {donationsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold-rich" /></div>
                      ) : filteredDonations.length === 0 ? (
                        <p className="py-10 text-center text-xs italic text-neutral-gray">Aucun don ne correspond à ces critères.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-gold-rich/10">
                          <table className="w-full min-w-[820px] text-left">
                            <thead className="bg-primary-green/15 text-[9px] font-mono uppercase tracking-wider text-neutral-gray">
                              <tr>
                                <th className="px-4 py-3">Donateur</th>
                                <th className="px-4 py-3">Montant</th>
                                <th className="px-4 py-3">Moyen</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Statut</th>
                                <th className="px-4 py-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gold-rich/10">
                              {filteredDonations.map(d => (
                                <tr key={d.id} className="hover:bg-primary-green/5">
                                  <td className="px-4 py-4">
                                    <p className="text-sm font-semibold">{d.donorName || 'Anonyme'}</p>
                                    <p className="text-[10px] text-neutral-gray">{d.donorEmail}</p>
                                  </td>
                                  <td className="px-4 py-4 text-sm font-mono font-bold text-gold-bright">{(d.amount || 0).toLocaleString()} FCFA</td>
                                  <td className="px-4 py-4 text-[11px] text-neutral-gray">{d.paymentMethod}</td>
                                  <td className="px-4 py-4 text-[11px] text-neutral-gray">{d.date}</td>
                                  <td className="px-4 py-4">
                                    <span className={`rounded-md px-2 py-1 text-[9px] font-mono font-bold uppercase ${
                                      d.status === 'Confirmé' ? 'bg-emerald-500/15 text-emerald-300' :
                                      d.status === 'En attente' ? 'bg-gold-rich/15 text-gold-bright' :
                                      'bg-red-500/15 text-red-300'
                                    }`}>
                                      {d.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    {d.status === 'En attente' ? (
                                      <div className="flex gap-2">
                                        <button
                                          disabled={updatingDonationId === d.id}
                                          onClick={() => handleUpdateDonationStatus(d.id, 'Confirmé')}
                                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-1.5 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                                          title="Confirmer"
                                        >
                                          {updatingDonationId === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                        </button>
                                        <button
                                          disabled={updatingDonationId === d.id}
                                          onClick={() => handleUpdateDonationStatus(d.id, 'Échoué')}
                                          className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                                          title="Rejeter"
                                        >
                                          <XCircle className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-neutral-gray">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ================= NOTIFICATIONS ================= */}
                  {activeTab === 'notifications' && (
                    <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mx-auto max-w-2xl space-y-6">
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

                      <div className="rounded-xl border border-gold-rich/10 bg-primary-green/10 p-5">
                        <div className="mb-2 flex items-center gap-3">
                          <div className="rounded-xl bg-gold-rich/10 p-3"><BellRing className="h-5 w-5 text-gold-bright" /></div>
                          <div>
                            <h4 className="font-cinzel text-sm font-bold">Choisir l'audience</h4>
                            <p className="mt-1 text-[10px] text-neutral-gray">Le Leader peut cibler qui il veut.</p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <button
                            type="button"
                            onClick={() => applyAudience('all-members')}
                            className={`rounded-xl border p-3 text-left text-xs transition ${notifAudience === 'all-members' ? 'border-gold-rich bg-gold-rich/10 text-gold-bright' : 'border-gold-rich/15 text-neutral-gray hover:border-gold-rich/30'}`}
                          >
                            <Globe className="mb-1.5 h-4 w-4" />
                            <p className="font-semibold">Tout le monde</p>
                            <p className="mt-0.5 text-[10px] opacity-70">Tous les membres inscrits</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => applyAudience('managers')}
                            className={`rounded-xl border p-3 text-left text-xs transition ${notifAudience === 'managers' ? 'border-gold-rich bg-gold-rich/10 text-gold-bright' : 'border-gold-rich/15 text-neutral-gray hover:border-gold-rich/30'}`}
                          >
                            <ShieldCheck className="mb-1.5 h-4 w-4" />
                            <p className="font-semibold">Managers seulement</p>
                            <p className="mt-0.5 text-[10px] opacity-70">Tous les responsables de département</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => applyAudience('department')}
                            className={`rounded-xl border p-3 text-left text-xs transition ${notifAudience === 'department' ? 'border-gold-rich bg-gold-rich/10 text-gold-bright' : 'border-gold-rich/15 text-neutral-gray hover:border-gold-rich/30'}`}
                          >
                            <Building2 className="mb-1.5 h-4 w-4" />
                            <p className="font-semibold">Un département</p>
                            <p className="mt-0.5 text-[10px] opacity-70">Choisir un département précis</p>
                          </button>
                        </div>

                        {notifAudience === 'department' && (
                          <select
                            value={notifDeptId}
                            onChange={e => setNotifDeptId(e.target.value)}
                            className="mt-3 w-full rounded-xl border border-gold-rich/15 bg-deep-green px-4 py-3 text-sm text-gold-bright outline-none"
                          >
                            {DEPARTMENTS_DATA.map((d: any) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <form onSubmit={handleSendNotification} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Titre</label>
                          <input
                            type="text"
                            required
                            value={notifTitle}
                            onChange={e => setNotifTitle(e.target.value)}
                            placeholder="Ex: Message du Leader à toute l'Armée"
                            className="w-full rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm outline-none transition focus:border-gold-rich/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Message</label>
                          <textarea
                            required
                            rows={4}
                            value={notifBody}
                            onChange={e => setNotifBody(e.target.value)}
                            placeholder="Rédigez le contenu du message..."
                            className="w-full resize-none rounded-xl border border-gold-rich/15 bg-primary-green/10 px-4 py-3 text-sm outline-none transition focus:border-gold-rich/50"
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

                  {/* ================= RAPPORTS ================= */}
                  {activeTab === 'rapports' && (
                    <motion.div key="rapports" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                          <h4 className="font-cinzel text-sm font-bold mb-3">Résumé des Données</h4>
                          <div className="space-y-2">
                            <SummaryRow label="Membres" value={stats.totalMembers.toLocaleString()} />
                            <SummaryRow label="Départements" value={MOCK_ADMIN_METRICS.totalDepartments.toString()} />
                            <SummaryRow label="Témoignages" value={testimonies.length.toString()} />
                            <SummaryRow label="Enseignements" value={teachings.length.toString()} />
                            <SummaryRow label="Événements" value={registeredEvents.length.toString()} />
                            <SummaryRow label="Dons confirmés" value={confirmedDonations.length.toString()} />
                            <SummaryRow label="Total collecté" value={`${totalCollected.toLocaleString()} FCFA`} />
                            <SummaryRow label="Sessions de présence" value={allAttendance.length.toString()} />
                          </div>
                        </div>

                        <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-5">
                          <h4 className="font-cinzel text-sm font-bold mb-3">Actions Rapides</h4>
                          <div className="space-y-2">
                            <button
                              onClick={handleExport}
                              disabled={isExporting}
                              className="w-full px-4 py-2.5 rounded-xl bg-gold-rich text-deep-green font-bold text-sm text-center hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              {isExporting ? 'Exportation...' : 'Exporter tout (Excel)'}
                            </button>
                            {exportSuccess && (
                              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                                <CheckCircle className="h-4 w-4" /> Export terminé avec succès !
                              </div>
                            )}
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

// ---------------- Sous-composants d'affichage ----------------

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub: string; accent?: 'emerald' | 'gold' | 'red' }) {
  const iconColor = accent === 'emerald' ? 'text-emerald-400' : accent === 'red' ? 'text-red-400' : 'text-gold-rich';
  return (
    <div className="rounded-2xl border border-gold-rich/10 bg-[#0a2113] p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-gray">{label}</span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-[10px] text-neutral-gray">{sub}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: number; sub: string; accent?: 'red' }) {
  return (
    <div className="rounded-xl border border-gold-rich/10 bg-primary-green/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${accent === 'red' ? 'text-red-400' : 'text-gold-rich'}`} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-gray">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-0.5 text-[9px] text-neutral-gray">{sub}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-gray">{label}</span>
      <span className="text-pristine-white font-mono">{value}</span>
    </div>
  );
}
