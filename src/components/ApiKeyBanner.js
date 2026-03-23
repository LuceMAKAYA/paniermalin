/**
 * ApiKeyBanner.js – Bannière de saisie/sauvegarde de la clé API Anthropic.
 */
import { setApiKey, getApiKey } from '../store.js';
import { showToast } from './toast.js';

export function createApiKeyBanner() {
  const saved = localStorage.getItem('pm_api_key') || '';
  if (saved) setApiKey(saved);

  const banner = document.createElement('div');
  banner.className = 'api-banner';
  banner.innerHTML = `
    <label for="input-api-key">🔑 Clé API Anthropic :</label>
    <input
      id="input-api-key"
      class="input-key"
      type="password"
      placeholder="sk-ant-api03-…"
      autocomplete="off"
      value="${saved}"
    />
    <button id="btn-save-key" class="btn-generate" style="padding:9px 20px;font-size:.9rem;border-radius:8px;box-shadow:none;">
      Enregistrer
    </button>
    <span id="key-status" class="api-banner-status ${saved ? 'visible' : ''}">
      ${saved ? '✓ Clé enregistrée' : ''}
    </span>
  `;

  banner.querySelector('#btn-save-key').addEventListener('click', () => {
    const val = banner.querySelector('#input-api-key').value.trim();
    if (!val) { showToast('⚠️ Veuillez saisir une clé API.'); return; }
    localStorage.setItem('pm_api_key', val);
    setApiKey(val);
    const status = banner.querySelector('#key-status');
    status.textContent = '✓ Clé enregistrée';
    status.classList.add('visible');
    showToast('Clé API enregistrée ✓');
  });

  // Sync input → store live
  banner.querySelector('#input-api-key').addEventListener('input', e => {
    setApiKey(e.target.value.trim());
    const status = banner.querySelector('#key-status');
    status.classList.remove('visible');
  });

  return banner;
}
