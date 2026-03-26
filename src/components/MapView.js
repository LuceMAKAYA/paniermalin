/**
 * MapView.js – Panier Malin 3.0 (Mobile PWA)
 */

export function createMapView(storeData, onStoreSelect) {
  const el = document.createElement('div');
  el.className = 'map-view';
  el.style.height = '100%';

  el.innerHTML = `
    <div class="animate-fade-up">
      <h2 class="clash" style="font-size: 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 24px;">📍</span> Magasins & Promos
      </h2>
      <div id="map-container" class="card glass" style="height: 300px; padding: 0; overflow: hidden; margin-bottom: 24px; border-color: rgba(59,130,246,0.3);">
         ${!storeData ? `<div style="padding:40px; text-align:center; color:var(--text3); font-weight: 500;">Saisissez votre adresse dans la section 'Setup' pour voir la carte.</div>` : ''}
      </div>
    </div>
    
    ${storeData?.rawStores?.length ? `
      <div class="animate-fade-up" style="animation-delay: 0.1s;">
        <h3 class="clash" style="font-size: 16px; margin-bottom: 16px; color: var(--text2);">Enseignes à proximité</h3>
        <div id="stores-list" style="display: flex; flex-direction: column; gap: 12px;">
          ${storeData.rawStores.map((s, i) => {
            const hasPromo = (s.name.length + i) % 3 === 0; // Pseudo-random consistent promo based on name length
            const promoText = hasPromo ? ['-30% sur le Frais', '2 achetés = 1 offert', 'Rayon Bio à -15%'][(s.name.length) % 3] : null;
            
            return `
            <div class="card glass store-card" data-name="${s.name}" style="cursor: pointer; padding: 16px; margin-bottom: 0; display: flex; align-items: center; transition: all 0.2s;">
              <div style="flex:1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <p style="font-weight: 800; font-size: 15px; color: var(--text);">${s.name}</p>
                  ${hasPromo ? `<span class="badge" style="background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); font-size: 9px; padding: 2px 6px;">PROMO</span>` : ''}
                </div>
                <p class="text-3" style="font-size: 11px; font-weight: 600;">
                  <span style="color: var(--accent);">${s.dist}m</span> · ${s.type === 'supermarket' ? 'Supermarché' : s.type}
                </p>
                ${hasPromo ? `<p style="font-size: 11px; color: #ef4444; margin-top: 6px; font-weight: 600;">🔥 ${promoText}</p>` : ''}
              </div>
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--accent); font-weight: 800;">→</div>
            </div>
          `}).join('')}
        </div>
      </div>
    ` : ''}
    <div style="height: 40px;"></div>
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
