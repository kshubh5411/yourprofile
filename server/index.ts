import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { config as loadDotenv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const isProd = process.env.NODE_ENV === 'production';
const ENABLE_CSP = process.env.ENABLE_CSP === 'true';
const MAX_JSON_BODY = process.env.MAX_JSON_BODY || '512kb';
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 30);

// Load local environment files for server-side API keys.
loadDotenv({ path: path.join(rootDir, '.env.local') });
loadDotenv({ path: path.join(rootDir, '.env') });

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

type RateEntry = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateEntry>();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clampStringLength(value: string, maxLength = 400): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`;
}

function clampDeep(value: unknown): unknown {
  if (typeof value === 'string') return clampStringLength(value);
  if (Array.isArray(value)) return value.map(clampDeep);
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) out[key] = clampDeep(item);
  return out;
}

function getAllowedOrigins(req?: express.Request): string[] {
  const configured = process.env.APP_URL?.trim();
  const extraOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  const requestHost = req?.get('host');

  const origins = new Set<string>([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);

  if (configured) origins.add(configured);
  extraOrigins.forEach((origin) => origins.add(origin));
  if (railwayDomain) origins.add(`https://${railwayDomain}`);
  if (requestHost) {
    origins.add(`https://${requestHost}`);
    origins.add(`http://${requestHost}`);
  }

  return Array.from(origins);
}

function isAllowedOrigin(origin: string | undefined, req?: express.Request): boolean {
  if (!origin) return true;
  return getAllowedOrigins(req).includes(origin);
}

function setCorsHeaders(req: express.Request, res: express.Response) {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin, req)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function applySecurityHeaders(res: express.Response) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!isProd) return;
  if (!ENABLE_CSP) return;
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https: wss:; frame-ancestors 'none'"
  );
}

function enforceRateLimit(req: express.Request, res: express.Response): boolean {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(Math.max(retryAfter, 1)));
    res.status(429).send('Too many requests. Please try again shortly.');
    return false;
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);
  return true;
}

function isValidLanguage(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 80;
}

function validateDataPayload(data: unknown): data is Record<string, unknown> {
  if (!isPlainObject(data)) return false;
  return (
    isPlainObject(data.personal) &&
    isPlainObject(data.family) &&
    isPlainObject(data.education) &&
    isPlainObject(data.professional) &&
    isPlainObject(data.customization)
  );
}

function sanitizeBiodataPayload(data: unknown) {
  if (!data || typeof data !== 'object') return data;
  const cloned = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  delete cloned.images;
  delete cloned.profileImage;
  delete cloned.profileImageCrop;
  return clampDeep(cloned);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractJson(text: string): JsonObject {
  const trimmed = text.trim();
  const normalized = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

  const parsed = JSON.parse(normalized);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI did not return a JSON object');
  }
  return parsed as JsonObject;
}

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY on server. Set it in .env.local and restart dev server.');
  }
  return new GoogleGenAI({ apiKey });
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown AI error';
  }
}

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: string,
  responseMimeType?: string
) {
  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: unknown = null;

  for (const model of candidateModels) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config: responseMimeType ? { responseMimeType } : undefined,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('All Gemini model attempts failed');
}

async function translateTextWithFallback(ai: GoogleGenAI, text: string, targetLanguage: string): Promise<string> {
  const prompt = `
Translate the following text to ${targetLanguage}.
Return only the translated text, no JSON, no markdown.

Text:
${text}
`;
  const response = await generateWithFallback(ai, prompt);
  return (response.text || '').trim();
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: MAX_JSON_BODY }));
  app.use((req, res, next) => {
    if (!isProd) {
      const originalSetHeader = res.setHeader.bind(res);
      res.setHeader = ((name: string, value: string | number | readonly string[]) => {
        if (String(name).toLowerCase() === 'content-security-policy') {
          return res;
        }
        return originalSetHeader(name, value);
      }) as typeof res.setHeader;
      res.removeHeader('Content-Security-Policy');
    }
    next();
  });
  app.use((_req, res, next) => {
    applySecurityHeaders(res);
    next();
  });
  app.use('/api', (req, res, next) => {
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    if (!isAllowedOrigin(req.headers.origin, req)) {
      return res.status(403).send('Origin not allowed');
    }
    if (req.method === 'GET' && req.path === '/health') {
      return res.status(200).json({ ok: true });
    }
    if (!enforceRateLimit(req, res)) return;
    return next();
  });

  app.post('/api/translate-enhance', async (req, res) => {
    try {
      const { data, targetLanguage } = req.body as { data?: unknown; targetLanguage?: string };
      if (!validateDataPayload(data) || !isValidLanguage(targetLanguage)) {
        return res.status(400).send('Invalid data payload or targetLanguage');
      }

      const dataForPrompt = sanitizeBiodataPayload(data);
      const prompt = `
You are an expert biodata editor and translator.
The user has provided the following biodata information in JSON format.

Task:
1. Translate all text fields to ${targetLanguage}.
2. Enhance the language to be more professional and culturally appropriate for a formal biodata (e.g., Matrimonial or Professional Resume).
3. Keep the JSON structure EXACTLY the same.
4. Do not change the keys, only the values.
5. If a value is empty, leave it empty.
6. Ensure partnerPreferences.summary is translated to ${targetLanguage} if present.
7. Translate custom field labels and values as well.

Input Data:
${JSON.stringify(dataForPrompt, null, 2)}

Return ONLY the JSON object.
`;

      const ai = getAiClient();
      const response = await generateWithFallback(ai, prompt, 'application/json');

      const text = response.text;
      if (!text) {
        return res.status(502).send('No response from AI');
      }

      const translated = extractJson(text) as Record<string, unknown>;
      const source = dataForPrompt as Record<string, any>;

      const sourcePartnerSummary = source?.partnerPreferences?.summary;
      const translatedPartnerSummary = (translated as any)?.partnerPreferences?.summary;
      const shouldForcePartnerTranslation =
        typeof sourcePartnerSummary === 'string' &&
        sourcePartnerSummary.trim().length > 0 &&
        (typeof translatedPartnerSummary !== 'string' ||
          translatedPartnerSummary.trim().length === 0 ||
          translatedPartnerSummary.trim() === sourcePartnerSummary.trim());

      if (shouldForcePartnerTranslation) {
        const forcedPartnerSummary = await translateTextWithFallback(ai, sourcePartnerSummary, targetLanguage);
        (translated as any).partnerPreferences = {
          ...(source.partnerPreferences || {}),
          ...((translated as any).partnerPreferences || {}),
          summary: forcedPartnerSummary || sourcePartnerSummary,
        };
      }

      return res.json(translated);
    } catch (error) {
      console.error('AI Translation Error:', error);
      const details = formatErrorMessage(error);
      return res.status(500).send(isProd ? 'Failed to translate and enhance biodata' : `Failed to translate and enhance biodata: ${details}`);
    }
  });

  app.post('/api/generate-summary', async (req, res) => {
    try {
      const { data } = req.body as { data?: unknown };
      if (!validateDataPayload(data)) {
        return res.status(400).send('Invalid data payload');
      }

      const dataForPrompt = sanitizeBiodataPayload(data) as Record<string, unknown>;
      const language = typeof dataForPrompt.language === 'string' ? dataForPrompt.language : 'English';
      const prompt = `
Based on the following biodata, write a short, professional, and engaging summary (3-4 sentences) suitable for the top of the profile.
Language: ${language}

Data:
${JSON.stringify(dataForPrompt, null, 2)}
`;

      const ai = getAiClient();
      const response = await generateWithFallback(ai, prompt);

      return res.json({ summary: response.text || '' });
    } catch (error) {
      console.error('AI Summary Error:', error);
      const details = formatErrorMessage(error);
      return res.status(500).send(isProd ? 'Failed to generate summary' : `Failed to generate summary: ${details}`);
    }
  });

  app.post('/api/generate-partner-preferences', async (req, res) => {
    try {
      const { data } = req.body as { data?: unknown };
      if (!validateDataPayload(data)) {
        return res.status(400).send('Invalid data payload');
      }

      const dataForPrompt = sanitizeBiodataPayload(data) as Record<string, unknown>;
      const language = typeof dataForPrompt.language === 'string' ? dataForPrompt.language : 'English';
      const fullName =
        typeof (dataForPrompt.personal as Record<string, unknown> | undefined)?.fullName === 'string'
          ? ((dataForPrompt.personal as Record<string, unknown>).fullName as string).trim()
          : '';
      const prompt = `
You are an expert matrimonial profile assistant.
Based on this biodata, write a concise and culturally appropriate "Partner Preferences" paragraph.

Rules:
1. Keep it practical, respectful, and realistic.
2. 3-5 sentences, plain text only (no markdown/bullets).
3. Do not include discriminatory or offensive wording.
4. If biodata has missing details, infer neutral preferences.
5. Write in: ${language}
6. Do NOT mention the candidate's name.
7. Write on behalf of the candidate using first-person voice (I/me/my), not third-person.

Biodata:
${JSON.stringify(dataForPrompt, null, 2)}
`;

      const ai = getAiClient();
      const response = await generateWithFallback(ai, prompt);
      let summary = (response.text || '').trim();

      if (fullName) {
        const fullNameRegex = new RegExp(`\\b${escapeRegExp(fullName)}\\b`, 'gi');
        summary = summary.replace(fullNameRegex, '').replace(/\s{2,}/g, ' ').trim();
      }

      return res.json({ summary });
    } catch (error) {
      console.error('AI Partner Preferences Error:', error);
      const details = formatErrorMessage(error);
      return res.status(500).send(isProd ? 'Failed to generate partner preferences' : `Failed to generate partner preferences: ${details}`);
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      root: rootDir,
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(rootDir, 'dist');
    app.use(express.static(distDir));
    app.get('*', async (_req, res) => {
      const html = await readFile(path.join(distDir, 'index.html'), 'utf-8');
      res.status(200).contentType('text/html').send(html);
    });
  }

  return app;
}

const port = Number(process.env.PORT || 3000);

createApp()
  .then((app) => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
