import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Shield, Award, Sparkles, Compass, Users, 
  Quote, Heart, Target, Calendar 
} from 'lucide-react';

export default function Vision() {
  const [activeTab, setActiveTab] = useState<'prophete' | 'vision'>('prophete');

  const values = [
    {
      icon: Shield,
      title: 'La Consécration',
      desc: 'Nous croyons qu\'une vie entièrement mise à part pour Dieu est le fondement d\'un ministère puissant. La prière, le jeûne et une communion constante avec le Saint-Esprit façonnent notre marche quotidienne.',
    },
     {
      icon: Compass,
      title: 'La Loyauté',
      desc: 'La loyauté est le sceau de notre engagement. Nous cultivons une fidélité inébranlable envers Dieu, Sa Parole, la vision qu\'Il nous a confiée et notre père spirituel qu\'Il établit. Nous croyons qu\'une armée forte se construit par l\'unité, l\'intégrité et la fidélité.',
    },
    {
      icon: Award,
      title: 'La Parole de Vérité',
      desc: 'Nous croyons que la Parole de Dieu est le fondement de toute croissance spirituelle et la référence absolue pour la vie du disciple.',
    },
    {
      icon: Sparkles,
      title: 'La Discipline Spirituelle',
      desc: 'Comme de véritables soldats de Christ, nous marchons dans l\'obéissance, l\'ordre et la persévérance. Nous croyons qu\'une vie disciplinée permet de demeurer ferme dans l\'appel de Dieu et d\'accomplir fidèlement la mission qui nous est confiée.',
    },
  ];

  const biblicalFoundations = [
    {
      verse: '« Publiez ces choses parmis les nations! Preparez la guerre! Réveillez les heros! Qu\'ils s\'approchent, qu\'ils montent, Tous les hommes de guerre!. »',
      reference: 'Joel 3:9',
    },
  ];

  const timelineEvents = [
    {
      year: '2014',
      title: 'Le Debut du Service',
      desc: 'Le Prophète Kader Josué Fadika s\'engage pleinement dans le service de Dieu. Commence alors plusieurs années de formation, de prière, de jeûne et d\'accompagnement de nombreux jeunes dans leur croissance spirituelle.',
    },
    {
      year: '2020',
      title: 'Naissance de Christ Army',
      desc: 'Après plusieurs années de préparation spirituelle, Dieu lui confie la vision de Christ Army. Les premiers programmes sont organisés entièrement en ligne via WhatsApp, permettant à des croyants de différents horizons de recevoir des enseignements, des temps de prière et d\'intercession.',
    },
    {
      year: '2023',
      title: 'La Vision grandie',
      desc: 'La communauté grandit progressivement. Les enseignements, les temps de prière et les rencontres spirituelles rassemblent un nombre croissant de personnes désireuses de vivre une relation plus profonde avec Dieu.',
    },
    {
      year: '2026',
      title: 'Une Génération en marche',
      desc: 'Christ Army poursuit sa mission de former des disciples, d\'équiper les croyants par la Parole de Dieu, de promouvoir une vie de consécration et d\'annoncer fidèlement l\'Évangile de Jésus-Christ.',
    }
  ];

  return (
    <section id="vision" className="relative py-24 bg-deep-green border-t border-gold-rich/10">
      {/* Light glow overlay */}
      <div className="absolute top-1/3 left-1/10 w-[500px] h-[500px] rounded-full bg-gold-rich/3 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Title Section */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-rich font-semibold">
            {activeTab === 'vision' ? 'La Vision & Nos Valeurs' : 'L\'Instrument Choisi'}
          </span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold mt-2 text-pristine-white tracking-wider">
            {activeTab === 'vision' ? 'VISION & FONDEMENTS' : 'LE PROPHÈTE FONDATEUR'}
          </h2>
          <p className="text-sm text-neutral-gray max-w-2xl mx-auto mt-4 font-light leading-relaxed">
            {activeTab === 'vision' 
              ? 'Découvrez les fondements célestes, la chronologie historique et les valeurs intraitables qui gouvernent la mission Christ Army.' 
              : 'Découvrez le parcours de consécration, l\'onction de délivrance et le cœur sacerdotal du Prophète Kader Josué Fadika.'}
          </p>
          <div className="w-16 h-[2px] bg-gold-rich mx-auto mt-4" />
        </div>

        {/* Dynamic Inner Swapper */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-primary-green/20 p-1 rounded-xl border border-gold-rich/10">
           <button
              onClick={() => setActiveTab('prophete')}
              className={`px-6 py-3 rounded text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'prophete'
                  ? 'bg-gold-rich text-deep-green font-bold shadow'
                  : 'text-neutral-gray hover:text-pristine-white'
              }`}
            >
              Le Prophète Fondateur
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`px-6 py-3 rounded text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'vision'
                  ? 'bg-gold-rich text-deep-green font-bold shadow'
                  : 'text-neutral-gray hover:text-pristine-white'
              }`}
            >
              Vision & Chronologie
            </button>
           
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'prophete' ? (
              /* ==============================================================
               TAB: LE PROPHÈTE FONDATEUR
               ============================================================== */
            <motion.div
              key="prophete-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-20"
            >
              {/* Biography & Photo Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Portrait Image */}
                <div className="lg:col-span-5 relative group">
                  <div className="absolute inset-0 bg-gold-rich/10 rounded-2xl -translate-x-3 -translate-y-3 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-deep-green rounded-2xl translate-x-3 translate-y-3 -z-20 border border-gold-rich/20" />
                  <div className="relative overflow-hidden rounded-2xl border border-gold-rich/30 shadow-2xl">
                    <img
                      src="/assets/prophète.png"
                      alt="Prophète Kader Josué Fadika"
                      className="w-full h-auto object-cover object-top aspect-[3/4]  transition-all duration-700 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-green via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl luxury-glass border border-gold-rich/25 text-center">
                      <span className="text-xs font-mono text-gold-bright uppercase tracking-widest block mb-1">
                        Fondateur & Visionnaire
                      </span>
                      <span className="font-cinzel text-lg font-bold text-pristine-white">
                        Prophète Kader Josué Fadika
                      </span>
                    </div>
                  </div>
                </div>

                {/* Biography Text */}
                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <h3 className="font-cinzel text-3xl font-semibold text-gold-rich mb-4 italic tracking-wide leading-tight">
                      « Un appel de feu pour une génération sans repère. »
                    </h3>
                    <p className="text-neutral-gray leading-relaxed font-light text-base mb-6">
Le Prophète Kader Josué Fadika est un serviteur de Dieu appelé à former une génération profondément enracinée dans la prière, la Parole de Dieu et la consécration. Converti et engagé dans le service du Seigneur depuis 2014, il reçoit ses premières bases spirituelles au sein du Ministère du Combat Spirituel, où il est initié aux principes du combat spirituel, de l'intercession et de la dépendance au Saint-Esprit. Cet héritage spirituel constitue aujourd'hui l'un des piliers majeurs de la vision que Dieu lui a confiée à travers Christ Army. </p>
                    <p className="text-neutral-gray leading-relaxed font-light text-base mb-6">
Titulaire de deux Masters en droit et reconnu pour son parcours universitaire d'excellence, il a très tôt concilié engagement académique et service de Dieu. Dès ses années universitaires, il anime des cellules de prière avant de servir pendant plusieurs années au sein de Sentinelle de Feu, où il accompagne et forme de nombreux jeunes dans leur marche avec Christ.                    </p>
                    <p className="text-neutral-gray leading-relaxed font-light text-base">
Après plusieurs années de jeûne, de prière et de recherche de la face de Dieu, le Seigneur lui confie la vision de Christ Army, officiellement lancée en avril 2020. À travers son ministère, il poursuit avec fidélité la mission de conduire les jeunes à une vie de sainteté, de discipline spirituelle et d'attachement profond à Jésus-Christ.                    </p>
                  </div>

                  {/* Quote Banner */}
                  <div className="luxury-glass p-6 rounded-xl border-l-4 border-l-gold-rich relative">
                    <Quote className="w-12 h-12 text-gold-rich/10 absolute top-4 right-4" />
                    <p className="font-serif italic text-lg text-pristine-white mb-3">
                      « 
Il n'y a pas alliance sans service de DIEU.
L'alliance avec DIEU signifie un pacte que tu fais avec LUI qui se traduit par le service que tu feras pour l'honorer et par les promesses que Lui s'engage à honorer dans ta vie.
L'autel est la faveur que DIEU accorde à ceux qui le servent                      »
                    </p>
                    <span className="text-xs font-mono text-gold-rich uppercase tracking-widest">
                      — Prophète Kader Josué Fadika
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
              ) : (
         
            /* ==============================================================
               TAB: VISION & FONDEMENTS
               ============================================================== */
            <motion.div
              key="vision-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-24"
            >
              {/* Mission & Purpose Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="luxury-glass p-8 md:p-12 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-rich/5 rounded-full blur-2xl -mr-16 -mt-16" />
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-rich mb-6 border border-gold-rich/20">
                      <Compass className="w-6 h-6" />
                    </div>
                    <h3 className="font-cinzel text-2xl font-semibold mb-4 text-pristine-white tracking-wide">
                      La Vision de Christ Army
                    </h3>
                    <p className="text-neutral-gray leading-relaxed font-light mb-6">
Christ Army est une vision inspirée par Dieu pour lever une génération de jeunes entièrement consacrés à Christ, enracinés dans la prière, la Parole de Dieu et la discipline spirituelle.
                    </p>
                    <blockquote className="border-l-2 border-gold-rich pl-4 py-1 text-sm font-serif italic text-gold-bright bg-primary-green/20 rounded-r p-3">
              « Publiez ces choses parmis les nations! Preparez la guerre! Réveillez les heros! Qu'ils s'approchent, qu'ils montent, Tous les hommes de guerre!. » — Joel 3:9
                    </blockquote>
                    <p className="text-neutral-gray leading-relaxed py-4 font-light mb-6">
Ce passage constitue le fondement de la vision de Christ Army, appelant chaque jeune à devenir un véritable soldat de Jésus-Christ.                    </p>
                  </div>
                </div>

                <div className="luxury-glass p-8 md:p-12 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/20 rounded-full blur-2xl -mr-16 -mt-16" />
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-rich mb-6 border border-gold-rich/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-cinzel text-2xl font-semibold mb-4 text-pristine-white tracking-wide">
                     Notre Mission
                    </h3>
                    <p className="text-neutral-gray leading-relaxed font-light mb-6">
Former une armée spirituelle de disciples passionnés par Christ, équipés par la Parole de Dieu, fortifiés dans la prière et engagés à annoncer fidèlement l'Évangile.

Nous croyons qu'une génération transformée par la présence de Dieu est capable d'impacter durablement les familles, les villes et les nations.                    </p>
                    <blockquote className="border-l-2 border-gold-rich pl-4 py-1 text-sm font-serif italic text-gold-bright bg-primary-green/20 rounded-r p-3">
                      « Ce qui te donne d'avoir un trône dans le monde spirituel, c'est la vision et la mission de bâtir dans le domaine ou Dieu t'appelle à prospérer. »
                    </blockquote>
                  </div>
                </div>
              </div>

              
              {/* Biblical Foundations */}
            <div className="luxury-glass p-8 md:p-14 rounded-3xl border border-gold-rich/20 bg-gradient-to-br from-primary-green/20 to-deep-green">
  <div className="flex items-center justify-center gap-3 mb-10">
    <BookOpen className="w-6 h-6 text-gold-bright" />
    <h3 className="font-cinzel text-2xl md:text-3xl font-semibold text-pristine-white">
       Verset de Christ Army 
    </h3>
  </div>

  <div className="max-w-4xl mx-auto text-center">
    <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-pristine-white">
      «  Publiez ces choses parmis les nations! 
      <br />
      <span className="text-gold-bright">
        Préparez la guerre !
      </span>
      <br />
      Réveillez les héros !
      <br />
       Qu'ils s'approchent, qu'ils montent,
      Tous les hommes de guerre! »
    </p>

    <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-bright to-transparent mx-auto my-8" />

    <span className="font-cinzel text-gold-bright uppercase tracking-[0.35em] text-sm">
      JOËL 3:9
    </span>
  </div>
</div>

              {/* Core Values Section */}
              <div>
                <div className="text-center mb-12">
                  <h3 className="font-cinzel text-2xl md:text-3xl font-semibold text-pristine-white">Nos Quatre Piliers</h3>
                  <p className="text-sm text-neutral-gray max-w-lg mx-auto mt-2 font-light">
                    Les valeurs fondamentales sur lesquelles chaque membre de Christ Army scelle sa marche de disciple.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {values.map((v, idx) => {
                    const IconComp = v.icon;
                    return ( 
                      <div
                        key={idx}
                        className="p-6 rounded-xl border border-gold-rich/10 bg-primary-green/10 hover:bg-primary-green/20 hover:border-gold-rich/30 transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gold-rich/10 flex items-center justify-center text-gold-rich mb-5 group-hover:bg-gold-rich group-hover:text-deep-green transition-all duration-300">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h4 className="font-cinzel text-lg font-semibold text-pristine-white mb-2 group-hover:text-gold-bright transition-colors">
                          {v.title}
                        </h4>
                        <p className="text-xs text-neutral-gray font-light leading-relaxed">
                          {v.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Interactive Timeline */}
              <div>
                <div className="text-center mb-16">
                  <h3 className="font-cinzel text-2xl md:text-3xl font-semibold text-pristine-white">Chronologie du Ministère</h3>
                  <p className="text-sm text-neutral-gray max-w-lg mx-auto mt-2 font-light">
                    Le parcours de foi, d'obéissance et d'onction qui a structuré le ministère Christ Army.
                  </p>
                </div>

                <div className="relative border-l border-gold-rich/20 max-w-3xl mx-auto pl-6 sm:pl-10 space-y-12">
                  {timelineEvents.map((ev, idx) => (
                    <div
                      key={idx}
                      className="relative group"
                    >
                      <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-deep-green border-2 border-gold-rich group-hover:bg-gold-bright transition-colors duration-300" />

                      <div className="luxury-glass p-6 rounded-xl hover:border-gold-rich/35 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                          <span className="text-lg font-mono font-bold text-gold-bright px-3 py-0.5 rounded bg-gold-rich/10 border border-gold-rich/20">
                            {ev.year}
                          </span>
                          <h4 className="font-cinzel text-lg font-semibold text-pristine-white tracking-wide">
                            {ev.title}
                          </h4>
                        </div>
                        <p className="text-sm text-neutral-gray font-light leading-relaxed">
                          {ev.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
        
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
