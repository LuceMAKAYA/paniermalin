/**
 * main.js – Panier Malin 3.0 (Mobile PWA)
 */
import './style.css';
import { createFormView } from './components/FormView.js';
import { createResultsView } from './components/ResultsView.js';
import { createHomeView } from './components/HomeView.js';
import { createMapView } from './components/MapView.js';
import { createProfileView } from './components/ProfileView.js';
import { createLandingView } from './components/LandingView.js';
import { generateShoppingList } from './api/groq.js';
import { fetchNearbyStores } from './api/places.js';
import { buildPrompt } from './utils/prompt.js';
import { getState } from './store.js';

import { auth } from './api/auth.js';
import { shopping } from './api/shopping.js';
import { supabase } from './supabase.js';

// ── App State ─────────────────────────────────────────────
let currentUser = auth.getSession();
let activeTab = 'home'; // home, list, map, profile, setup
let currentListData = null;
let currentStoreData = currentUser?.storeData || null;

// ── Elements ──────────────────────────────────────────────
const app = document.getElementById('app');
const container = document.createElement('div');
container.className = 'screen-container';
app.appendChild(container);

// ── Views ─────────────────────────────────────────────────
function renderActiveTab() {
  container.innerHTML = '';
  
  if (!currentUser) {
    container.appendChild(createLandingView((user) => {
      currentUser = user;
      activeTab = 'home';
      boot(); // Full boot after login
    }));
    return;
  }

  if (activeTab === 'setup') {
    renderSetup();
    renderBottomNav();
    return;
  }

  // Common Layout for Main Tabs
  const scrollArea = document.createElement('div');
  scrollArea.className = 'scroll-area';
  container.appendChild(scrollArea);

  switch (activeTab) {
    case 'home':
      const stats = {
        hasList: !!currentListData,
        people: getState().personnes,
        count: currentListData ? currentListData.categories.reduce((acc, c) => acc + c.articles.length, 0) : 0,
        articlesFound: currentListData ? currentListData.categories.reduce((acc, c) => acc + c.articles.filter(a => a.done).length, 0) : 0,
        total: currentListData ? (currentListData.total_estime).toFixed(2) + '€' : '0.00€',
        budgetGoal: getState().budget
      };
      scrollArea.appendChild(createHomeView(currentUser.name, stats, switchTab));
      break;

    case 'list':
      if (!currentListData) {
        scrollArea.innerHTML = `
          <div style="text-align: center; padding-top: 60px;">
            <div style="font-size: 48px; margin-bottom: 20px;">🛍️</div>
            <h2 class="clash">Aucune liste active</h2>
            <p class="text-3 mb-20">Commencez par générer votre panier intelligent.</p>
            <button class="btn-main" onclick="window.__switchTab('setup')">Créer ma liste</button>
          </div>
        `;
      } else {
        const listEl = createResultsView(currentListData, getState().budget, () => switchTab('setup'), currentStoreData, async () => {
          // Re-sync if changed
          console.log("List changed locally, syncing stats...");
        });
        scrollArea.appendChild(listEl);
      }
      break;

    case 'map':
      scrollArea.appendChild(createMapView(currentStoreData, (storeName) => {
        alert(`Magasin sélectionné : ${storeName}. Vous pouvez maintenant voir les prix pour ce magasin dans l'onglet Liste.`);
        switchTab('list');
      }));
      break;

    case 'profile':
      scrollArea.appendChild(createProfileView(currentUser));
      break;
  }

  renderBottomNav();
}

function renderSetup() {
  const formEl = createFormView(handleGenerate);
  container.appendChild(formEl);
}

// ── Navigation ────────────────────────────────────────────
function switchTab(tabId) {
  activeTab = tabId;
  renderActiveTab();
}
window.__switchTab = switchTab;

function renderBottomNav() {
  let nav = app.querySelector('.bottom-nav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    app.appendChild(nav);
  }

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Accueil' },
    { id: 'list', icon: '🛍️', label: 'Liste' },
    { id: 'map', icon: '🗺️', label: 'Carte' },
    { id: 'profile', icon: '👤', label: 'Profil' }
  ];

  nav.innerHTML = tabs.map(t => `
    <div class="nav-tab ${activeTab === t.id ? 'active' : ''}" onclick="window.__switchTab('${t.id}')">
      <div class="nt-icon">${t.icon}</div>
      <div class="nt-label">${t.label}</div>
    </div>
  `).join('');
}

// ── Generate Handler ──────────────────────────────────────
async function handleGenerate() {
  activeTab = 'loading';
  renderLoading();

  try {
    const state = getState();
    updateLoadingStep(0);
    await new Promise(r => setTimeout(r, 600));

    updateLoadingStep(1);
    await new Promise(r => setTimeout(r, 600));

    updateLoadingStep(2);
    let storeData = null;
    if (state.ville && state.ville.trim().length > 3) {
      storeData = await fetchNearbyStores(state.ville);
    }
    await new Promise(r => setTimeout(r, 500));

    updateLoadingStep(3);
    const prompt = buildPrompt(state, storeData?.promptString || null);
    const data   = await generateShoppingList(prompt);
    
    currentListData = data;
    currentStoreData = storeData;
    
    // Save minimal metadata to profile (like town)
    await auth.updateSessionData({ city: state.ville });

    updateLoadingStep(4);
    await new Promise(r => setTimeout(r, 400));

    activeTab = 'list';
    renderActiveTab();
  } catch (err) {
    activeTab = 'setup';
    renderActiveTab();
    alert("Erreur: " + err.message);
  }
}

function renderLoading() {
  container.innerHTML = `
    <div class="gen-page">
      <div class="gen-orb">🤖</div>
      <h2 class="clash">Génération en cours…</h2>
      <p class="text-3 mb-20">Votre panier intelligent se prépare</p>
      <div id="gen-steps" style="width: 100%;">
        <div class="gs act" id="g0"><div class="gd"></div>Analyse du profil</div>
        <div class="gs" id="g1"><div class="gd"></div>Sélection saison</div>
        <div class="gs" id="g2"><div class="gd"></div>Recherche magasins</div>
        <div class="gs" id="g3"><div class="gd"></div>IA Génération</div>
        <div class="gs" id="g4"><div class="gd"></div>Finalisation</div>
      </div>
    </div>
  `;
}

function updateLoadingStep(idx) {
  const steps = container.querySelectorAll('.gs');
  steps.forEach((s, i) => {
    s.classList.toggle('act', i === idx);
    s.classList.toggle('done', i < idx);
    if (i < idx) s.innerHTML = '<span>✓</span> ' + s.textContent.trim();
  });
}

// ── Boot ──────────────────────────────────────────────────
let listSubscription = null;

async function boot() {
  // 1. Get current auth user directly from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    currentUser = { ...user, name: user.user_metadata?.full_name || user.email };
    
    // 2. Fetch active list from database
    try {
      const activeList = await shopping.getActiveList(user.id);
      if (activeList) {
        currentListData = activeList;
        
        // 3. Subscribe to real-time changes
        if (listSubscription) listSubscription.unsubscribe();
        listSubscription = shopping.subscribeToList(activeList.id, (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new;
            // Update local state
            currentListData.categories.forEach(cat => {
              cat.articles.forEach(art => {
                if (art.id === updatedItem.id) {
                  art.done = updatedItem.is_checked;
                }
              });
            });
            // Re-render ONLY if we are on a tab that uses this data
            if (activeTab === 'home' || activeTab === 'list') {
              renderActiveTab();
            }
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            // Simplify: just fetch full list again for now to maintain category structure
            shopping.getActiveList(user.id).then(newList => {
              currentListData = newList;
              renderActiveTab();
            });
          }
        });
      }
    } catch (e) {
      console.warn("Could not fetch active list", e);
    }
  }

  renderActiveTab();
}

boot();

