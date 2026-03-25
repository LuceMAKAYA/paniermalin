import { getState } from '../store.js';
import { auth } from '../api/auth.js';

export function createProfileView(user) {
  const el = document.createElement('div');
  el.className = 'profile-view';
  const state = getState();

  const render = (history = []) => {
    el.innerHTML = `
      <div style="text-align: center; padding: 20px 0 30px;">
        <div style="width: 80px; height: 80px; border-radius: 40px; background: linear-gradient(135deg, var(--accent), var(--teal)); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; border: 4px solid var(--bg2); box-shadow: 0 10px 30px rgba(61,127,255,0.3);">
          ${(user?.name || 'U')[0].toUpperCase()}
        </div>
        <h2 class="clash" style="font-size: 24px;">${user?.name || 'Utilisateur'}</h2>
        <p class="text-3" style="font-size: 13px;">${state.ville || 'Localisation non définie'} · Plan ${user?.type === 'guest' ? 'Invité' : 'Liberté'} · Depuis mars 2024</p>
      </div>

      <!-- 3-Metric Bar -->
      <div style="display: flex; gap: 10px; margin-bottom: 30px;">
         <div class="card" style="flex: 1; text-align: center; padding: 16px; margin-bottom: 0;">
           <p class="clash" style="font-size: 18px; color: var(--green);">${history.length > 0 ? history.reduce((acc, h) => acc + h.stats.total_price, 0).toFixed(0) + '€' : '0€'}</p>
           <p class="text-3" style="font-size: 10px; text-transform: uppercase;">Total</p>
         </div>
         <div class="card" style="flex: 1; text-align: center; padding: 16px; margin-bottom: 0;">
           <p class="clash" style="font-size: 18px; color: var(--teal);">${history.length > 0 ? (history.reduce((acc, h) => acc + h.stats.seasonal_score, 0) / history.length).toFixed(0) + '%' : '--'}</p>
           <p class="text-3" style="font-size: 10px; text-transform: uppercase;">Saison</p>
         </div>
         <div class="card" style="flex: 1; text-align: center; padding: 16px; margin-bottom: 0;">
           <p class="clash" style="font-size: 18px; color: var(--amber);">${history.length}</p>
           <p class="text-3" style="font-size: 10px; text-transform: uppercase;">Courses</p>
         </div>
      </div>

      <!-- AI Insights Section -->
      <div style="margin-bottom: 32px;">
        <h3 class="clash" style="font-size: 15px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span>🤖</span> CE QUE L'IA A APPRIS
        </h3>
        <div class="card" style="padding: 0; background: transparent; border-color: rgba(255,255,255,0.05);">
          <div class="profile-item" style="padding: 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px;">
            <div style="font-size: 20px; width: 32px; text-align: center;">🥛</div>
            <p style="font-size: 13px; flex: 1;">Toujours du <b>lait Lactel</b> — ajouté automatiquement.</p>
          </div>
          <div class="profile-item" style="padding: 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px;">
            <div style="font-size: 20px; width: 32px; text-align: center;">🏪</div>
            <p style="font-size: 13px; flex: 1;">Préférence <b>Lidl</b> pour l'épicerie, <b>marché</b> pour les légumes.</p>
          </div>
        </div>
      </div>

      <!-- History Section -->
      <div style="margin-bottom: 32px;">
        <h3 class="clash" style="font-size: 15px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span>📜</span> HISTORIQUE RÉEL
        </h3>
        ${history.length === 0 ? `
          <div class="card" style="text-align: center; padding: 40px 20px;">
            <p class="text-3" style="font-size: 13px;">Aucune course enregistrée pour le moment.</p>
          </div>
        ` : history.map(h => {
          const date = new Date(h.created_at);
          const day = date.getDate();
          const month = date.toLocaleString('fr-FR', { month: 'short' }).toUpperCase();
          return `
            <div class="card" style="padding: 10px; background: var(--bg2); margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--card); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <span style="font-size: 14px; font-weight: 700;">${day}</span>
                  <span style="font-size: 8px; color: var(--text3);">${month}</span>
                </div>
                <div style="flex: 1;">
                  <p style="font-weight: 600; font-size: 13px;">Course #${h.id.slice(0, 4)}</p>
                  <p class="text-3" style="font-size: 11px;">${h.stats.items_count} articles · ${h.stats.seasonal_score}% saison</p>
                </div>
                <div style="text-align: right;">
                  <p class="green" style="font-weight: 700; font-size: 15px;">${h.stats.total_price.toFixed(0)}€</p>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <button class="btn-ghost" id="btn-logout" style="color: var(--red); border-color: rgba(255,64,96,0.2); margin-top: 20px;">Se déconnecter</button>
      <p style="text-align: center; margin-top: 30px; font-size: 10px; color: var(--text3);">Panier Malin v3.1.0-cloud</p>
    `;

    el.querySelector('#btn-logout').onclick = () => {
      if (confirm('Voulez-vous vous déconnecter ?')) {
        auth.logout();
        location.reload();
      }
    };
  };

  // Initial render (loading state)
  render();

  // Load real history
  auth.getHistory().then(history => {
    render(history);
  });

  return el;
}
