import { Department, Teaching, Event, Testimony, BlogPost } from './types';

export const DEPARTMENTS_DATA: Department[] = [
  {
    id: 'accueil',
    name: 'Accueil',
    iconName: 'Shield',
    description: 'Recevoir les invités avec amour et veiller à la sécurité et la bienséance des cultes.',
    longDescription: 'Inspiré par le cœur du serviteur, le département d\'Accueil veille à ce que chaque personne franchissant les portes de Christ Army se sente honorée, aimée et en sécurité. Ils orientent la foule, s\'occupent des invités. C\'est le visage de Christ Army, le premier contact. ',
    verse: '« Accueillez-vous donc les uns les autres, comme Christ vous a accueillis... » — Romains 15:7',
    headOfDepartment: 'Rama Christwalker ',
    requirements: [
      'Toujours avoir le sourire',
      'Avoir une excellente présentation physique et vestimentaire',
      'Savoir s\'exprimer avec politesse, patience et fermeté',
      'Avoir le sens de l\'observation et de la vigilance'
    ],
    responsibilities: [
      'Accueillir et guider les invités vers leurs places respectives',
      'Assister les personnes qui viennent pour la première fois',
      'S\'occuper des offrandes et collecter les dons'
    ],
    image: '/assets/intercession.jpeg'
  },
  {
    id: 'intercession',
    name: 'Intercession ',
    iconName: 'Flame',
    description: 'Le moteur spirituel du ministère. Une armée de prière qui veille jour et nuit.',
    longDescription: 'Le département d\'Intercession est la fondation invisible sur laquelle repose l\'ensemble du ministère Christ Army. Inspirés par la ferveur biblique, les intercesseurs veillent constamment dans la prière pour porter les fardeaux du peuple de Dieu, soutenir les cultes et libérer l\'atmosphère pour la manifestation du Saint-Esprit. C\'est le lieu où se livrent les combats spirituels pour la délivrance des âmes.',
    verse: '« Veillez et priez, afin que vous ne tombiez pas en tentation... » — Matthieu 26:41',
    headOfDepartment: 'Espérance Christwalker',
    requirements: [
      "Avoir une vie de prière régulière et le désir de grandir dans l\'intercession.",
"Être fidèle aux temps de prière hebdomadaire, aux enseignements et aux activités du département.",
"Faire preuve de consécration, de discipline et de loyauté envers la vision de Christ Army.",
"Être disponible pour servir avec humilité, discrétion et persévérance."
    ],
    responsibilities: [
      "Participer fidèlement aux chaînes de prière et aux temps d'intercession du ministère.",
"Porter dans la prière les activités, les programmes et la vision de Christ Army.",
"Intercéder pour les serviteurs de Dieu et l'ensemble des membres du ministère.",
"Se tenir à la brèche pour les sujets de prière confiés au département, dans la confidentialité et la fidélité.",
    ],
    image: '/assets/intercession.jpeg'
  },
  {
    id: 'organisation',
    name: 'Organisation ',
    iconName: 'Compass',
    description: 'Servir la vision avec ordre, fidélité et excellence afin de créer un cadre favorable à l\'œuvre de Dieu.',
    longDescription: 'Le département Organisation est chargé de la planification, de la coordination et du bon déroulement des programmes de Christ Army. Véritable soutien opérationnel du ministère, il veille à ce que chaque programme soit préparé avec ordre, excellence et efficacité, afin de permettre à l\'œuvre de Dieu de s\'accomplir dans les meilleures conditions.',
    verse: '« Les projets réussissent grâce à de nombreux conseillers. » — Proverbes 15:22',
    headOfDepartment: 'Lyne Christwalker',
    requirements: [
      "Faire preuve de discipline, de rigueur et de sens des responsabilités.",
"Être disponible pour participer à la préparation et à l'organisation des programmes.",
"Travailler avec un esprit de loyauté, d'humilité et de collaboration.",
"Savoir respecter les consignes et les délais établis."
    ],
    responsibilities: [
      "Participer à la préparation logistique des programmes.",
"Veiller au bon déroulement des programmes avant, pendant et après chaque activité.",
"Coordonner les équipes afin d'assurer une organisation fluide et efficace.",
"Contribuer au maintien de l'ordre pendant le service.",
    ],
    image: '/assets/intercession.jpeg'
  },
  {
    id: 'chantre',
    name: 'Louange & Adoration ',
    iconName: 'Music',
    description: 'Conduire le peuple dans la présence majestueuse de Dieu par un chant d\'excellence.',
    longDescription: 'Le département des Chantres rassemble des adorateurs passionnés dont la mission est de conduire le peuple de Dieu dans une adoration sincère et profonde. Par le chant, la musique et une vie consacrée, ils créent une atmosphère propice à la manifestation de la présence de Dieu et à l\'édification de l\'Église.',
    verse: '« Louez-le avec le tambourin et les danses ! Louez-le avec les instruments à cordes et le chalumeau ! » — Psaume 150:4',
    headOfDepartment: 'Samira Christwalker',
    requirements: [
      "Avoir un cœur d'adorateur et le désir de servir Dieu par le chant ou la musique.",
"Mener une vie de consécration en accord avec les valeurs de Christ Army.",
"Être fidèle aux répétitions, aux temps de prière et aux activités du département.",
"Cultiver un esprit d'humilité, d'unité et de disponibilité."
    ],
    responsibilities: [
  "Conduire l'assemblée dans des temps de louange et d'adoration inspirés.",
"Participer activement aux répétitions et aux préparations spirituelles du département.",
"Servir avec excellence, dans un esprit d'unité et de soumission.",
"Utiliser les talents reçus pour glorifier Dieu et accompagner la vision de Christ Army."
    ],
    image: '/assets/intercession.jpeg'
  },
  {
    id: 'communication',
    name: 'Communication',
    iconName: 'Share2',
    description: 'Diffuser la vision prophétique sur le web et soigner l\'image publique du ministère.',
    longDescription: 'À l\'ère du numérique, la Communication de Christ Army a pour mission de faire rayonner la vision de Christ Army à travers tous les moyens de communication. Par l\'image, les mots, les médias et les outils numériques, il veille à transmettre fidèlement le message du ministère tout en reflétant son identité, ses valeurs et son excellence.',
    verse: '« Écris la prophétie, grave-la sur des tables, afin qu\'on la lise couramment. » — Habacuc 2:2',
    headOfDepartment: 'Aurelie Christwalker ',
    requirements: [
      "Avoir le désir de mettre ses compétences au service de la vision de Christ Army.",
"Faire preuve de créativité, de rigueur et d'un esprit d'initiative.",
"Être disponible, réactif et capable de travailler en équipe.",
"Respecter la confidentialité et l'identité visuelle du ministère."
    ],
    responsibilities: [
      "Concevoir les supports de communication des programmes et événements.",
"Assurer la gestion des plateformes numériques et des réseaux sociaux du ministère.",
"Produire et diffuser des contenus qui valorisent la vision de Christ Army.",
"Veiller à l'unité, à la qualité et à la cohérence de la communication sur tous les supports."
    ],
    image: '/assets/intercession.jpeg'
  },
  {
    id: 'commando',
    name: 'Commando',
    iconName: 'Sliders',
    description: 'Assurer une captation audiovisuelle irréprochable et un son pur lors des cultes.',
    longDescription: 'La Technique est la cheville ouvrière logistique et acoustique de Christ Army. Chargé de la sonorisation de l\'auditorium, de la régie vidéo pour la diffusion internet en direct, et de la gestion des lumières scéniques, ce département garantit que le message de l\'Évangile soit entendu et vu avec le plus haut niveau de clarté professionnelle possible.',
    verse: '« Que tout se fasse avec bienséance et avec ordre. » — 1 Corinthiens 14:40',
    headOfDepartment: 'Yves Dion Christwalker',
    requirements: [
    "Avoir un cœur de serviteur et faire preuve d'humilité.",
"Être attentif, calme et savoir agir avec discernement.",
"Faire preuve de discrétion et de respect envers chaque personne.",
"Être fidèle aux temps de formation et aux activités du département."
    ],
    responsibilities: [
"Assister les personnes sous l'action de l'Esprit de Dieu avec respect et bienveillance.",
"Veiller à leur sécurité durant les temps de ministère.",
"Intervenir avec discrétion afin de préserver le bon déroulement des temps de prière.",
"Servir avec sensibilité, vigilance et dans le respect des directives du ministère."
    ],
    image: '/assets/intercession.jpeg'
  },
];

export const TEACHINGS_DATA: Teaching[] = [
    { 
    id: 't-1',
    title: 'DIEU NE CHERCHE PAS DES CIVILS MAIS DES SOLDATS',
    author: 'Prophète Kader Josué Fadika',
    date: '2026-06-01',
    category: 'video', // ou 'audio' ou 'pdf'
    coverImage: '/assets/cover1.png',
    videoUrl: '/assets/vid1.mp4', // Pour les vidéos
    audioUrl: '', // Pour les audios
    durationOrPages: '45:23',
    fileSize: '156 MB',
    fileUrl:'#',
    playsCount: 3420,
    downloadsCount: 0
  }
];

export const EVENTS_DATA: Event[] = [
  {
    id: 'ev-1',
    title: 'AUTEL, AUTEL AINSI  DIT L\'ETERNEL',
    date: '18-07-2026',
    time: '14h00 - 17h30',
    location: 'Espace Arche, Angré Mahou',
    speaker: 'Prophète Kader Josué Fadika',
    imageUrl: '/assets/event.png',
    description: 'Le grand rendez-vous du mois de juillet. Une journée dans la présence de Dieu avec prédication incisive, louange prophétique d\'impact, et libération d\'onction. Venez vivre une visitation divine sans précédent.',
    fullProgram: [
      '14h00 - 14h10 : Debut du programme',
      '14h10 - 14h40 : Louange',
      '14h40 - 15h30 : Première prédication et prière',
      '15h30 - 17h00 : Prédication de l\orateur et prière',
      '17h00 - 17h30 : Offrande et prière de fin'
    ],
    isFree: true,
    countdownTarget: '2026-07-18T21:00:00',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15891.139824249052!2d-4.0082!3d5.36!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjEnMzYuMCJOIDTCsDAwJzI5LjUiVw!5e0!3m2!1sfr!2sci!4v1625000000000!5m2!1sfr!2sci',
    registeredCount: 0
  },
];

export const TESTIMONIES_DATA: Testimony[] = [
  {
    id: 'test-1',
    authorName: 'Sœur Jeanne Boka',
    title: 'Guérie miraculeusement d\'un Cancer du Col de l\'Utérus de stade 3',
    category: 'Guérison',
    content: 'Les médecins m\'avaient condamnée et me préparaient à la chimiothérapie intensive. Lors du culte de miracle du mois dernier, le Prophète Kader Josué a eu une parole de connaissance et m\'a appelée par mon nom. Il a posé ses mains sur mon ventre. Je suis retournée faire mes examens deux semaines après : le médecin n\'en revenait pas, aucune cellule cancéreuse n\'a été retrouvée ! Toute la gloire revient au Dieu de Christ Army !',
    date: '2026-06-24',
    isApproved: true,
    likesCount: 1
  },
];

export const BLOG_DATA: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Séminaire Spécial Pâques',
    type: 'Déclaration prophétique',
    content: 'Il n\'y a point de conquête de la terre et point d\'approbation du ciel sans qu\'il y ait d\'abord construction d\'autel. Quand DIEU annonce à Noé qu\'il est temps pour lui de descendre. La première des choses que Noé fait ce n\'est pas d\'aller se précipiter pour conquérir la terre, ni pour aller écrire son nom dans le ciel , mais Il sait qu\'il ne peut pas posséder la terre sans avoir bâti un autel',
    author: 'Prophète Kader Josué Fadika',
    date: '2025-04-18',
    readTime: '3 min',
    coverImage: '/assets/coverimg1.png',
    likesCount: 1 ,
    sharesCount:1 
  },
  
];

export const MOCK_ADMIN_METRICS = {
  totalVisitors: 45200,
  visitorsGrowth: 15.4,
  conversionsRate: 8.2,
  conversionsGrowth: 1.2,
  totalRegistrations: 10450,
  registrationsGrowth: 24.1,
  totalDonations: 8745000, // FCFA or dollars
  donationsGrowth: 18.2,
  activeStreams: 1542,
  popularPage: '/christ-army-tv',
  averageTime: '12m 45s',
  countriesMap: [
    { country: 'Côte d\'Ivoire', count: 18400, percentage: 41 },
    { country: 'France', count: 9800, percentage: 22 },
    { country: 'Cameroun', count: 5400, percentage: 12 },
    { country: 'États-Unis', count: 3200, percentage: 7 },
    { country: 'Canada', count: 2100, percentage: 5 },
    { country: 'Autres', count: 6300, percentage: 13 }
  ],
  popularVideos: [
    { title: 'Briser les Autels de Famille', views: 42300, duration: '58:40', score: 98 },
    { title: 'Le Culte de Miracle Direct', views: 35120, duration: '2:15:00', score: 95 },
    { title: 'Le Jeûne d\'Esther : Session 1', views: 28900, duration: '42:15', score: 92 },
    { title: 'Guérison Tumeur Cerveau', views: 18450, duration: '12:30', score: 89 }
  ]
};
