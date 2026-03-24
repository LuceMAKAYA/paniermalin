/**
 * LandingView.js – Panier Malin 3.0 (Onboarding)
 */

export function createLandingView(onComplete) {
  const el = document.createElement('div');
  el.className = 'landing-page';
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.minHeight = '100%';
  el.style.padding = '40px 24px';
  el.style.textAlign = 'center';

  el.innerHTML = `
    <!-- Decorative Orb Background -->
    <div style="position: absolute; top: -100px; right: -50px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(61,127,255,0.1) 0%, transparent 70%); z-index: 0;"></div>
    
    <div style="position: relative; z-index: 1;">
      <div style="font-size: 64px; margin-bottom: 24px;">🛒</div>
      <h1 class="clash" style="font-size: 42px; line-height: 1; margin-bottom: 12px; background: linear-gradient(135deg, white, var(--text2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Panier<br>Malin</h1>
      <p class="text-2" style="font-size: 16px; margin-bottom: 48px; max-width: 280px; margin-left: auto; margin-right: auto;">L'assistant de courses intelligent qui prend soin de votre budget.</p>

      <div class="card" style="width: 100%; max-width: 320px; text-align: left; background: rgba(255,255,255,0.03);">
        <p class="field-label" style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px;">COMMENT SOUHAITEZ-VOUS CONTINUER ?</p>
        
        <input class="input-field" id="landing-name" placeholder="Votre prénom" style="margin-bottom: 12px;">
        
        <button class="btn-main" id="btn-guest" style="margin-bottom: 12px;">Mode Invité ✨</button>
        <button class="btn-ghost" id="btn-login" style="border-style: solid; opacity: 0.6;">Se connecter (Bientôt)</button>
      </div>
      
      <p style="margin-top: 32px; font-size: 12px; color: var(--text3);">En continuant, vous acceptez nos conditions d'utilisation.</p>
    </div>
  `;

  const input = el.querySelector('#landing-name');
  const btnGuest = el.querySelector('#btn-guest');

  btnGuest.onclick = () => {
    const name = input.value.trim() || 'Invité';
    localStorage.setItem('panier_malin_user', name);
    onComplete(name);
  };

  return el;
}
