import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomeTab from './components/HomeTab';
import AdoptTab from './components/AdoptTab';
import VetAssistantTab from './components/VetAssistantTab';
import SuccessTab from './components/SuccessTab';
import AdminTab from './components/AdminTab';
import ProfileTab from './components/ProfileTab';
import {
  CastrationFormModal,
  AdoptionWizardModal,
  DniLookupModal
} from './components/Modals';

// Initial seeded collections
import {
  initialPets,
  initialCampaigns,
  initialAppointments,
  initialAdoptions,
  initialTestimonials,
  initialFinances,
  initialHistoricAdopters
} from './initialData';

import { Pet, CastrationCampaign, CastrationAppointment, AdoptionApplication, Testimonial, UserProfile, FinanceRecord, HistoricAdopter } from './types';
import { db, auth, OperationType, handleFirestoreError } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs, getDocFromServer, query, where } from 'firebase/firestore';

export default function App() {
  // Navigation active state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Authenticated user references
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Core Firestore states, synced dynamically with realtime listeners
  const [pets, setPets] = useState<Pet[]>(initialPets);
  const [campaigns, setCampaigns] = useState<CastrationCampaign[]>(initialCampaigns);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [finances, setFinances] = useState<FinanceRecord[]>(initialFinances);
  const [historicAdopters, setHistoricAdopters] = useState<HistoricAdopter[]>(initialHistoricAdopters);

  // Administrative stats & lists - secured under admin/user auth session listeners
  const [appointments, setAppointments] = useState<CastrationAppointment[]>([]);
  const [adoptions, setAdoptions] = useState<AdoptionApplication[]>([]);

  // Modals Visibility controllers
  const [isCastrationOpen, setIsCastrationOpen] = useState(false);
  const [isAdoptionWizardOpen, setIsAdoptionWizardOpen] = useState(false);
  const [wizardPet, setWizardPet] = useState<Pet | null>(null);
  const [isDniLookupOpen, setIsDniLookupOpen] = useState(false);

  // Track currently chosen campaign for registration
  const [selectedBookingCampaign, setSelectedBookingCampaign] = useState<CastrationCampaign | null>(null);

  // Shared selected detailed pet card
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // 1. Connection Validation Check on app mount
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("📡 Firestore connection check: OK (Client online)");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("⚠️ Firestore client is offline. Verify network connection and config.");
        }
      }
    }
    testConnection();
  }, []);

  // 2. Authentication, Authorization & User Profile State Synchronizer
  useEffect(() => {
    return auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const email = currentUser.email || '';
        const isUserAdmin = email.toLowerCase() === 'polinomicomkops@gmail.com';
        setIsAdmin(isUserAdmin);

        // Sync profile doc on Firestore
        const userRef = doc(db, "users", currentUser.uid);
        try {
          const profileSnap = await getDocFromServer(userRef);
          if (profileSnap.exists()) {
            setUserProfile(profileSnap.data() as UserProfile);
          } else {
            const defaultProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Usuario Cuatro Patitas',
              email: email,
              photoURL: currentUser.photoURL || '',
              isAdmin: isUserAdmin
            };
            await setDoc(userRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (err) {
          console.warn("Could not query Firestore user profile, seeding profile locally: ", err);
          setUserProfile({
            uid: currentUser.uid,
            name: currentUser.displayName || 'Usuario Cuatro Patitas',
            email: email,
            photoURL: currentUser.photoURL || '',
            isAdmin: isUserAdmin
          });
        }
      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }
    });
  }, []);

  // 3. Admin Seeding / Database Bootstrapper
  useEffect(() => {
    if (isAdmin) {
      const bootstrapDatabase = async () => {
        try {
          console.log("🔄 Seeding Firestore defaults from administrative account...");
          const petSnap = await getDocs(collection(db, "pets"));
          if (petSnap.empty) {
            for (const pet of initialPets) {
              await setDoc(doc(db, "pets", pet.id), pet);
            }
          }

          const campaignSnap = await getDocs(collection(db, "campaigns"));
          if (campaignSnap.empty) {
            for (const camp of initialCampaigns) {
              await setDoc(doc(db, "campaigns", camp.id), camp);
            }
          }

          const testimonialSnap = await getDocs(collection(db, "testimonials"));
          if (testimonialSnap.empty) {
            for (const test of initialTestimonials) {
              await setDoc(doc(db, "testimonials", test.id), test);
            }
          }

          const apptSnap = await getDocs(collection(db, "appointments"));
          if (apptSnap.empty) {
            for (const appt of initialAppointments) {
              await setDoc(doc(db, "appointments", appt.id), appt);
            }
          }

          const adopSnap = await getDocs(collection(db, "adoptions"));
          if (adopSnap.empty) {
            for (const adop of initialAdoptions) {
              await setDoc(doc(db, "adoptions", adop.id), adop);
            }
          }

          const financeDocs = await getDocs(collection(db, "finances"));
          if (financeDocs.empty) {
            for (const fin of initialFinances) {
              await setDoc(doc(db, "finances", fin.id), fin);
            }
          }

          const historicDocs = await getDocs(collection(db, "historic_adopters"));
          if (historicDocs.empty) {
            for (const ha of initialHistoricAdopters) {
              await setDoc(doc(db, "historic_adopters", ha.id), ha);
            }
          }

          console.log("✅ Seeding completed! Database is fully populated with production structures.");
        } catch (e) {
          console.warn("Seeding bypassed or already complete: ", e);
        }
      };
      bootstrapDatabase();
    }
  }, [isAdmin]);

  // 4. Public real-time subscriptions with full robust local seed fallback protection
  useEffect(() => {
    const unsubPets = onSnapshot(collection(db, "pets"), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(doc => doc.data() as Pet).sort((a,b) => b.addedAt.localeCompare(a.addedAt));
        setPets(list);
      } else {
        setPets(initialPets);
      }
    }, (error) => {
      console.warn("Public read note: Falling back to offline dataset for pets.", error);
      setPets(initialPets);
    });

    const unsubCampaigns = onSnapshot(collection(db, "campaigns"), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(doc => doc.data() as CastrationCampaign);
        setCampaigns(list);
      } else {
        setCampaigns(initialCampaigns);
      }
    }, (error) => {
      console.warn("Public read note: Falling back to offline dataset for campaigns.", error);
      setCampaigns(initialCampaigns);
    });

    const unsubTestimonials = onSnapshot(collection(db, "testimonials"), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(doc => doc.data() as Testimonial);
        setTestimonials(list);
      } else {
        setTestimonials(initialTestimonials);
      }
    }, (error) => {
      console.warn("Public read note: Falling back to offline dataset for testimonials.", error);
      setTestimonials(initialTestimonials);
    });

    return () => {
      unsubPets();
      unsubCampaigns();
      unsubTestimonials();
    };
  }, []);

  // 4b. Administrative-only real-time subscriptions
  useEffect(() => {
    if (!isAdmin) {
      setFinances(initialFinances);
      setHistoricAdopters(initialHistoricAdopters);
      return;
    }

    const unsubFinances = onSnapshot(collection(db, "finances"), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(doc => doc.data() as FinanceRecord).sort((a, b) => b.date.localeCompare(a.date));
        setFinances(list);
      } else {
        setFinances(initialFinances);
      }
    }, (error) => {
      console.warn("Finances realtime read error: ", error);
      setFinances(initialFinances);
    });

    const unsubHistoric = onSnapshot(collection(db, "historic_adopters"), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(doc => doc.data() as HistoricAdopter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setHistoricAdopters(list);
      } else {
        setHistoricAdopters(initialHistoricAdopters);
      }
    }, (error) => {
      console.warn("Historic adopters realtime error: ", error);
      setHistoricAdopters(initialHistoricAdopters);
    });

    return () => {
      unsubFinances();
      unsubHistoric();
    };
  }, [isAdmin]);

  // 5. User-Authoritative & Administrative real-time subscriptions
  useEffect(() => {
    if (!user) {
      setAppointments([]);
      setAdoptions([]);
      return;
    }

    const qAppts = isAdmin
      ? collection(db, "appointments")
      : query(collection(db, "appointments"), where("ownerEmail", "==", user.email));

    const qAdops = isAdmin
      ? collection(db, "adoptions")
      : query(collection(db, "adoptions"), where("adopterEmail", "==", user.email));

    const unsubAppts = onSnapshot(qAppts, (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(doc => doc.data() as CastrationAppointment).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
        setAppointments(list);
      } else {
        setAppointments([]);
      }
    }, (error) => {
      console.warn("Appointments real-time subscription error: ", error);
      setAppointments([]);
    });

    const unsubAdops = onSnapshot(qAdops, (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(doc => doc.data() as AdoptionApplication).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
        setAdoptions(list);
      } else {
        setAdoptions([]);
      }
    }, (error) => {
      console.warn("Adoptions real-time subscription error: ", error);
      setAdoptions([]);
    });

    return () => {
      unsubAppts();
      unsubAdops();
    };
  }, [user, isAdmin]);

  // Main Event Handlers

  // Register castration turn
  const handleRegisterCastration = async (data: Omit<CastrationAppointment, 'id' | 'createdAt' | 'status'>) => {
    const appointmentId = `turno_${Date.now()}`;
    const newAppointment: CastrationAppointment = {
      ...data,
      id: appointmentId,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      ...(user ? { userId: user.uid } : {})
    };

    try {
      // Write appointment to database
      await setDoc(doc(db, "appointments", appointmentId), newAppointment);

      // Secure slot update
      const campRef = doc(db, "campaigns", data.campaignId);
      const camp = campaigns.find(c => c.id === data.campaignId);
      if (camp) {
        await updateDoc(campRef, {
          totalRegistered: (camp.totalRegistered || 0) + 1
        });
      }

      alert(`🎉 ¡Listo! Turno pre-reservado con éxito para ${data.petName}.\n\nPara consultar o verificar la aprobación, puedes ingresar tu DNI (${data.ownerDni}) en "Mis Solicitudes" de tu Perfil, o en el buscador de la página de inicio.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `appointments/${appointmentId}`);
    }
  };

  // Register adoption application wizard details
  const handleRegisterAdoption = async (data: Omit<AdoptionApplication, 'id' | 'createdAt' | 'status' | 'petId' | 'petName'>) => {
    if (!wizardPet) return;

    const adoptionId = `adop_${Date.now()}`;
    const newApplication: AdoptionApplication = {
      ...data,
      id: adoptionId,
      petId: wizardPet.id,
      petName: wizardPet.name,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      ...(user ? { userId: user.uid } : {})
    };

    try {
      await setDoc(doc(db, "adoptions", adoptionId), newApplication);
      alert(`💖 ¡Muchas gracias por postularte para adoptar a ${wizardPet.name}!\n\nTu formulario ha ingresado para evaluación por nuestro comité. Verificaremos las condiciones de seguridad hogareña y te responderemos a la brevedad.\n\nPuedes consultar el estatus ingresando tu DNI (${data.adopterDni}) en "Mis Solicitudes" de tu Perfil, o en la página de inicio.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `adoptions/${adoptionId}`);
    }
  };

  // Add pet by Co-Director (with customizable details)
  const handleAddPet = async (newPetData: Omit<Pet, 'id' | 'addedAt'>) => {
    const petId = `pet_${Date.now()}`;
    const newPet: Pet = {
      ...newPetData,
      id: petId,
      addedAt: new Date().toISOString().split('T')[0]
    };

    try {
      await setDoc(doc(db, "pets", petId), newPet);
      alert(`🎉 ¡${newPetData.name} ha sido agregado exitosamente al catálogo para Adopción!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `pets/${petId}`);
    }
  };

  // Create castration campaign / event (admin action)
  const handleAddCampaign = async (newCampData: Omit<CastrationCampaign, 'id' | 'totalRegistered' | 'collectedAmount'>) => {
    const campaignId = `camp_${Date.now()}`;
    const newCamp: CastrationCampaign = {
      ...newCampData,
      id: campaignId,
      totalRegistered: 0,
      collectedAmount: 0
    };

    try {
      await setDoc(doc(db, "campaigns", campaignId), newCamp);
      alert(`🎉 ¡El evento/campaña "${newCampData.title}" ha sido creado con éxito!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `campaigns/${campaignId}`);
    }
  };

  // Delete castration campaign / event (admin action)
  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteDoc(doc(db, "campaigns", id));
      alert("🗑️ El evento/campaña ha sido eliminado con éxito de la base de datos.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `campaigns/${id}`);
    }
  };

  // Finance addition and removal admin operations
  const handleAddFinanceRecord = async (newRecord: Omit<FinanceRecord, 'id' | 'createdAt'>) => {
    const financeId = `fin_${Date.now()}`;
    const record: FinanceRecord = {
      ...newRecord,
      id: financeId,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, "finances", financeId), record);
      alert("💰 Registro de finanzas agregado con éxito.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `finances/${financeId}`);
    }
  };

  const handleDeleteFinanceRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, "finances", id));
      alert("🗑️ Registro de finanzas eliminado con éxito.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `finances/${id}`);
    }
  };

  // Historic adopters database handlers
  const handleAddHistoricAdopter = async (newAdopter: Omit<HistoricAdopter, 'id' | 'createdAt'>) => {
    const histId = `hist_${Date.now()}`;
    const adopter: HistoricAdopter = {
      ...newAdopter,
      id: histId,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, "historic_adopters", histId), adopter);
      alert("📄 Adoptante histórico registrado con éxito.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `historic_adopters/${histId}`);
    }
  };

  const handleDeleteHistoricAdopter = async (id: string) => {
    try {
      await deleteDoc(doc(db, "historic_adopters", id));
      alert("🗑️ Adoptante histórico de papel eliminado con éxito.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `historic_adopters/${id}`);
    }
  };

  // Update turn booking state (admin action)
  const handleUpdateAppointmentStatus = async (id: string, status: 'Aprobado' | 'Rechazado', note?: string) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;

    const updatedAppt: CastrationAppointment = {
      ...appt,
      status,
      note: note || undefined
    };

    try {
      await setDoc(doc(db, "appointments", id), updatedAppt);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  // Update adoption status (admin action)
  const handleUpdateAdoptionStatus = async (id: string, status: 'Aprobado' | 'Rechazado', note?: string) => {
    const adop = adoptions.find(a => a.id === id);
    if (!adop) return;

    try {
      const updatedAdop: AdoptionApplication = {
        ...adop,
        status,
        note: note || (status === 'Aprobado' ? '¡Tu solicitud ha sido Aprobada! Nos comunicaremos vía telefónica para ultimar la entrega.' : undefined)
      };

      await setDoc(doc(db, "adoptions", id), updatedAdop);

      if (status === 'Aprobado') {
        const p = pets.find(item => item.id === adop.petId);
        if (p) {
          const updatedPet: Pet = { ...p, status: 'Adoptado' };
          await setDoc(doc(db, "pets", adop.petId), updatedPet);
        }

        // Auto generate public testimonial
        const testimonialId = `test_${Date.now()}`;
        const newTestimonial: Testimonial = {
          id: testimonialId,
          petName: adop.petName,
          adopterName: adop.adopterName,
          story: `¡Adoptar a ${adop.petName} fue lo mejor que nos pasó! Nos postulamos a través de la web de Cuatro Patitas, la co-dirección evaluó nuestro hogar y en pocos de días lo tuvimos con nosotros. Es juguetón, educado y súper compañero. ¡Gracias infinitas por confiar en nosotros!`,
          photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
          date: new Date().toISOString().split('T')[0]
        };
        await setDoc(doc(db, "testimonials", testimonialId), newTestimonial);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `adoptions/${id}`);
    }
  };

  // Contributory transaction fundraiser action
  const handleContributeFundraiser = async (campaignId: string, amount: number) => {
    const campRef = doc(db, "campaigns", campaignId);
    const camp = campaigns.find(c => c.id === campaignId);
    if (camp) {
      const currentCollected = camp.collectedAmount || 0;
      try {
        await updateDoc(campRef, {
          collectedAmount: currentCollected + amount
        });
        alert(`💖 ¡Contribución recibida! Se sumaron $${amount.toLocaleString()} de forma simulada.\n\nEl pozo de recaudación se ha actualizado en tiempo real en la cartelera. ¡Muchísimas gracias por colaborar con Cuatro Patitas!`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `campaigns/${campaignId}`);
      }
    }
  };

  // Google Sign-In and logout triggers
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setActiveTab('perfil'); // Autonavigate to profile for details completion
    } catch (error) {
      console.error("Google login popup failed: ", error);
      alert("No se pudo iniciar sesión con Google. El navegador o políticas de iFrame lo bloquearon.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
    } catch (error) {
      console.error("Sign-out error: ", error);
    }
  };

  // Profile data save updates
  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    try {
      const merged = { ...(userProfile || {}), ...updatedData, uid: user.uid, email: user.email } as UserProfile;
      await setDoc(userRef, merged);
      setUserProfile(merged);
      alert("🎉 ¡Perfil guardado con éxito! Tus datos de contacto se autocompletarán en tus reservas.");
    } catch (error) {
      console.error("Error setting user profile configuration: ", error);
      alert("Error al guardar la configuración en la base de datos.");
    }
  };

  const activeCampaign = selectedBookingCampaign || campaigns.find((c) => c.active) || campaigns[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* GLOBAL APPLICATION STICKY HEADER */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        user={user}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      {/* CORE CONTENT LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <HomeTab
            campaigns={campaigns}
            pets={pets}
            onOpenCastration={(campaign) => {
              setSelectedBookingCampaign(campaign);
              setIsCastrationOpen(true);
            }}
            onOpenLookup={() => setIsDniLookupOpen(true)}
            onSelectPet={(pet) => setSelectedPet(pet)}
            onDonateOrPurchase={handleContributeFundraiser}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'adopt' && (
          <AdoptTab
            pets={pets}
            onOpenAdoptionWizard={(pet) => {
              setWizardPet(pet);
              setIsAdoptionWizardOpen(true);
            }}
            selectedPetExternal={selectedPet}
            setSelectedPetExternal={setSelectedPet}
          />
        )}

        {activeTab === 'vet' && <VetAssistantTab />}

        {activeTab === 'success' && <SuccessTab testimonials={testimonials} />}

        {activeTab === 'perfil' && userProfile && (
          <ProfileTab
            userProfile={userProfile}
            appointments={appointments}
            adoptions={adoptions}
            pets={pets}
            onUpdateProfile={handleUpdateProfile}
            onSignOut={handleSignOut}
          />
        )}

        {activeTab === 'admin' && (
          <AdminTab
            pets={pets}
            appointments={appointments}
            adoptions={adoptions}
            campaigns={campaigns}
            finances={finances}
            historicAdopters={historicAdopters}
            onAddPet={handleAddPet}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onUpdateAdoptionStatus={handleUpdateAdoptionStatus}
            onAddCampaign={handleAddCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            onAddFinanceRecord={handleAddFinanceRecord}
            onDeleteFinanceRecord={handleDeleteFinanceRecord}
            onAddHistoricAdopter={handleAddHistoricAdopter}
            onDeleteHistoricAdopter={handleDeleteHistoricAdopter}
          />
        )}
      </main>

      {/* COMPREHENSIVE MODALS */}
      <CastrationFormModal
        isOpen={isCastrationOpen}
        onClose={() => {
          setIsCastrationOpen(false);
          setSelectedBookingCampaign(null);
        }}
        campaign={activeCampaign}
        userProfile={userProfile}
        onSubmit={handleRegisterCastration}
      />

      <AdoptionWizardModal
        isOpen={isAdoptionWizardOpen}
        onClose={() => {
          setIsAdoptionWizardOpen(false);
          setWizardPet(null);
        }}
        pet={wizardPet}
        userProfile={userProfile}
        onSubmit={handleRegisterAdoption}
      />

      <DniLookupModal
        isOpen={isDniLookupOpen}
        onClose={() => setIsDniLookupOpen(false)}
        appointments={appointments}
        adoptions={adoptions}
      />

      {/* SUBTLE FOOTER DESIGN */}
      <footer className="bg-white border-t border-t-gray-100 py-6 text-center text-xs text-gray-400 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-left">
          <p>© 2026 Cuatro Patitas ONG. Todos los derechos reservados. San Martín, Buenos Aires.</p>
          <p className="font-mono text-[10px] bg-gray-50 px-2 py-0.5 rounded-full text-gray-500 border border-gray-100">
            Control Sanitario & Castraciones gratuitas sistemáticas
          </p>
        </div>
      </footer>
    </div>
  );
}
