import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ShieldCheck, Heart, AlertTriangle, MessageCircleQuestion } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function VetAssistantTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Soy **Paticas** 🐶🐾, el Asistente Clínico Inteligente de **Cuatro Patitas Fighiera**.\n\nEstoy aquí para responder tus dudas sobre salud, nutrición, primeros auxilios ecológicos o pautas de adiestramiento respetuoso para tus mascotas o rescatados de la calle.\n\n_¿En qué te puedo asesorar hoy?_ 😊',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested preset prompts
  const presets = [
    { title: '🏡 Adaptar perro de calle', text: '¿Cómo hago para adaptar a mi casa a un perro rescatado de la calle que tiene miedos?' },
    { title: '🩹 Primeros Auxilios', text: 'Encontré un gatito con frío y decaimiento en la calle, ¿qué primeros auxilios básicos puedo darle?' },
    { title: '🥦 Comidas Prohibidas', text: '¿Cuáles son los principales alimentos tóxicos o prohibidos para perros y gatos?' },
    { title: '📅 Calendario Vacunas', text: '¿A qué edad se deben aplicar las primeras vacunas y desparasitar a un cachorro?' }
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMsg: ChatMessage = {
        id: `msg_${Date.now()}_b`,
        sender: 'bot',
        text: data.message || 'Disculpa, no obtuve una respuesta válida.',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Error in Vet Chat:', error);
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        sender: 'bot',
        text: `⚠️ **Oops, disculpa:** Ocurrió un error al conectarme con la central veterinaria de Gemini. Asegúrate de configurar la clave secreta \`GEMINI_API_KEY\` en el panel de Secrets.\n\n_Error: ${error.message || 'No se pudo conectar al servidor.'}_`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Safe simple markdown renderer helper
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold rendering **text**
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          elements.push(line.substring(lastIndex, match.index));
        }
        elements.push(<strong key={match.index} className="font-bold text-gray-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        elements.push(line.substring(lastIndex));
      }

      // If line is empty let's return double spacing
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="leading-relaxed mb-1">
          {elements.length > 0 ? elements : formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fadeIn text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-950 font-sans tracking-tight">🩺 Consultorio Veterinario IA</h1>
        <p className="text-gray-500 text-xs mt-1">Tu asistente inteligente disponible 24/7 para despejar dudas sobre tus rescatados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Info/Presets */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-2xl space-y-3">
            <h3 className="font-extrabold text-indigo-950 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Prescripciones IA
            </h3>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              Haz clic en cualquier pregunta sugerida para recibir de inmediato el asesoramiento experto en cuidado animal.
            </p>

            <div className="space-y-2 pt-1 font-sans">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(preset.text)}
                  disabled={loading}
                  className="w-full text-left p-2 bg-white hover:bg-indigo-100 border border-indigo-200/50 rounded-xl text-[11px] font-medium text-indigo-900 transition-all hover:translate-x-0.5 line-clamp-2 block"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-2 text-amber-900 leading-relaxed text-[11px] font-sans">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer Médico:</strong> Las respuestas brindadas por Paticas IA son de orientación y divulgación educativa. <strong>Nunca</strong> reemplazan el diagnóstico físico de un profesional veterinario matriculado.
            </p>
          </div>
        </div>

        {/* Chat Main Panel */}
        <div className="lg:col-span-3 bg-white border border-gray-150 rounded-3xl overflow-hidden flex flex-col h-[550px] shadow-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 px-6 py-4 flex items-center justify-between border-b border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-indigo-800 rounded-2xl">
                <Bot className="h-5 w-5 text-indigo-300 animate-bounce" />
                <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-400 border border-indigo-950" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">Doctor Paticas Clinici IA</h3>
                <span className="text-[10px] text-indigo-300 font-medium">Asesor Clínico de Cuatro Patitas</span>
              </div>
            </div>

            <span className="text-[10px] bg-indigo-800 text-indigo-100 font-mono px-2 py-0.5 rounded-full uppercase font-semibold">
              Gemini Direct
            </span>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}>
                  {/* Icon */}
                  <div className={`p-2 rounded-xl h-9 w-9 shrink-0 flex items-center justify-center ${
                    isBot ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-600 text-white'
                  }`}>
                    {isBot ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>

                  {/* Bubble body */}
                  <div className={`p-4 rounded-3xl text-sm ${
                    isBot
                      ? 'bg-white border border-gray-150 text-gray-800 rounded-tl-none shadow-xs'
                      : 'bg-indigo-600 text-indigo-50 rounded-tr-none shadow-sm'
                  }`}>
                    {renderFormattedText(msg.text)}
                    <span className="block text-[9px] text-gray-400 font-medium font-mono text-right mt-1.5 select-none">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Waiting clinical loader */}
            {loading && (
              <div className="flex gap-3 max-w-[80%] mr-auto text-left animate-pulse">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl h-9 w-9 flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="bg-white border border-gray-150 p-4 rounded-3xl rounded-tl-none shadow-xs max-w-sm flex items-center gap-2">
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce delay-100" />
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce delay-200" />
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce delay-300" />
                  <span className="text-xs text-gray-400 ml-1 font-medium font-sans">Gemini está analizando...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Inputs form board */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              disabled={loading}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre alimentación, adiestramiento, vacunas de tu mascota..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Send className="h-4.5 w-4.5 rotate-45" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
