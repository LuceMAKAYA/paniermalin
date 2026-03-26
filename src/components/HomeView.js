/**
 * HomeView.js – Panier Malin 3.0 (Mobile PWA)
 */


export function createHomeView(userName, listStats, onSwitchTab) {
  const el = document.createElement('div');
  el.className = 'home-view fade-in';

  // Get a random tip
  const tips = [
    { icon: '💡', text: "Achetez les fruits de saison pour économiser jusqu'à 30%." },
    { icon: '🥗', text: "Cuisinez en gros le dimanche pour gagner du temps en semaine." },
    { icon: '📱', text: "Scannez vos tickets pour suivre l'évolution des prix." },
    { icon: '🌿', text: "Privilégiez le vrac pour réduire vos déchets plastiques." }
  ];
  const dailyTip = tips[Math.floor(Math.random() * tips.length)];

  const render = () => {
    // Calculate budget percentage
    const budgetRaw = parseFloat(listStats.total?.replace('€', '') || 0);
    const budgetGoal = listStats.budgetGoal || 150;
    const budgetPct = Math.min(Math.round((budgetRaw / budgetGoal) * 100), 100);

    el.innerHTML = `
      <div style="padding: 10px 0 24px;">
        <p class="text-3" style="font-size: 14px; margin-bottom: 4px;">Ravi de vous revoir,</p>
        <h1 class="clash text-gradient" style="font-size: 32px; letter-spacing: -1px;">${userName || 'Utilisateur'}</h1>
      </div>

      <!-- Hero Card Premium -->
      <div class="card hero-card" style="padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <p style="font-size: 11px; font-weight: 800; color: var(--teal); margin-bottom: 6px; letter-spacing: 1px;">✧ SEMAINE ACTUELLE</p>
            <h2 class="clash" style="font-size: 20px; margin-bottom: 2px;">Votre Panier Malin</h2>
            <p class="text-3" style="font-size: 12px; color: rgba(255,255,255,0.5);">${listStats.people || '4'} personnes · Mode Écogestion</p>
          </div>
          <div class="badge badge-ia">IA Active 🤖</div>
        </div>
        
        <div class="hero-stats">
          <div class="hs">
            <div class="hs-val">${listStats.count || '0'}</div>
            <div class="hs-label">Articles</div>
          </div>
          <div style="width: 1px; background: rgba(255,255,255,0.1); margin: 5px 0;"></div>
          <div class="hs">
            <div class="hs-val">${listStats.total || '0.00€'}</div>
            <div class="hs-label">Estimé</div>
          </div>
          <div style="width: 1px; background: rgba(255,255,255,0.1); margin: 5px 0;"></div>
          <div class="hs">
            <div class="hs-val">Saison</div>
            <div class="hs-label">100% Frais</div>
          </div>
        </div>

        ${listStats.hasList ? `
          <div class="mini-budget">
            <div class="mb-header">
              <span class="mb-title">Progression du budget</span>
              <span class="mb-pct" style="color: ${budgetPct > 90 ? 'var(--red)' : budgetPct > 70 ? 'var(--amber)' : 'var(--green)'}">${budgetPct}%</span>
            </div>
            <div class="mb-track-home">
              <div class="mb-fill-home" style="width: ${budgetPct}%; background: ${budgetPct > 90 ? 'var(--red)' : budgetPct > 70 ? 'var(--amber)' : 'linear-gradient(90deg, var(--green), var(--teal))'}"></div>
            </div>
          </div>
        ` : ''}
        
        <button class="btn-main" id="btn-go-list-home" style="margin-top: 24px;">
          ${listStats.hasList ? 'Accéder à mon panier →' : 'Planifier ma semaine →'}
        </button>
      </div>

      <!-- Discovery Section -->
      <div style="margin-bottom: 32px;">
        <h3 class="clash" style="font-size: 18px; margin-bottom: 16px;">Services rapides</h3>
        <div class="responsive-grid">
          <div class="card clickable glass" id="btn-mode-courses" style="padding: 20px;">
            <div style="font-size: 28px; margin-bottom: 12px;">🛍️</div>
            <p style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">Mode courses</p>
            <p class="text-3" style="font-size: 11px; margin-bottom: 12px;">Optimisation en rayon</p>
            <div class="badge badge-en-cours">Prêt</div>
          </div>
          
          <div class="card clickable glass" id="btn-quick-map" style="padding: 20px;">
            <div style="font-size: 28px; margin-bottom: 12px;">🗺️</div>
            <p style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">Magasins proches</p>
            <p class="text-3" style="font-size: 11px; margin-bottom: 12px;">Trouver le meilleur prix</p>
            <div class="badge badge-ouvert">6 ouverts</div>
          </div>
        </div>
      </div>

      <!-- Tip of the day -->
      <div class="card tip-card clickable" style="margin-bottom: 32px;">
        <div class="tip-icon">${dailyTip.icon}</div>
        <div>
          <p style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">Conseil Malin</p>
          <p class="text-3" style="font-size: 12px;">${dailyTip.text}</p>
        </div>
      </div>

      <!-- Secondary Actions -->
      <div class="responsive-grid" style="grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="card clickable" id="btn-quick-new" style="padding: 16px; border-style: dashed; background: transparent; border-color: var(--border2);">
          <div style="font-size: 20px; margin-bottom: 8px;">✨</div>
          <p style="font-weight: 600; font-size: 13px;">Nouvelle liste</p>
        </div>
        <div class="card clickable" id="btn-quick-family" style="padding: 16px; border-style: dashed; background: transparent; border-color: var(--border2);">
          <div style="font-size: 20px; margin-bottom: 8px;">👥</div>
          <p style="font-weight: 600; font-size: 13px;">Partager</p>
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
