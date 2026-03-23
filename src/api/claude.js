/**
 * gemini.js – Client API pour Google Gemini (gratuit).
 * Modèle : gemini-2.5-flash-lite (free tier : 1000 req/jour, 15 RPM)
 * Clé API : https://aistudio.google.com/app/apikey
 */

const MODEL   = 'gemini-2.5-flash-lite';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const URL     = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

/**
 * @param {string} prompt
 * @returns {Promise<{categories: any[], total_estime: number, conseil: string}>}
 */
export async function generateShoppingList(prompt) {
  if (!API_KEY) {
    throw new Error(
      'Clé API Gemini manquante. Ajoutez VITE_GEMINI_API_KEY dans votre fichier .env\n' +
      'Obtenez une clé gratuite sur : https://aistudio.google.com/app/apikey'
    );
  }

  const response = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error("⏳ Vous avez atteint la limite de requêtes gratuites de l'IA (15 par minute).\nVeuillez patienter 30 secondes avant de réessayer.");
    }
    const msg  = body?.error?.message || `Erreur HTTP ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip potential markdown code fences
  let jsonStr = raw.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  return JSON.parse(jsonStr);
}
