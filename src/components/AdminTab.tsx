import React, { useState, useEffect } from 'react';
import { ShieldCheck, PlusCircle, Users, ClipboardCheck, Scissors, Trash, Sparkles, Check, X, Wand2, LogOut, Camera, Calendar, DollarSign, MapPin, AlertCircle } from 'lucide-react';
import { Pet, CastrationCampaign, CastrationAppointment, AdoptionApplication, FinanceRecord, HistoricAdopter } from '../types';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';

interface AdminTabProps {
  pets: Pet[];
  appointments: CastrationAppointment[];
  adoptions: AdoptionApplication[];
  campaigns: CastrationCampaign[];
  finances: FinanceRecord[];
  historicAdopters: HistoricAdopter[];
  onAddPet: (pet: Omit<Pet, 'id' | 'addedAt'>) => void;
  onUpdateAppointmentStatus: (id: string, status: 'Aprobado' | 'Rechazado', note?: string) => void;
  onUpdateAdoptionStatus: (id: string, status: 'Aprobado' | 'Rechazado', note?: string) => void;
  onAddCampaign: (campaign: Omit<CastrationCampaign, 'id' | 'totalRegistered' | 'collectedAmount'>) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  onAddFinanceRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteFinanceRecord: (id: string) => Promise<void>;
  onAddHistoricAdopter: (adopter: Omit<HistoricAdopter, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteHistoricAdopter: (id: string) => Promise<void>;
}

export default function AdminTab({
  pets,
  appointments,
  adoptions,
  campaigns,
  finances,
  historicAdopters,
  onAddPet,
  onUpdateAppointmentStatus,
  onUpdateAdoptionStatus,
  onAddCampaign,
  onDeleteCampaign,
  onAddFinanceRecord,
  onDeleteFinanceRecord,
  onAddHistoricAdopter,
  onDeleteHistoricAdopter
}: AdminTabProps) {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Google login error:", e);
      alert("⚠️ Error al iniciar sesión con Google. Inténtalo de nuevo.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  // Current active sub-tab inside admin panel
  const [subTab, setSubTab] = useState<'adoptions' | 'castrations' | 'pets' | 'campaigns' | 'finances' | 'historic'>('adoptions');

  // Finances form state variables
  const [finType, setFinType] = useState<'expense' | 'revenue'>('expense');
  const [finCategory, setFinCategory] = useState('Alimento');
  const [finAmount, setFinAmount] = useState('');
  const [finDescription, setFinDescription] = useState('');
  const [finDate, setFinDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSavingFinance, setIsSavingFinance] = useState(false);

  // Historic adopters form state variables
  const [histAdopterName, setHistAdopterName] = useState('');
  const [histAdopterDni, setHistAdopterDni] = useState('');
  const [histAdopterPhone, setHistAdopterPhone] = useState('');
  const [histAdopterEmail, setHistAdopterEmail] = useState('');
  const [histPetName, setHistPetName] = useState('');
  const [histPetBreed, setHistPetBreed] = useState('');
  const [histAdoptionDate, setHistAdoptionDate] = useState('');
  const [histNotes, setHistNotes] = useState('');
  const [historicSearchQuery, setHistoricSearchQuery] = useState('');

  // Campaign creator form state variables
  const [campTitle, setCampTitle] = useState('');
  const [campDescription, setCampDescription] = useState('');
  const [campType, setCampType] = useState<'castration' | 'vaccination' | 'fundraiser'>('castration');
  const [campFecha, setCampFecha] = useState('');
  const [campLugar, setCampLugar] = useState('');
  const [campHasLimit, setCampHasLimit] = useState(true);
  const [campMaxSlots, setCampMaxSlots] = useState('50');
  const [campGoalAmount, setCampGoalAmount] = useState('50000');
  const [campBanner, setCampBanner] = useState('');
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);

  // Handle campaign banner mobile image compilation and compression
  const handleCampaignBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // slightly wider for banner rows
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.70); // slightly higher compression for banner
          setCampBanner(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Form Submission for Campaign / Event creation
  const handleAddCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle || !campDescription || !campFecha || !campLugar) {
      alert('Por favor, completa los campos obligatorios del evento (Título, Descripción, Fecha y Lugar).');
      return;
    }

    setIsSavingCampaign(true);

    // Default Stock Images depending on the chosen campaign type
    let finalBanner = campBanner.trim();
    if (!finalBanner) {
      if (campType === 'castration') {
        finalBanner = 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=1200';
      } else if (campType === 'vaccination') {
        finalBanner = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200';
      } else {
        finalBanner = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=1200';
      }
    }

    try {
      await onAddCampaign({
        title: campTitle,
        description: campDescription,
        type: campType,
        fecha: campFecha,
        lugar: campLugar,
        bannerImage: finalBanner,
        active: true,
        ...(campType !== 'fundraiser' && campHasLimit ? { maxSlots: parseInt(campMaxSlots) || 50 } : {}),
        ...(campType === 'fundraiser' ? { goalAmount: parseFloat(campGoalAmount) || 100000 } : {})
      });

      // Reset Campaign Form
      setCampTitle('');
      setCampDescription('');
      setCampType('castration');
      setCampFecha('');
      setCampLugar('');
      setCampHasLimit(true);
      setCampMaxSlots('50');
      setCampGoalAmount('50000');
      setCampBanner('');
    } catch (err: any) {
      alert(`⚠️ Error al guardar evento: ${err?.message || err}`);
    } finally {
      setIsSavingCampaign(false);
    }
  };

  // Form State for Adding animals
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petSize, setPetSize] = useState<'Chico' | 'Mediano' | 'Grande'>('Mediano');
  const [petGender, setPetGender] = useState<'Macho' | 'Hembra'>('Macho');
  const [petDescription, setPetDescription] = useState('');
  const [petPhoto, setPetPhoto] = useState('');
  const [petTraits, setPetTraits] = useState(''); // traits for AI generation
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Rejection Notes State
  const [activeRejectionId, setActiveRejectionId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  const [activeRejectionCastrationId, setActiveRejectionCastrationId] = useState<string | null>(null);
  const [rejectionCastrationNote, setRejectionCastrationNote] = useState('');

  // Handle mobile image input + local compression to fit nicely inside database limits
  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setPetPhoto(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // AI Description writer handler (Gemini via server side proxy)
  const handleGenerateAIBio = async () => {
    if (!petName || !petBreed) {
      alert('Por favor, ingresa el nombre de la mascota y la raza para darle contexto a la Inteligencia Artificial.');
      return;
    }

    setIsGeneratingBio(true);
    try {
      const response = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: petName,
          species: petBreed, // breed contains cat/dog/mestizo
          age: petAge,
          traits: petTraits || 'Cariñoso, mimoso, tranquilo y juguetón'
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (data.bio) {
        setPetDescription(data.bio);
      }
    } catch (error: any) {
      console.error('Error in AI Bio writer:', error);
      alert(`⚠️ Error al generar biografía con IA: ${error.message || 'Verifica la clave API.'}`);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleAddPetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !petBreed || !petDescription) {
      alert('Por favor, completa los campos obligatorios del animal.');
      return;
    }

    // Default stock photo matching keyword
    let finalPhoto = petPhoto.trim();
    if (!finalPhoto) {
      const isCat = petBreed.toLowerCase().includes('gato') || petBreed.toLowerCase().includes('gat') || petName.toLowerCase() === 'michi';
      finalPhoto = isCat
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600'
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';
    }

    onAddPet({
      name: petName,
      breed: petBreed,
      age: petAge || '1 año',
      size: petSize,
      gender: petGender,
      description: petDescription,
      photo: finalPhoto,
      status: 'En adopción'
    });

    // Reset Form
    setPetName('');
    setPetBreed('');
    setPetAge('');
    setPetDescription('');
    setPetPhoto('');
    setPetTraits('');
    alert(`🎉 ¡${petName} ha sido agregado exitosamente al catálogo para Adopción!`);
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-gray-150 rounded-3xl shadow-lg text-center font-sans">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl w-fit mx-auto mb-6">
          <ShieldCheck className="h-10 w-10 text-rose-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-950 tracking-tight">Acceso Co-Dirección</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
          Para ver el Panel de Coordinación, administrar adopciones, y subir fotos de rescatados, por favor inicia sesión.
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.97 1 12 1 7.24 1 3.19 3.73 1.24 7.7l3.8 2.95C6.01 7.24 8.76 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.41-4.93 3.41-8.6z"
              />
              <path
                fill="#FBBC05"
                d="M5.04 14.35c-.24-.72-.38-1.5-.38-2.35s.14-1.63.38-2.35L1.24 6.7C.45 8.29 0 10.09 0 12s.45 3.71 1.24 5.3l3.8-2.95z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.24 0-5.99-2.2-6.96-5.61l-3.8 2.95C3.19 20.27 7.24 23 12 23z"
              />
            </svg>
            Iniciar Sesión con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn text-left font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-rose-600 animate-pulse" />
            Panel de Co-Dirección NGO
          </h1>
          <p className="text-gray-500 text-xs">Administra solicitudes de adopción, coordina las castraciones sistemáticas y sube rescatados.</p>
        </div>
        
        {/* User Auth Badge */}
        <div className="flex items-center gap-3.5 bg-gray-50 border border-gray-150 px-4 py-2 rounded-2xl w-fit">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || ''} 
              className="h-8 w-8 rounded-full border border-gray-200" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs uppercase">
              {(currentUser.displayName || currentUser.email || 'A')[0].toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <p className="text-xs font-bold text-gray-800 leading-tight">{currentUser.displayName || 'Co-Director'}</p>
            <p className="text-[10px] text-gray-400 font-mono leading-none mt-0.5">{currentUser.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-1.5 hover:bg-gray-150 text-gray-400 hover:text-red-500 rounded-lg transition-all ml-1 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* STATS COUNT CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 border border-gray-150 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase font-mono">Rescatados Activos</span>
            <span className="text-3xl font-black text-gray-950 block mt-1">
              {pets.filter((p) => p.status !== 'Adoptado').length}
            </span>
          </div>
          <div className="p-3.5 bg-rose-50 rounded-2xl text-rose-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 border border-gray-150 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase font-mono">Turnos Castración</span>
            <span className="text-3xl font-black text-gray-950 block mt-1">
              {appointments.filter((a) => a.status === 'Pendiente').length}{' '}
              <span className="text-sm text-gray-400 font-normal">pendientes</span>
            </span>
          </div>
          <div className="p-3.5 bg-indigo-50 rounded-2xl text-indigo-600">
            <Scissors className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 border border-gray-150 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase font-mono">Adopciones en Evaluación</span>
            <span className="text-3xl font-black text-gray-950 block mt-1">
              {adoptions.filter((ad) => ad.status === 'Pendiente').length}{' '}
              <span className="text-sm text-gray-400 font-normal">formularios</span>
            </span>
          </div>
          <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-600">
            <ClipboardCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* SUB-TABS SELECTOR DE ADMINISTRACIÓN */}
      <div className="border-b border-gray-150 flex flex-wrap gap-1 sm:gap-2">
        <button
          onClick={() => setSubTab('adoptions')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 ${
            subTab === 'adoptions'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Adopciones ({adoptions.length})
        </button>
        <button
          onClick={() => setSubTab('castrations')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 ${
            subTab === 'castrations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Castraciones ({appointments.length})
        </button>
        <button
          onClick={() => setSubTab('pets')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 ${
            subTab === 'pets'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          ➕ Subir Mascota IA
        </button>
        <button
          onClick={() => setSubTab('campaigns')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 ${
            subTab === 'campaigns'
              ? 'border-indigo-650 text-slate-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          🗓️ Eventos ({campaigns.length})
        </button>
        <button
          onClick={() => setSubTab('finances')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 ${
            subTab === 'finances'
              ? 'border-emerald-500 text-emerald-605 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          💰 Finanzas / Gastos
        </button>
        <button
          onClick={() => setSubTab('historic')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 ${
            subTab === 'historic'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          📄 Adoptantes Papel
        </button>
      </div>

      {/* ADOPTION FORMS EVALUATION TAB */}
      {subTab === 'adoptions' && (
        <div className="space-y-4 animate-fadeIn">
          {adoptions.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl">
              <span className="text-2xl">📋</span>
              <p className="text-sm font-semibold text-gray-600 mt-2">Sin solicitudes vigentes</p>
            </div>
          ) : (
            adoptions.map((adop) => (
              <div key={adop.id} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs relative space-y-4">
                <div className="flex justify-between items-start gap-3 border-b border-gray-50 pb-3 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase border border-emerald-100">
                      Postulante para {adop.petName}
                    </span>
                    <h4 className="font-extrabold text-gray-950 text-base mt-2">{adop.adopterName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      DNI: {adop.adopterDni} | Cel: {adop.adopterPhone} | Correo: {adop.adopterEmail}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider uppercase border rounded-lg px-2.5 py-1 ${
                    adop.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    adop.status === 'Rechazado' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    {adop.status}
                  </span>
                </div>

                {/* Answers payload render */}
                <div className="bg-slate-50/50 p-4 rounded-xl space-y-2 text-xs">
                  <h5 className="font-bold text-gray-700 uppercase tracking-widest text-[10px] mb-2 text-rose-600">Respuestas del Adopción Wizard</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                    <p>🏡 <strong>Vivienda:</strong> {adop.answers.homeType}</p>
                    <p>🐈 <strong>¿Tiene otras mascotas?:</strong> {adop.answers.otherPets}</p>
                    <p>🧱 <strong>Patio Cerrado:</strong> {adop.answers.yardSecure}</p>
                    <p>⏰ <strong>Horas Solo/Día:</strong> {adop.answers.hoursAlone} horas</p>
                  </div>
                </div>

                {adop.note && (
                  <div className="p-3 bg-indigo-50/40 rounded-xl text-xs text-indigo-800 border-l-2 border-indigo-500">
                    <strong>Motivo/Nota Administrativa:</strong> {adop.note}
                  </div>
                )}

                {/* Accept Reject buttons */}
                {adop.status === 'Pendiente' && (
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setActiveRejectionId(adop.id);
                        setRejectionNote('');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                      Rechazar con Nota
                    </button>
                    <button
                      onClick={() => onUpdateAdoptionStatus(adop.id, 'Aprobado')}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-200/50 transition-all"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Aprobar Adopción
                    </button>
                  </div>
                )}

                {/* Rejection form expand */}
                {activeRejectionId === adop.id && (
                  <div className="mt-3 p-4 border border-amber-200 bg-amber-50/30 rounded-xl space-y-3 animate-fadeIn">
                    <label className="text-xs font-bold text-amber-800">Escribe el motivo de rechazo (Se comunicará al DNI del solicitante):</label>
                    <textarea
                      required
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      rows={2}
                      placeholder="Ej: Agradecemos la postulación, pero Milo necesita un patio tapialado dado que le gusta saltar..."
                      className="w-full text-xs p-2 border border-amber-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveRejectionId(null)}
                        className="px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 rounded-md"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (!rejectionNote.trim()) {
                            alert('Escribe el motivo del rechazo.');
                            return;
                          }
                          onUpdateAdoptionStatus(adop.id, 'Rechazado', rejectionNote);
                          setActiveRejectionId(null);
                        }}
                        className="px-3.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md"
                      >
                        Enviar Rechazo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* CASTRATIONS APPOINTMENTS COORDINATION TAB */}
      {subTab === 'castrations' && (
        <div className="space-y-4 animate-fadeIn">
          {appointments.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl">
              <span className="text-2xl">✂️</span>
              <p className="text-sm font-semibold text-gray-650 mt-2">Sin turnos agendados</p>
            </div>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-start gap-3 border-b border-gray-50 pb-2 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md uppercase border border-indigo-100">
                      Cita de Castración
                    </span>
                    <h4 className="font-extrabold text-gray-950 text-sm mt-1.5">Mascota: {appt.petName} ({appt.petType})</h4>
                    <p className="text-xs text-gray-500">Edad: {appt.petAge}  | Peso aprox: {appt.petWeight}</p>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider uppercase border rounded-lg px-2.5 py-1 ${
                    appt.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    appt.status === 'Rechazado' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {appt.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>👤 <strong>Responsable:</strong> {appt.ownerName} (DNI: {appt.ownerDni})</p>
                  <p>📞 <strong>Contacto:</strong> {appt.ownerPhone} | {appt.ownerEmail}</p>
                </div>

                {appt.note && (
                  <div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-600 border-l-2 border-indigo-500">
                    <strong>Coordinación:</strong> {appt.note}
                  </div>
                )}

                {appt.status === 'Pendiente' && (
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setActiveRejectionCastrationId(appt.id);
                        setRejectionCastrationNote('');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                      Rechazar Turno
                    </button>
                    <button
                      onClick={() => onUpdateAppointmentStatus(appt.id, 'Aprobado', 'Turno aprobado para el 15 tras evaluar peso. Recordar traer manta y ayuno absoluto.')}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-150 transition-all"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Aprobar Cita
                    </button>
                  </div>
                )}

                {activeRejectionCastrationId === appt.id && (
                  <div className="mt-3 p-4 border border-amber-200 bg-amber-50/30 rounded-xl space-y-3 animate-fadeIn">
                    <label className="text-xs font-bold text-amber-800">Causa del Rechazo / Recomendación clínica:</label>
                    <textarea
                      required
                      value={rejectionCastrationNote}
                      onChange={(e) => setRejectionCastrationNote(e.target.value)}
                      rows={2}
                      placeholder="Ej: No podemos castrar debido a que tiene sobrepeso severo o edad menor a 4 meses. Recomendamos..."
                      className="w-full text-xs p-2 border border-amber-200 bg-white rounded-lg focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveRejectionCastrationId(null)}
                        className="px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 rounded-md"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (!rejectionCastrationNote.trim()) {
                            alert('Escribe un motivo.');
                            return;
                          }
                          onUpdateAppointmentStatus(appt.id, 'Rechazado', rejectionCastrationNote);
                          setActiveRejectionCastrationId(null);
                        }}
                        className="px-3.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md"
                      >
                        Enviar Rechazo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE NEW RESCUED ANIMAL FORM WITH GEMINI INTELLIGENCE */}
      {subTab === 'pets' && (
        <form onSubmit={handleAddPetSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs space-y-5 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <PlusCircle className="h-5 w-5 text-emerald-600" />
            <h3 className="font-extrabold text-gray-950 text-base">Ficha de Nuevo Rescatado</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 font-bold">Nombre del Animal 🐶🐱 *</label>
              <input
                type="text"
                required
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Ej: Rocco, Linda"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 font-bold">Especie y Raza *</label>
              <input
                type="text"
                required
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                placeholder="Ej: Gato Atigrado, Caniche Cruzado"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 font-bold">Edad Estimada *</label>
              <input
                type="text"
                required
                value={petAge}
                onChange={(e) => setPetAge(e.target.value)}
                placeholder="Ej: 8 meses, 3 años"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs text-gray-700 font-bold block">Foto de la Mascota (Subir desde Celular o URL) *</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile / Local Image Upload Dropzone */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-150 hover:border-emerald-500 rounded-2xl p-4 transition-colors bg-emerald-50/10 cursor-pointer relative group min-h-[110px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUploadChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    id="mobile-photo-upload"
                  />
                  <div className="text-center space-y-1.5 flex flex-col items-center justify-center">
                    <div className="p-2.5 bg-white text-emerald-600 rounded-xl shadow-xs group-hover:scale-105 transition-transform border border-emerald-50 animate-bounce">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Subir foto desde Celular o PC</p>
                      <p className="text-[10px] text-gray-405 font-medium">Captura directo o selecciona de tu galería</p>
                    </div>
                  </div>
                </div>

                {/* Photo URL Link fallback and real-time preview display */}
                <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50/35 flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">O ingresa un Link directo de Imagen</label>
                    <input
                      type="url"
                      value={petPhoto.startsWith('data:') ? '' : petPhoto}
                      onChange={(e) => setPetPhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-600 placeholder:text-gray-400"
                    />
                  </div>

                  {petPhoto ? (
                    <div className="mt-3 flex items-center gap-3 bg-white p-2 border border-gray-150 rounded-xl shadow-xs">
                      <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-gray-150 shrink-0 bg-gray-100">
                        <img src={petPhoto} alt="Vista previa" className="h-full w-full object-cover" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-800 truncate">
                          {petPhoto.startsWith('data:') ? 'Foto capturada del celular 📸' : 'Foto cargada por URL 🌐'}
                        </p>
                        <p className="text-[9px] text-gray-400 leading-none">Tamaño adaptado y comprimido correctamente</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPetPhoto('')}
                        className="p-1 px-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-3 text-[10px] text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white mt-1">
                      Ninguna foto seleccionada aún
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600 font-bold">Tamaño *</label>
              <select
                value={petSize}
                onChange={(e: any) => setPetSize(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none"
              >
                <option value="Chico">Chico</option>
                <option value="Mediano">Mediano</option>
                <option value="Grande">Grande</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 font-bold">Sexo *</label>
              <select
                value={petGender}
                onChange={(e: any) => setPetGender(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none"
              >
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
          </div>

          {/* AI BIO GENERATION BOARD */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-150 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-emerald-600 fill-emerald-100 animate-pulse" />
                <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">Generador de Biografías IA (Gemini)</h4>
              </div>
              <button
                type="button"
                disabled={isGeneratingBio || !petName || !petBreed}
                onClick={handleGenerateAIBio}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <Wand2 className="h-3.5 w-3.5" />
                {isGeneratingBio ? 'Escribiendo con IA...' : 'Generar Historia con IA'}
              </button>
            </div>

            <p className="text-[11px] text-emerald-800 leading-normal">
              Ayuda a la Inteligencia Artificial agregando algunos comportamientos o palabras clave de personalidad en el siguiente recuadro para que la historia sea detallada y conmovedora:
            </p>

            <input
              type="text"
              value={petTraits}
              onChange={(e) => setPetTraits(e.target.value)}
              placeholder="Ej: rescatado con desnutrición, muy mimoso, miedoso al principio, adora comer galletas de atún"
              className="w-full px-3 py-2 border border-emerald-250 bg-white rounded-xl text-xs outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 font-bold">Historia / Descripción del Rescatado *</label>
            <textarea
              required
              rows={4}
              value={petDescription}
              onChange={(e) => setPetDescription(e.target.value)}
              placeholder="Haz clic arriba en 'Generar Historia con IA' para que Gemini narre automáticamente una historia en primera persona conmovedora, o escríbela tú manualmente."
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-2.5 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 rounded-xl transition-all cursor-pointer"
            >
              Publicar en Adopción
            </button>
          </div>
        </form>
      )}

      {/* MANAGE EVENTS & CAMPAIGNS TAB */}
      {subTab === 'campaigns' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn text-left">
          {/* Create Campaign/Event Form */}
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={handleAddCampaignSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <h3 className="font-extrabold text-gray-950 text-base">Crear Evento / Campaña</h3>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="Ej: Gran Jornada de Castración Veterinaria"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-600 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Tipo de Evento *</label>
                <select
                  value={campType}
                  onChange={(e: any) => setCampType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-600 text-gray-905"
                >
                  <option value="castration">✂️ Campaña de Castración Sistemática</option>
                  <option value="vaccination">💉 Campaña de Vacunación Preventiva</option>
                  <option value="fundraiser">💰 Colecta de Fondos Solidaria</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">Fecha del Evento *</label>
                  <input
                    type="text"
                    required
                    value={campFecha}
                    onChange={(e) => setCampFecha(e.target.value)}
                    placeholder="Ej: Sábado 24 de Mayo"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-600 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">Lugar / Ubicación *</label>
                  <input
                    type="text"
                    required
                    value={campLugar}
                    onChange={(e) => setCampLugar(e.target.value)}
                    placeholder="Ej: Salón Comunal N° 3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-600 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {campType !== 'fundraiser' ? (
                <div className="p-3 bg-gray-50 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="camp-limit-toggle"
                      checked={campHasLimit}
                      onChange={(e) => setCampHasLimit(e.target.checked)}
                      className="h-4 w-4 rounded text-indigo-650 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="camp-limit-toggle" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                      Establecer límite de turnos (Cupos)
                    </label>
                  </div>
                  {campHasLimit && (
                    <div className="animate-fadeIn">
                      <label className="text-[10px] text-gray-500 font-bold block">Cupos Totales Disponibles</label>
                      <input
                        type="number"
                        min="1"
                        required={campHasLimit}
                        value={campMaxSlots}
                        onChange={(e) => setCampMaxSlots(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-600"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl animate-fadeIn">
                  <label className="text-xs text-indigo-950 font-bold block mb-1">Meta a Recaudar ($) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">$</span>
                    <input
                      type="number"
                      required
                      value={campGoalAmount}
                      onChange={(e) => setCampGoalAmount(e.target.value)}
                      placeholder="Ej: 80000"
                      className="w-full px-7 py-1.5 border border-indigo-200 rounded-lg text-xs outline-none bg-white font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Campaign Banner image upload */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-700 font-bold block">Foto o Banner del Evento (Opcional)</label>
                <div className="grid grid-cols-1 gap-3">
                  {/* File Upload Trigger */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-xl p-3 bg-gray-50/20 cursor-pointer relative group transition-colors">
                    <input
                      id="camp-banner-file"
                      type="file"
                      accept="image/*"
                      onChange={handleCampaignBannerChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    <div className="text-center flex items-center gap-2">
                      <Camera className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-bold text-gray-700">Subir foto desde Celular o PC</span>
                    </div>
                  </div>

                  {/* Text input URL fallback or preview */}
                  <div>
                    <input
                      type="url"
                      value={campBanner.startsWith('data:') ? '' : campBanner}
                      onChange={(e) => setCampBanner(e.target.value)}
                      placeholder="O ingresa Link de imagen..."
                      className="w-full text-[11px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-600 placeholder:text-gray-400"
                    />
                  </div>

                  {campBanner && (
                    <div className="relative h-20 w-full rounded-lg overflow-hidden border border-gray-150 bg-gray-100">
                      <img src={campBanner} alt="Banner Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCampBanner('')}
                        className="absolute right-2 top-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full shadow-xs transition-colors"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Descripción corta del Evento *</label>
                <textarea
                  required
                  rows={2}
                  value={campDescription}
                  onChange={(e) => setCampDescription(e.target.value)}
                  placeholder="Ej: Estaremos realizando castraciones de perros y gatos de forma gratuita en el Salón Comunal."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-600 placeholder:text-gray-400"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSavingCampaign}
                  className="w-full py-2.5 font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 shadow-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  {isSavingCampaign ? 'Creando evento...' : 'Publicar Evento Nuevo'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing list of events / campaigns */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-black text-gray-950 flex items-center gap-2 border-b border-gray-100 pb-2">
              📅 Lista de Eventos y Campañas Activas ({campaigns.length})
            </h3>

            {campaigns.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-150 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-500 mt-2">No hay ninguna campaña o evento activo cargada en el sistema.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((camp) => {
                  const isCastration = camp.type === 'castration';
                  const isVaccination = camp.type === 'vaccination';
                  const isFundraiser = camp.type === 'fundraiser';

                  return (
                    <div key={camp.id} className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                      {/* Banner row */}
                      <div className="h-28 relative">
                        <img
                          src={camp.bannerImage || 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=1200'}
                          alt={camp.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3.5 p-left">
                          <span className={`text-[9px] font-bold tracking-wider uppercase rounded-md px-2 py-0.5 w-fit border leading-none mb-1 text-white ${
                            isCastration ? 'bg-indigo-600/80 border-indigo-400' :
                            isVaccination ? 'bg-orange-500/80 border-orange-400' :
                            'bg-emerald-600/80 border-emerald-400'
                          }`}>
                            {isCastration ? '✂️ Castración' :
                             isVaccination ? '💉 Vacunación' :
                             '💰 Colecta'}
                          </span>
                          <h4 className="font-extrabold text-sm text-white leading-tight truncate">{camp.title}</h4>
                        </div>
                      </div>

                      {/* Info payload */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                        <p className="text-gray-500 leading-normal text-[11px] line-clamp-2">
                          {camp.description}
                        </p>

                        <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl text-gray-700">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{camp.fecha}</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{camp.lugar}</span>
                          </div>
                        </div>

                        {/* Capacity and details */}
                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[11px]">
                          <div>
                            {isFundraiser ? (
                              <p className="text-gray-500">
                                Recaudado: <span className="font-bold text-emerald-600">${camp.collectedAmount?.toLocaleString() || 0}</span> / ${camp.goalAmount?.toLocaleString() || '100,000'}
                              </p>
                            ) : camp.maxSlots ? (
                              <p className="text-gray-500">
                                Reservas: <span className="font-bold text-indigo-600">{camp.totalRegistered || 0}</span> / {camp.maxSlots} cupos
                              </p>
                            ) : (
                              <p className="text-gray-500 font-bold text-indigo-605 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 inline-block">
                                ✨ Cupos Ilimitados
                              </p>
                            )}
                          </div>

                          {/* Delete Campaign Action Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Estás completamente seguro de eliminar el evento "${camp.title}" de forma permanente? Se perderá toda la vinculación.`)) {
                                onDeleteCampaign(camp.id);
                              }
                            }}
                            className="p-1 px-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent flex items-center gap-1 font-bold active:bg-rose-100"
                          >
                            <Trash className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FINANCES & ACCOUNTABILITY TAB */}
      {subTab === 'finances' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xl font-black text-gray-950 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              Gestión Financiera de la ONG
            </h3>
            <p className="text-xs text-gray-505 mt-1">Sigue de cerca las donaciones, lo recaudado por apadrinamientos o eventos y controla los gastos sistemáticos veterinarios.</p>
            
            {/* Financial Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-emerald-50/60 p-4 border border-emerald-100 rounded-2xl">
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider font-mono">Recaudación Total</span>
                <span className="text-2xl font-black text-emerald-950 block mt-1">
                  ${finances
                    .filter(f => f.type === 'revenue')
                    .reduce((acc, curr) => acc + curr.amount, 0)
                    .toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-650 mt-1 block">Donaciones, eventos y padrinos</span>
              </div>

              <div className="bg-rose-50/60 p-4 border border-rose-100 rounded-2xl">
                <span className="text-[10px] text-rose-800 uppercase font-bold tracking-wider font-mono">Egresos / Gastos</span>
                <span className="text-2xl font-black text-rose-950 block mt-1">
                  ${finances
                    .filter(f => f.type === 'expense')
                    .reduce((acc, curr) => acc + curr.amount, 0)
                    .toLocaleString()}
                </span>
                <span className="text-[10px] text-rose-650 mt-1 block">Alimentos, medicamentos, veterinaria</span>
              </div>

              {(() => {
                const totalRev = finances.filter(f => f.type === 'revenue').reduce((acc, curr) => acc + curr.amount, 0);
                const totalExp = finances.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
                const balance = totalRev - totalExp;
                const isPositive = balance >= 0;

                return (
                  <div className={`p-4 border rounded-2xl ${isPositive ? 'bg-blue-50/60 border-blue-100 text-blue-950' : 'bg-red-50/60 border-red-100 text-red-950'}`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Balance Neto Mensual</span>
                    <span className="text-2xl font-black block mt-1">
                      {isPositive ? '+' : '-'}${Math.abs(balance).toLocaleString()}
                    </span>
                    <span className="text-[10px] mt-1 block">Fondo de reserva disponible</span>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const amt = parseFloat(finAmount);
                if (isNaN(amt) || amt <= 0) {
                  alert('Por favor ingresa un monto válido superior a cero.');
                  return;
                }
                setIsSavingFinance(true);
                try {
                  await onAddFinanceRecord({
                    type: finType,
                    category: finCategory,
                    amount: amt,
                    description: finDescription,
                    date: finDate
                  });
                  // Reset form
                  setFinAmount('');
                  setFinDescription('');
                } finally {
                  setIsSavingFinance(false);
                }
              }}
              className="lg:col-span-1 bg-white border border-gray-150 rounded-3xl p-5 space-y-4"
            >
              <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                Registrar Movimiento de Caja
              </h4>

              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Tipo de Movimiento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFinType('revenue');
                      setFinCategory('Donación');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      finType === 'revenue' 
                        ? 'bg-emerald-550 border-emerald-650 text-white' 
                        : 'bg-white border-gray-250 text-gray-650 hover:bg-gray-50'
                    }`}
                  >
                    📈 Ingreso / Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFinType('expense');
                      setFinCategory('Alimento');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      finType === 'expense' 
                        ? 'bg-rose-550 border-rose-650 text-white' 
                        : 'bg-white border-gray-250 text-gray-650 hover:bg-gray-50'
                    }`}
                  >
                    📉 Egreso / Gasto
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Categoría</label>
                <select
                  value={finCategory}
                  onChange={(e) => setFinCategory(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {finType === 'revenue' ? (
                    <>
                      <option value="Donación">Donación Voluntaria</option>
                      <option value="Apadrinamiento">Cuota Padrino / Madrina</option>
                      <option value="Evento">Recaudación Evento / Rifa</option>
                      <option value="Otros">Otros Ingresos</option>
                    </>
                  ) : (
                    <>
                      <option value="Alimento">Alimento / Balanceado</option>
                      <option value="Veterinaria">Veterinaria / Honorarios</option>
                      <option value="Medicamentos">Medicamentos / Vacunas / Insumos</option>
                      <option value="Logística">Traslados y Combustible</option>
                      <option value="Otros">Gastos Operativos Varios</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Monto en Pesos ($ARS)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={finAmount}
                  onChange={(e) => setFinAmount(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                  placeholder="Ej: 4500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Fecha de Registro</label>
                <input
                  type="date"
                  required
                  value={finDate}
                  onChange={(e) => setFinDate(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold block mb-1">Descripción / Concepto</label>
                <textarea
                  required
                  value={finDescription}
                  onChange={(e) => setFinDescription(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none h-20 resize-none"
                  placeholder="Ej: Vacuna para Milo veterinaria central..."
                />
              </div>

              <button
                type="submit"
                disabled={isSavingFinance}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-850 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isSavingFinance ? 'Guardando...' : '💾 Confirmar Registro'}
              </button>
            </form>

            {/* List log column */}
            <div className="lg:col-span-2 bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
              <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5 border-b border-gray-100 pb-2">
                📒 Historial Diario de Transacciones
              </h4>

              {finances.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-gray-400">No hay movimientos registrados.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {finances.map((f) => {
                    const isRev = f.type === 'revenue';
                    return (
                      <div 
                        key={f.id} 
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:bg-gray-50 text-xs ${
                          isRev ? 'bg-emerald-50/20 border-emerald-100' : 'bg-rose-50/20 border-rose-100'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[9px] text-gray-450">{f.date}</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] font-sans border ${
                              isRev ? 'bg-emerald-100/60 text-emerald-800 border-emerald-250' : 'bg-rose-100/60 text-rose-800 border-rose-250'
                            }`}>
                              {f.category}
                            </span>
                          </div>
                          <p className="font-bold text-gray-950 truncate max-w-md">{f.description}</p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-right">
                          <span className={`text-sm font-black font-sans ${isRev ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isRev ? '+' : '-'}${f.amount.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('¿Seguro que deseas eliminar este registro de caja de forma permanente?')) {
                                onDeleteFinanceRecord(f.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 text-gray-450 hover:text-rose-600 rounded-lg transition-colors border border-transparent"
                            title="Eliminar registro"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HISTORIC ADOPTERS PAPER EXPORT TAB */}
      {subTab === 'historic' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xl font-black text-gray-950 flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
              Migración de Planillas Históricas en Papel
            </h3>
            <p className="text-xs text-gray-505 mt-1">
              ¿Tienes registros de adopciones previas apuntadas en cuadernos o folios? Complétalos aquí para digitalizarlos. Facilita las búsquedas futuras por DNI en el buscador unificado ante reportes de abandono o controles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!histAdopterName || !histAdopterDni || !histAdopterPhone || !histPetName || !histAdoptionDate) {
                  alert('Por favor, completa los campos obligatorios (*).');
                  return;
                }
                try {
                  await onAddHistoricAdopter({
                    adopterName: histAdopterName,
                    adopterDni: histAdopterDni.replace(/\D/g, ''),
                    adopterPhone: histAdopterPhone,
                    adopterEmail: histAdopterEmail || 'sin@correo.com',
                    petName: histPetName,
                    petBreed: histPetBreed,
                    adoptionDate: histAdoptionDate,
                    notes: histNotes
                  });
                  // Reset form
                  setHistAdopterName('');
                  setHistAdopterDni('');
                  setHistAdopterPhone('');
                  setHistAdopterEmail('');
                  setHistPetName('');
                  setHistPetBreed('');
                  setHistAdoptionDate('');
                  setHistNotes('');
                } catch (err: any) {
                  alert(`⚠️ Error al cargar adoptante histórico: ${err?.message || err}`);
                }
              }}
              className="lg:col-span-1 bg-white border border-gray-150 rounded-3xl p-5 space-y-4"
            >
              <h4 className="font-extrabold text-blue-900 text-sm flex items-center gap-1.5 border-b border-gray-100 pb-2">
                📋 Registro Manual Ficha Histórica
              </h4>

              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 block mb-1 font-mono">Datos del Adoptante Fisico</span>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={histAdopterName}
                    onChange={(e) => setHistAdopterName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-250 px-3 py-2 text-gray-900 focus:outline-none"
                    placeholder="Ej: Roberto Gómez"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 font-bold">DNI (Sin puntos) *</label>
                    <input
                      type="text"
                      required
                      value={histAdopterDni}
                      onChange={(e) => setHistAdopterDni(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs rounded-xl border border-gray-250 px-3 py-2 text-gray-900 focus:outline-none"
                      placeholder="Ej: 15432987"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold">Teléfono celular *</label>
                    <input
                      type="tel"
                      required
                      value={histAdopterPhone}
                      onChange={(e) => setHistAdopterPhone(e.target.value)}
                      className="w-full text-xs rounded-xl border border-gray-250 px-3 py-2 text-gray-900 focus:outline-none"
                      placeholder="Ej: 341655443"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    value={histAdopterEmail}
                    onChange={(e) => setHistAdopterEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-250 px-3 py-2 text-gray-900 focus:outline-none"
                    placeholder="Ej: roberto@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 block mb-1 font-mono">Datos de la Mascota</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 font-bold">Nombre Mascota *</label>
                    <input
                      type="text"
                      required
                      value={histPetName}
                      onChange={(e) => setHistPetName(e.target.value)}
                      className="w-full text-xs rounded-xl border border-gray-250 px-3 py-2 text-gray-900 focus:outline-none"
                      placeholder="Ej: Rocko"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold">Raza / Tipo</label>
                    <input
                      type="text"
                      value={histPetBreed}
                      onChange={(e) => setHistPetBreed(e.target.value)}
                      className="w-full text-xs rounded-xl border border-gray-250 px-3 py-2 text-gray-900 focus:outline-none"
                      placeholder="Ej: Cruza Ovejero"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold">Fecha de Adopción (Aproximada) *</label>
                  <input
                    type="text"
                    required
                    value={histAdoptionDate}
                    onChange={(e) => setHistAdoptionDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-250 px-3 py-2 text-gray-900 focus:outline-none"
                    placeholder="Ej: Noviembre de 2023, o YYYY-MM-DD"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold">Notas o Folio Libro Papel</label>
                  <textarea
                    value={histNotes}
                    onChange={(e) => setHistNotes(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-250 px-3 py-2 text-gray-900 focus:outline-none h-16 resize-none"
                    placeholder="Ej: Cuaderno N°2, folio 45. Entrega con collar."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                💾 Registrar en Base de Datos Digital
              </button>
            </form>

            {/* List log column */}
            <div className="lg:col-span-2 bg-white border border-gray-150 rounded-3xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <h4 className="font-extrabold text-gray-905 text-sm">
                  📚 Padrón de Adoptantes Digitalizado ({historicAdopters.length})
                </h4>

                <input
                  type="text"
                  placeholder="🔎 Filtrar por DNI, Nombre o Mascota..."
                  value={historicSearchQuery}
                  onChange={(e) => setHistoricSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl max-w-sm w-full outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {historicAdopters.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-gray-400">No hay adoptantes históricos registrados todavía.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[510px] overflow-y-auto pr-1">
                  {historicAdopters
                    .filter(ha => {
                      const query = historicSearchQuery.toLowerCase();
                      return (
                        ha.adopterName.toLowerCase().includes(query) ||
                        ha.adopterDni.toLowerCase().includes(query) ||
                        ha.petName.toLowerCase().includes(query) ||
                        (ha.petBreed || '').toLowerCase().includes(query)
                      );
                    })
                    .map((ha) => (
                      <div key={ha.id} className="bg-slate-50/50 p-4 border border-gray-150 rounded-2xl flex flex-col sm:flex-row justify-between gap-3 text-xs">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-gray-900 text-sm font-sans">{ha.adopterName}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold font-mono text-[10px] border border-blue-100">
                              DNI {ha.adopterDni}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-gray-650 text-[11px]">
                            <p>📞 Celular: <span className="font-extrabold text-gray-800">{ha.adopterPhone}</span></p>
                            <p>✉️ Email: <span className="font-extrabold text-gray-800">{ha.adopterEmail}</span></p>
                            <p>🐾 Mascota: <span className="font-black text-emerald-850">{ha.petName}</span> <span className="text-gray-400">({ha.petBreed || 'Mestizo'})</span></p>
                            <p>📅 Fecha Adoptado: <span className="font-extrabold text-indigo-900">{ha.adoptionDate}</span></p>
                          </div>

                          {ha.notes && (
                            <p className="text-[10px] text-gray-500 italic bg-white p-2 border border-gray-100 rounded-lg max-w-xl">
                              📝 Observaciones: {ha.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex sm:flex-col justify-end items-end pr-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Estás completamente seguro de eliminar a ${ha.adopterName} de los registros históricos digitalizados?`)) {
                                onDeleteHistoricAdopter(ha.id);
                              }
                            }}
                            className="p-1 px-2.5 bg-white hover:bg-rose-50 hover:text-rose-600 border border-gray-200 text-gray-400 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Trash className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
