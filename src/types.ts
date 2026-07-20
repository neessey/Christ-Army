export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  favorites: string[]; // teaching or video IDs
  eventsRegistered: string[]; // event IDs
  joinedDepartments: string[]; // department IDs
  donationHistory: {
    id: string;
    amount: number;
    paymentMethod: string;
    date: string;
    status: string;
    referenceCode: string;
  }[];
  notificationsEnabled?: boolean;
  fcmTokens?: string[];
  createdAt?: unknown;
}

export interface Department {
  id: string;
  name: string;
  iconName: string;
  description: string;
  longDescription: string;
  verse: string;
  headOfDepartment: string;
  requirements: string[];
  responsibilities: string[];
  image: string;
}

export interface Teaching {
  id: string;
  title: string;
  author: string;
  date: string;
  category: 'audio' | 'video' | 'pdf';
  durationOrPages: string;
  fileSize: string;
  playsCount: number;
  downloadsCount: number;
  coverImage: string;
  fileUrl: string;
  videoUrl: string;
  audioUrl:string
}


export interface Event {
  registeredCount: number;
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  speaker: string;
  imageUrl: string;
  description: string;
  fullProgram: string[];
  isFree: boolean;
  price?: number;
  countdownTarget: string; // ISO string for timer
  mapEmbedUrl?: string;
}

export interface Testimony {
  id: string;
  authorName: string;
  title: string;
  category: 'Miracle' | 'Guérison' | 'Conversion' | 'Restauration';
  content: string;
  date: string;
  imageUrl?: string;
  videoUrl?: string;
  isApproved: boolean;
  likesCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  type: 'Article' | 'Méditation' | 'Déclaration prophétique' | 'Communiqué';
  content: string;
  author: string;
  date: string;
  readTime: string;
  coverImage: string;
  likesCount: number;
  sharesCount: number;
}