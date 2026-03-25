/**
 * HomeView.js – Panier Malin 3.0 (Mobile PWA)
 */

import { promosApi } from '../api/promos.js';

export function createHomeView(userName, listStats, onSwitchTab) {
  const el = document.createElement('div');
  el.className = 'home-view';

  const render = (promos = []) => {
    // Fallback if no real promos yet
    const displayPromos = promos.length > 0 ? promos : [
      { store_name: 'Lidl', dist: '0.8km', product_name: 'Boeuf haché 500g', promo_price: '3,89€', original_price: '5,40€', discount_tag: '-28%'},
      { store_name: 'Carrefour', dist: '1.4km', product_name: 'Yaourts Danone ×8', promo_price: '2,24€', original_price: '3,20€', discount_tag: '-30%'},
      { store_name: 'Aldi', dist: '2.1km', product_name: 'Poulet entier 1.2kg', promo_price: '4,50€', original_price: '6,10€', discount_tag: '-26%'}
    ];

  el.innerHTML = `
    <div style="padding: 10px 0 20px;">
      <p class="text-3" style="font-size: 14px;">Bonjour 👋</p>
      <h1 class="clash" style="font-size: 28px;">${userName || 'Utilisateur'}</h1>
    </div>

    <!-- Hero Card V2 -->
    <div class="card hero-card" style="padding: 24px; position: relative; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div>
          <p style="font-size: 11px; font-weight: 700; color: var(--teal); margin-bottom: 4px; letter-spacing: 0.5px;">✦ SEMAINE DU 24 MARS</p>
          <p class="text-3" style="font-size: 11px;">${listStats.people || '4'} personnes · Équilibré</p>
        </div>
        <div class="badge badge-ia">Saison 🌿</div>
      </div>
      
      <div class="hero-stats" style="margin-bottom: 24px;">
        <div class="hs">
          <div class="hs-val">${listStats.count || '0'}</div>
          <div class="hs-label">Articles</div>
        </div>
        <div class="hs">
          <div class="hs-val">${listStats.total || '0€'}</div>
          <div class="hs-label">Estimé</div>
        </div>
        <div class="hs">
          <div class="hs-val">68%</div>
          <div class="hs-label">Saison</div>
        </div>
      </div>
      
      <button class="btn-main" id="btn-go-list-home" style="font-size: 14px; padding: 14px;">
        ${listStats.hasList ? 'Voir ma liste de courses →' : 'Créer ma liste →'}
      </button>
    </div>

    <!-- Promos Section -->
    <div class="promos-section" style="margin-top: 32px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 class="clash" style="font-size: 16px;">🔥 Promos ce soir</h3>
        <span class="accent" style="font-size: 12px; font-weight: 600; cursor: pointer;">Voir tout</span>
      </div>
      <div class="h-scroll">
        ${displayPromos.map(p => `
          <div class="card promo-card">
            <span class="promo-tag">${p.discount_tag}</span>
            <p class="text-3" style="font-size: 10px; margin-bottom: 4px;">🛒 ${p.store_name} ${p.dist ? '· ' + p.dist : ''}</p>
            <p style="font-weight: 600; font-size: 13px; margin-bottom: 12px; height: 32px; overflow: hidden;">${p.product_name}</p>
            <div>
              <span class="promo-price">${p.promo_price}${typeof p.promo_price === 'number' ? '€' : ''}</span>
              <span class="old-price">${p.original_price}${typeof p.original_price === 'number' ? '€' : ''}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Quick Access Grid -->
    <div style="margin-top: 32px;">
      <h3 class="clash" style="font-size: 16px; margin-bottom: 20px;">Accès rapide</h3>
      <div class="responsive-grid" style="gap: 12px;">
        <div class="card clickable" id="btn-mode-courses" style="padding: 16px; margin-bottom: 0;">
          <div style="font-size: 24px; margin-bottom: 12px;">🛍️</div>
          <p style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">Mode courses</p>
          <div class="badge badge-en-cours">En cours</div>
        </div>
        <div class="card clickable" id="btn-quick-map" style="padding: 16px; margin-bottom: 0;">
          <div style="font-size: 24px; margin-bottom: 12px;">📍</div>
          <p style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">Magasins</p>
          <div class="badge badge-ouvert">Ouvert</div>
        </div>
        <div class="card clickable" id="btn-quick-family" style="padding: 16px; margin-bottom: 0;">
          <div style="font-size: 24px; margin-bottom: 12px;">👥</div>
          <p style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">Famille</p>
          <div class="badge badge-live">Live 🟢</div>
        </div>
        <div class="card clickable" id="btn-quick-new" style="padding: 16px; margin-bottom: 0;">
          <div style="font-size: 24px; margin-bottom: 12px;">✨</div>
          <p style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">Nouvelle liste</p>
          <div class="badge badge-ia">IA</div>
        </div>
      </div>
    </div>
    
    <div style="height: 40px;"></div>
  `;

    el.querySelector('#btn-go-list-home').onclick = () => onSwitchTab(listStats.hasList ? 'list' : 'setup');
    el.querySelector('#btn-mode-courses').onclick = () => onSwitchTab('list');
    el.querySelector('#btn-quick-new').onclick = () => onSwitchTab('setup');
    el.querySelector('#btn-quick-map').onclick = () => onSwitchTab('map');
    el.querySelector('#btn-quick-family').onclick = () => onSwitchTab('profile');
  };

  // Initial render with fallback/mock
  render();

  // Async fetch real promos from Supabase
  promosApi.getActivePromos().then(realPromos => {
    if (realPromos && realPromos.length > 0) {
      render(realPromos);
    }
  });

  return el;
}
