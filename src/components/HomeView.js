export function createHomeView(userName, listStats, onSwitchTab) {
  const el = document.createElement('div');
  el.className = 'home-view fade-in';
  
  let viewPeriod = 'week'; // 'week' | 'month'

  const render = (period = 'week') => {
    viewPeriod = period;
    const history = listStats.spendingHistory || [];
    
    // Aggregate data if needed
    let displayHistory = history;
    if (viewPeriod === 'month') {
      const monthly = {};
      history.forEach(h => {
        const d = new Date(h.week_start);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthly[key]) {
          monthly[key] = { week_start: key + '-01', actual_spent: 0, count: 0 };
        }
        monthly[key].actual_spent += (h.actual_spent || 0);
        monthly[key].count++;
      });
      displayHistory = Object.values(monthly);
    }

    const totalActual = history.reduce((sum, h) => sum + (h.actual_spent || 0), 0) / 100;
    const lastMonthAvg = history.length > 0 
      ? history.filter(h => (h.actual_spent || 0) > 0).reduce((s, h) => s + h.actual_spent, 0) / (history.filter(h => (h.actual_spent || 0) > 0).length || 1) / 100
      : 0;
    
    const now = new Date();
    const ceMois = history
      .filter(h => {
          const d = new Date(h.week_start);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, h) => sum + (h.actual_spent || 0), 0) / 100;

    const lastMonth = new Date(); lastMonth.setMonth(now.getMonth() - 1);
    const totalLastMonth = history
      .filter(h => {
          const d = new Date(h.week_start);
          return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, h) => sum + (h.actual_spent || 0), 0) / 100;
    
    const diffMois = totalLastMonth > 0 ? Math.round(((ceMois - totalLastMonth) / totalLastMonth) * 100) : 0;

    const chartData = displayHistory.slice(-12).map((h, i, arr) => {
      const budgetVal = viewPeriod === 'week' ? (listStats.budget_goal || 15000) : (listStats.budget_goal || 15000) * 4;
      const barHeight = Math.min(Math.round(((h.actual_spent || 0) / budgetVal) * 100), 100);
      const label = viewPeriod === 'week' 
        ? new Date(h.week_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        : new Date(h.week_start).toLocaleDateString('fr-FR', { month: 'short' });

      return {
        label,
        val: barHeight > 0 ? barHeight : 2,
        amt: ((h.actual_spent || 0) / 100).toFixed(0) + '€',
        active: i === arr.length - 1
      };
    });

    if (chartData.length === 0) {
      chartData.push({ label: 'Aucune', val: 5, amt: '0€', active: true });
    }

    const articlesFound = listStats.articlesFound || 0;
    const totalArticles = listStats.count || 0;
    const seasonalPct  = listStats.seasonalPct ?? 0;
    const co2Saved     = listStats.co2Saved ?? 0;
    const progressPct  = totalArticles > 0 ? Math.min(Math.round((articlesFound / totalArticles) * 100), 100) : 0;

    el.innerHTML = `
      <!-- Header -->
      <div class="header-home">
        <div>
          <p class="text-3" style="font-size: 13px; margin-bottom: 2px;">Bonjour 👋</p>
          <h1 class="clash" style="font-size: 28px;">${userName || 'TU'}</h1>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="width: 44px; height: 44px; border-radius: 14px; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-size: 20px; position: relative;">
            🔔 <div style="position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background: var(--amber); border-radius: 50%; border: 2px solid var(--bg);"></div>
          </div>
        </div>
      </div>

      <!-- Alert Box -->
      <div class="alert-box">
        <div style="font-size: 20px; margin-top: 2px;">⚠️</div>
        <div style="flex: 1;">
          <p style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #fecaca;">Budget dépassé possible</p>
          <p class="text-3" style="font-size: 11px; line-height: 1.4; color: #fca5a5;">Carrefour augmente les prix des produits laitiers cette semaine</p>
        </div>
        <div class="alert-close">✕</div>
      </div>

      <!-- Hero Card V4 -->
      <div class="card hero-card" style="padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
          <div>
            <p style="font-size: 11px; font-weight: 800; color: #22c55e; margin-bottom: 8px; letter-spacing: 0.5px;">● SEMAINE DU 24 MARS</p>
            <div style="display: flex; align-items: baseline; gap: 12px;">
              <h2 class="clash" style="font-size: 42px;">${listStats.total || '53.70€'}</h2>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: -4px;">
              <p class="text-3" style="font-size: 12px;">estimé cette semaine</p>
              <div style="font-size: 11px; font-weight: 700; color: #22c55e;">↓ 8.20€ vs sem. passée</div>
            </div>
          </div>
          <div class="badge badge-ouvert" style="background: rgba(34,197,94,0.1); color: #4ade80; border: none; padding: 6px 10px;">🌿 Saison printemps</div>
        </div>

        <div class="article-progress" style="margin-bottom: 16px;">
          <div class="ap-header">
            <span class="ap-title">Progression des courses</span>
            <span class="ap-count">${articlesFound} / ${totalArticles} articles cochés</span>
          </div>
          <div class="ap-track" style="height: 6px; background: rgba(255,255,255,0.05);">
            <div class="ap-fill" style="width: ${progressPct}%; background: #22c55e;"></div>
          </div>
        </div>

        <div class="weekly-days">
          <div class="day-pill done">Lun✓</div>
          <div class="day-pill done">Mar✓</div>
          <div class="day-pill active">Mer 🔵</div>
          <div class="day-pill">Jeu</div>
          <div class="day-pill">Ven</div>
          <div class="day-pill">Sam</div>
          <div class="day-pill">Di</div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="hero-stats-v3" style="margin-bottom: 24px;">
        <div class="hs-box" style="padding: 16px 12px;">
          <div class="hs-val-v3" style="color: #22c55e;">${totalArticles}</div>
          <div class="hs-label-v3">Articles</div>
        </div>
        <div class="hs-box" style="padding: 16px 12px;">
          <div class="hs-val-v3" style="color: #60a5fa;">${seasonalPct}%</div>
          <div class="hs-label-v3">Saisonnier</div>
        </div>
        <div class="hs-box" style="padding: 16px 12px;">
          <div class="hs-val-v3" style="color: #fbbf24;">-${co2Saved} kg</div>
          <div class="hs-label-v3">CO₂ Économisé</div>
        </div>
      </div>

      <button class="btn-main btn-green" style="margin-bottom: 32px; height: 72px; display: flex; align-items: center; justify-content: center; gap: 16px;">
        <div style="font-size: 24px;">🛒</div>
        <div style="text-align: left;">
          <p style="font-size: 16px; font-weight: 800; margin-bottom: 2px;">Démarrer les courses</p>
          <p style="font-size: 11px; opacity: 0.8; font-weight: 400;">Guidage aisle par aisle · Carrefour Bastille</p>
        </div>
        <div style="margin-left: auto; font-size: 20px;">→</div>
      </button>

      <!-- Quick Access Enhanced -->
      <div style="margin-bottom: 32px;">
        <h3 class="clash" style="font-size: 18px; margin-bottom: 20px;">Accès rapide</h3>
        <div class="responsive-grid" style="grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="card clickable" id="btn-quick-new-ia" style="min-height: 160px; padding: 20px; background: #111827; position: relative;">
            <div class="qa-header-gradient" style="background: linear-gradient(90deg, #a855f7, #6366f1);"></div>
            <div style="font-size: 24px; margin-bottom: 12px;">✨</div>
            <p style="font-weight: 700; font-size: 15px; margin-bottom: 6px;">Liste IA</p>
            <p class="text-3" style="font-size: 11px; line-height: 1.4;">Génère une liste équilibrée de saison en 10 sec</p>
            <div class="badge badge-ia" style="margin-top: 16px; background: rgba(168,85,247,0.1); color: #c084fc; border: none;">✦ IA ↗</div>
          </div>
          
          <div class="card clickable" id="btn-quick-stores" style="min-height: 160px; padding: 20px; background: #111827; position: relative;">
            <div class="qa-header-gradient" style="background: linear-gradient(90deg, #3b82f6, #06b6d4);"></div>
            <div style="font-size: 24px; margin-bottom: 12px;">📍</div>
            <p style="font-weight: 700; font-size: 15px; margin-bottom: 6px;">Magasins</p>
            <p class="text-3" style="font-size: 11px; line-height: 1.4;">2 promos actives près de toi maintenant</p>
            <div class="badge badge-ouvert" style="margin-top: 16px; background: rgba(59,130,246,0.1); color: #60a5fa; border: none;">● Ouvert</div>
          </div>

          <div class="card clickable" style="min-height: 160px; padding: 20px; background: #111827; position: relative;">
            <div class="qa-header-gradient" style="background: linear-gradient(90deg, #f59e0b, #ef4444);"></div>
            <div style="font-size: 24px; margin-bottom: 12px;">💡</div>
            <p style="font-weight: 700; font-size: 15px; margin-bottom: 6px;">Optimise budget</p>
            <p class="text-3" style="font-size: 11px; line-height: 1.4;">Trouver des substituts moins chers sans perte qualité</p>
            <div class="badge" style="margin-top: 16px; background: rgba(245,158,11,0.1); color: #fbbf24; border: none;">Économise -12€</div>
          </div>

          <div class="card clickable" style="min-height: 160px; padding: 20px; background: #111827; position: relative;" onclick="window.__switchTab('list')">
            <div class="qa-header-gradient" style="background: linear-gradient(90deg, #10b981, #3b82f6);"></div>
            <div style="font-size: 24px; margin-bottom: 12px;">🍴</div>
            <p style="font-weight: 700; font-size: 15px; margin-bottom: 6px;">Planificateur</p>
            <p class="text-3" style="font-size: 11px; line-height: 1.4;">${totalArticles > 0 ? totalArticles + ' articles prêts à cuisiner' : 'Générez une liste pour voir vos menus'}</p>
            <div class="badge" style="margin-top: 16px; background: rgba(16,185,129,0.1); color: #34d399; border: none;">${totalArticles > 0 ? 'IA active' : 'En attente'}</div>
          </div>
        </div>
      </div>

      <!-- Items to Add -->
      <div style="margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 class="clash" style="font-size: 18px;">Suggestions pour vous</h3>
          <span style="color: #60a5fa; font-size: 12px; font-weight: 600;">Voir plus</span>
        </div>
        <div class="h-scroll" style="gap: 12px;">
          ${[
            { icon: '🥚', name: 'Œufs bio x6', price: '~3.20€' },
            { icon: '🧴', name: 'Lessive', price: '~8.50€' },
            { icon: '🥦', name: 'Brocoli', price: '~2.10€' }
          ].map(item => `
            <div class="forgotten-item" style="min-width: 140px; padding: 12px; background: #111827; border: 1px solid var(--border); border-radius: 12px; display: flex; align-items: center; gap: 12px; position: relative;">
              <div style="font-size: 20px;">${item.icon}</div>
              <div style="flex: 1;">
                <p style="font-weight: 700; font-size: 13px; margin-bottom: 3px;">${item.name}</p>
                <p style="font-size: 11px; color: var(--text3);">${item.price}</p>
              </div>
              <div style="width: 24px; height: 24px; border-radius: 6px; background: #22c55e; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: 800; cursor: pointer;">+</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Analytics Chart -->
      <div class="card analytics-card" style="padding: 24px; margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <h3 class="clash" style="font-size: 16px;">Analyses dépenses</h3>
          
          <div style="display: flex; gap: 4px; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 10px;">
            <button class="btn-period ${viewPeriod === 'week' ? 'active' : ''}" id="p-week" style="padding: 4px 10px; border-radius: 8px; border: none; font-size: 10px; font-weight: 700; cursor: pointer; transition: 0.2s;">SEM.</button>
            <button class="btn-period ${viewPeriod === 'month' ? 'active' : ''}" id="p-month" style="padding: 4px 10px; border-radius: 8px; border: none; font-size: 10px; font-weight: 700; cursor: pointer; transition: 0.2s;">MOIS</button>
          </div>
        </div>
        
        <style>
          .btn-period { background: transparent; color: var(--text3); }
          .btn-period.active { background: var(--accent); color: white; }
        </style>
        
        <div class="chart-container">
          ${chartData.map(d => `
            <div class="bar-wrap">
              <div class="bar ${d.active ? 'active' : ''}" style="height: ${d.val}%;"></div>
              <span class="bar-label">${d.label}</span>
            </div>
          `).join('')}
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
          <div>
            <p class="hs-val-v3" style="font-size: 18px;">${lastMonthAvg.toFixed(2)}€</p>
            <p class="text-3" style="font-size: 9px; text-transform: uppercase;">Moy. mensuelle</p>
          </div>
          <div>
            <p class="hs-val-v3" style="font-size: 18px;">${ceMois.toFixed(0)}€</p>
            <p class="text-3" style="font-size: 9px; text-transform: uppercase;">Ce mois</p>
          </div>
          <div>
            <p class="hs-val-v3" style="font-size: 18px; color: ${diffMois < 0 ? '#4ade80' : '#f87171'};">${diffMois > 0 ? '+' : ''}${diffMois}%</p>
            <p class="text-3" style="font-size: 9px; text-transform: uppercase;">vs mois dernier</p>
          </div>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="card family-card" style="padding: 24px; margin-bottom: 32px;">
        <h3 class="clash" style="font-size: 18px; margin-bottom: 20px;">Activité famille</h3>
        <div class="activity-list">
          ${familyActivity.map(act => {
            const initials = act.initials || (act.name ? act.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '??');
            const color = act.color || '#3b82f6';
            return `
            <div class="activity-item" style="display: flex; gap: 16px; margin-bottom: 20px; align-items: flex-start;">
              <div class="user-avatar-sm" style="background: ${color}; width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: white;">
                ${initials}
              </div>
              <div style="flex: 1;">
                <p style="font-size: 13px; font-weight: 500; margin-bottom: 2px;">
                  <span style="font-weight: 800;">${act.name}</span> ${act.text}
                </p>
                <p class="text-3" style="font-size: 11px;">${act.time}</p>
              </div>
            </div>
          `}).join(familyActivity.length === 0 ? '<p class="text-3" style="font-size: 13px; text-align: center; padding: 20px;">Aucune activité récente</p>' : '')}
        </div>
      </div>
      
      <div style="height: 40px;"></div>
    `;

    // Click handlers
    el.querySelector('.alert-close').onclick = () => {
      el.querySelector('.alert-box').style.display = 'none';
    };
    
    el.querySelector('#btn-quick-new-ia').onclick = () => onSwitchTab('setup');
    el.querySelector('#btn-quick-stores').onclick = () => onSwitchTab('map');

    el.querySelector('#p-week').onclick = () => render('week');
    el.querySelector('#p-month').onclick = () => render('month');
  };

  render();
  return el;
}
