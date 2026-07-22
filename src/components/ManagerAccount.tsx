import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, BellRing, Phone, Mail, Calendar, CheckSquare, Square, Plus, Trash2, CheckCircle, AlertCircle, Loader2, Search, Target } from 'lucide-react';
import { DEPARTMENTS_DATA } from '../mockData';
import { User as UserType } from '../types';
import { subscribeToDeptMembers, DeptInscriptionData } from '../lib/firestoreService';

interface ManagerAccountProps {
  user: UserType;
}

interface AttendanceSession {
  id: string;
  date: string;
  title: string;
  presentMemberIds: string[]; // IDs des membres présents
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

const NOTIFICATIONS_API_URL = (import.meta as ImportMetaWithEnv).env.VITE_NOTIFICATIONS_API_URL;

export default function ManagerAccount({ user }: ManagerAccountProps) {
  const departmentId = user.managedDepartmentId;
  const department = DEPARTMENTS_DATA.find(d => d.id === departmentId);

  const [members, setMembers] = useState<DeptInscriptionData[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'membres' | 'presence' | 'objectifs' | 'notifications'>('membres');

  // --- NOUVEAU : État pour la Liste de Présence ---
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    const saved = localStorage.getItem(`dept_attendance_${departmentId}`);
    return saved ? JSON.parse(saved) : [
      { id: '1', date: new Date().toLocaleDateString('fr-FR'), title: 'Réunion / Culte standard', presentMemberIds: [] }
    ];
  });
  const [newSessionTitle, setNewSessionTitle] = useState('');

  // --- NOUVEAU : État pour la To-Do List / Objectifs ---
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(`dept_tasks_${departmentId}`);
    return saved ? JSON.parse(saved) : [
      { id: 't1', text: 'Préparer le programme de la semaine', category: 'semaine', completed: false },
      { id: 't2', text: 'Accueillir les nouveaux membres', category: 'jour', completed: true }
    ];
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'jour' | 'semaine' | 'mois'>('semaine');
  const [taskFilter, setTaskFilter] = useState<'tous' | 'jour' | 'semaine' | 'mois'>('tous');

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

  // Sauvegarde locale de la présence
  useEffect(() => {
    if (departmentId) {
      localStorage.setItem(`dept_attendance_${departmentId}`, JSON.stringify(attendanceSessions));
    }
  }, [attendanceSessions, departmentId]);

  // Sauvegarde locale des tâches / objectifs
  useEffect(() => {
    if (departmentId) {
      localStorage.setItem(`dept_tasks_${departmentId}`, JSON.stringify(tasks));
    }
  }, [tasks, departmentId]);

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.includes(searchTerm)
  );

  // Gestion des présences
  const handleToggleAttendance = (sessionId: string, memberId: string) => {
    setAttendanceSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const isPresent = session.presentMemberIds.includes(memberId);
        return {
          ...session,
          presentMemberIds: isPresent
            ? session.presentMemberIds.filter(id => id !== memberId)
            : [...session.presentMemberIds, memberId]
        };
      }
      return session;
    }));
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) return;
    const newSession: AttendanceSession = {
      id: `sess_${Date.now()}`,
      date: new Date().toLocaleDateString('fr-FR'),
      title: newSessionTitle.trim(),
      presentMemberIds: []
    };
    setAttendanceSessions([newSession, ...attendanceSessions]);
    setNewSessionTitle('');
  };

  const handleDeleteSession = (sessionId: string) => {
    if (attendanceSessions.length <= 1) {
      alert("Vous devez garder au moins une session de présence.");
      return;
    }
    setAttendanceSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // Gestion des tâches / objectifs
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      text: newTaskText.trim(),
      category: newTaskCategory,
      completed: false
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(t => taskFilter === 'tous' ? true : t.category === taskFilter);

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
            {user.name} — Responsable en charge de ce département. Gérez vos membres, suivez les présences et vos objectifs.
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
          <div className="flex flex-wrap bg-[#051d0d]/80 border-b border-gold-rich/10">
            {(['membres', 'presence', 'objectifs', 'notifications'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-5 py-4 font-mono text-xs uppercase tracking-wider font-semibold transition-all border-r border-gold-rich/5 ${
                  activeSubTab === tab
                    ? 'bg-primary-green/10 text-gold-bright border-b-2 border-b-gold-bright'
                    : 'text-neutral-gray hover:text-white hover:bg-primary-green/5'
                }`}
              >
                {tab === 'membres' && 'Liste des Membres'}
                {tab === 'presence' && 'Feuille de Présence'}
                {tab === 'objectifs' && 'Objectifs / To-Do'}
                {tab === 'notifications' && 'Notifications'}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* ONGLET MEMBRES */}
              {activeSubTab === 'membres' && (
                <motion.div
                  key="membres"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
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

              {/* ONGLET PRÉSENCE */}
              {activeSubTab === 'presence' && (
                <motion.div
                  key="presence"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary-green/20 p-4 rounded-xl border border-gold-rich/15">
                    <div>
                      <h4 className="font-cinzel text-base font-bold text-pristine-white">Suivi des Présences aux Rencontres</h4>
                      <p className="text-xs text-neutral-gray mt-0.5">Cochez les membres présents pour chaque session de réunion.</p>
                    </div>
                    <form onSubmit={handleAddSession} className="flex gap-2 w-full md:w-auto">
                      <input
                        type="text"
                        placeholder="Nom de la session (ex: Culte du dimanche)..."
                        value={newSessionTitle}
                        onChange={e => setNewSessionTitle(e.target.value)}
                        className="px-3 py-2 rounded bg-primary-green/10 border border-gold-rich/20 text-xs text-pristine-white outline-none flex-grow"
                      />
                      <button type="submit" className="px-4 py-2 bg-gold-rich text-deep-green font-bold text-xs uppercase rounded flex items-center gap-1 shrink-0">
                        <Plus className="w-4 h-4" /> Ajouter
                      </button>
                    </form>
                  </div>

                  {members.length === 0 ? (
                    <p className="text-xs text-neutral-gray text-center py-8 italic">Aucun membre dans ce département pour effectuer l'appel.</p>
                  ) : (
                    <div className="space-y-6">
                      {attendanceSessions.map(session => (
                        <div key={session.id} className="border border-gold-rich/15 rounded-xl bg-primary-green/5 p-5 space-y-4">
                          <div className="flex justify-between items-center border-b border-gold-rich/10 pb-3">
                            <div>
                              <h5 className="font-bold text-sm text-gold-bright">{session.title}</h5>
                              <span className="text-[10px] font-mono text-neutral-gray">Date : {session.date} • Présents : {session.presentMemberIds.length} / {members.length}</span>
                            </div>
                            {attendanceSessions.length > 1 && (
                              <button onClick={() => handleDeleteSession(session.id)} className="text-red-400 hover:text-red-300 p-1" title="Supprimer cette session">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {members.map(m => {
                              const isPresent = session.presentMemberIds.includes(m.id);
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => handleToggleAttendance(session.id, m.id)}
                                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                                    isPresent
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                                      : 'bg-primary-green/10 border-gold-rich/10 text-neutral-gray hover:border-gold-rich/30'
                                  }`}
                                >
                                  <span className="text-xs font-medium truncate pr-2">{m.name}</span>
                                  {isPresent ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-neutral-gray shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ONGLET OBJECTIFS / TO-DO LIST */}
              {activeSubTab === 'objectifs' && (
                <motion.div
                  key="objectifs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 bg-primary-green/20 p-4 rounded-xl border border-gold-rich/15">
                    <input
                      type="text"
                      placeholder="Nouvel objectif ou tâche pour le département..."
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      className="px-3 py-2.5 rounded bg-primary-green/10 border border-gold-rich/20 text-xs text-pristine-white outline-none flex-grow"
                    />
                    <select
                      value={newTaskCategory}
                      onChange={(e: any) => setNewTaskCategory(e.target.value)}
                      className="px-3 py-2.5 rounded bg-deep-green border border-gold-rich/20 text-xs text-gold-bright font-mono uppercase outline-none"
                    >
                      <option value="jour">Par Jour</option>
                      <option value="semaine">Par Semaine</option>
                      <option value="mois">Par Mois</option>
                    </select>
                    <button type="submit" className="px-4 py-2.5 bg-gold-rich text-deep-green font-bold text-xs uppercase rounded flex items-center justify-center gap-1 shrink-0">
                      <Plus className="w-4 h-4" /> Ajouter
                    </button>
                  </form>

                  {/* Filtres de la To-Do List */}
                  <div className="flex items-center gap-2 border-b border-gold-rich/10 pb-3">
                    <Target className="w-4 h-4 text-gold-rich mr-1" />
                    <span className="text-xs font-mono uppercase text-neutral-gray mr-2">Filtrer par :</span>
                    {(['tous', 'jour', 'semaine', 'mois'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setTaskFilter(cat)}
                        className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
                          taskFilter === cat ? 'bg-gold-rich text-deep-green font-bold' : 'bg-primary-green/10 text-neutral-gray hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {filteredTasks.length === 0 ? (
                    <p className="text-xs text-neutral-gray text-center py-8 italic">Aucune tâche enregistrée pour ce filtre.</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredTasks.map(task => (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            task.completed
                              ? 'bg-primary-green/5 border-emerald-500/20 opacity-75'
                              : 'bg-primary-green/10 border-gold-rich/15'
                          }`}
                        >
                          <div className="flex items-center gap-3 cursor-pointer flex-grow pr-4" onClick={() => handleToggleTask(task.id)}>
                            {task.completed ? (
                              <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-5 h-5 text-neutral-gray shrink-0" />
                            )}
                            <span className={`text-sm ${task.completed ? 'line-through text-neutral-gray' : 'text-pristine-white'}`}>
                              {task.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase bg-gold-rich/15 text-gold-bright">
                              {task.category}
                            </span>
                            <button onClick={() => handleDeleteTask(task.id)} className="text-neutral-gray hover:text-red-400 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ONGLET NOTIFICATIONS */}
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