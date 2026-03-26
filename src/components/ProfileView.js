import { getState } from '../store.js';
import { auth } from '../api/auth.js';
import { shopping } from '../api/shopping.js';
import { family } from '../api/family.js';
import { profile } from '../api/profile.js';

export function createProfileView(user) {
  const el = document.createElement('div');
  el.className = 'profile-view';
  const state = getState();

  let userFamily = null;
  let familyMembers = [];
  let userPrefs = null;

  const render = (history = []) => {
    const totalSpent = (history.reduce((acc, h) => acc + (h.actual_spent || h.total_budget || 0), 0) / 100).toFixed(0);
    // Fix: Calculate real average seasonal score from history
    const avgSeasonal = history.length > 0 
      ? Math.round(history.reduce((acc, h) => acc + (h.seasonal_pct || 0), 0) / history.length)
      : 0; 

    el.innerHTML = `
      <div class="animate-fade-up" style="text-align: center; padding: 20px 0 40px;">
        <div style="position: relative; width: 100px; height: 100px; margin: 0 auto 20px;">
          <div style="position: absolute; inset: -4px; border-radius: 50%; background: var(--accent-grad); opacity: 0.3; filter: blur(12px); animation: pulse 3s infinite;"></div>
          <div style="position: relative; width: 100%; height: 100%; border-radius: 50%; background: var(--bg2); border: 4px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 38px; color: var(--accent); font-weight: 800; box-shadow: var(--shadow-lg); overflow: hidden;">
            <div style="position: absolute; inset: 0; background: var(--accent-grad); opacity: 0.1;"></div>
            ${(user?.name || 'U')[0].toUpperCase()}
          </div>
        </div>
        <h2 class="clash" style="font-size: 28px; line-height: 1.1;">Bonjour, ${user?.name || 'Voisin'}</h2>
        <p class="text-3" style="font-size: 13px; font-weight: 600; margin-top: 8px; opacity: 0.7;">
          <span style="color: var(--accent);">●</span> ${state.ville || 'Localisation non définie'} · 
          <span style="color: var(--teal);">●</span> ${user?.type === 'guest' ? 'Compte Invité' : 'Membre Premium'}
        </p>
      </div>

      <!-- 3-Metric Bar -->
      <div class="animate-fade-up" style="display: flex; gap: 12px; margin-bottom: 32px; animation-delay: 0.1s;">
         <div class="card glass" style="flex: 1; text-align: center; padding: 18px 10px; margin-bottom: 0;">
           <p class="text-3" style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; opacity: 0.6;">DÉPENSÉ</p>
           <p class="clash" style="font-size: 22px; color: var(--green);">${totalSpent}€</p>
         </div>
         <div class="card glass" style="flex: 1; text-align: center; padding: 18px 10px; margin-bottom: 0;">
           <p class="text-3" style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; opacity: 0.6;">SAISON</p>
           <p class="clash" style="font-size: 22px; color: var(--teal);">${avgSeasonal}%</p>
         </div>
         <div class="card glass" style="flex: 1; text-align: center; padding: 18px 10px; margin-bottom: 0;">
           <p class="text-3" style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; opacity: 0.6;">COURSES</p>
           <p class="clash" style="font-size: 22px; color: var(--amber);">${history.length}</p>
         </div>
      </div>

      <!-- Family Section -->
      ${user?.type === 'user' ? `
      <div class="animate-fade-up" style="margin-bottom: 32px; animation-delay: 0.2s;">
        <h3 class="clash" style="font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; padding-left: 4px;">
          <span style="width: 32px; height: 32px; background: rgba(59,130,246,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">🏠</span>
          VOTRE FOYER
        </h3>
        <div id="family-container">
          ${renderFamilyContent()}
        </div>
      </div>
      ` : ''}

      <!-- Food Prefs Section -->
      <div class="animate-fade-up" style="margin-bottom: 32px; animation-delay: 0.3s;">
        <h3 class="clash" style="font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; padding-left: 4px;">
          <span style="width: 32px; height: 32px; background: rgba(16,185,129,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">🥗</span>
          PRÉFÉRENCES
        </h3>
        <div class="card glass" style="padding: 24px;">
          <div style="margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 20px;">
            <p class="text-3" style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--accent); margin-bottom: 12px;">Objectif budget hebdomadaire</p>
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="number" id="input-budget-goal" value="${(userPrefs?.budget_goal || 150)}" style="background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: white; padding: 10px 16px; border-radius: 12px; width: 90px; font-weight: 700; font-size: 16px;">
              <span class="clash" style="font-size: 20px; opacity: 0.8;">€</span>
              <button class="btn-ghost" id="btn-save-budget" style="padding: 10px 20px; font-size: 12px; margin-bottom: 0; flex: 1;">Enregistrer</button>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <p class="text-3" style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--accent); margin-bottom: 8px;">Régime & Taille du foyer</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span class="badge" style="background: rgba(34,197,94,0.15); color: #4ade80; border-color: rgba(34,197,94,0.3);">${userPrefs?.household_size || 2} pers.</span>
              ${(userPrefs?.dietary_regime || ['omnivore']).map(r => `<span class="badge" style="background: rgba(59,130,246,0.15); color: var(--accent); border-color: rgba(59,130,246,0.3);">${r}</span>`).join('')}
            </div>
          </div>
          <div>
            <p class="text-3" style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--accent); margin-bottom: 8px;">Cuisines de prédilection</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${(userPrefs?.cuisines || ['Française']).map(c => `
                <span style="font-size: 11px; font-weight: 700; background: var(--bg2); border: 1px solid var(--border); padding: 6px 14px; border-radius: 20px; color: var(--text2);">${c}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- AI Insights Section -->
      <div class="animate-fade-up" style="margin-bottom: 40px; animation-delay: 0.4s;">
        <h3 class="clash" style="font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; padding-left: 4px;">
          <span style="width: 32px; height: 32px; background: rgba(167,139,250,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">🤖</span>
          ANALYSE INTELLIGENTE
        </h3>
        <div class="card glass" style="padding: 0; overflow: hidden; border-color: rgba(167,139,250,0.2);">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px; background: rgba(167,139,250,0.03);">
            <div style="font-size: 22px; filter: drop-shadow(0 0 5px rgba(167,139,250,0.4));">🛒</div>
            <p style="font-size: 13px; line-height: 1.4;">Préfère les marques <b>Distributeur</b> pour les produits secs.</p>
          </div>
          <div style="padding: 16px 20px; display: flex; align-items: center; gap: 16px;">
            <div style="font-size: 22px; filter: drop-shadow(0 0 5px rgba(59,130,246,0.4));">📅</div>
            <p style="font-size: 13px; line-height: 1.4;">Habitude de course observée le <b>Samedi matin</b>.</p>
          </div>
        </div>
      </div>

      <!-- History Section -->
      <div class="animate-fade-up" style="margin-bottom: 32px; animation-delay: 0.5s;">
        <h3 class="clash" style="font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; padding-left: 4px;">
          <span style="width: 32px; height: 32px; background: rgba(245,158,11,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">📜</span>
          DERNIÈRES COURSES
        </h3>
        ${history.length === 0 ? `
          <div class="card glass" style="text-align: center; padding: 40px 20px; border-style: dashed; opacity: 0.6;">
            <p class="text-3" style="font-size: 13px; font-weight: 500;">Votre historique s'affichera ici après vos premiers achats.</p>
          </div>
        ` : history.slice(0, 5).map(h => {
          const date = new Date(h.created_at);
          const day = date.getDate();
          const month = date.toLocaleString('fr-FR', { month: 'short' }).toUpperCase();
          const price = (h.actual_spent || h.total_budget || 0) / 100;
          return `
            <div class="card clickable" style="padding: 14px; background: rgba(255,255,255,0.02); margin-bottom: 12px; border-color: var(--border);">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--bg); border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                  <span style="font-size: 16px; font-weight: 800; color: var(--accent); line-height: 1;">${day}</span>
                  <span style="font-size: 9px; font-weight: 900; color: var(--text3); letter-spacing: 0.5px;">${month}</span>
                </div>
                <div style="flex: 1;">
                  <p style="font-weight: 700; font-size: 14px; color: var(--text);">${h.title || 'Course Optimisée'}</p>
                  <p class="text-3" style="font-size: 11px; font-weight: 600; opacity: 0.6;">${h.status === 'completed' ? '❤️ Complétée' : '⏳ En cours'}</p>
                </div>
                <div style="text-align: right;">
                  <p class="clash" style="font-weight: 800; font-size: 18px; color: var(--green);">${price.toFixed(0)}€</p>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <button class="btn-ghost" id="btn-logout" style="color: var(--red); border-color: rgba(239,68,68,0.2); margin-top: 20px; background: rgba(239,68,68,0.03); font-weight: 800; letter-spacing: 0.5px;">DÉCONNEXION</button>
      <p style="text-align: center; margin-top: 40px; font-size: 11px; color: var(--text3); font-weight: 600; letter-spacing: 0.5px;">PANIER MALIN • ALPHA v3.1.2</p>
      <div style="height: 40px;"></div>
    `;

    bindFamilyEvents();

    const btnSaveBudget = el.querySelector('#btn-save-budget');
    if (btnSaveBudget) {
      btnSaveBudget.onclick = async () => {
        const newBudget = parseInt(el.querySelector('#input-budget-goal').value);
        if (newBudget > 0) {
          btnSaveBudget.disabled = true;
          btnSaveBudget.textContent = '...';
          try {
            if (typeof profile !== 'undefined' && profile.updateFoodPreferences) {
              await profile.updateFoodPreferences(user.id, { ...userPrefs, budget_goal: newBudget });
              userPrefs.budget_goal = newBudget;
              showToast('✅ Budget mis à jour !');
            }
          } catch (err) {
            showToast('❌ Erreur: ' + err.message);
          } finally {
            btnSaveBudget.disabled = false;
            btnSaveBudget.textContent = 'Mettre à jour';
          }
        }
      };
    }

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
        (typeof profile !== 'undefined' && profile?.getFoodPreferences) ? profile.getFoodPreferences(user?.id) : Promise.resolve(null)
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


