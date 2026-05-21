import React, { useState } from 'react';
import { Calendar, Scissors, ClipboardList, ShieldAlert, Heart, ArrowRight, CheckCircle2, Award, Zap, Coins, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Pet, CastrationCampaign } from '../types';

interface HomeTabProps {
  campaigns: CastrationCampaign[];
  pets: Pet[];
  onOpenCastration: (campaign: CastrationCampaign) => void;
  onOpenLookup: () => void;
  onSelectPet: (pet: Pet) => void;
  onDonateOrPurchase: (campaignId: string, amount: number) => void;
  setActiveTab: (tab: string) => void;
}

export default function HomeTab({
  campaigns,
  pets,
  onOpenCastration,
  onOpenLookup,
  onSelectPet,
  onDonateOrPurchase,
  setActiveTab
}: HomeTabProps) {
  const [selectedDonationCamp, setSelectedDonationCamp] = useState<string | null>(null);
  const [customDonationAmount, setCustomDonationAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedStoreItem, setSelectedStoreItem] = useState<{ name: string; price: number } | null>(null);

  // Show first 3 active pets on home screen
  const featuredPets = pets.filter(p => p.status === 'En adopción').slice(0, 3);

  const handleSimulatedPayment = async (campaignId: string, amount: number) => {
    setIsProcessingPayment(true);
    // Simulate slight processing latency for premium feel
    setTimeout(() => {
      onDonateOrPurchase(campaignId, amount);
      setIsProcessingPayment(false);
      setSelectedDonationCamp(null);
      setSelectedStoreItem(null);
      setCustomDonationAmount('');
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn text-left">      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-blue-50/40 rounded-3xl p-6 md:p-12 border border-blue-100 flex flex-col md:flex-row items-center gap-8 shadow-xs">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200/25 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl -z-10" />

        <div className="flex-1 space-y-5 text-left z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 animate-fadeIn">
            <Heart className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
            No compres, adoptá uno sin casa 💙
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-950 font-sans tracking-tight leading-tight">
            Cambiá la historia de un compañero de <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">Cuatro Patitas Fighiera</span>
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xl">
            <strong>No contamos con refugio físico.</strong> Funcionamos gracias a una hermosa red solidaria de hogares de tránsito, traslados, cuidados y colaboradores en <strong>Fighiera, Rosario (Santa Fe)</strong> 🇦🇷. ¡Transitá 🏡, trasladá 🚗, ayudá 🙌, adoptá ❤️!
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('adopt')}
              className="px-6 py-3 font-semibold text-sm text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 tracking-wide rounded-xl shadow-md shadow-blue-250 transition-all flex items-center gap-2 group cursor-pointer border-0 outline-none"
            >
              Ver Mascotas en Adopción
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onOpenLookup}
              className="px-5 py-3 font-semibold text-sm text-gray-750 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all cursor-pointer outline-none"
            >
              Consultar Mi Solicitud / DNI
            </button>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md md:max-w-none">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800"
              alt="Cuatro Patitas"
              className="rounded-2xl shadow-lg border border-white/50 w-full object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-4 -left-4 bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-md flex items-center gap-3">
              <span className="text-2xl">🏡</span>
              <div>
                <span className="block font-bold text-gray-950 text-sm">Red de Tránsitos</span>
                <span className="text-[10px] text-gray-500 font-medium font-mono">Fighiera, Santa Fe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAMPAIGNS & EVENTS GRID ("CARTELES DE EVENTOS") */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-950 tracking-tight">📅 Cartelera de Campañas Activas y Eventos</h2>
          <p className="text-gray-500 text-xs mt-1">Sumate a nuestros operativos de salud animal gratuitos o colaborá con las colectas solidarias</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {campaigns.map((camp) => {
            const isCastration = camp.type === 'castration';
            const isVaccination = camp.type === 'vaccination';
            const isFundraiser = camp.type === 'fundraiser';

            // Percentage of fundraising
            const percent = isFundraiser && camp.goalAmount && camp.collectedAmount
              ? Math.min(Math.round((camp.collectedAmount / camp.goalAmount) * 100), 100)
              : 0;

            return (
              <div
                key={camp.id}
                className={`flex flex-col justify-between p-6 rounded-3xl border shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                  isFundraiser
                    ? 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white border-emerald-800'
                    : isVaccination
                    ? 'bg-gradient-to-br from-orange-950 via-amber-950 to-slate-900 text-white border-orange-900'
                    : 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border-indigo-900'
                }`}
              >
                {/* Decorative Pattern Background Accent */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  {/* Badge Row */}
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                    isFundraiser
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/20'
                      : isVaccination
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/20'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/20'
                  }`}>
                    {isFundraiser && <Coins className="h-3 w-3" />}
                    {isVaccination && <Calendar className="h-3 w-3" />}
                    {isCastration && <Scissors className="h-3 w-3" />}
                    {isFundraiser ? 'Venta & Colecta Recaudación' : isVaccination ? 'Campaña Vacunación' : 'Campaña Castración'}
                  </span>

                  <h3 className="text-xl font-bold tracking-tight leading-snug">{camp.title}</h3>
                  <p className={`text-xs leading-relaxed ${
                    isFundraiser ? 'text-emerald-250' : isVaccination ? 'text-amber-250' : 'text-indigo-250'
                  }`}>
                    {camp.description}
                  </p>

                  <div className="space-y-2 text-xs pt-2 font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold font-mono uppercase text-[9px] ${
                        isFundraiser ? 'bg-emerald-800 text-emerald-300' : isVaccination ? 'bg-amber-800 text-amber-300' : 'bg-indigo-800 text-indigo-300'
                      }`}>📅 Fecha</span>
                      <span>{camp.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold font-mono uppercase text-[9px] ${
                        isFundraiser ? 'bg-emerald-800 text-emerald-300' : isVaccination ? 'bg-amber-800 text-amber-300' : 'bg-indigo-800 text-indigo-300'
                      }`}>📍 Lugar</span>
                      <span className="truncate">{camp.lugar}</span>
                    </div>
                  </div>
                </div>

                {/* Sub UI / Input / Stats Segment */}
                <div className="mt-6 pt-4 border-t border-white/10 relative z-10 text-left">
                  {isFundraiser && camp.goalAmount && camp.collectedAmount && (
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-baseline text-xs mb-1.5 font-bold">
                          <span className="text-emerald-300 uppercase tracking-wide text-[10px]">Recaudado en directo</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold font-mono text-gray-300 mt-2">
                          <span>${camp.collectedAmount.toLocaleString()}</span>
                          <span className="text-emerald-300">Meta: ${camp.goalAmount.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Store items to buy / donate */}
                      <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-2">
                        <span className="text-[9px] text-emerald-300 font-bold block uppercase tracking-wider">Tienda Solidaria</span>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          <button
                            onClick={() => setSelectedStoreItem({ name: 'Calendario Solidario 2026', price: 3500 })}
                            className="flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-emerald-400 hover:text-gray-950 transition-all font-semibold outline-none text-left"
                          >
                            <span className="flex items-center gap-1.5">
                              <ShoppingBag className="h-3 w-3" /> Calendario 2026
                            </span>
                            <span>$3,500</span>
                          </button>
                          <button
                            onClick={() => setSelectedStoreItem({ name: 'Remera Oficial Cuatro Patitas', price: 9000 })}
                            className="flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-emerald-400 hover:text-gray-950 transition-all font-semibold outline-none text-left"
                          >
                            <span className="flex items-center gap-1.5">
                              <ShoppingBag className="h-3 w-3" /> Remera Oficial
                            </span>
                            <span>$9,000</span>
                          </button>
                        </div>

                        <div className="h-[1px] bg-white/10 my-2" />

                        {/* Direct Contribution button */}
                        <button
                          onClick={() => setSelectedDonationCamp(camp.id)}
                          className="w-full py-1.5 text-[11px] font-bold text-center text-white bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg hover:text-rose-200 transition-all cursor-pointer border border-emerald-400/20"
                        >
                          💸 Hacer Donación Libre
                        </button>
                      </div>
                    </div>
                  )}

                  {!isFundraiser && camp.maxSlots && camp.totalRegistered !== undefined && (
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Cupos Confirmados</span>
                        <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
                          {camp.maxSlots - camp.totalRegistered} <span className="text-xs text-white/70 font-normal">libres / {camp.maxSlots}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenCastration(camp)}
                        className="px-4 py-2.5 text-xs font-bold text-gray-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/10 cursor-pointer border-0 outline-none"
                      >
                        Reservar Turno
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SIMULATED PAYMENT DIALOG / GATEWAY ACCENTS */}
      {selectedDonationCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-150 shadow-2xl space-y-4">
            <h4 className="font-extrabold text-gray-950 text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" />
              Donativo Directo
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Ingresa el monto de pesos argentinos que deseas simular para contribuir a nuestro refugio.
            </p>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 font-bold text-sm">
                $
              </span>
              <input
                type="number"
                required
                value={customDonationAmount}
                onChange={(e) => setCustomDonationAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-sm font-bold bg-gray-50 border border-gray-200 focus:bg-white text-gray-950 rounded-xl focus:border-emerald-500 focus:outline-none transition-all placeholder:text-gray-400"
                placeholder="2000"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDonationCamp(null)}
                className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl outline-none"
              >
                Cancelar
              </button>
              <button
                disabled={isProcessingPayment || !customDonationAmount}
                onClick={() => handleSimulatedPayment(selectedDonationCamp, parseFloat(customDonationAmount))}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl outline-none disabled:opacity-50"
              >
                {isProcessingPayment ? 'Cargando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedStoreItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-150 shadow-2xl space-y-4">
            <h4 className="font-extrabold text-gray-950 text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-500" />
              Compra Solidaria
            </h4>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left">
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Artículo</span>
              <span className="font-bold text-gray-950 text-sm">{selectedStoreItem.name}</span>
              <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Precio Final</span>
                <span className="font-extrabold text-emerald-600 text-lg">${selectedStoreItem.price.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              La transacción se realiza mediante pasarela bancaria simulada segura de Cuatro Patitas. Los artículos comprados se retiran en sede de la campaña indicando tu email.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedStoreItem(null)}
                className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl outline-none"
              >
                Cancelar
              </button>
              <button
                disabled={isProcessingPayment}
                onClick={() => handleSimulatedPayment('camp_3', selectedStoreItem.price)}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl outline-none"
              >
                {isProcessingPayment ? 'Pagando...' : 'Simular Pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SOLIDARITY CORNER: ADOPT, SPONSOR, OR FOSTER PROMOCARD */}
      <section className="bg-gradient-to-br from-blue-700 via-indigo-750 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-lg text-left relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="text-[10px] uppercase font-mono bg-white/20 px-3 py-1 rounded-full text-white tracking-widest font-bold">
            Adoptar • Apadrinar • Transitar
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Nuestros rescatados ahora tienen su propia sección de solidaridad 🐾
          </h2>
          <p className="text-blue-150 text-xs md:text-sm leading-relaxed">
            Hemos trasladado todos los perfiles de animales a una pestaña unificada. Algunos de nuestros rescatados no están disponibles para adopción (como los senior o enfermos graves), pero ahora podés <strong>Apadrinarlos</strong> con aportes mensuales, o brindarles un <strong>Hogar de Tránsito</strong> temporal para su recuperación.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <span className="text-xl">🏡</span>
              <h4 className="font-extrabold text-xs mt-1 text-white">Adopción Responsable</h4>
              <p className="text-[10px] text-blue-150 leading-relaxed mt-0.5">Sumá un miembro definitivo a tu familia firmando el compromiso.</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <span className="text-xl">💖</span>
              <h4 className="font-extrabold text-xs mt-1 text-white">Apadrinaje Solidario</h4>
              <p className="text-[10px] text-blue-150 leading-relaxed mt-0.5">Asumí un aporte mensual para los gastos clínicos y alimento de uno.</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <span className="text-xl">🤝</span>
              <h4 className="font-extrabold text-xs mt-1 text-white">Tránsito Temporal</h4>
              <p className="text-[10px] text-blue-150 leading-relaxed mt-0.5">Hospedá transitoriamente a un rehabilitando hasta que esté fuerte.</p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('adopt')}
              className="px-6 py-2.5 bg-white text-indigo-900 hover:bg-gray-50 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              Ver Catálogo de Rescatados ({pets.length})
              <ArrowRight className="h-4 w-4 text-indigo-900" />
            </button>
            <button
              onClick={() => setActiveTab('adopt')}
              className="px-5 py-2.5 bg-blue-600/30 hover:bg-blue-600/40 text-xs font-bold rounded-xl transition-all border border-white/10 cursor-pointer"
            >
              Ver Opciones de Apadrinaje/Tránsito
            </button>
          </div>
        </div>
      </section>

      {/* 5. VALUE ADOPTION INFOGRAPHIC */}
      <section className="bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8">
        <h2 className="text-2xl font-extrabold text-gray-950 text-center tracking-tight mb-8">
          ¿Por qué adoptar en <span className="text-blue-600">Cuatro Patitas Fighiera</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 w-fit">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-955 text-sm">Control Sanitario Completo</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Todos nuestros rescatados se entregan vacunados, desparasitados interna y externamente, y con su libreta de control veterinario al día.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 w-fit">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-955 text-sm">Castración 100% Garantizada</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Sin excepciones. Si adoptas un cachorro de menos de 6 meses, te entregamos un bono digital con turno reservado para su castración gratis.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 w-fit">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-955 text-sm">Asesoría de Adaptación Permanente</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Te acompañamos en el proceso de inserción del animal en tu hogar de forma personalizada y dispones de nuestro Chat Clínico Veterinario IA.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
