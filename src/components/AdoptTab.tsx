import React, { useState } from 'react';
import { Search, Filter, PawPrint, Heart, BadgeCheck, AlertCircle, X, Check } from 'lucide-react';
import { Pet } from '../types';

interface AdoptTabProps {
  pets: Pet[];
  onOpenAdoptionWizard: (pet: Pet) => void;
  selectedPetExternal: Pet | null;
  setSelectedPetExternal: (pet: Pet | null) => void;
}

export default function AdoptTab({
  pets,
  onOpenAdoptionWizard,
  selectedPetExternal,
  setSelectedPetExternal
}: AdoptTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'Perro' | 'Gato'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Macho' | 'Hembra'>('all');
  const [sizeFilter, setSizeFilter] = useState<'all' | 'Chico' | 'Mediano' | 'Grande'>('all');
  const [programFilter, setProgramFilter] = useState<'all' | 'adopt' | 'foster' | 'sponsor'>('all');

  const handleSelectPet = (pet: Pet) => {
    setSelectedPetExternal(pet);
  };

  // Filter pet catalog
  const filteredPets = pets.filter((pet) => {
    // Only show adoptable or recovering pets in adoption explorer
    if (pet.status === 'Adoptado') return false;

    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.description.toLowerCase().includes(searchTerm.toLowerCase());

    const isDog = pet.breed.toLowerCase().includes('dog') || pet.breed.toLowerCase().includes('mestizo') || pet.breed.toLowerCase().includes('ovejero') || pet.breed.toLowerCase().includes('labrador') || pet.breed.toLowerCase().includes('boxer') || pet.breed.toLowerCase().includes('caniche');
    const isCat = pet.breed.toLowerCase().includes('gato') || pet.breed.toLowerCase().includes('gat') || pet.breed.toLowerCase().includes('atigrada');

    // Species heuristics
    let matchesSpecies = true;
    if (speciesFilter === 'Perro') {
      matchesSpecies = !isCat; // Simple matching rule
    } else if (speciesFilter === 'Gato') {
      matchesSpecies = isCat || pet.name === 'Luna' || pet.name === 'Cleo';
    }

    const matchesGender = genderFilter === 'all' || pet.gender === genderFilter;
    const matchesSize = sizeFilter === 'all' || pet.size === sizeFilter;

    // Filter by Solidarity Programs availability
    let matchesProgram = true;
    if (programFilter === 'adopt') {
      matchesProgram = pet.allowAdoption !== false;
    } else if (programFilter === 'foster') {
      matchesProgram = pet.allowFoster === true;
    } else if (programFilter === 'sponsor') {
      matchesProgram = pet.allowSponsorship === true;
    }

    return matchesSearch && matchesSpecies && matchesGender && matchesSize && matchesProgram;
  });

  return (
    <div className="space-y-8 pb-16 animate-fadeIn text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-950 font-sans tracking-tight">🔎 Explora Nuestros Rescatados</h1>
        <p className="text-gray-500 text-xs mt-1">Utiliza los filtros de especie, tamaño y programa solidario para apadrinar, transitar o adoptar</p>
      </div>

      {/* FILTER SEARCH BAR BAR */}
      <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Text search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, raza o personalidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Species radio choice buttons */}
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setSpeciesFilter('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                speciesFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSpeciesFilter('Perro')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                speciesFilter === 'Perro'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              🐶 Perros
            </button>
            <button
              onClick={() => setSpeciesFilter('Gato')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                speciesFilter === 'Gato'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              🐱 Gatos
            </button>
          </div>
        </div>

        {/* Extended drop filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Sexo:</span>
            <select
              value={genderFilter}
              onChange={(e: any) => setGenderFilter(e.target.value)}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg font-medium outline-none text-gray-700 focus:border-blue-500"
            >
              <option value="all">Ver Ambos</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Tamaño:</span>
            <select
              value={sizeFilter}
              onChange={(e: any) => setSizeFilter(e.target.value)}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg font-medium outline-none text-gray-700 focus:border-blue-500"
            >
              <option value="all">Ver Todos</option>
              <option value="Chico">Chico (Gatas o perritos miniatura)</option>
              <option value="Mediano">Mediano (Milo, caniches, etc)</option>
              <option value="Grande">Grande (Roco, Fiona, ovejeros)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Programa Solidario:</span>
            <select
              value={programFilter}
              onChange={(e: any) => setProgramFilter(e.target.value)}
              className="px-2.5 py-1 bg-blue-50/50 border border-blue-200 text-blue-800 rounded-lg font-bold outline-none focus:border-blue-500 text-xs"
            >
              <option value="all">Ver todas las opciones</option>
              <option value="adopt">🏡 Disponible para Adopción</option>
              <option value="foster">🤝 Disponible para Tránsito (Hogar Temporal)</option>
              <option value="sponsor">💖 Disponible para Apadrinar (Sponsor)</option>
            </select>
          </div>

          {searchTerm || speciesFilter !== 'all' || genderFilter !== 'all' || sizeFilter !== 'all' || programFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setSpeciesFilter('all');
                setGenderFilter('all');
                setSizeFilter('all');
                setProgramFilter('all');
              }}
              className="ml-auto text-blue-650 font-bold hover:underline"
            >
              Restablecer Filtros
            </button>
          ) : null}
        </div>
      </div>

      {/* CATALOG CARD ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 border border-gray-100 rounded-3xl">
            <span className="text-4xl text-gray-400">🐾</span>
            <h3 className="font-bold text-gray-700 text-lg mt-3">Sin resultados coincidentes</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">No hay ningún rescatado que cumpla con todos los criterios seleccionados actualmente. Intenta ampliando los filtros.</p>
          </div>
        ) : (
          filteredPets.map((pet) => (
            <div
              key={pet.id}
              onClick={() => handleSelectPet(pet)}
              className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col h-full text-left"
            >
              <div className="relative overflow-hidden aspect-[4/3] w-full bg-slate-100">
                <img
                  src={pet.photo}
                  alt={pet.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider shadow-xs ${
                    pet.gender === 'Macho' ? 'bg-indigo-600' : 'bg-pink-500'
                  }`}>
                    {pet.gender}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-950/70 text-white uppercase tracking-wider backdrop-blur-xs shadow-xs">
                    {pet.age}
                  </span>
                </div>

                {pet.status === 'Recuperándose' && (
                  <div className="absolute bottom-3 left-3 bg-teal-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-xs shadow-md">
                    🩹 Recuperándose
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-extrabold text-gray-955 text-lg group-hover:text-blue-600 transition-colors">
                      {pet.name}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono truncate">{pet.breed}</span>
                  </div>
                  
                  {/* Dynamic Solidarity Programs Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {pet.allowAdoption !== false && (
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-150">
                        🏡 Adopción
                      </span>
                    )}
                    {pet.allowFoster === true && (
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-150">
                        🤝 Tránsito
                      </span>
                    )}
                    {pet.allowSponsorship === true && (
                      <span className="text-[9px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-150">
                        💖 Apadrinar
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-xs leading-relaxed mt-2.5 line-clamp-2">
                    {pet.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium font-sans">
                  <span className="bg-gray-50 px-2 py-1 rounded-md">
                    📏 {pet.size}
                  </span>
                  <span className="text-blue-650 font-bold group-hover:underline flex items-center gap-0.5 text-xs">
                    Ver ficha y Solidaridad →
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAILED MODAL SHEET (WHEN AN ANIMAL IS SELECTED) */}
      {selectedPetExternal && (
        <div className="fixed inset-0 z-45 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden animate-slideUp">
            <div className="relative">
              <img src={selectedPetExternal.photo} alt={selectedPetExternal.name} className="w-full h-80 object-cover" />
              <button
                onClick={() => setSelectedPetExternal(null)}
                className="absolute right-4 top-4 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full transition-all backdrop-blur-xs"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full text-white uppercase tracking-wide shadow-md ${
                  selectedPetExternal.gender === 'Macho' ? 'bg-indigo-600' : 'bg-pink-500'
                }`}>
                  {selectedPetExternal.gender}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-950/75 text-white uppercase tracking-wide backdrop-blur-xs shadow-md">
                  {selectedPetExternal.age}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 text-left max-h-[50vh] overflow-y-auto pr-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-gray-100 pb-3">
                <h3 className="text-2xl font-black text-gray-955">{selectedPetExternal.name}</h3>
                <span className="text-sm text-gray-500 font-mono">Raza: {selectedPetExternal.breed} - Tamaño: {selectedPetExternal.size}</span>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-xs tracking-wider uppercase mb-1">Su historia y comportamiento</h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-blue-50/10 p-3 border border-blue-100/30 rounded-2xl">
                  {selectedPetExternal.description}
                </p>
              </div>

              {/* Sanity / Hospital details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <BadgeCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  <span className="text-gray-700"><strong>Libreta Sanitaria al día</strong> (Vacunas anuales)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <BadgeCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  <span className="text-gray-700"><strong>Desparasitación completa</strong> (Efectuada)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                  <AlertCircle className="h-4.5 w-4.5 text-indigo-650 shrink-0" />
                  <span className="text-gray-700 font-medium">La co-dirección evalúa cada postulación para garantizar el mayor bienestar posible.</span>
                </div>
              </div>

              {/* Action items control */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedPetExternal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl transition-all self-start sm:self-center"
                >
                  Regresar al catálogo
                </button>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  {selectedPetExternal.status === 'Recuperándose' ? (
                    <div className="px-4 py-2 bg-amber-50 border border-amber-250 text-amber-800 text-xs font-bold rounded-xl">
                      🩹 En Rehabilitación Médica
                    </div>
                  ) : (
                    <>
                      {selectedPetExternal.allowAdoption !== false && (
                        <button
                          onClick={() => {
                            localStorage.setItem('selected_solidarity_program', 'adopt');
                            onOpenAdoptionWizard(selectedPetExternal);
                            setSelectedPetExternal(null);
                          }}
                          className="px-4 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          🏡 Adoptar
                        </button>
                      )}
                      
                      {selectedPetExternal.allowFoster === true && (
                        <button
                          onClick={() => {
                            localStorage.setItem('selected_solidarity_program', 'foster');
                            onOpenAdoptionWizard(selectedPetExternal);
                            setSelectedPetExternal(null);
                          }}
                          className="px-4 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          🤝 Ofrecer Tránsito
                        </button>
                      )}

                      {selectedPetExternal.allowSponsorship === true && (
                        <button
                          onClick={() => {
                            localStorage.setItem('selected_solidarity_program', 'sponsor');
                            onOpenAdoptionWizard(selectedPetExternal);
                            setSelectedPetExternal(null);
                          }}
                          className="px-4 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          💖 Apadrinar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
