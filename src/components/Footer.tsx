import React from 'react';
import { Flame, Send, Globe, MessageSquare, Facebook, Youtube, Instagram } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {

  return (
    <footer className="bg-[#020b04] border-t border-gold-rich/10 text-neutral-gray py-16">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top footer row: Bible verse & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-gold-rich/5 pb-12 mb-12 items-center">
          
          {/* Slogan & Verse */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 text-pristine-white">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gold-rich/10 border border-gold-rich/20 flex items-center justify-center transition-all group-hover:bg-gold-rich">
              <img src="/assets/logo.png" alt="Christ Army logo" className="w-full h-full object-cover" />
            </div>
             <span className="font-cinzel text-lg font-bold tracking-widest">CHRIST ARMY</span>
            </div>
            <p className="font-serif italic text-base text-gold-rich max-w-md">
              « Publiez ces choses parmis les nations! Preparez la guerre! Réveillez les heros! Qu'ils s'approchent, qu'ils montent, Tous les hommes de guerre!. » — Joel 3:9
            </p>
          </div>

        </div>

        {/* Middle footer row: Nav sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          <div className="space-y-4">
            <h4 className="font-cinzel text-xs font-bold text-pristine-white tracking-widest uppercase">Découverte</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('vision')} className="hover:text-gold-bright transition-colors">La Vision & Prophète</button></li>
              <li><button onClick={() => onNavigate('departments')} className="hover:text-gold-bright transition-colors">Départements</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-cinzel text-xs font-bold text-pristine-white tracking-widest uppercase">Ressources</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('teachings')} className="hover:text-gold-bright transition-colors">Bibliothèque (Enseignements)</button></li>
              <li><button onClick={() => onNavigate('teachings')} className="hover:text-gold-bright transition-colors">Paroles Inspirées</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-cinzel text-xs font-bold text-pristine-white tracking-widest uppercase">Engagement</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('events')} className="hover:text-gold-bright transition-colors">Événements</button></li>
              <li><button onClick={() => onNavigate('donations')} className="hover:text-gold-bright transition-colors">Devenir Christwalker</button></li>
              <li><button onClick={() => onNavigate('donations')} className="hover:text-gold-bright transition-colors">Faire un Don (Semence)</button></li>
              <li><button onClick={() => onNavigate('account')} className="hover:text-gold-bright transition-colors">Espace Membre</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-cinzel text-xs font-bold text-pristine-white tracking-widest uppercase">Réseaux Sociaux</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/christ_army1/" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-primary-green/10 flex items-center justify-center text-gold-rich border border-gold-rich/10 hover:bg-gold-rich hover:text-deep-green transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[10px] text-neutral-gray font-light">
              Suivez nos cultes et retrouvez de nombreuses capsules spirituelles en direct de nos comptes officiels.
            </p>
          </div>

        </div>

        {/* Bottom footer row: Credits */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-mono border-t border-gold-rich/5 pt-8 text-neutral-gray gap-4">
          <span>© 2026 Christ Army Ministry. Tous droits réservés.</span>
          <div className="flex gap-4">
            <span>Sainteté • Puissance • Consécration • Excellence</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
