import { getState } from '../store.js';
import { auth } from '../api/auth.js';

export function createProfileView(userName) {
  const el = document.createElement('div');
  el.className = 'profile-view';
  const state = getState();

  el.innerHTML = `
    <div style="text-align: center; padding: 20px 0 40px;">
      <div style="width: 80px; height: 80px; border-radius: 40px; background: linear-gradient(135deg, var(--accent), var(--teal)); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; border: 4px solid var(--bg2);">👤</div>
      <h2 class="clash" style="font-size: 24px;">${userName || 'Utilisateur'}</h2>
      <p class="text-3" style="font-size: 13px;">Membre depuis Mars 2024</p>
    </div>

    <div class="card" style="padding: 0; overflow: visible;">
      <div class="profile-item" style="padding: 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; cursor: pointer;">
        <div style="font-size: 20px;">🛡️</div>
        <div style="flex: 1;">
          <p style="font-weight: 600; font-size: 14px;">Compte Famille</p>
          <p class="text-3" style="font-size: 11px;">Foyer de ${state.personnes || '4'} personnes</p>
        </div>
        <div class="nt-icon" style="background: var(--bg2); border: 1px solid var(--border2); font-size: 12px;">👤👤</div>
      </div>
      <div class="profile-item" id="p-stats" style="padding: 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; cursor: pointer;">
         <div style="font-size: 20px;">📊</div>
         <div style="flex: 1;">
           <p style="font-weight: 600; font-size: 14px;">Statistiques</p>
           <p class="text-3" style="font-size: 11px;">-15% de dépenses en moyenne</p>
         </div>
      </div>
      <div class="profile-item" id="p-settings" style="padding: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
         <div style="font-size: 20px;">⚙️</div>
         <div style="flex: 1;">
           <p style="font-weight: 600; font-size: 14px;">Paramètres</p>
           <p class="text-3" style="font-size: 11px;">Notifications, Export, Données</p>
         </div>
      </div>
    </div>

    <button class="btn-ghost" id="btn-logout" style="color: var(--red); border-color: rgba(255,64,96,0.2); margin-top: 20px;">Se déconnecter</button>
    <p style="text-align: center; margin-top: 30px; font-size: 10px; color: var(--text3);">Panier Malin v3.0.0-beta</p>
  `;

  el.querySelectorAll('.profile-item').forEach(item => {
    item.onclick = () => {
      alert('Cette fonctionnalité sera disponible dans la version finale ! ✨');
    };
  });

  el.querySelector('#btn-logout').onclick = () => {
    if (confirm('Voulez-vous vous déconnecter ?')) {
      auth.logout();
      location.reload();
    }
  };

  return el;
}
