import React, { useState } from 'react';
import { User, Shield, CreditCard, Phone, MapPin, ClipboardCheck, ArrowRight, Activity, CalendarDays, KeyRound, Save } from 'lucide-react';
import { UserProfile, CastrationAppointment, AdoptionApplication, Pet } from '../types';

interface ProfileTabProps {
  userProfile: UserProfile;
  appointments: CastrationAppointment[];
  adoptions: AdoptionApplication[];
  pets: Pet[];
  onUpdateProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  onSignOut: () => void;
}

export default function ProfileTab({
  userProfile,
  appointments,
  adoptions,
  pets,
  onUpdateProfile,
  onSignOut
}: ProfileTabProps) {
  // Local state for editing fields
  const [dni, setDni] = useState(userProfile.dni || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [name, setName] = useState(userProfile.name || '');
  const [isSaving, setIsSaving] = useState(false);

  // Identify successfully adopted pets for this user
  // We match approved adoptions where adopterEmail == userProfile.email OR adopterDni == userProfile.dni
  const approvedAdopPetIds = adoptions
    .filter(a => a.status === 'Aprobado')
    .map(a => a.petId);

  const adoptedPets = pets.filter(p => p.status === 'Adoptado' && approvedAdopPetIds.includes(p.id));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        name,
        dni: dni.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn text-left max-w-5xl mx-auto">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 md:p-8 rounded-3xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {userProfile.photoURL ? (
               <img
                 src={userProfile.photoURL}
                 alt={userProfile.name}
                 referrerPolicy="no-referrer"
                 className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
               />
            ) : (
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-2xl border-2 border-white shadow-md">
                 {userProfile.name.charAt(0).toUpperCase()}
               </div>
            )}
            {userProfile.isAdmin && (
               <span className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full text-[10px]" title="Co-Director / Coordinador">
                 <Shield className="h-3.5 w-3.5" />
               </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-955 flex items-center gap-2">
              ¡Hola, {userProfile.name}!
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{userProfile.email}</p>
            {userProfile.isAdmin && (
               <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">
                 Co-Director Administrador
               </span>
            )}
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-100 transition-all cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs">
            <h2 className="text-lg font-bold text-gray-955 flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <User className="h-5 w-5 text-blue-600" />
              Mis Datos Personales
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-955 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Documento Nacional ID (DNI)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 font-mono text-xs font-bold">
                    DNI
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-955 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                    placeholder="Ej: 38241944"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-sans">Mandatorio para vincular solicitudes y turnos</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teléfono Móvil
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-955 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                    placeholder="Ej: 1125227744"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Dirección de Residencia
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-955 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                    placeholder="Calle, Número, Departamento, Localidad"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 font-semibold text-sm text-white bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all outline-none"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Guardando...' : 'Guardar y Prefilar'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Adopted Pets & Application Trackers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: My Adopted Pets */}
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs">
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <ClipboardCheck className="h-5 w-5 text-emerald-500" />
              Mis Mascotas Adoptadas ({adoptedPets.length})
            </h2>

            {adoptedPets.length === 0 ? (
              <div className="py-10 text-center space-y-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 px-4">
                <span className="text-3xl block">🐕🏡</span>
                <p className="text-sm font-semibold text-gray-800">Todavía no has concretado adopciones</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Cuando tu solicitud de adopción sea aprobada por el comité co-director, el perrito o gatito aparecerá como miembro oficial de tu familia en esta sección.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adoptedPets.map(pet => (
                  <div key={pet.id} className="border border-gray-150 rounded-xl overflow-hidden flex flex-col bg-white">
                    <img
                      src={pet.photo}
                      alt={pet.name}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-extrabold text-gray-950 text-base">{pet.name}</span>
                          <span className="text-xs text-gray-400 font-mono">{pet.breed}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mt-1">
                          {pet.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-100 mt-2 flex justify-between items-center text-[10px] text-gray-400 font-semibold uppercase">
                        <span>🎂 {pet.age}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Adoptado Oficialmente
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Registration Status Timeline */}
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs">
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Activity className="h-5 w-5 text-indigo-500" />
              Historial de Solicitudes y Turnos
            </h2>

            {appointments.length === 0 && adoptions.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">No posees turnos de cirugía ni postulaciones de adopción registradas con este email.</p>
            ) : (
              <div className="space-y-4">
                {/* Adoption requests */}
                {adoptions.map((ad, idx) => (
                  <div key={ad.id} className="border border-gray-150 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-100 transition-all">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-750 uppercase border border-blue-100">
                          🏡 Solicitud de Adopción
                        </span>
                        <span className="font-mono text-[9px] text-gray-400">ID: {ad.id}</span>
                      </div>
                      <h4 className="font-bold text-gray-950 text-sm">Postulación para adoptar a: <span className="text-blue-600">{ad.petName}</span></h4>
                      <p className="text-xs text-gray-500">Fecha: {ad.createdAt}</p>
                      {ad.note && (
                        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mt-2 leading-relaxed border border-amber-100">
                          <strong>💡 Nota Co-Dirección:</strong> {ad.note}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold shadow-xs uppercase tracking-wider ${
                        ad.status === 'Aprobado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ad.status === 'Rechazado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ad.status}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Operations / Vaccine appointments */}
                {appointments.map((appt, idx) => (
                  <div key={appt.id} className="border border-gray-150 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-100 transition-all">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">
                          ⚕️ Turno de Campaña
                        </span>
                        <span className="font-mono text-[9px] text-gray-400">ID: {appt.id}</span>
                      </div>
                      <h4 className="font-bold text-gray-950 text-sm">Inscripción de: <span className="text-indigo-600">{appt.petName}</span> ({appt.petType})</h4>
                      <p className="text-xs text-gray-500">Operativo: {appt.campaignDate}</p>
                      {appt.note && (
                        <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg p-2 mt-2 leading-relaxed border border-emerald-100">
                          <strong>💡 Recomendaciones Clínicas:</strong> {appt.note}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold shadow-xs uppercase tracking-wider ${
                        appt.status === 'Aprobado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : appt.status === 'Rechazado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
