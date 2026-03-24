export function createProfileView(userName) {
  const el = document.createElement('div');
  el.className = 'profile-view';
  const state = getState();

  el.innerHTML = `
    <div style="text-align: center; padding: 20px 0 30px;">
      <div style="width: 80px; height: 80px; border-radius: 40px; background: linear-gradient(135deg, var(--accent), var(--teal)); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; border: 4px solid var(--bg2); box-shadow: 0 10px 30px rgba(61,127,255,0.3);">
        ${(userName || 'U')[0].toUpperCase()}
      </div>
      <h2 class="clash" style="font-size: 24px;">${userName || 'Utilisateur'}</h2>
      <p class="text-3" style="font-size: 13px;">Auxerre · Plan Famille · Depuis mars 2024</p>
    </div>

    <!-- 3-Metric Bar -->
    <div style="display: flex; gap: 10px; margin-bottom: 30px;">
       <div class="card" style="flex: 1; text-align: center; padding: 16px; margin-bottom: 0;">
         <p class="clash" style="font-size: 20px; color: var(--green);">438€</p>
         <p class="text-3" style="font-size: 10px; text-transform: uppercase;">Ce mois</p>
       </div>
       <div class="card" style="flex: 1; text-align: center; padding: 16px; margin-bottom: 0;">
         <p class="clash" style="font-size: 20px; color: var(--teal);">68%</p>
         <p class="text-3" style="font-size: 10px; text-transform: uppercase;">Saison</p>
       </div>
       <div class="card" style="flex: 1; text-align: center; padding: 16px; margin-bottom: 0;">
         <p class="clash" style="font-size: 20px; color: var(--amber);">4.2 <span style="font-size: 14px;">⭐</span></p>
         <p class="text-3" style="font-size: 10px; text-transform: uppercase;">Note Moy.</p>
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
          <div style="font-size: 20px; width: 32px; text-align: center;">📅</div>
          <p style="font-size: 13px; flex: 1;">Vous faites les courses <b>samedi matin</b> — rappel à 9h.</p>
        </div>
        <div class="profile-item" style="padding: 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 20px; width: 32px; text-align: center;">🏪</div>
          <p style="font-size: 13px; flex: 1;">Préférence <b>Lidl</b> pour l'épicerie, <b>marché</b> pour les légumes.</p>
        </div>
        <div class="profile-item" style="padding: 14px; display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 20px; width: 32px; text-align: center;">🫒</div>
          <p style="font-size: 13px; flex: 1;">Stock d'<b>huile d'olive</b> estimé épuisé → ajouté à la liste.</p>
        </div>
      </div>
    </div>

    <!-- History Section -->
    <div style="margin-bottom: 32px;">
      <h3 class="clash" style="font-size: 15px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <span>📜</span> HISTORIQUE
      </h3>
      <div class="card" style="padding: 10px; background: var(--bg2);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--card); display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 14px; font-weight: 700;">15</span>
            <span style="font-size: 8px; color: var(--text3);">MAR</span>
          </div>
          <div style="flex: 1;">
            <p style="font-weight: 600; font-size: 13px;">Semaine 11 · 4 personnes</p>
            <p class="text-3" style="font-size: 11px;">Lidl + Marché · 18 articles</p>
            <div style="color: var(--amber); font-size: 10px;">★★★★☆ <span class="text-3" style="margin-left:8px;">72% saison</span></div>
          </div>
          <div style="text-align: right;">
            <p class="green" style="font-weight: 700; font-size: 15px;">108€</p>
            <p class="text-3" style="font-size: 9px;">Lidl</p>
          </div>
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
