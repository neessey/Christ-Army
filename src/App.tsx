import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Menu, X, Shield, User, Heart, Lock, HelpCircle } from 'lucide-react';

import Hero from './components/Hero';
import Vision from './components/Vision';
import Departments from './components/Departments';
import Teachings from './components/Teachings';
import Events from './components/Events';
import Donations from './components/Donations';
import AdminDashboard from './components/AdminDashboard';
import UserAccount from './components/UserAccount';
import Footer from './components/Footer';

import { TESTIMONIES_DATA, TEACHINGS_DATA, EVENTS_DATA } from './mockData';
import { User as UserType, Testimony, Teaching, Event } from './types';
import {
  saveEnrolement,
  saveDeptInscription,
  saveEventInscription,
  getEnrolements,
  getDeptInscriptions,
  getEventInscriptions,
  toggleFavoriteTeaching,
  registerUserToEvent,
  addUserToDepartment,
  addDonationToHistory,
  subscribeToUserProfile,
  EnrolementData,
  DeptInscriptionData,
  EventInscriptionData,
} from './lib/firestoreService';
import { subscribeToAuthChanges } from './lib/authService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // L'utilisateur connecté est maintenant dérivé de Firebase Auth + Firestore,
  // et non plus d'un mock stocké dans localStorage.
  const [user, setUser] = useState<UserType | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const profileUnsubscribeRef = useRef<(() => void) | null>(null);

  const [testimonies, setTestimonies] = useState<Testimony[]>(() => {
    const saved = localStorage.getItem('ca_testimonies');
    return saved ? JSON.parse(saved) : TESTIMONIES_DATA;
  });

  const [teachings, setTeachings] = useState<Teaching[]>(() => {
    const saved = localStorage.getItem('ca_teachings');
    return saved ? JSON.parse(saved) : TEACHINGS_DATA;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('ca_events');
    return saved ? JSON.parse(saved) : EVENTS_DATA;
  });

  const [joinedCount, setJoinedCount] = useState<number>(() => {
    const saved = localStorage.getItem('ca_joined_count');
    return saved ? Number(saved) : 10450;
  });
  const [dbEnrolements, setDbEnrolements] = useState<EnrolementData[]>([]);
  const [dbDeptInscriptions, setDbDeptInscriptions] = useState<DeptInscriptionData[]>([]);
  const [dbEventInscriptions, setDbEventInscriptions] = useState<EventInscriptionData[]>([]);

  // --- Espace Membre : écoute de la session Firebase Auth ---
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthChanges(firebaseUser => {
      // On coupe l'ancien abonnement au profil Firestore avant d'en ouvrir un nouveau
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }

      if (firebaseUser) {
        const unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, profile => {
          setUser(profile);
        });
        profileUnsubscribeRef.current = unsubscribeProfile;
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (profileUnsubscribeRef.current) profileUnsubscribeRef.current();
    };
  }, []);

  // --- PWA : enregistrement du service worker (installabilité + FCM) ---
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(err => {
        console.error('Échec d\'enregistrement du service worker:', err);
      });
    }
  }, []);

  // Load Firestore data on mount
  useEffect(() => {
    async function loadFirestoreData() {
      try {
        const enrolements = await getEnrolements();
        const depts = await getDeptInscriptions();
        const evs = await getEventInscriptions();

        setDbEnrolements(enrolements);
        setDbDeptInscriptions(depts);
        setDbEventInscriptions(evs);

        // Sum the initial base 10450 with real-time enrollees
        setJoinedCount(10450 + enrolements.length);
      } catch (err) {
          console.error('Erreur de chargement Firestore initial:', err);
      }
    }
    loadFirestoreData();
  }, []);

  // Sync to localStorage (contenu public uniquement — le profil membre vit dans Firestore)
  useEffect(() => {
    localStorage.setItem('ca_testimonies', JSON.stringify(testimonies));
  }, [testimonies]);

  useEffect(() => {
    localStorage.setItem('ca_teachings', JSON.stringify(teachings));
  }, [teachings]);

  useEffect(() => {
    localStorage.setItem('ca_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('ca_joined_count', String(joinedCount));
  }, [joinedCount]);

  const handleToggleFavorite = async (id: string) => {
    if (!user) {
      // Il faut un espace membre pour enregistrer des favoris
      setActiveTab('account');
      return;
    }
    const hasFav = user.favorites.includes(id);
    await toggleFavoriteTeaching(user.id, id, hasFav);
    // La mise à jour de l'UI arrive automatiquement via l'abonnement Firestore temps réel.
  };

  const handleRegisterEvent = async (eventId: string) => {
    const userName = user?.name ?? 'Visiteur Invité';
    const userEmail = user?.email ?? 'visiteur@gmail.com';
    const event = events.find(e => e.id === eventId);
    const eventTitle = event ? event.title : 'Événement Spécial';

    const registerId = `CA-EV-${Date.now()}`;
    const newReg: EventInscriptionData = {
      id: registerId,
      eventId,
      eventTitle,
      userEmail,
      userName,
      dateRegistered: new Date().toLocaleDateString('fr-FR')
    };

    await saveEventInscription(newReg);
    setDbEventInscriptions(prev => [...prev, newReg]);

    const alreadyRegistered = user?.eventsRegistered.includes(eventId) ?? false;

    if (user && !alreadyRegistered) {
      await registerUserToEvent(user.id, eventId);
    }

    if (!alreadyRegistered) {
      setEvents(prev => prev.map(ev => {
        if (ev.id === eventId) {
          return { ...ev, registeredCount: ev.registeredCount + 1 };
        }
        return ev;
      }));
    }
  };

  const handleJoinDepartment = async (departmentId: string, formData: any) => {
    setJoinedCount(prev => prev + 1);

    const inscriptionId = `CA-DEPT-${Date.now()}s`;
    const newInscription: DeptInscriptionData = {
      id: inscriptionId,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      country: formData.country,
      motivation: formData.motivation,
      availability: formData.availability,
      departmentId,
      dateJoined: new Date().toLocaleDateString('fr-FR')
    };

    await saveDeptInscription(newInscription);
    setDbDeptInscriptions(prev => [...prev, newInscription]);

    if (user) {
      await addUserToDepartment(user.id, departmentId);
    }
  };

  const handleJoinMouvement = async (memberData: any) => {
    setJoinedCount(prev => prev + 1);

    await saveEnrolement(memberData);
    setDbEnrolements(prev => [...prev, memberData]);

    if (user) {
      await addUserToDepartment(user.id, memberData.serviceDomain);
    }
  };

  const handleAddDonation = async (donation: any) => {
    if (user) {
      await addDonationToHistory(user.id, donation);
    }
    // Les visiteurs non connectés voient toujours la confirmation de don dans
    // Donations.tsx, mais l'historique n'est conservé que sur un espace membre.
  };

  const handleAddTestimony = (newTest: Testimony) => {
    setTestimonies(prev => [newTest, ...prev]);
  };

  // Administrative Controls
  const handleAddTeaching = (newTeaching: Teaching) => {
    setTeachings(prev => [newTeaching, ...prev]);
  };

  const handleAddEvent = (newEvent: Event) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleApproveTestimony = (id: string, isApproved: boolean) => {
    setTestimonies(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, isApproved };
      }
      return t;
    }));
  };

  const handleExportExcelSimulation = () => {
    // Generate a mock CSV content
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Nom,Email,Date Enrôlement,Département\n" +
      "CA-1024,Arthur Kouadio,arthur@gmail.com,15/06/2026,Intercession\n" +
      "CA-1025,Jeanne Kouassi,jeanne@gmail.com,18/06/2026,Musique\n" +
      "CA-1026,Samuel Diop,diop@gmail.com,20/06/2026,Évangélisation\n" +
      "CA-1027,Sœur Grâce,grace@gmail.com,25/06/2026,Communication";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "christ_army_rapport_membres.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNavigate = (section: string) => {
    setActiveTab(section);
    setMobileMenuOpen(false);
    // Smooth scroll to top of app wrapper
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-deep-green font-sans text-pristine-white overflow-x-hidden antialiased selection:bg-gold-rich selection:text-deep-green">

      {/* --- PREMIUM FIXED GLASS NAVIGATION BAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gold-rich/10 bg-deep-green/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo Brand */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gold-rich/10 border border-gold-rich/20 flex items-center justify-center transition-all group-hover:bg-gold-rich">
              <img src="/assets/logo.jpg" alt="Christ Army logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-cinzel text-base font-bold tracking-widest text-pristine-white block">CHRIST ARMY</span>
              <span className="text-[8px] font-mono uppercase text-gold-rich tracking-widest block mt-0.5">Ministère de Puissance</span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden xl:flex items-center gap-7">
            {[
              { id: 'vision', label: 'Vision & Fondateur' },
              { id: 'departments', label: 'Départements' },
              { id: 'teachings', label: 'Bibliothèque' },
              { id: 'events', label: 'Programme' },
              { id: 'donations', label: 'Cotisations / Dons' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`text-[11px] font-mono uppercase tracking-wider font-semibold transition-colors duration-300 hover:text-gold-bright ${
                  activeTab === item.id ? 'text-gold-bright border-b border-gold-bright pb-1' : 'text-neutral-gray'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Action Row: Espace Membre / Admin Cockpit */}
          <div className="hidden xl:flex items-center gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavigate('admin')}
                className={`px-3 py-1.5 rounded border text-[10px] font-mono uppercase tracking-wider ${
                  activeTab === 'admin'
                    ? 'bg-gold-bright text-deep-green font-bold border-gold-bright'
                    : 'bg-primary-green/20 border-gold-rich/20 text-gold-bright hover:bg-gold-rich hover:text-deep-green'
                }`}
              >
                Cockpit Admin
              </button>
            )}

            <button
              onClick={() => handleNavigate('account')}
              className={`p-2 rounded-full border border-gold-rich/20 flex items-center justify-center transition-all ${
                activeTab === 'account' ? 'bg-gold-rich text-deep-green' : 'bg-primary-green/10 text-gold-rich hover:bg-primary-green/20'
              }`}
              title="Mon Compte"
            >
              <User className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg border border-gold-rich/20 text-gold-rich"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {/* Mobile menu expanded */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden border-t border-gold-rich/10 bg-deep-green/95 backdrop-blur-lg"
            >
              <div className="px-6 py-6 space-y-4 flex flex-col text-left">
                {[
                  { id: 'vision', label: 'Vision & Prophète' },
                  { id: 'departments', label: 'Départements' },
                  { id: 'teachings', label: 'Bibliothèque' },
                  { id: 'events', label: 'Programme' },
                  { id: 'donations', label: 'Cotisations & Dons' },
                  { id: 'account', label: 'Espace Membre' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`text-xs font-mono uppercase tracking-widest font-bold py-2 border-b border-gold-rich/5 text-left ${
                      activeTab === item.id ? 'text-gold-bright' : 'text-neutral-gray'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="w-full text-center py-2.5 bg-gold-rich text-deep-green font-bold font-mono text-xs uppercase tracking-widest rounded"
                  >
                    Console d'Administration
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- ACTIVE WORKSPACE COMPONENT (FADE TRANSITIONS) --- */}
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'home' && <Hero onNavigate={handleNavigate} />}
            {activeTab === 'vision' && <Vision />}

            {activeTab === 'departments' && (
              <Departments
                onJoinDepartment={handleJoinDepartment}
                joinedDepartmentIds={user?.joinedDepartments || []}
              />
            )}

            {activeTab === 'teachings' && (
              <Teachings
                favorites={user?.favorites || []}
                onToggleFavorite={handleToggleFavorite}
                testimonies={testimonies}
                onAddTestimony={handleAddTestimony}
              />
            )}

            {activeTab === 'events' && (
              <Events
                onRegisterEvent={handleRegisterEvent}
                registeredEventIds={user?.eventsRegistered || []}
              />
            )}

            {activeTab === 'donations' && (
              <Donations
                onAddDonation={handleAddDonation}
              />
            )}

            {activeTab === 'account' && <UserAccount user={user} />}

            {activeTab === 'admin' && user?.role === 'admin' && (
              <AdminDashboard
                onAddTeaching={handleAddTeaching}
                onAddEvent={handleAddEvent}
                onApproveTestimony={handleApproveTestimony}
                onExportExcel={handleExportExcelSimulation}
                testimonies={testimonies}
                registeredEvents={events}
                teachings={teachings}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- FOOTER COMPONENT --- */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}