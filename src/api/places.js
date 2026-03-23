/**
 * places.js – Récupère les magasins réels via l'API Google Maps (Places + Geocoding).
 */

export async function fetchNearbyStores(address) {
  if (!address || address.trim().length < 3) return null;
  if (!window.google || !window.google.maps) return null;

  return new Promise((resolve) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    // 1. Déterminer la géolocalisation exacte
    let locationPromise;
    if (window.__googleLocation) {
      locationPromise = Promise.resolve(window.__googleLocation);
    } else {
      // Fallback: Geocoding si l'utilisateur n'a pas utilisé l'autocomplétion
      const geocoder = new window.google.maps.Geocoder();
      locationPromise = new Promise(res => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            res(results[0].geometry.location);
          } else {
            res(null);
          }
        });
      });
    }

    locationPromise.then(location => {
      if (!location) return resolve(null);

      // 2. Recherche des commerces autour (Google Places API NearbySearch)
      service.nearbySearch({
        location: location,
        radius: 800,
        keyword: 'supermarché OR épicerie OR boucherie OR primeur OR boulangerie'
      }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          
          // 3. Calcul local de la distance pour chaque lieu et tri
          const stores = results.slice(0, 15).map(place => {
            const dist = getDistance(
              location.lat(), location.lng(),
              place.geometry.location.lat(), place.geometry.location.lng()
            );
            return {
              name: place.name,
              type: inferType(place.types),
              rating: place.rating || 'N/A',
              dist
            };
          }).sort((a,b) => a.dist - b.dist);

          const uniqueStores = stores.map(s => `${s.name} (${s.type}, ~${s.dist}m, Note: ${s.rating}⭐)`).join(', ');
          resolve(uniqueStores);
        } else {
          resolve(null);
        }
      });
    });
  });
}

// Formule de Haversine pour la distance exacte en mètres
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

// Nettoyage des types Google Maps pour l'IA
function inferType(types) {
  if (!types) return 'Magasin';
  if (types.includes('supermarket')) return 'Supermarché';
  if (types.includes('bakery')) return 'Boulangerie';
  if (types.includes('convenience')) return 'Épicerie';
  if (types.includes('grocery_or_supermarket')) return 'Alimentation';
  if (types.includes('health')) return 'Magasin Bio';
  return 'Commerce';
}
