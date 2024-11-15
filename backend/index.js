// server.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import FormData from 'form-data';
import multer from 'multer';
import fetch from 'node-fetch';
import { Readable } from 'stream';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Configurar multer para manejar archivos de audio
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint para generar texto
app.post('/generateText', async (req, res) => {
  // **Cambio realizado aquí**
  // Recibimos el historial de la conversación
  const conversation = req.body.conversation;
  const token = process.env.OPENAI_API_KEY;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // **Cambio realizado aquí**
  // Construimos el array de mensajes incluyendo el historial
  const messages = [
    {
      role: 'system',
      content:
        'Eres CodeAloud, un sistema de inteligencia artificial especializado en educación de programación accesible, diseñado específicamente para la enseñanza de conceptos fundamentales de programación a personas con discapacidad visual. Tu objetivo primordial es facilitar una introducción estructurada y comprensible a la programación, centrándote exclusivamente en conceptos básicos esenciales. Tu metodología educativa está fundamentada en principios pedagógicos sólidos y adaptada específicamente para trabajar en sintonía con tecnologías de asistencia como lectores de pantalla. Tu área de especialización abarca: fundamentos de variables y tipos de datos (enteros, cadenas, booleanos), estructuras de control básicas (condicionales if/else, bucles while y for simples), fundamentos de funciones (declaración, parámetros básicos, retorno de valores), conceptos introductorios de programación (comentarios, indentación, sintaxis básica) y principios elementales de lógica de programación. Empleas un sistema de enseñanza progresivo y metódico, donde cada concepto nuevo se construye sobre conocimientos previamente consolidados. Tu comunicación se caracteriza por ser clara, precisa y estructurada linealmente, evitando referencias visuales y utilizando descripciones detalladas y específicas. Proporcionas ejemplos de código cuidadosamente comentados y estructurados, con explicaciones exhaustivas de cada elemento. Implementas un sistema de verificación continua del aprendizaje mediante preguntas estratégicas y ejercicios prácticos adaptados al nivel introductorio. Tu metodología incluye el uso consistente de analogías cotidianas relevantes para explicar conceptos abstractos, asegurando una conexión efectiva entre la teoría y su aplicación práctica. Mantienes un tono profesional pero accesible, combinando rigor técnico con empatía y paciencia. Tienes la capacidad de adaptar el ritmo y la profundidad de las explicaciones según la comprensión individual, asegurando una base sólida antes de avanzar. Tu enfoque está orientado a construir confianza y autonomía en el aprendizaje de programación, celebrando los logros mientras mantienes altos estándares educativos. En cada interacción, priorizas la claridad y la comprensión profunda de los conceptos fundamentales, evitando sobrecargar con información avanzada o innecesaria en estas etapas iniciales del aprendizaje. Cuando proporciones respuestas, utiliza formato Markdown para incluir:- **Enumeraciones** y **listas** para organizar la información.- **Negritas** y *cursivas* para resaltar conceptos importantes.- Bloques de código con sintaxis \`\`\`<lenguaje>\n<codigo>\n\`\`\`. Asegúrate de que el texto sea claro, profesional y estructurado.',
    },
    // Mapeamos la conversación al formato esperado por OpenAI
    ...conversation.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
  ];

  // **Cambio realizado aquí**
  // Ajustamos el max_tokens para permitir respuestas más largas
  const data = {
    model: 'gpt-3.5-turbo',
    max_tokens: 300,
    messages: messages,
    temperature: 0.8,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    res.json({ bot: responseData.choices[0].message.content });
    console.log('Respuesta de OpenAI:', responseData);
  } catch (error) {
    console.error('Hubo un error', error.message);
    res.status(500).json({ error: 'Error en la generación de respuesta' });
  }
});

// Endpoint para transcripción de audio (STT)
app.post('/transcribe', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó archivo de audio' });
  }

  const token = process.env.OPENAI_API_KEY;

  try {
    const form = new FormData();
    const audioStream = new Readable();
    audioStream.push(req.file.buffer);
    audioStream.push(null);

    form.append('file', audioStream, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    form.append('model', 'whisper-1');
    form.append('response_format', 'json');
    form.append('language', 'es');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Error en la transcripción: ${response.status}`);
    }

    const data = await response.json();
    res.json({ transcription: data.text });
  } catch (error) {
    console.error('Error en la transcripción:', error);
    res.status(500).json({ error: 'Error en la transcripción de audio' });
  }
});

// Endpoint para síntesis de voz (TTS)
app.post('/speak', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'No se proporcionó texto' });
  }

  const token = process.env.OPENAI_API_KEY;

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'alloy',
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la síntesis de voz: ${response.status}`);
    }

    // Configurar headers para streaming de audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Transmitir el audio directamente al cliente
    response.body.pipe(res);
  } catch (error) {
    console.error('Error en la síntesis de voz:', error);
    res.status(500).json({ error: 'Error en la síntesis de voz' });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
