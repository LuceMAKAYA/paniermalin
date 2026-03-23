/**
 * ResultsView.js – Affichage de la liste de courses générée.
 */

/**
 * @param {object} data   - Réponse JSON de l'API Claude
 * @param {number} budget - Budget sélectionné par l'utilisateur
 * @param {Function} onBack - Callback pour revenir au formulaire
 */
export function createResultsView(data, budget, onBack) {
  const total = data.total_estime ?? 0;
  const diff  = budget - total;
  const pct   = Math.min((total / budget) * 100, 100);
  const isOver = diff < 0;

  const el = document.createElement('div');
  el.className = 'results-view visible';

  // Build category cards HTML
  const cardsHtml = (data.categories ?? [])
    .filter(c => c.articles?.length)
    .map(cat => {
      const catTotal = cat.articles.reduce((s, a) => s + (a.prix_estime ?? 0), 0);
      return `
        <div class="cat-card">
          <div class="cat-card-head">
            <div class="cat-card-title">${cat.emoji ?? ''} ${cat.nom}</div>
            <div class="cat-card-badges">
              <span class="badge badge-accent">${cat.articles.length} art.</span>
              <span class="badge badge-green">${catTotal.toFixed(2)}€</span>
            </div>
          </div>
          <div class="cat-card-body">
            ${cat.articles.map(a => `
              <div class="article-row">
                <span class="article-name">${a.nom}</span>
                <span class="article-qty">${a.quantite}</span>
                <span class="article-price">${(a.prix_estime ?? 0).toFixed(2)}€</span>
              </div>`).join('')}
          </div>
        </div>`;
    }).join('');

  el.innerHTML = `
    <!-- Budget summary -->
    <div class="budget-summary">
      <div class="budget-stats">
        <div class="budget-stat">
          <div class="budget-stat-label">Total estimé</div>
          <div class="budget-stat-value accent">${total.toFixed(2)}€</div>
        </div>
        <div class="budget-stat">
          <div class="budget-stat-label">Budget</div>
          <div class="budget-stat-value muted">${budget}€</div>
        </div>
        <div class="budget-stat">
          <div class="budget-stat-label">${isOver ? 'Dépassement' : 'Restant'}</div>
          <div class="budget-stat-value ${isOver ? 'red' : 'green'}">${Math.abs(diff).toFixed(2)}€</div>
        </div>
      </div>
      <div class="progress-bg">
        <div class="progress-fill ${isOver ? 'over' : 'ok'}" style="width:0%" data-target="${pct}"></div>
      </div>
      <div class="price-disclaimer mt-8" style="font-size:0.75rem; color:var(--text-3); text-align:center;">
        * Les prix sont des estimations indicatives et peuvent varier selon les enseignes.
      </div>
    </div>

    <!-- Conseil -->
    ${data.conseil ? `
    <div class="conseil-box">
      <span class="conseil-icon">💡</span>
      <p class="conseil-text">${data.conseil}</p>
    </div>` : ''}

    <!-- Magasins recommandés -->
    ${data.magasins_recommandes && data.magasins_recommandes.length > 0 ? `
    <div class="magasins-box mt-12" style="margin-bottom:14px;">
      <div class="magasins-title" style="font-weight:600;font-size:.85rem;margin-bottom:6px;color:var(--text);display:flex;align-items:center;gap:6px;">
        <span class="conseil-icon" style="font-size:1rem;">📍</span> Où faire vos courses ?
      </div>
      <ul class="magasins-list" style="margin:0;padding-left:26px;font-size:.85rem;color:var(--text-2);line-height:1.6;">
        ${data.magasins_recommandes.map(m => `<li>${m}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Category cards -->
    <div class="categories-grid">${cardsHtml}</div>

    <button class="btn-back">✏️ Modifier mes préférences</button>
  `;

  el.querySelector('.btn-back').addEventListener('click', onBack);

  // Animate progress bar after a frame
  requestAnimationFrame(() => {
    setTimeout(() => {
      const fill = el.querySelector('.progress-fill');
      if (fill) fill.style.width = fill.dataset.target + '%';
    }, 80);
  });

  return el;
}
