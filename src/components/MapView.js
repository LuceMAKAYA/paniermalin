/**
 * MapView.js – Panier Malin 3.0 (Mobile PWA)
 */

export function createMapView(storeData, onStoreSelect) {
  const el = document.createElement('div');
  el.className = 'map-view';
  el.style.height = '100%';

  el.innerHTML = `
    <h2 class="clash mb-20">📍 Magasins proches</h2>
    <div id="map-container" class="map-container mb-20" style="height: 350px;">
       ${!storeData ? `<div style="padding:40px; text-align:center; color:var(--text3);">Saisissez votre adresse dans la section 'Setup' pour voir la carte.</div>` : ''}
    </div>
    
    ${storeData?.rawStores?.length ? `
      <h3 class="clash" style="font-size:15px; margin-bottom:12px;">Liste des enseignes</h3>
      <div id="stores-list">
        ${storeData.rawStores.map(s => `
          <div class="store-card" data-name="${s.name}" style="cursor: pointer;">
            <div style="flex:1;">
              <p style="font-weight:700; font-size:14px;">${s.name}</p>
              <p class="text-3" style="font-size:11px;">${s.type} · ${s.dist}m</p>
            </div>
            <div class="nt-icon" style="background:var(--as); color:var(--accent);">→</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  if (storeData) {
    // Lazy load Leaflet
    const initMap = () => {
      const map = L.map(el.querySelector('#map-container')).setView([storeData.userLocation.lat, storeData.userLocation.lon], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      
      L.marker([storeData.userLocation.lat, storeData.userLocation.lon], {
        icon: L.divIcon({ html: '📍', className: 'map-user-icon', iconSize: [30, 30] })
      }).addTo(map);

      storeData.rawStores.forEach(s => {
        const marker = L.marker([s.lat, s.lon]).addTo(map);
        marker.on('click', () => onStoreSelect(s.name));
      });
    };

    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      setTimeout(initMap, 100);
    }
  }

  el.querySelectorAll('.store-card').forEach(card => {
    card.onclick = () => onStoreSelect(card.dataset.name);
  });

  return el;
}
