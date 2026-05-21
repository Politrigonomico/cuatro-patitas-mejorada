export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  size: 'Chico' | 'Mediano' | 'Grande';
  gender: 'Macho' | 'Hembra';
  description: string;
  status: 'En adopción' | 'Adoptado' | 'Recuperándose';
  photo: string;
  story?: string;
  addedAt: string;
  allowAdoption?: boolean; // Defaults to true
  allowSponsorship?: boolean; // Defaults to false
  allowFoster?: boolean; // Defaults to false
}

export interface FinanceRecord {
  id: string;
  type: 'expense' | 'revenue';
  category: string; // e.g., 'Veterinaria', 'Alimento', 'Medicamentos', 'Donación', 'Apadrinamiento', 'Evento', 'Otros'
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface HistoricAdopter {
  id: string;
  adopterName: string;
  adopterDni: string;
  adopterPhone: string;
  adopterEmail: string;
  petName: string;
  petBreed?: string;
  adoptionDate: string; // YYYY-MM-DD format or descriptive
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  dni?: string;
  phone?: string;
  address?: string;
  isAdmin?: boolean;
}

export interface CastrationCampaign {
  id: string;
  title: string;
  description: string;
  type: 'castration' | 'vaccination' | 'fundraiser';
  fecha: string;
  lugar: string;
  maxSlots?: number;
  totalRegistered?: number;
  goalAmount?: number;
  collectedAmount?: number;
  bannerImage?: string;
  active: boolean;
}

export interface CastrationAppointment {
  id: string;
  campaignId: string;
  campaignDate: string;
  ownerName: string;
  ownerEmail: string;
  ownerDni: string;
  ownerPhone: string;
  petName: string;
  petType: 'Perro' | 'Gato';
  petAge: string;
  petWeight: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  note?: string;
  userId?: string;
  createdAt: string;
}

export interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  adopterName: string;
  adopterEmail: string;
  adopterDni: string;
  adopterPhone: string;
  answers: {
    homeType: string;
    otherPets: string;
    yardSecure: string;
    hoursAlone: string;
    agreement: boolean;
  };
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  note?: string;
  userId?: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  petName: string;
  adopterName: string;
  story: string;
  photoUrl: string;
  date: string;
}
