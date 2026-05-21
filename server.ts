import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with named parameter and correct headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint: Generate emotional pet bio using Gemini
app.post('/api/ai/generate-bio', async (req, res) => {
  try {
    const { name, species, age, traits } = req.body;

    if (!name || !species) {
      res.status(400).json({ error: 'Faltan campos obligatorios: name o species' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY no está configurada.' });
      return;
    }

    const prompt = `Genera una biografía en primera persona para una mascota en adopción en nuestro portal 'Cuatro Patitas'.
Detalles de la mascota:
- Nombre: ${name}
- Especie: ${species}
- Edad: ${age || 'Desconocida'}
- Rasgos de personalidad/Físicos: ${traits || 'Cariñoso, tranquilo'}

La biografía debe escribirse en primera persona (ej. "¡Hola! Soy ${name}..."), ser muy emotiva, enganchar al lector para incentivar la adopción, y contar con un tono amigable, juguetón si es joven, o sabio si es adulto/senior. El texto debe estar completamente en español y estructurarse en 2 o 3 párrafos cortos y cálidos. No excedas las 150 palabras. No incluyas hashtags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ bio: response.text });
  } catch (error: any) {
    console.error('Error generating bio with Gemini:', error);
    res.status(500).json({ error: error.message || 'Error interno al generar biografía con IA.' });
  }
});

// API endpoint: Virtual Vet Assistant Chat using Gemini
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Falta el mensaje' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY no está configurada.' });
      return;
    }

    const systemInstruction = `Eres 'Paticas', el Asistente Virtual Inteligente de 'Cuatro Patitas', una ONG líder de rescate animal y campañas de castración gratis.
Especialidades:
- Cuidado animal, adiestramiento básico con refuerzo positivo y consejos de adaptación para perros y gatos rescatados.
- Directrices básicas sobre herocuidado, nutrición, higiene y tenencia responsable.
- Guías de primeros auxilios amigables para animales callejeros enfermos o lastimados.

Reglas de respuesta:
- Habla siempre de forma tierna, atenta y entusiasta, usando analogías perrunas/gatunas cuando sea divertido.
- Si te preguntan sobre problemas de salud graves (fracturas, envenenamiento parásito grave, vómito persistente), da pautas inmediatas de primeros auxilios básicos para mantener al animal a salvo, pero SIEMPRE añade un aviso prominente pidiendo acudir urgentemente a un médico veterinario profesional.
- No salgas de tu rol veterinario y de voluntario de Cuatro Patitas. Envía mucho cariño a los adoptantes y defensores de los animales.`;

    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction,
      }
    });

    // Send chat message (we can restore history if requested but simple request handles perfectly)
    const response = await chat.sendMessage({ message });

    res.json({ message: response.text });
  } catch (error: any) {
    console.error('Error in Vet Chat with Gemini:', error);
    res.status(500).json({ error: error.message || 'Error interno al comunicarse con el asistente virtual.' });
  }
});

// Start integration server with Vite configuration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode serving compiled assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Cuatro Patitas] Server running on http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV}`);
  });
}

startServer();
