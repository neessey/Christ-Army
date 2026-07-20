import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Volume2, Download, Heart, FileText, Video, Play, Pause, 
  BookmarkCheck, Headphones, Eye, Tv, Activity, Plus, CheckCircle, 
  Send, Quote, Bookmark, Share2, ArrowLeft, HeartHandshake
} from 'lucide-react';
import { TEACHINGS_DATA, BLOG_DATA } from '../mockData';
import { Teaching, BlogPost, Testimony } from '../types';

interface TeachingsProps {
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  testimonies: Testimony[];
  onAddTestimony: (testimony: Testimony) => void;
}

type TabType = 'all' | 'video' | 'audio'  | 'blog' | 'testimonies';

export default function Teachings({ 
  onToggleFavorite, 
  favorites, 
  testimonies, 
  onAddTestimony 
}: TeachingsProps) {
  // Navigation tabs inside Bibliothèque
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Audio state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);



  // Blog state
  const [blogLikes, setBlogLikes] = useState<Record<string, number>>({});
  const [hasLikedBlog, setHasLikedBlog] = useState<Record<string, boolean>>({});
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Testimonies state
  const [testimonyFilter, setTestimonyFilter] = useState<'Tous' | 'Miracle' | 'Guérison' | 'Conversion' | 'Restauration'>('Tous');
  const [showTestimonyModal, setShowTestimonyModal] = useState(false);
  const [testimonySuccess, setTestimonySuccess] = useState(false);
  const [testimonyLikes, setTestimonyLikes] = useState<Record<string, number>>({});
  const [userLikedTestimony, setUserLikedTestimony] = useState<Record<string, boolean>>({});

  // Testimony Form states
  const [authorName, setAuthorName] = useState('');
  const [testimonyTitle, setTestimonyTitle] = useState('');
  const [testimonyCategory, setTestimonyCategory] = useState<'Miracle' | 'Guérison' | 'Conversion' | 'Restauration'>('Miracle');
  const [testimonyContent, setTestimonyContent] = useState('');

  // ------------------------------------------
  // LECTURE AUDIO LOGIC
  // ------------------------------------------
  const handlePlayAudio = (teaching: Teaching) => {
    if (playingId === teaching.id) {
      audioPlayer?.pause();
      setPlayingId(null);
    } else {
      if (audioPlayer) {
        audioPlayer.pause();
      }
      const newPlayer = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');
      newPlayer.play().catch(err => console.log('Audio blocked', err));
      newPlayer.volume = 0.2;
      newPlayer.addEventListener('ended', () => setPlayingId(null));
      setAudioPlayer(newPlayer);
      setPlayingId(teaching.id);
    }
  };

  const handleDownloadSimulation = (teaching: Teaching) => {
    const element = document.createElement('a');
    const fileContent = `Enseignement Christ Army : ${teaching.title}\nPar : ${teaching.author}\nDate : ${teaching.date}\n\nCeci est un fichier d'enseignement chrétien de démonstration officiel du ministère Christ Army. Pour plus de ressources, veuillez vous connecter sur la plateforme.`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${teaching.title.replace(/\s+/g, '_')}_Christ_Army.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };


  // ------------------------------------------
  // BLOG / PAROLES INSPIRÉES LOGIC
  // ------------------------------------------
  const handleBlogLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLikedBlog[id]) {
      setBlogLikes(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 }));
      setHasLikedBlog(prev => ({ ...prev, [id]: false }));
    } else {
      setBlogLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setHasLikedBlog(prev => ({ ...prev, [id]: true }));
    }
  };

  const selectedPost = BLOG_DATA.find(p => p.id === selectedPostId);

  // ------------------------------------------
  // TÉMOIGNAGES LOGIC
  // ------------------------------------------
  const filteredTestimonies = testimonies.filter(t => {
    if (!t.isApproved) return false;
    return testimonyFilter === 'Tous' ? true : t.category === testimonyFilter;
  });

  const handleTestimonyLike = (id: string) => {
    if (userLikedTestimony[id]) {
      setTestimonyLikes(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 }));
      setUserLikedTestimony(prev => ({ ...prev, [id]: false }));
    } else {
      setTestimonyLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setUserLikedTestimony(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleSubmitTestimony = (e: React.FormEvent) => {
    e.preventDefault();

    const newTest: Testimony = {
      id: `test-${Date.now()}`,
      authorName,
      title: testimonyTitle,
      category: testimonyCategory,
      content: testimonyContent,
      date: new Date().toISOString().split('T')[0],
      isApproved: true, // Approved locally immediately for rich experience
      likesCount: 1
    };

    onAddTestimony(newTest);
    setTestimonySuccess(true);

    setTimeout(() => {
      setShowTestimonyModal(false);
      setTestimonySuccess(false);
      setAuthorName('');
      setTestimonyTitle('');
      setTestimonyContent('');
    }, 2500);
  };

  // Filter regular teachings
  const filteredTeachings = TEACHINGS_DATA.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'video') return matchesSearch && t.category === 'video';
    if (activeTab === 'audio') return matchesSearch && t.category === 'audio';
    return false;
  });

  const [selectedVideo, setSelectedVideo] = useState<Teaching | null>(null);

  return (
    <section id="teachings" className="relative py-24 bg-deep-green border-t border-gold-rich/10">
      <div className="absolute top-1/3 right-1/10 w-[500px] h-[500px] rounded-full bg-gold-rich/3 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Unified Title */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-rich font-semibold">
            {activeTab === 'all' || activeTab === 'video' || activeTab === 'audio' ? 'Bibliothèque Spirituelle' : ''}
            {activeTab === 'blog' ? 'Paroles de Révélation' : ''}
            {activeTab === 'testimonies' ? 'Témoins de l\'Onction' : ''}
          </span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold mt-2 text-pristine-white uppercase tracking-wider">
            {activeTab === 'all' || activeTab === 'video' || activeTab === 'audio' ? 'La Bibliothèque' : ''}
            {activeTab === 'blog' ? 'Paroles Inspirées' : ''}
            {activeTab === 'testimonies' ? 'Témoignages & Miracles' : ''}
          </h2>
          <p className="text-sm text-neutral-gray max-w-2xl mx-auto mt-4 font-light leading-relaxed">
            {activeTab === 'all' || activeTab === 'video' || activeTab === 'audio' 
              ? 'Nourrissez votre esprit avec les prédications doctrinales du Prophète Kader Josué Fadika. Téléchargez les livrets et écoutez les fichiers audio.' 
              : ''}
          
            {activeTab === 'blog' 
              ? 'Parcourez nos articles de foi, révélations divines et déclarations prophétiques écrites personnellement par l\'onction pastorale.' 
              : ''}
            {activeTab === 'testimonies' 
              ? 'Découvrez les récits authentiques de conversions radicales, de guérisons certifiées et de miracles de restauration opérés par le Seigneur.' 
              : ''}
          </p>
          <div className="w-16 h-[2px] bg-gold-rich mx-auto mt-4" />
        </div>

        {/* --- UNIFIED MULTI-TAB SWITCHER --- */}
        <div className="flex flex-wrap bg-primary-green/20 p-1.5 rounded-xl border border-gold-rich/10 gap-1.5 mb-12">
          {[
            { id: 'audio', label: 'Audios' },
            { id: 'video', label: 'Videos'},
            { id: 'blog', label: 'Paroles Fortes' },
            { id: 'testimonies', label: 'Témoignages' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setSelectedPostId(null);
              }}
              className={`flex-grow md:flex-none px-5 py-3 rounded text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gold-rich text-deep-green font-bold shadow-md'
                  : 'text-neutral-gray hover:text-pristine-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* -------------------------------------------------------------
            TAB: TEACHINGS VIEW (ALL, video, AUDIO)
            ------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'video' || activeTab === 'audio') && (
  <div className="space-y-10">

    {/* Search filter row */}
    <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-primary-green/5 p-4 rounded-xl border border-gold-rich/5">
      <span className="text-xs font-mono text-gold-bright tracking-widest uppercase">
        {filteredTeachings.length} Ressources Trouvées
      </span>

      <div className="relative w-full md:max-w-md">
        <Search className="w-4 h-4 text-neutral-gray absolute left-3.5 top-1/2 -translate-y-1/2" />

        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Rechercher un thème, un passage, un titre..."
          className="w-full pl-10 pr-4 py-2.5 rounded bg-black/40 border border-gold-rich/15 text-sm text-pristine-white outline-none focus:border-gold-rich/40 transition-colors"
        />
      </div>
    </div>


    {/* Teachings Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

      <AnimatePresence mode="popLayout">

        {filteredTeachings.map((teaching) => {

          const isFavorited = favorites.includes(teaching.id);
          const isPlaying = playingId === teaching.id;


          return (

            <motion.div
              key={teaching.id}
              layout
              initial={{ opacity:0, scale:0.95 }}
              animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.95 }}
              transition={{duration:0.5}}
              className="luxury-glass p-6 rounded-2xl flex flex-col sm:flex-row gap-6 hover:border-gold-rich/30 transition-all"
            >


              {/* VIDEO COVER */}
              <div className="w-full sm:w-36 h-36 shrink-0 rounded-xl overflow-hidden relative border border-gold-rich/10">

                {teaching.category === "video" ? (

                  <video
                    id={`video-${teaching.id}`}
                    src={teaching.videoUrl}
                    poster={teaching.coverImage}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />

                ) : (

                  <img
                    src={teaching.coverImage}
                    alt={teaching.title}
                    className="w-full h-full object-cover transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />

                )}


                <div className="absolute inset-0 bg-deep-green/35 pointer-events-none" />


                {/* CATEGORY ICON */}
                <div className="absolute top-2 left-2 p-1.5 rounded bg-deep-green/80 text-gold-bright border border-gold-rich/10">

                  {teaching.category === 'video' && (
                    <Video className="w-4 h-4" />
                  )}

                  {teaching.category === 'audio' && (
                    <Volume2 className="w-4 h-4" />
                  )}

                </div>

              </div>



              {/* BODY */}

              <div className="flex-grow flex flex-col justify-between">


                <div>

                  <div className="flex justify-between items-start gap-2 mb-1.5">

                    <span className="text-[10px] font-mono uppercase text-gold-rich tracking-widest">

                      {teaching.category === 'video' && 'Session Vidéo'}

                      {teaching.category === 'audio' && 'Enseignement Vocal'}

                    </span>


                    <button
                      onClick={() => onToggleFavorite(teaching.id)}
                      className={`p-1.5 rounded hover:bg-gold-rich/10 ${
                        isFavorited ? 'text-gold-bright' : 'text-neutral-gray'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorited ? 'fill-current' : ''
                        }`}
                      />
                    </button>


                  </div>



                  <h3 className="font-cinzel text-lg font-bold text-pristine-white mb-2">
                    {teaching.title}
                  </h3>


                </div>



                {/* ACTIONS */}

                <div className="flex items-center justify-between border-t border-gold-rich/5 pt-3">

                  <div className="flex gap-4 font-mono text-[10px] text-neutral-gray">

                    <span>{teaching.durationOrPages}</span>

                    <span>{teaching.fileSize}</span>

                  </div>



                  <div className="flex gap-2">


                    {teaching.category === "video" && (
  <button
    onClick={() => setSelectedVideo(teaching)}
    className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary-green/20 text-gold-bright border border-gold-rich/10 hover:bg-gold-rich hover:text-deep-green font-mono text-[10px] uppercase tracking-wider transition-all"
  >
    <Play className="w-3.5 h-3.5 fill-current" />
    <span>Voir</span>
  </button>
)}
                    {teaching.category === "audio" && (

                      <button
                        onClick={() => handlePlayAudio(teaching)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary-green/20 text-gold-bright border border-gold-rich/10 font-mono text-[10px]"
                      >

                        <Play className="w-3.5 h-3.5 fill-current"/>

                        <span>
                          Écouter
                        </span>

                      </button>

                    )}



                    <button
                      onClick={() => handleDownloadSimulation(teaching)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary-green/20 text-gold-bright border border-gold-rich/10 font-mono text-[10px]"
                    >

                      <Download className="w-3.5 h-3.5"/>

                      <span>
                        Télécharger
                      </span>

                    </button>


                  </div>


                </div>


              </div>


            </motion.div>

          );

        })}

      </AnimatePresence>

    </div>

  </div>
)}


        {/* -------------------------------------------------------------
            TAB: BLOG / PAROLES INSPIRÉES
            ------------------------------------------------------------- */}
        {activeTab === 'blog' && (
          <AnimatePresence mode="wait">
            {!selectedPostId ? (
              /* --- Grid View --- */
              <motion.div
                key="blog-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {BLOG_DATA.map((post, idx) => {
                  const currentLikes = blogLikes[post.id] !== undefined ? blogLikes[post.id] : post.likesCount;
                  const liked = !!hasLikedBlog[post.id];
                  const isSaved = favorites.includes(post.id);

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      onClick={() => setSelectedPostId(post.id)}
                      className="group luxury-glass rounded-2xl overflow-hidden hover:border-gold-rich/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/90 to-transparent" />
                        <div className="absolute top-4 left-4 p-1.5 rounded bg-deep-green/80 text-gold-bright border border-gold-rich/10 text-[10px] font-mono tracking-wider">
                          {post.type}
                        </div>
                      </div>

                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-gray mb-2">
                            <span>{post.date}</span>
                            <span>{post.readTime} de lecture</span>
                          </div>

                          <h3 className="font-cinzel text-lg font-bold text-pristine-white leading-snug tracking-wide group-hover:text-gold-bright transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-xs text-neutral-gray font-light line-clamp-3 mt-3 leading-relaxed">
                            {post.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-gold-rich/5 pt-4 mt-6">
                          <span className="text-[10px] font-serif italic text-gold-rich">
                            Par: {post.author}
                          </span>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => handleBlogLike(post.id, e)}
                              className={`flex items-center gap-1 text-[10px] font-mono ${
                                liked ? 'text-red-500 font-bold' : 'text-neutral-gray hover:text-red-400'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                              <span>{currentLikes}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(post.id);
                              }}
                              className={`text-[10px] font-mono ${
                                isSaved ? 'text-gold-bright' : 'text-neutral-gray hover:text-gold-rich'
                              }`}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* --- Detailed Immersive View --- */
              <motion.div
                key="blog-article"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="luxury-glass p-8 md:p-12 rounded-2xl border border-gold-rich/25 bg-gradient-to-br from-deep-green to-primary-green/10 max-w-4xl mx-auto"
              >
                <button
                  onClick={() => setSelectedPostId(null)}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gold-bright hover:text-pristine-white mb-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour aux écrits</span>
                </button>

                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-gray">
                    <span className="px-3 py-1 bg-gold-rich/10 text-gold-bright rounded border border-gold-rich/25 uppercase">
                      {selectedPost?.type}
                    </span>
                    <span>{selectedPost?.date} • {selectedPost?.readTime} de lecture</span>
                  </div>

                  <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-pristine-white leading-tight tracking-wide">
                    {selectedPost?.title}
                  </h1>

                  <p className="text-sm font-serif italic text-gold-rich">
                    Écrit sous l'inspiration divine par : {selectedPost?.author}
                  </p>

                  <div className="rounded-xl overflow-hidden border border-gold-rich/20 aspect-video max-h-96">
                    <img
                      src={selectedPost?.coverImage}
                      alt={selectedPost?.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Text content block */}
                  <div className="p-6 md:p-8 rounded-xl bg-deep-green/80 border border-gold-rich/10 relative">
                    <Quote className="w-16 h-16 text-gold-rich/5 absolute top-4 left-4" />
                    <p className="text-base text-neutral-gray leading-relaxed font-light whitespace-pre-line relative z-10">
                      {selectedPost?.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gold-rich/10 pt-6 mt-8">
                   
                    <button
                      onClick={() => setSelectedPostId(null)}
                      className="text-xs font-mono uppercase tracking-widest text-neutral-gray hover:text-pristine-white"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* -------------------------------------------------------------
            TAB: TÉMOIGNAGES & ACTIONS DE GRÂCES
            ------------------------------------------------------------- */}
        {activeTab === 'testimonies' && (
          <div className="space-y-10">
            {/* Filter buttons & submission CTA */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-primary-green/5 p-4 rounded-xl border border-gold-rich/10">

              <button
                onClick={() => setShowTestimonyModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gold-rich/10 hover:bg-gold-rich text-gold-bright hover:text-deep-green border border-gold-rich/30 font-bold text-xs font-mono uppercase tracking-widest transition-all duration-300 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Publier mon Témoignage
              </button>
            </div>

            {/* Testimonies List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredTestimonies.map((test) => {
                  const currentLikes = testimonyLikes[test.id] !== undefined ? testimonyLikes[test.id] : test.likesCount;
                  const hasLiked = !!userLikedTestimony[test.id];

                  return (
                    <motion.div
                      key={test.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="luxury-glass p-8 rounded-2xl border border-gold-rich/15 hover:border-gold-rich/30 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-gold-rich uppercase tracking-widest bg-gold-rich/10 px-2.5 py-0.5 rounded border border-gold-rich/25">
                            {test.category}
                          </span>
                          <span className="text-xs font-mono text-neutral-gray">{test.date}</span>
                        </div>

                        <h3 className="font-cinzel text-lg font-bold text-pristine-white leading-snug">
                          « {test.title} »
                        </h3>

                        <p className="text-sm text-neutral-gray font-light leading-relaxed italic">
                          {test.content}
                        </p>
                      </div>

                      {/* Author row */}
                      <div className="flex justify-between items-center border-t border-gold-rich/5 pt-4 mt-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gold-rich/10 border border-gold-rich/30 flex items-center justify-center text-gold-bright text-xs font-mono font-bold">
                            {test.authorName.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-pristine-white">{test.authorName}</span>
                        </div>

                        <button
                          onClick={() => handleTestimonyLike(test.id)}
                          className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
                            hasLiked ? 'text-red-500 font-bold' : 'text-neutral-gray hover:text-red-400'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-red-500' : ''}`} />
                          <span>{currentLikes} Actions de grâce</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* --- FLOATING AUDIO CONTROLLER AT THE BOTTOM --- */}
        <AnimatePresence>
          {playingId && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-40 max-w-sm luxury-glass p-4 rounded-xl border border-gold-bright/30 bg-deep-green shadow-2xl flex items-center gap-4 animate-pulse"
            >
              <div className="w-10 h-10 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-bright animate-spin shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <span className="text-[9px] font-mono uppercase tracking-widest text-gold-bright block">Lecture en cours...</span>
                <span className="text-xs font-bold text-pristine-white block truncate">
                  {TEACHINGS_DATA.find(t => t.id === playingId)?.title}
                </span>
              </div>
              <button
                onClick={() => {
                  audioPlayer?.pause();
                  setPlayingId(null);
                }}
                className="p-1.5 rounded bg-primary-green hover:bg-gold-rich hover:text-deep-green text-gold-bright text-xs font-mono font-bold"
              >
                STOP
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- TESTIMONY MODAL FORM OVERLAY --- */}
        <AnimatePresence>
          {showTestimonyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTestimonyModal(false)}
                className="absolute inset-0 bg-deep-green/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-lg luxury-glass p-8 rounded-2xl border border-gold-rich/35 shadow-2xl z-10 bg-deep-green"
              >
                {testimonySuccess ? (
                  <div className="text-center py-12 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gold-rich/10 border border-gold-rich/30 flex items-center justify-center text-gold-bright animate-bounce">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="font-cinzel text-2xl font-bold text-pristine-white">Gloire à Dieu !</h3>
                    <p className="text-sm text-neutral-gray max-w-xs leading-relaxed">
                      Votre témoignage a été publié avec succès dans notre Bibliothèque de bénédictions. Que votre parcours fortifie la foi de milliers de frères et sœurs.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTestimony} className="space-y-5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gold-rich tracking-widest block">Action de grâce</span>
                      <h3 className="font-cinzel text-xl font-bold text-pristine-white font-serif">
                        Publier Votre Témoignage
                      </h3>
                      <p className="text-xs text-neutral-gray mt-1 font-light">
                        Partagez les bienfaits du Seigneur pour encourager le corps de Christ.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Votre Nom ou Initiale</label>
                          <input
                            type="text"
                            required
                            value={authorName}
                            onChange={e => setAuthorName(e.target.value)}
                            placeholder="Ex: Sœur Grâce Kouassi"
                            className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Titre court du miracle</label>
                        <input
                          type="text"
                          required
                          value={testimonyTitle}
                          onChange={e => setTestimonyTitle(e.target.value)}
                          placeholder="Ex: Guérie totalement d'une maladie chronique"
                          className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-gray mb-1.5">Votre récit détaillé</label>
                        <textarea
                          required
                          rows={4}
                          value={testimonyContent}
                          onChange={e => setTestimonyContent(e.target.value)}
                          placeholder="Racontez précisément ce que le Seigneur a fait pour vous..."
                          className="w-full px-4 py-2.5 rounded bg-primary-green/10 border border-gold-rich/15 focus:border-gold-rich/50 text-pristine-white text-sm outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowTestimonyModal(false)}
                        className="w-1/2 py-2.5 border border-gold-rich/10 text-neutral-gray hover:text-pristine-white rounded text-xs font-mono uppercase tracking-widest transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-2.5 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-bold rounded text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-md transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Soumettre
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
{selectedVideo && (
  <div
    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto"
    onClick={() => setSelectedVideo(null)}
  >

    <div
      className="relative w-full max-w-4xl my-8 bg-black rounded-2xl overflow-hidden border border-gold-rich/20 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* Bouton fermer */}
      <button
        onClick={() => setSelectedVideo(null)}
        className="
          absolute 
          top-3 
          right-3 
          z-20
          w-10 
          h-10 
          rounded-full 
          bg-black/80 
          text-white 
          flex 
          items-center 
          justify-center
          hover:bg-gold-rich 
          hover:text-black
          transition
        "
      >
        ✕
      </button>


      {/* Video responsive */}
      <div className="w-full aspect-video bg-black">

        <video
          src={selectedVideo.videoUrl}
          controls
          autoPlay
          playsInline
          className="
            w-full 
            h-full 
            object-contain
          "
        />

      </div>


      {/* Informations */}
      <div className="p-5 bg-deep-green">

        <h2 className="text-lg md:text-xl font-cinzel text-pristine-white">
          {selectedVideo.title}
        </h2>

        <p className="text-sm text-neutral-gray mt-2">
          {selectedVideo.author}
        </p>

      </div>


    </div>

  </div>
)}
      </div>
    </section>
  );
}
