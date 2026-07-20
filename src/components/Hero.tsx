import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Calendar, Volume2, VolumeX, Flame, Cross } from 'lucide-react';

interface HeroProps {
  onNavigate: (section: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTimeString, setCurrentTimeString] = useState('');
  const [audio] = useState(() => {
    // Elegant background instrumental piano
    const a = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    a.loop = true;
    a.volume = 0.15;
    return a;
  });

  useEffect(() => {
    // Update real time clock (UTC style or local Ivory Coast)
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeString(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' GMT');
    }, 1000);
    return () => {
      clearInterval(timer);
      audio.pause();
    };
  }, [audio]);

  const toggleAudio = () => {
    if (isPlayingAudio) {
      audio.pause();
    } else {
      audio.play().catch(err => console.log('Audio playback prevented by browser autoplay policy', err));
    }
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-deep-green">
      {/* Background Image with Dark Vignette overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/hero.jpg"
          alt="Christ Army Sanctuary"
          className="w-full h-full object-cover opacity-35 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-green via-deep-green/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-green via-transparent to-deep-green" />
      </div>

      {/* Halo Doré (Golden ambient glow) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold-rich/5 blur-[120px] pointer-events-none z-10" />

      {/* Top Bar Spacer for Transparent Nav */}
      <div className="h-20" />

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full flex-grow flex flex-col justify-center items-center text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-rich/30 bg-primary-green/40 backdrop-blur-md text-xs text-gold-bright tracking-widest font-sans font-medium uppercase mb-8 shadow-sm">
             Plateforme Officielle
          </div>

          {/* Majestic Animated Logo Text */}
         <h1 className="font-cinzel text-5xl md:text-8xl font-bold tracking-[0.15em] text-pristine-white mb-6 relative select-none">
  CHRIST ARMY
  <span className="block text-xl md:text-3xl tracking-[0.3em] text-gold-rich mt-4 font-normal font-serif italic">
    Un appel à la consécration et à la puissance divine
  </span>
</h1>

<p className="max-w-2xl text-lg md:text-xl text-neutral-gray font-light leading-relaxed mb-10">
  Former une génération de disciples enracinés dans la sainteté, équipés dans la foi, et envoyés pour manifester la gloire de Jésus-Christ aux nations.
</p>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto items-center">
            <button
              onClick={() => onNavigate('events')}
              className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-rich to-gold-bright text-deep-green font-semibold rounded-lg shadow-lg hover:shadow-gold-rich/20 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              id="hero-cta-live"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <Play className="w-5 h-5 fill-current" />
              Voir Le Programme
            </button>

            <button
              onClick={() => onNavigate('vision')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-deep-green/50 hover:bg-primary-green/40 text-pristine-white border border-gold-rich/30 hover:border-gold-rich/60 font-medium rounded-lg transition-all duration-300 backdrop-blur-sm"
              id="hero-cta-vision"
            >
              <Calendar className="w-5 h-5 text-gold-rich" />
              Découvrir la Vision
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
