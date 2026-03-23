/**
 * places.js – Récupère les magasins réels autour de l'adresse de l'utilisateur
 * via Nominatim (Géocodage) et l'API Overpass (OpenStreetMap).
 */

export async function fetchNearbyStores(address) {
  if (!address || address.trim().length < 3) return null;

  try {
    // 1. Géocodage (Nominatim)
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    if (!geoData || geoData.length === 0) return null;

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    // 2. Recherche des commerces autour de 1.2km (Overpass API)
    // On cible : supermarchés, boucheries, boulangeries, épiceries
    const query = `
      [out:json][timeout:15];
      (
        node["shop"="supermarket"](around:1200,${lat},${lon});
        node["shop"="butcher"](around:1200,${lat},${lon});
        node["shop"="bakery"](around:1200,${lat},${lon});
        node["shop"="convenience"](around:1200,${lat},${lon});
        node["shop"="greengrocer"](around:1200,${lat},${lon});
      );
      out body 25;
    `;

    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    
    if (!overpassRes.ok) return null;
    const overpassData = await overpassRes.json();
    
    // 3. Extraction et formatage des résultats
    if (!overpassData.elements || overpassData.elements.length === 0) return null;

    const stores = overpassData.elements
      .filter(e => e.tags && e.tags.name)
      .map(e => `${e.tags.name} (${translateShopType(e.tags.shop)})`);
      
    // Remove duplicates
    const uniqueStores = [...new Set(stores)];
    
    return uniqueStores.join(', ');

  } catch (err) {
    console.error('Erreur OpenStreetMap:', err);
    return null;
  }
}

function translateShopType(type) {
  const map = {
    'supermarket': 'Supermarché',
    'butcher': 'Boucherie',
    'bakery': 'Boulangerie',
    'convenience': 'Épicerie',
    'greengrocer': 'Primeur'
  };
  return map[type] || 'Magasin';
}
