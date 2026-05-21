import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Shield, Phone, Scissors, Check, Heart, AlertCircle, FileText } from 'lucide-react';
import { Pet, CastrationCampaign, CastrationAppointment, AdoptionApplication, UserProfile } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Turn Registration (Castration) Modal
interface CastrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CastrationCampaign;
  userProfile?: UserProfile | null;
  onSubmit: (data: Omit<CastrationAppointment, 'id' | 'createdAt' | 'status'>) => void;
}

export function CastrationFormModal({ isOpen, onClose, campaign, userProfile, onSubmit }: CastrationModalProps) {
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerDni, setOwnerDni] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'Perro' | 'Gato'>('Perro');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');

  // Auto pre-populate user details if logged in
  useEffect(() => {
    if (isOpen && userProfile) {
      setOwnerName(userProfile.name || '');
      setOwnerEmail(userProfile.email || '');
      setOwnerDni(userProfile.dni || '');
      setOwnerPhone(userProfile.phone || '');
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const isVaccination = campaign.type === 'vaccination';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !ownerEmail || !ownerDni || !ownerPhone || !petName) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    onSubmit({
      campaignId: campaign.id,
      campaignDate: campaign.fecha,
      ownerName,
      ownerEmail,
      ownerDni,
      ownerPhone,
      petName,
      petType,
      petAge,
      petWeight: petWeight ? `${petWeight} kg` : 'Desconocido'
    });
    // Reset inputs
    setOwnerName('');
    setOwnerEmail('');
    setOwnerDni('');
    setOwnerPhone('');
    setPetName('');
    setPetAge('');
    setPetWeight('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-slideUp">
        <div className={`text-white p-6 relative ${isVaccination ? 'bg-orange-600' : 'bg-blue-600'}`}>
          <button onClick={onClose} className="absolute right-4 top-4 hover:bg-white/10 p-2 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 rounded-2xl">
              {isVaccination ? (
                <Calendar className="h-6 w-6 text-white" />
              ) : (
                <Scissors className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">
                {isVaccination ? 'Inscripción a Vacunación Gratis' : 'Inscripción a Castración Gratis'}
              </h3>
              <p className="text-white/80 text-xs">Campaña: {campaign.fecha} - {campaign.lugar}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Owner details */}
          <div className="border-b border-gray-100 pb-3 text-left">
            <h4 className="font-bold text-gray-800 text-xs tracking-wider uppercase mb-3 text-left">Datos del Responsable</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label className="text-xs text-gray-500 font-medium block text-left">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block text-left">DNI (Sin puntos) *</label>
                <input
                  type="text"
                  required
                  value={ownerDni}
                  onChange={(e) => setOwnerDni(e.target.value.replace(/\D/g, ''))}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Ej: 38445566"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block text-left">Email *</label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Ej: responsable@correo.com"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block text-left">Teléfono / Celular *</label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Ej: 1123456789"
                />
              </div>
            </div>
          </div>

          {/* Pet details */}
          <div className="text-left">
            <h4 className="font-bold text-gray-800 text-xs tracking-wider uppercase mb-3 text-left">Datos de la Mascota</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 font-medium block text-left">Nombre de la Mascota *</label>
                <input
                  type="text"
                  required
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Firulais"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1 text-left">Especie *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPetType('Perro')}
                    className={`flex-1 py-2 text-center text-sm rounded-xl font-medium border transition-all ${
                      petType === 'Perro'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🐶 Perro
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetType('Gato')}
                    className={`flex-1 py-2 text-center text-sm rounded-xl font-medium border transition-all ${
                      petType === 'Gato'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🐱 Gato
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block text-left">Edad Estimada *</label>
                <input
                  type="text"
                  required
                  value={petAge}
                  onChange={(e) => setPetAge(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Ej: 1 año, 8 meses"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 font-medium block text-left">Peso Estimado (KG, opcional para dosis anestésica / vacunas)</label>
                <input
                  type="number"
                  value={petWeight}
                  onChange={(e) => setPetWeight(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Ej: 12"
                />
              </div>
            </div>
          </div>

          {/* Guidelines info */}
          <div className={`p-3.5 border rounded-2xl flex gap-3 text-xs text-left ${isVaccination ? 'bg-orange-50 border-orange-100 text-orange-850' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
            <AlertCircle className={`h-5 w-5 shrink-0 ${isVaccination ? 'text-orange-600' : 'text-blue-600'}`} />
            <p className="leading-relaxed">
              <strong>Importante:</strong> Las campañas están destinadas a animales rescatados o de familias vulnerables. {isVaccination ? 'Asistir en el horario indicado. No hace falta ayuno.' : 'La mascota debe asistir con 12 hs de ayuno absoluto (sólidos y líquidos) y manta para el postoperatorio.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-sm font-medium text-white shadow-md rounded-xl transition-all ${isVaccination ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
              Confirmar Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




// Adoption Form Wizard Modal
interface AdoptionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet | null;
  userProfile?: UserProfile | null;
  onSubmit: (data: Omit<AdoptionApplication, 'id' | 'createdAt' | 'status' | 'petId' | 'petName'>) => void;
}

export function AdoptionWizardModal({ isOpen, onClose, pet, userProfile, onSubmit }: AdoptionWizardProps) {
  const [step, setStep] = useState(1);
  const [adopterName, setAdopterName] = useState('');
  const [adopterEmail, setAdopterEmail] = useState('');
  const [adopterDni, setAdopterDni] = useState('');
  const [adopterPhone, setAdopterPhone] = useState('');
  const [solidarityMode, setSolidarityMode] = useState<'adopt' | 'foster' | 'sponsor'>('adopt');
  
  // Specific sponsor settings
  const [sponsorAmount, setSponsorAmount] = useState('2000');
  const [paymentMethod, setPaymentMethod] = useState('Transferencia Bancaria');

  // Auto pre-populate user details if logged in & solidarity program from storage
  useEffect(() => {
    if (isOpen) {
      const mode = (localStorage.getItem('selected_solidarity_program') || 'adopt') as 'adopt' | 'foster' | 'sponsor';
      setSolidarityMode(mode);
      setStep(1);
      
      if (userProfile) {
        setAdopterName(userProfile.name || '');
        setAdopterEmail(userProfile.email || '');
        setAdopterDni(userProfile.dni || '');
        setAdopterPhone(userProfile.phone || '');
      }
    }
  }, [isOpen, userProfile]);
  
  // Custom answers
  const [homeType, setHomeType] = useState('Casa');
  const [otherPets, setOtherPets] = useState('No');
  const [yardSecure, setYardSecure] = useState('Sí');
  const [hoursAlone, setHoursAlone] = useState('4');
  const [agreement, setAgreement] = useState(false);

  if (!isOpen || !pet) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!adopterName || !adopterEmail || !adopterDni || !adopterPhone) {
        alert('Por favor, completa tus datos de contacto obligatorios.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) {
      alert('Debes firmar el compromiso para continuar.');
      return;
    }

    const answersObj: any = {
      homeType: solidarityMode === 'sponsor' ? 'N/A - Apadrinamiento' : homeType,
      otherPets: solidarityMode === 'sponsor' ? 'N/A' : otherPets,
      yardSecure: solidarityMode === 'sponsor' ? 'N/A' : yardSecure,
      hoursAlone: solidarityMode === 'sponsor' ? '0' : hoursAlone,
      agreement,
      solidarityType: solidarityMode,
    };

    if (solidarityMode === 'sponsor') {
      answersObj.sponsorAmount = `$${Number(sponsorAmount).toLocaleString()}`;
      answersObj.paymentMethod = paymentMethod;
    }

    onSubmit({
      adopterName,
      adopterEmail,
      adopterDni,
      adopterPhone,
      answers: answersObj
    });

    // Reset details
    setStep(1);
    setAdopterName('');
    setAdopterEmail('');
    setAdopterDni('');
    setAdopterPhone('');
    setAgreement(false);
    onClose();
  };

  // Human read titles for wizard types
  const getBannerTitle = () => {
    if (solidarityMode === 'foster') return 'Hogar de Tránsito Temporal';
    if (solidarityMode === 'sponsor') return 'Apadrinamiento Solidario';
    return 'Solicitud de Adopción Definitiva';
  };

  const getPetActionText = () => {
    if (solidarityMode === 'foster') return `Tránsito para ${pet.name}`;
    if (solidarityMode === 'sponsor') return `Apadrinar a ${pet.name}`;
    return `Adoptar a ${pet.name}`;
  };

  const getThemeGradient = () => {
    if (solidarityMode === 'foster') return 'from-teal-700 to-emerald-500';
    if (solidarityMode === 'sponsor') return 'from-pink-700 to-rose-500';
    return 'from-blue-700 to-cyan-500';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-slideUp">
        {/* Banner with Pet Info */}
        <div className={`bg-gradient-to-r ${getThemeGradient()} text-white p-6 relative`}>
          <button onClick={onClose} className="absolute right-4 top-4 hover:bg-white/10 p-2 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <img src={pet.photo} alt={pet.name} className="h-14 w-14 object-cover rounded-2xl border-2 border-white/20" />
            <div>
              <span className="text-white/80 text-xs font-semibold uppercase tracking-widest bg-white/15 px-2 py-0.5 rounded-md">
                {getBannerTitle()}
              </span>
              <h3 className="font-bold text-xl mt-0.5">{getPetActionText()}</h3>
            </div>
          </div>

          {/* Navigation Steps header */}
          <div className="flex gap-2 mt-5">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  step >= num ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-left">
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className={`flex h-5 w-5 bg-blue-50 text-blue-600 items-center justify-center text-xs font-bold rounded-full`}>1</span>
                <h4 className="font-bold text-gray-800 text-sm">Tus Datos de Contacto</h4>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={adopterName}
                  onChange={(e) => setAdopterName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej: Ana María Martínez"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">DNI (Sin puntos) *</label>
                  <input
                    type="text"
                    required
                    value={adopterDni}
                    onChange={(e) => setAdopterDni(e.target.value.replace(/\D/g, ''))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ej: 32445566"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Teléfono de contacto *</label>
                  <input
                    type="tel"
                    required
                    value={adopterPhone}
                    onChange={(e) => setAdopterPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ej: 1166778899"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Email *</label>
                <input
                  type="email"
                  required
                  value={adopterEmail}
                  onChange={(e) => setAdopterEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej: ana@correo.com"
                />
              </div>
            </div>
          )}

          {step === 2 && solidarityMode !== 'sponsor' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="flex h-5 w-5 bg-blue-50 text-blue-600 items-center justify-center text-xs font-bold rounded-full">2</span>
                <h4 className="font-bold text-gray-800 text-sm">Entorno y Tipo de Vivienda</h4>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Tipo de Vivienda *</label>
                <select
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white text-gray-900"
                >
                  <option value="Casa con patio grande">Casa con patio grande</option>
                  <option value="Casa con patio chico">Casa con patio chico</option>
                  <option value="Departamento amplio">Departamento amplio</option>
                  <option value="Departamento chico / Monoambiente">Departamento chico / Monoambiente</option>
                  <option value="PH / Quinta / Finca">PH / Quinta / Finca</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-900">
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">¿Si hay patio, es seguro? *</label>
                  <select
                    value={yardSecure}
                    onChange={(e) => setYardSecure(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white font-medium"
                  >
                    <option value="Sí, totalmente tapialado/cerrado">Sí (Cercos altos y seguros)</option>
                    <option value="No, está abierto / baja altura">No (Abierto o medianera muy baja)</option>
                    <option value="No aplicable (edificio con balcón/red)">Balcón con red de seguridad</option>
                    <option value="No aplicable (sin patio/balcón)">Sin patio ni balcón</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">¿Convive con otros animales? *</label>
                  <select
                    value={otherPets}
                    onChange={(e) => setOtherPets(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white"
                  >
                    <option value="No">No, sería la única mascota</option>
                    <option value="Sí, perros tranquilos">Sí, perros tranquilos</option>
                    <option value="Sí, perros activos">Sí, perros muy activos</option>
                    <option value="Sí, gatos sociables">Sí, gatos sociables</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">¿Cuántas horas aproximadas pasará sola la mascota al día? *</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  required
                  value={hoursAlone}
                  onChange={(e) => setHoursAlone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej: 4"
                />
              </div>
            </div>
          )}

          {step === 2 && solidarityMode === 'sponsor' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="flex h-5 w-5 bg-pink-50 text-pink-600 items-center justify-center text-xs font-bold rounded-full">2</span>
                <h4 className="font-bold text-gray-800 text-sm">Configuración del Aporte Mensual</h4>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Cuota Mensual Deseada (en Pesos ARS) *</label>
                <select
                  value={sponsorAmount}
                  onChange={(e) => setSponsorAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white text-gray-900 font-bold"
                >
                  <option value="1000">$1.000 / mes (Colaborador Bronce)</option>
                  <option value="2000">$2.000 / mes (Colaborador Plata)</option>
                  <option value="5000">$5.000 / mes (Colaborador Oro)</option>
                  <option value="10000">$10.000 / mes (Padrino Platino)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Canal de Pago Simulado de Preferencia *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white text-gray-900"
                >
                  <option value="Transferencia Bancaria">Transferencia Bancaria directa (CBU)</option>
                  <option value="Mercado Pago">Mercado Pago (Débito Automático)</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito (Visa / Mastercard)</option>
                </select>
              </div>

              <div className="bg-pink-50/50 p-3.5 border border-pink-100 rounded-xl text-xs text-pink-900 leading-relaxed">
                ℹ️ <strong>Nota Solidaria:</strong> El apadrinamiento es un compromiso simbólico. La administración de Cuatro Patitas te enviará mensualmente un link de autocompletado y un reporte veterinario de {pet.name} contándote sobre sus avances y estado de salud.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="flex h-5 w-5 bg-blue-50 text-blue-600 items-center justify-center text-xs font-bold rounded-full">3</span>
                <h4 className="font-bold text-gray-800 text-sm">Firma de Compromiso Solidario</h4>
              </div>

              {solidarityMode === 'adopt' && (
                <div className="space-y-3 bg-gray-50 p-4 border border-gray-100 rounded-2xl text-xs text-gray-600 leading-relaxed">
                  <p className="font-bold text-gray-800 mb-1 font-sans">🌟 Al postularte para adoptar, te comprometes a:</p>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Brindarle alimento premium, agua fresca constante y atención veterinaria periódica (vacunas preventivas, desparasitación).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Darle refugio seguro bajo techo y nunca dejarla amarrada, encadenada o sola a la intemperie en patios ni en la vía pública.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Tener paciencia y respeto por su proceso de adaptación e integración inicial al nuevo hogar.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Permitir el seguimiento digital o domiciliario por los coordinadores de Cuatro Patitas.</span>
                  </div>
                </div>
              )}

              {solidarityMode === 'foster' && (
                <div className="space-y-3 bg-emerald-50/50 p-4 border border-emerald-100 rounded-2xl text-xs text-gray-600 leading-relaxed">
                  <p className="font-bold text-emerald-950 mb-1 font-sans">🤝 Compromiso de Hogar de Tránsito Responsable:</p>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Resguardar provisoriamente a {pet.name} hasta que esté listo para adopción o culminada su recuperación médica.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Administrar correctamente los medicamentos y alimentos especiales provistos íntegramente por Cuatro Patitas.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Traer al animal a la sede o posibilitar su traslado para los controles sanitarios fijados por la ONG.</span>
                  </div>
                </div>
              )}

              {solidarityMode === 'sponsor' && (
                <div className="space-y-3 bg-pink-50/40 p-4 border border-pink-100 rounded-2xl text-xs text-gray-650 leading-relaxed">
                  <p className="font-bold text-pink-950 mb-1 font-sans">💖 Compromiso de Padrino / Madrina:</p>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                    <span>Asumir simbólicamente la donación regular mensual fijada para co-financiar el sustento de {pet.name}.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                    <span>Recibir y responder las notificaciones y reportes médicos y afectivos que te acerquemos mensualmente.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                    <span>Disfrutar de visitarlo bajo agenda previa en el predio o participar de los paseos voluntarios.</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 mt-4 border border-blue-100 bg-blue-50/40 p-3 rounded-2xl animate-pulse">
                <input
                  type="checkbox"
                  id="agree-check"
                  checked={agreement}
                  onChange={(e) => setAgreement(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="agree-check" className="text-gray-700 text-xs font-bold cursor-pointer leading-tight">
                  {solidarityMode === 'adopt' && `Acepto los términos de Adoptante Responsable y autorizo a Cuatro Patitas para verificar mis datos para garantizar el bienestar de ${pet.name}. *`}
                  {solidarityMode === 'foster' && `Acepto los términos de Hogar de Tránsito Responsable y me comprometo a cuidar adecuadamente de ${pet.name} de forma temporal. *`}
                  {solidarityMode === 'sponsor' && `Acepto con agrado incorporarme como Padrino/Madrina voluntario activo de ${pet.name} con un aporte mensual estimado de $${Number(sponsorAmount).toLocaleString()}. *`}
                </label>
              </div>
            </div>
          )}

          {/* Stepper controls */}
          <div className="flex justify-between pt-4 border-t border-gray-100">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 rounded-xl"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl"
              >
                Atrás
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 rounded-xl transition-all"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 rounded-xl transition-all"
              >
                Enviar Compromiso
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// DNI Search / Lookup Modal (Mis Trámites / Mis Solicitudes)
interface DniModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: CastrationAppointment[];
  adoptions: AdoptionApplication[];
}

export function DniLookupModal({ isOpen, onClose, appointments, adoptions }: DniModalProps) {
  const [dni, setDni] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedAppointments, setMatchedAppointments] = useState<CastrationAppointment[]>([]);
  const [matchedAdoptions, setMatchedAdoptions] = useState<AdoptionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni) return;

    const normalizedDni = dni.trim().replace(/\D/g, '');
    setIsLoading(true);

    try {
      if (appointments.length > 0 || adoptions.length > 0) {
        // Admin preloaded filter fallback 
        const foundAppts = appointments.filter((app) => app.ownerDni.replace(/\D/g, '') === normalizedDni);
        const foundAdops = adoptions.filter((ad) => ad.adopterDni.replace(/\D/g, '') === normalizedDni);
        setMatchedAppointments(foundAppts);
        setMatchedAdoptions(foundAdops);
      } else {
        // Secure zero-trust query filtering by DNI
        const apptsQuery = query(collection(db, "appointments"), where("ownerDni", "==", normalizedDni));
        const apptSnap = await getDocs(apptsQuery);
        const apptsList = apptSnap.docs.map(doc => doc.data() as CastrationAppointment);

        const adopsQuery = query(collection(db, "adoptions"), where("adopterDni", "==", normalizedDni));
        const adopsSnap = await getDocs(adopsQuery);
        const adopsList = adopsSnap.docs.map(doc => doc.data() as AdoptionApplication);

        setMatchedAppointments(apptsList);
        setMatchedAdoptions(adopsList);
      }
      setHasSearched(true);
    } catch (error) {
      console.error("DNI Lookup Firestore error, fallback to offline filter: ", error);
      const foundAppts = appointments.filter((app) => app.ownerDni.replace(/\D/g, '') === normalizedDni);
      const foundAdops = adoptions.filter((ad) => ad.adopterDni.replace(/\D/g, '') === normalizedDni);
      setMatchedAppointments(foundAppts);
      setMatchedAdoptions(foundAdops);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors = (status: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
    switch (status) {
      case 'Aprobado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rechazado':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-xl overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 relative">
          <button
            onClick={() => {
              onClose();
              setDni('');
              setHasSearched(false);
            }}
            className="absolute right-4 top-4 hover:bg-white/10 p-2 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 rounded-2xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Consulta de Solicitudes y Turnos</h3>
              <p className="text-white/80 text-xs">Entérate del estado de tus solicitudes con tu número de DNI</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Query input DNI form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              required
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
              placeholder="Ingresa tu DNI (sin puntos ni espacios)"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-150 transition-all disabled:bg-gray-400"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {/* Results section */}
          {hasSearched && (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 animate-fadeIn">
              <h4 className="font-bold text-xs text-gray-500 uppercase tracking-widest">Resultados de la Búsqueda</h4>

              {matchedAppointments.length === 0 && matchedAdoptions.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 border border-gray-100 rounded-2xl">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm font-semibold text-gray-700 mt-2">Sin trámites registrados</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">No encontramos ninguna solicitud de adopción ni cita de castración vinculada al DNI: {dni}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Appointments matching DNI */}
                  {matchedAppointments.map((appt) => (
                    <div key={appt.id} className="border border-gray-150 bg-white p-4 rounded-2xl shadow-xs relative">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Cita Castración</span>
                          <h5 className="font-bold text-gray-800 text-sm mt-1.5">Mascota: {appt.petName} ({appt.petType})</h5>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Fecha Campaña: {appt.campaignDate}
                          </p>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider shrink-0 ${statusColors(appt.status)}`}>
                          {appt.status}
                        </span>
                      </div>

                      {appt.note && (
                        <div className="mt-3 p-2.5 bg-gray-50 rounded-xl text-xs text-gray-600 border-l-2 border-indigo-400">
                          <span className="font-bold block text-gray-700 mb-0.5">Nota de Coordinación:</span>
                          {appt.note}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Adoptions matching DNI */}
                  {matchedAdoptions.map((adop) => (
                    <div key={adop.id} className="border border-gray-150 bg-white p-4 rounded-2xl shadow-xs relative">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Adopción Responsable</span>
                          <h5 className="font-bold text-gray-800 text-sm mt-1.5">Postulación para {adop.petName}</h5>
                          <p className="text-xs text-gray-500 mt-0.5">Solicitante: {adop.adopterName}</p>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider shrink-0 ${statusColors(adop.status)}`}>
                          {adop.status}
                        </span>
                      </div>

                      {adop.note && (
                        <div className="mt-3 p-2.5 bg-gray-50 rounded-xl text-xs text-gray-600 border-l-2 border-teal-500">
                          <span className="font-bold block text-gray-700 mb-0.5">Nota de Devolución del Refugio:</span>
                          {adop.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Guidelines disclaimer info */}
          {!hasSearched && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3 text-indigo-800 text-xs">
              <Shield className="h-5 w-5 text-indigo-600 shrink-0" />
              <p className="leading-relaxed">
                <strong>Verificación en tiempo real:</strong> Los voluntarios actualizan continuamente el estatus de las postulaciones. Al ser aprobados para adopción, nos pondremos en contacto para coordinar la entrevista final domiciliaria.
              </p>
            </div>
          )}

          {/* Close button */}
          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              onClick={() => {
                onClose();
                setDni('');
                setHasSearched(false);
              }}
              className="px-4 py-2 font-medium text-xs text-gray-500 hover:bg-gray-50 rounded-xl"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
