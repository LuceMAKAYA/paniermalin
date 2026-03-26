import { getState } from '../store.js';
import { auth } from '../api/auth.js';
import { shopping } from '../api/shopping.js';
import { family } from '../api/family.js';

export function createProfileView(user) {
  const el = document.createElement('div');
  el.className = 'profile-view';
  const state = getState();

  let userFamily = null;
  let familyMembers = [];
  let userPrefs = null;

  const render = (history = []) => {
    const totalSpent = history.reduce((acc, h) => acc + (h.actual_spent || h.total_budget || 0), 0) / 100;
    const avgSeasonal = 75; 

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
           <p class="clash" style="font-size: 18px; color: var(--green);">${totalSpent.toFixed(0)}€</p>
           <p class="text-3" style="font-size: 10px; text-transform: uppercase;">Total</p>
         </div>
         <div class="card" style="flex: 1; text-align: center; padding: 16px; margin-bottom: 0;">
           <p class="clash" style="font-size: 18px; color: var(--teal);">${avgSeasonal}%</p>
           <p class="text-3" style="font-size: 10px; text-transform: uppercase;">Saison</p>
         </div>
         <div class="card" style="flex: 1; text-align: center; padding: 16px; margin-bottom: 0;">
           <p class="clash" style="font-size: 18px; color: var(--amber);">${history.length}</p>
           <p class="text-3" style="font-size: 10px; text-transform: uppercase;">Courses</p>
         </div>
      </div>

      <!-- Family Section -->
      <div style="margin-bottom: 32px;">
        <h3 class="clash" style="font-size: 15px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span>🏠</span> MA FAMILLE
        </h3>
        <div id="family-container">
          ${renderFamilyContent()}
        </div>
      </div>

      <!-- Food Prefs Section -->
      <div style="margin-bottom: 32px;">
        <h3 class="clash" style="font-size: 15px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span>🥗</span> MES PRÉFÉRENCES
        </h3>
        <div class="card" style="padding: 20px;">
          <div style="margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
            <p class="text-3" style="font-size: 10px; text-transform: uppercase; margin-bottom: 10px;">Budget hebdomadaire cible</p>
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="number" id="input-budget-goal" value="${(userPrefs?.budget_goal || 150)}" style="background: var(--bg); border: 1px solid var(--border); color: white; padding: 8px 12px; border-radius: 8px; width: 80px; font-weight: 700;">
              <span class="clash" style="font-size: 16px;">€</span>
              <button class="btn-ghost" id="btn-save-budget" style="padding: 8px 16px; font-size: 11px; margin-bottom: 0;">Mettre à jour</button>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <p class="text-3" style="font-size: 10px; text-transform: uppercase; margin-bottom: 6px;">Régime & Foyer</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span class="badge" style="background: rgba(34,197,94,0.1); color: #22c55e;">${userPrefs?.household_size || 2} personnes</span>
              ${(userPrefs?.dietary_regime || ['omnivore']).map(r => `<span class="badge" style="background: rgba(59,130,246,0.1); color: #3b82f6;">${r}</span>`).join('')}
            </div>
          </div>
          <div>
            <p class="text-3" style="font-size: 10px; text-transform: uppercase; margin-bottom: 6px;">Cuisines préférées</p>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${(userPrefs?.cuisines || ['francaise']).map(c => `<span style="font-size: 12px; background: var(--bg2); padding: 4px 10px; border-radius: 8px;">${c}</span>`).join('')}
            </div>
          </div>
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
          const price = (h.actual_spent || h.total_budget || 0) / 100;
          return `
            <div class="card" style="padding: 10px; background: var(--bg2); margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--card); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <span style="font-size: 14px; font-weight: 700;">${day}</span>
                  <span style="font-size: 8px; color: var(--text3);">${month}</span>
                </div>
                <div style="flex: 1;">
                  <p style="font-weight: 600; font-size: 13px;">${h.title || 'Course'}</p>
                  <p class="text-3" style="font-size: 11px;">Statut: ${h.status}</p>
                </div>
                <div style="text-align: right;">
                  <p class="green" style="font-weight: 700; font-size: 15px;">${price.toFixed(0)}€</p>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <button class="btn-ghost" id="btn-logout" style="color: var(--red); border-color: rgba(255,64,96,0.2); margin-top: 20px;">Se déconnecter</button>
      <p style="text-align: center; margin-top: 30px; font-size: 10px; color: var(--text3);">Panier Malin v3.1.0-cloud</p>
    `;

    bindFamilyEvents();

    el.querySelector('#btn-logout').onclick = () => {
      if (confirm('Voulez-vous vous déconnecter ?')) {
        auth.logout();
        location.reload();
      }
    };
  };

  function renderFamilyContent() {
    if (!userFamily) {
      return `
        <div class="card" style="padding: 24px; text-align: center; background: rgba(255,255,255,0.02);">
          <p class="text-3" style="font-size: 13px; margin-bottom: 20px;">Partagez vos listes avec votre foyer</p>
          <div style="display: flex; gap: 12px;">
            <button class="btn-ghost" id="btn-create-fam" style="flex: 1; font-size: 12px; padding: 12px;">Créer</button>
            <button class="btn-ghost" id="btn-join-fam" style="flex: 1; font-size: 12px; padding: 12px;">Rejoindre</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h4 style="font-size: 16px; font-weight: 700;">${userFamily.name}</h4>
            <p class="text-3" style="font-size: 11px; margin-top: 2px;">Code d'invitation : <b style="color: var(--accent);">${userFamily.invite_code}</b></p>
          </div>
          <div class="badge" style="background: var(--bg2); color: var(--text3); font-size: 10px;">${familyMembers.length} membres</div>
        </div>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${familyMembers.map(m => `
            <div title="${m.name}" style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; border: 2px solid var(--card);">
              ${m.name[0].toUpperCase()}
            </div>
          `).join('')}
          <div style="width: 32px; height: 32px; border-radius: 50%; border: 2px dashed var(--border); display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--text3); cursor: pointer;" onclick="alert('Partagez le code ${userFamily.invite_code} pour inviter !')">+</div>
        </div>
      </div>
    `;
  }

  function bindFamilyEvents() {
    const btnCreate = el.querySelector('#btn-create-fam');
    const btnJoin = el.querySelector('#btn-join-fam');

    if (btnCreate) {
      btnCreate.onclick = async () => {
        const name = prompt('Nom de votre famille (ex: Famille Smith) :');
        if (name) {
          try {
            await family.createFamily(name, user.id);
            loadData();
          } catch (err) {
            alert('Erreur lors de la création');
          }
        }
      };
    }

    if (btnJoin) {
      btnJoin.onclick = async () => {
        const code = prompt('Entrez le code d\'invitation :');
        if (code) {
          try {
            await family.joinFamily(code, user.id);
            loadData();
          } catch (err) {
            alert(err.message);
          }
        }
      };
    }
  }

  async function loadData() {
    try {
      const [hist, famData, prefsData] = await Promise.all([
        shopping.getHistory(user?.id),
        family.getUserFamily(user?.id),
        profile.getFoodPreferences(user?.id)
      ]);
      
      userFamily = famData;
      userPrefs = prefsData;
      if (userFamily) {
        familyMembers = await family.getFamilyMembers(userFamily.id);
      }
      
      render(hist);
    } catch (err) {
      console.error(err);
      render([]);
    }
  }

  // Initial load
  loadData();

  return el;
}


