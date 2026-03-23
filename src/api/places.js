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

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // 2. Recherche des commerces autour de 800m
    // Utilisation de "nwr" (node, way, relation) car beaucoup de supermarchés sont des bâtiments (ways)
    const query = `
      [out:json][timeout:15];
      (
        nwr["shop"="supermarket"](around:800,${lat},${lon});
        nwr["shop"="butcher"](around:800,${lat},${lon});
        nwr["shop"="bakery"](around:800,${lat},${lon});
        nwr["shop"="convenience"](around:800,${lat},${lon});
        nwr["shop"="greengrocer"](around:800,${lat},${lon});
      );
      out center 30;
    `;

    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    
    if (!overpassRes.ok) return null;
    const overpassData = await overpassRes.json();
    
    if (!overpassData.elements || overpassData.elements.length === 0) return null;

    // 3. Extraction, calcul de la distance exacte et tri
    const stores = overpassData.elements
      .filter(e => e.tags && e.tags.name)
      .map(e => {
        const eLat = e.lat || e.center?.lat;
        const eLon = e.lon || e.center?.lon;
        const dist = eLat && eLon ? getDistance(lat, lon, eLat, eLon) : 999;
        return {
          name: e.tags.name,
          type: translateShopType(e.tags.shop),
          dist: dist
        };
      })
      .sort((a, b) => a.dist - b.dist);
      
    // Remove duplicates by name
    const uniqueMap = new Map();
    stores.forEach(s => {
      if (!uniqueMap.has(s.name.toLowerCase())) {
        uniqueMap.set(s.name.toLowerCase(), s);
      }
    });
    
    const sortedUniqueStores = Array.from(uniqueMap.values()).slice(0, 15);
    return sortedUniqueStores.map(s => `${s.name} (${s.type}, ~${s.dist}m)`).join(', ');

  } catch (err) {
    console.error('Erreur OpenStreetMap:', err);
    return null;
  }
}

// Formule de Haversine pour calculer la distance en mètres
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Rayon de la terre en mètres
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
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
