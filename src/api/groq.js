/**
 * groq.js – Client API pour Groq (modèle Llama 3).
 * Gratuit et extrêmement rapide.
 * Clé API : https://console.groq.com/keys
 */

const MODEL   = 'llama-3.3-70b-versatile'; 
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const URL     = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateShoppingList(prompt) {
  if (!API_KEY) {
    throw new Error(
      'Clé API Groq manquante. Ajoutez VITE_GROQ_API_KEY dans votre fichier .env\n' +
      'Obtenez une clé gratuite sur : https://console.groq.com/keys'
    );
  }

  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" } // Demande explicite à Llama 3 de sortir du JSON valide
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error("⏳ Vous avez atteint la limite de sollicitation pour le moment.\nVeuillez patienter 30 secondes avant de réessayer.");
    }
    const msg  = body?.error?.message || `Erreur HTTP ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || '{}';

  // Sécurité supplémentaire au cas où il y aurait des balises markdown
  let jsonStr = raw.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Parse error sur :", jsonStr);
    throw new Error("L'IA n'a pas réussi à générer le bon format de liste. Veuillez réessayer.");
  }
}
