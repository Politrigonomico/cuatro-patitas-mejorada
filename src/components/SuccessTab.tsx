import React from 'react';
import { Sparkles, MessageSquareHeart, Award, Landmark, Smile, Heart } from 'lucide-react';
import { Testimonial } from '../types';

interface SuccessTabProps {
  testimonials: Testimonial[];
  setActiveTab?: (tab: string) => void;
}

export default function SuccessTab({ testimonials, setActiveTab }: SuccessTabProps) {
  return (
    <div className="space-y-8 pb-16 animate-fadeIn text-left">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-950 font-sans tracking-tight">🏡 Finales Felices</h1>
        <p className="text-gray-500 text-xs">Testimonios reales de familias que abrieron sus corazones para salvar vidas en Fighiera</p>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((test) => (
          <div
            key={test.id}
            className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300 font-sans"
          >
            {/* Image card frame */}
            <div className="relative aspect-video w-full overflow-hidden">
              <img src={test.photoUrl} alt={test.petName} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 bg-white/90 text-blue-600 rounded-lg shadow-sm backdrop-blur-xs flex items-center gap-1 uppercase">
                  <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                  Adoptado
                </span>
              </div>
            </div>

            {/* Testimonial body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <blockquote className="text-gray-600 font-medium text-xs leading-relaxed italic relative">
                  "{test.story}"
                </blockquote>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-extrabold text-gray-900">{test.adopterName}</h4>
                  <p className="text-[10px] text-gray-400 font-serif">Adoptantes de {test.petName}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-mono font-medium">{test.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warm summary footer banner */}
      <section className="bg-blue-50/40 border border-blue-100 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="space-y-2 text-left">
          <h3 className="text-lg font-extrabold text-gray-955">¿Listo para protagonizar tu propia historia de amor?</h3>
          <p className="text-gray-500 text-xs">Hay decenas de almas esperando reunirse contigo hoy mismo en nuestra red de hogares de tránsito de Fighiera y alrededores.</p>
        </div>
        <button
          onClick={() => setActiveTab && setActiveTab('adopt')}
          className="px-5 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-200 rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          Ver mascotas en adopción
        </button>
      </section>
    </div>
  );
}
