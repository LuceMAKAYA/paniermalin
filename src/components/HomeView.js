/**
 * HomeView.js – Panier Malin 3.0 (Mobile PWA)
 */

export function createHomeView(userName, listStats, onSwitchTab) {
  const el = document.createElement('div');
  el.className = 'home-view';

  el.innerHTML = `
    <div style="padding: 10px 0 20px;">
      <p class="text-3" style="font-size: 14px;">Bonjour 👋</p>
      <h1 class="clash" style="font-size: 28px;">${userName || 'Utilisateur'}</h1>
    </div>

    <!-- Hero Card -->
    <div class="card hero-card" style="padding: 24px;">
      <p style="font-size: 11px; font-weight: 700; color: var(--teal); margin-bottom: 8px; letter-spacing: 0.5px;">✦ LISTE ACTIVE</p>
      <h2 class="clash" style="font-size: 22px; margin-bottom: 4px;">Panier de la semaine</h2>
      <p class="text-2" style="font-size: 13px; margin-bottom: 20px; color: rgba(255,255,255,0.6);">Optimisée pour votre budget</p>
      
      <div class="hero-stats">
        <div class="hs" style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <div class="hs-val">${listStats.count || '--'}</div>
          <div class="hs-label">Articles</div>
        </div>
        <div class="hs" style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <div class="hs-val">${listStats.total || '--€'}</div>
          <div class="hs-label">Estimé</div>
        </div>
      </div>
      
      <button class="btn-main" id="btn-go-list-home" style="margin-top: 20px; font-size: 14px; padding: 14px;">
        ${listStats.hasList ? 'Ouvrir ma liste →' : 'Créer ma liste →'}
      </button>
    </div>

    <!-- Quick Actions -->
    <div style="margin-top: 32px;">
      <h3 class="clash" style="font-size: 16px; margin-bottom: 20px;">Actions rapides</h3>
      <div class="responsive-grid">
        <div class="card" id="btn-quick-new" style="padding: 16px; cursor: pointer; border-color: rgba(61,127,255,0.2); margin-bottom: 0;">
          <div style="font-size: 24px; margin-bottom: 12px;">✨</div>
          <p style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">Nouvelle liste</p>
          <p class="text-3" style="font-size: 11px;">Générateur IA</p>
        </div>
        <div class="card" id="btn-quick-map" style="padding: 16px; cursor: pointer; margin-bottom: 0;">
          <div style="font-size: 24px; margin-bottom: 12px;">📍</div>
          <p style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">Magasins</p>
          <p class="text-3" style="font-size: 11px;">Carte interactive</p>
        </div>
      </div>
    </div>

    <!-- Tips/Promo Section -->
    <div class="card" style="margin-top: 24px; background: var(--bg3); border-color: var(--border2);">
      <div style="display: flex; gap: 12px; align-items: center;">
        <div style="background: var(--ambs); color: var(--amber); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">💡</div>
        <div>
          <p style="font-weight: 600; font-size: 14px;">Économisez 12€ cette semaine</p>
          <p class="text-3" style="font-size: 11px;">En privilégiant les marques distributeurs chez Lidl.</p>
        </div>
      </div>
    </div>
  `;

  el.querySelector('#btn-go-list-home').onclick = () => onSwitchTab(listStats.hasList ? 'list' : 'setup');
  el.querySelector('#btn-quick-new').onclick = () => onSwitchTab('setup');
  el.querySelector('#btn-quick-map').onclick = () => onSwitchTab('map');

  return el;
}
