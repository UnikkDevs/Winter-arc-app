import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// CORS and Safari header support
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Initialize GoogleGenAI client (Telemetry header required by skill)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Gemini Coach Endpoint
app.post('/api/gemini/coach', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!ai) {
      // Provide high-quality disciplined deterministic coach fallback if API key is not configured
      return res.json({
        response: `[Offline Arc Protocol] Keep your momentum intact. Complete your hydration (water only) and protect your sleep window tonight. Small wins build insurmountable discipline. Focus on executing the next single rule.`,
      });
    }

    const systemInstruction = `You are the Winter Arc 2026 Executive Coach.
Your philosophy: "DISCIPLINE OVER MOTIVATION".
The Winter Arc is a personal 92-day high-performance system (October 1 to December 31, 2026).
The 10 rules are:
1. Only water (no sodas, alcohol, sugary drinks)
2. No junk food (unprocessed, nutrient dense)
3. 7–8 hours sleep (crucial recovery)
4. Gym 4x / week (heavy compound & hypertrophy)
5. Running 1x / week (aerobic base)
6. 10,000 steps daily (non-exercise activity)
7. 30 minutes outside daily (sunlight, fresh air)
8. No phone during meals (mindful eating)
9. 10 minutes prayer / mindfulness / reflection
10. 5 small wins daily (stacked accomplishments)

Tone & Rules:
- Direct, stoic, disciplined, sharp, encouraging, no generic corporate fluff.
- Keep responses concise (2 to 4 bullet points or short paragraphs, max 150-200 words).
- Focus on pragmatic execution, habit stack reorganizing, recovery balancing, and friction removal.
- STRICT SAFETY RULE: You must NEVER provide medical diagnosis, prescription advice, or unsafe extreme fitness advice. For exercise, sleep, or nutrition, always stay within safe, conservative general wellness guidance. If user feels pain or severe illness, instruct them to seek medical consultation.
- If a day or target is missed, adhere to "Reset and continue today" — no guilt, no shame, only forward action.`;

    const contents = `Context:
Current Day: ${context?.dayNumber ?? 'Day 1'} / 92 (Winter Arc 2026)
Daily Score: ${context?.dailyScore ?? 0}%
Weekly Score: ${context?.weeklyScore ?? 0}%
Completed Rules: ${Array.isArray(context?.completedRules) ? context.completedRules.join(', ') : 'None yet'}
Pending Rules: ${Array.isArray(context?.pendingRules) ? context.pendingRules.join(', ') : 'All'}
Gym sessions this week: ${context?.gymThisWeek ?? 0}/4
Runs this week: ${context?.runsThisWeek ?? 0}/1
Steps today: ${context?.stepsToday ?? 0}/10,000
Sleep recorded: ${context?.sleepHours ?? 0} hours
Outdoor time: ${context?.outdoorMinutes ?? 0}/30 mins
Wins recorded: ${context?.smallWinsCount ?? 0}/5

User Query:
"${prompt}"

Provide concise, tactical, disciplined Winter Arc coaching advice based on this exact status:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const reply = response.text || 'Execute the basics. Focus on the next single habit.';
    return res.json({ response: reply });
  } catch (err: any) {
    console.error('Error calling Gemini API:', err);
    return res.status(500).json({
      error: 'Coach temporarily unavailable.',
      details: err?.message || 'Unknown error',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Winter Arc 2026 server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
