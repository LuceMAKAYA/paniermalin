import { auth } from '../api/auth.js';

export function createLandingView(onSuccess) {
  const el = document.createElement('div');
  el.className = 'landing-page';
  el.style.minHeight = '100%';
  
  let mode = 'welcome'; // welcome, login, signup, guest

  const render = () => {
    el.innerHTML = `
      <div style="padding: 60px 24px; text-align: center; max-width: 450px; margin: 0 auto;">
        <div style="font-size: 64px; margin-bottom: 24px;">🛒</div>
        <h1 class="clash" style="font-size: 42px; margin-bottom: 12px; background: linear-gradient(135deg, white, var(--text2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Panier Malin</h1>
        <p class="text-2" style="font-size: 16px; margin-bottom: 48px;">L'assistant de courses intelligent.</p>

        <div id="auth-content">
          ${renderModeContent()}
        </div>

        <p id="auth-error" style="color: var(--red); font-size: 12px; margin-top: 16px; display: none;"></p>
      </div>
    `;
    attachEvents();
  };

  const renderModeContent = () => {
    switch (mode) {
      case 'welcome':
        return `
          <div class="card" style="background: rgba(255,255,255,0.03);">
            <button class="btn-main mb-12" id="goto-signup">S'inscrire ✦</button>
            <button class="btn-ghost mb-12" id="goto-login" style="border-style: solid;">Se connecter</button>
            <p style="margin: 16px 0; font-size: 11px; color: var(--text3);">OU</p>
            <button class="btn-ghost" id="goto-guest" style="border-color: rgba(61,127,255,0.3);">Mode Invité ✨</button>
          </div>
        `;
      case 'signup':
        return `
          <div class="card" style="text-align: left;">
            <p class="field-label">CRÉER UN COMPTE</p>
            <input class="input-field" id="su-name" placeholder="Votre nom complet" type="text">
            <input class="input-field" id="su-email" placeholder="Email" type="email">
            <input class="input-field" id="su-pass" placeholder="Mot de passe" type="password">
            <button class="btn-main" id="do-signup">Rejoindre Panier Malin</button>
            <button class="btn-ghost mt-10" id="back-welcome">Retour</button>
          </div>
        `;
      case 'login':
        return `
          <div class="card" style="text-align: left;">
            <p class="field-label">CONNEXION</p>
            <input class="input-field" id="li-email" placeholder="Email" type="email">
            <input class="input-field" id="li-pass" placeholder="Mot de passe" type="password">
            <button class="btn-main" id="do-login">Se connecter</button>
            <button class="btn-ghost mt-10" id="back-welcome">Retour</button>
          </div>
        `;
      case 'guest':
        return `
          <div class="card" style="text-align: left;">
            <p class="field-label">MODE INVITÉ</p>
            <p class="text-3 mb-12" style="font-size: 12px;">Vos données seront enregistrées localement uniquement.</p>
            <input class="input-field" id="gu-name" placeholder="Votre prénom" type="text" autofocus>
            <button class="btn-main" id="do-guest">Commencer →</button>
            <button class="btn-ghost mt-10" id="back-welcome">Retour</button>
          </div>
        `;
    }
  };

  const attachEvents = () => {
    const showError = (msg) => {
      const err = el.querySelector('#auth-error');
      err.textContent = msg;
      err.style.display = 'block';
    };

    // Navigation
    el.querySelector('#goto-signup')?.addEventListener('click', () => { mode = 'signup'; render(); });
    el.querySelector('#goto-login')?.addEventListener('click', () => { mode = 'login'; render(); });
    el.querySelector('#goto-guest')?.addEventListener('click', () => { mode = 'guest'; render(); });
    el.querySelector('#back-welcome')?.addEventListener('click', () => { mode = 'welcome'; render(); });

    // Actions
    el.querySelector('#do-signup')?.addEventListener('click', async () => {
      const name = el.querySelector('#su-name').value;
      const email = el.querySelector('#su-email').value;
      const pass = el.querySelector('#su-pass').value;
      if (!name || !email || !pass) return showError('Veuillez remplir tous les champs.');
      
      const btn = el.querySelector('#do-signup');
      btn.disabled = true; btn.textContent = 'Création...';
      
      try {
        const user = await auth.signup(name, email, pass);
        onSuccess(user);
      } catch (e) { 
        showError(e.message); 
        btn.disabled = false; btn.textContent = "Rejoindre Panier Malin";
      }
    });

    el.querySelector('#do-login')?.addEventListener('click', async () => {
      const email = el.querySelector('#li-email').value;
      const pass = el.querySelector('#li-pass').value;
      if (!email || !pass) return showError('Veuillez remplir tous les champs.');

      const btn = el.querySelector('#do-login');
      btn.disabled = true; btn.textContent = 'Connexion...';

      try {
        const user = await auth.login(email, pass);
        onSuccess(user);
      } catch (e) { 
        showError('Email ou mot de passe incorrect.'); 
        btn.disabled = false; btn.textContent = 'Se connecter';
      }
    });

    el.querySelector('#do-guest')?.addEventListener('click', () => {
      const name = el.querySelector('#gu-name').value || 'Invité';
      const user = auth.continueAsGuest(name);
      onSuccess(user);
    });
  };

  render();
  return el;
}
