/**
 * places.js – Récupère les magasins réels via l'API Google Maps (Places API New).
 * Utilise l'API moderne pour éviter les limitations "Legacy".
 */

export async function fetchNearbyStores(address) {
  if (!address || address.trim().length < 3) return null;
  if (!window.google || !window.google.maps) return null;

  try {
    const { Place } = await window.google.maps.importLibrary("places");
    
    let location = window.__googleLocation;
    
    // Fallback Geocoding form text if no autocomplete used
    if (!location) {
      const { Geocoder } = await window.google.maps.importLibrary("geocoding");
      const geocoder = new Geocoder();
      const response = await new Promise(res => {
        geocoder.geocode({ address: address + ', France' }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            res(results[0].geometry.location);
          } else {
            res(null);
          }
        });
      });
      location = response;
    }

    if (!location) return null;

    // Utilisation de la nouvelle API Places (searchNearby) avec le tri par distance intégré
    const request = {
      fields: ['displayName', 'location', 'rating', 'primaryType'],
      locationRestriction: {
        center: location,
        radius: 800,
      },
      includedPrimaryTypes: ['supermarket', 'grocery_store', 'bakery', 'butcher', 'greengrocer'],
      maxResultCount: 15,
      rankPreference: Place.RankPreference.DISTANCE,
    };
    
    const { places } = await Place.searchNearby(request);
    
    if (!places || places.length === 0) return null;

    // Formatage pour l'IA
    const uniqueStores = places.map(p => {
      const nom = p.displayName || 'Magasin';
      const type = inferType(p.primaryType);
      const note = p.rating ? p.rating + '⭐' : 'N/A';
      return `${nom} (${type}, Note: ${note})`;
    }).join(', ');
    
    return uniqueStores;
    
  } catch (err) {
    console.error('Erreur Google Places (New API):', err);
    return null;
  }
}

function inferType(type) {
  if (!type) return 'Boutique';
  if (type.includes('supermarket')) return 'Supermarché';
  if (type.includes('bakery')) return 'Boulangerie';
  if (type.includes('grocery_store')) return 'Épicerie/Alimentation';
  if (type.includes('butcher')) return 'Boucherie';
  if (type.includes('greengrocer')) return 'Primeur';
  return 'Commerce';
}
