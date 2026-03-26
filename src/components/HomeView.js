/**
 * HomeView.js – Panier Malin 3.0 (Mobile PWA)
 */


export function createHomeView(userName, listStats, onSwitchTab) {
  const el = document.createElement('div');
  el.className = 'home-view fade-in';

  // Dummy data for forgotten items
  const forgottenItems = [
    { icon: '🥚', name: 'Œufs bio', price: '~3.20€' },
    { icon: '🧴', name: 'Lessive', price: '~8.50€' },
    { icon: '🥦', name: 'Brocoli', price: '~2.10€' },
    { icon: '🧀', name: 'Comté 12m', price: '~5.40€' },
    { icon: '🍎', name: 'Pommes', price: '~2.80€' }
  ];

  const render = () => {
    // Article progress
    const articlesFound = listStats.articlesFound || 12;
    const totalArticles = listStats.count || 18;
    const progressPct = Math.min(Math.round((articlesFound / totalArticles) * 100), 100);

    el.innerHTML = `
      <!-- Header -->
      <div class="header-home">
        <div>
          <p class="text-3" style="font-size: 14px; margin-bottom: 2px;">Bonjour 👋</p>
          <h1 class="clash" style="font-size: 28px;">${userName || 'TU'}</h1>
        </div>
        <div class="avatar">${(userName || 'TU').substring(0, 2).toUpperCase()}</div>
      </div>

      <!-- Hero Card V3 -->
      <div class="card hero-card" style="padding: 24px; margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            <p style="font-size: 11px; font-weight: 800; color: #22c55e; margin-bottom: 4px; letter-spacing: 0.5px;">● SEMAINE DU 24 MARS</p>
            <p class="text-3" style="font-size: 12px; color: var(--text3);">${listStats.people || '4'} personnes · Équilibré</p>
          </div>
          <div class="badge badge-ouvert" style="background: rgba(30, 64, 175, 0.3); color: #60a5fa; border: none; padding: 4px 8px;">🌿 Saison</div>
        </div>
        
        <div class="hero-stats-v3">
          <div class="hs-box">
            <div class="hs-val-v3">${totalArticles}</div>
            <div class="hs-label-v3">Articles</div>
          </div>
          <div class="hs-box">
            <div class="hs-val-v3">${listStats.total || '53.70€'}</div>
            <div class="hs-label-v3">Estimé</div>
          </div>
          <div class="hs-box">
            <div class="hs-val-v3">68%</div>
            <div class="hs-label-v3">Saison</div>
          </div>
        </div>

        <div class="article-progress">
          <div class="ap-header">
            <span class="ap-title">Progression des courses</span>
            <span class="ap-count">${articlesFound}/${totalArticles} articles</span>
          </div>
          <div class="ap-track">
            <div class="ap-fill" style="width: ${progressPct}%;"></div>
          </div>
        </div>
        
        <button class="btn-main btn-green" id="btn-go-list-home" style="font-size: 15px; padding: 16px;">
          Voir ma liste de courses →
        </button>
      </div>

      <!-- Quick Access Grid -->
      <div style="margin-bottom: 32px;">
        <h3 class="clash" style="font-size: 17px; margin-bottom: 20px;">Accès rapide</h3>
        <div class="responsive-grid" style="grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="card clickable" id="btn-mode-courses" style="padding: 20px; min-height: 140px; display: flex; flex-direction: column; justify-content: space-between; background: #111827;">
            <div>
              <div style="font-size: 24px; margin-bottom: 12px;">🛒</div>
              <p style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Mode courses</p>
              <p class="text-3" style="font-size: 11px;">Navigation guidée en magasin</p>
            </div>
            <div class="badge badge-en-cours" style="align-self: flex-start; margin-top: 12px;">● En cours</div>
          </div>
          
          <div class="card clickable" id="btn-quick-map" style="padding: 20px; min-height: 140px; display: flex; flex-direction: column; justify-content: space-between; background: #111827;">
            <div>
              <div style="font-size: 24px; margin-bottom: 12px;">📍</div>
              <p style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Magasins</p>
              <p class="text-3" style="font-size: 11px;">2 magasins favoris à proximité</p>
            </div>
            <div class="badge badge-ouvert" style="align-self: flex-start; margin-top: 12px;">● Ouvert</div>
          </div>

          <div class="card clickable" id="btn-quick-family" style="padding: 20px; min-height: 140px; display: flex; flex-direction: column; justify-content: space-between; background: #111827;">
            <div>
              <div style="font-size: 24px; margin-bottom: 12px;">🧑‍🤝‍🧑</div>
              <p style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Famille</p>
              <p class="text-3" style="font-size: 11px;">Lucie a ajouté 2 articles</p>
            </div>
            <div class="badge badge-live" style="align-self: flex-start; margin-top: 12px;">● Live</div>
          </div>

          <div class="card clickable" id="btn-quick-new" style="padding: 20px; min-height: 140px; display: flex; flex-direction: column; justify-content: space-between; background: #111827;">
            <div>
              <div style="font-size: 24px; margin-bottom: 12px;">✨</div>
              <p style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Nouvelle liste</p>
              <p class="text-3" style="font-size: 11px;">Générée par IA selon la saison</p>
            </div>
            <div class="badge badge-ia" style="align-self: flex-start; margin-top: 12px; font-size: 9px;">IA ↗</div>
          </div>
        </div>
      </div>

      <!-- Forgotten Items -->
      <div style="margin-bottom: 32px;">
        <h3 class="clash" style="font-size: 17px; margin-bottom: 16px;">Articles souvent oubliés</h3>
        <div class="h-scroll" style="gap: 12px;">
          ${forgottenItems.map(item => `
            <div class="forgotten-item">
              <div class="fi-icon">${item.icon}</div>
              <div class="fi-name">${item.name}</div>
              <div class="fi-price">${item.price}</div>
            </div>
          `).join('')}
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

  render();
  return el;
}
