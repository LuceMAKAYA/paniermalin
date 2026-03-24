/**
 * places.js – Récupère les magasins réels via OpenStreetMap (Overpass API).
 * 100% gratuit, sans clé API.
 */

export async function fetchNearbyStores(address) {
  if (!address || address.trim().length < 3) return null;

  try {
    let lat, lon;

    // 1. Récupération des coordonnées
    if (window.__userCoords) {
      lat = window.__userCoords.lat;
      lon = window.__userCoords.lon;
    } else if (window.__googleLocation) {
      lat = window.__googleLocation.lat();
      lon = window.__googleLocation.lng();
    } else {
      // Fallback: Géocodage Nominatim si l'utilisateur n'a pas utilisé le menu déroulant
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) return null;
      lat = parseFloat(geoData[0].lat);
      lon = parseFloat(geoData[0].lon);
    }

    // 2. Recherche Overpass (NWR = Nodes, Ways, Relations pour inclure les bâtiments)
    const query = `
      [out:json][timeout:15];
      (
        nwr["shop"="supermarket"](around:1000,${lat},${lon});
        nwr["shop"="grocery"](around:1000,${lat},${lon});
        nwr["shop"="bakery"](around:1000,${lat},${lon});
        nwr["shop"="butcher"](around:1000,${lat},${lon});
        nwr["shop"="convenience"](around:1000,${lat},${lon});
        nwr["shop"="greengrocer"](around:1000,${lat},${lon});
        nwr["shop"="deli"](around:1000,${lat},${lon});
        nwr["shop"="seafood"](around:1000,${lat},${lon});
        nwr["shop"="dairy"](around:1000,${lat},${lon});
        nwr["shop"="organic"](around:1000,${lat},${lon});
        nwr["shop"="health_food"](around:1000,${lat},${lon});
      );
      out center 20;
    `;

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    const data = await res.json();
    if (!data.elements || data.elements.length === 0) return null;

    // 3. Tri par distance réelle
    const stores = data.elements
      .filter(e => e.tags && e.tags.name)
      .map(e => {
        const eLat = e.lat || e.center?.lat;
        const eLon = e.lon || e.center?.lon;
        const dist = getDistance(lat, lon, eLat, eLon);
        return {
          name: e.tags.name,
          type: translateType(e.tags.shop),
          dist,
          lat: eLat,
          lon: eLon
        };
      })
      .sort((a, b) => a.dist - b.dist);

    // Dédoublonnage par nom
    const uniqueMap = new Map();
    stores.forEach(s => {
      if (!uniqueMap.has(s.name.toLowerCase())) {
        uniqueMap.set(s.name.toLowerCase(), s);
      }
    });

    const uniqueStores = Array.from(uniqueMap.values()).slice(0, 15);
    
    return {
      promptString: uniqueStores.map(s => `${s.name} (${s.type}, ~${s.dist}m)`).join(', '),
      rawStores: uniqueStores,
      userLocation: { lat, lon }
    };

  } catch (err) {
    console.error('Erreur Places (OSM):', err);
    return null;
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

function translateType(t) {
  const map = {
    'supermarket': 'Supermarché',
    'bakery': 'Boulangerie',
    'butcher': 'Boucherie',
    'convenience': 'Épicerie',
    'greengrocer': 'Primeur',
    'grocery': 'Alimentation',
    'deli': 'Traiteur / Épicerie fine',
    'seafood': 'Poissonnerie',
    'dairy': 'Crèmerie',
    'organic': 'Bio',
    'health_food': 'Magasin de diététique'
  };
  return map[t] || 'Magasin';
}
