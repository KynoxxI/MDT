// État de session et base de données démo
let SESSION = null;
let DB = {
  citizens: [
    { id: 'C-0001', name: 'John Doe', dob: '1992-05-12', license: 'Valide', flags: ['Propriétaire d’arme'], notes: 'Coopératif.' },
    { id: 'C-0002', name: 'Jane Smith', dob: '1988-11-03', license: 'Suspendue', flags: ['Recherché'], notes: 'Prudence.' }
  ],
  vehicles: [
    { id: 'V-0001', plate: 'LSPD-001', model: 'Vapid Stanier', ownerId: 'C-0001', status: 'Actif' },
    { id: 'V-0002', plate: '4RZK572', model: 'Obey 9F', ownerId: 'C-0002', status: 'Volé' }
  ],
  reports: [],
  dispatch: {
    units: [
      { id: 'A67', officer: 'John Miller', status: 'En procédure', call: 'Braquage bijouterie' },
      { id: 'A18', officer: 'Alice Dupont', status: '10-56', call: 'Braquage bijouterie' },
      { id: 'A04', officer: 'Marc Leroy', status: '10-98', call: 'Braquage bijouterie' },
      { id: 'A12', officer: 'Sophie Martin', status: '10-91', call: 'Braquage bijouterie' }
    ],
    calls: [
      { id: 694, desc: 'Refus d’obtempérer', details: 'Argenté beige', time: '22:06' },
      { id: 695, desc: 'Braquage bijouterie', details: 'Rockfords Hills', time: '23:17' }
    ],
    agents: [
      { role: 'Sgt 1', name: 'Tyler Lewis' },
      { role: 'Sgt 2', name: 'Aksen Wilson' },
      { role: 'PO 2', name: 'Nyx-Mysti Mackey' }
    ]
  }
};

// Helpers
function $(sel) { return document.querySelector(sel); }
function setActive(route) {
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.route === route);
  });
}
function updateUserUI() {
  $('#user-name').textContent = SESSION ? SESSION.username : 'Invité';
  $('#user-role').textContent = SESSION ? SESSION.roleLabel : '—';
  $('.role-admin')?.classList.toggle('hidden', !(SESSION && SESSION.role === 'admin'));
}

// Rendu des vues
function render(route) {
  const v = $('#view');
  v.innerHTML = '';
  setActive(route);

  if (route === 'dashboard') {
    v.innerHTML = `
      <div class="card">
        <h3>Bienvenue dans le MDT</h3>
        <p>Utilise la barre latérale pour naviguer. La recherche globale scanne citoyens, véhicules et rapports.</p>
      </div>
    `;
  }

  if (route === 'citizens') {
    v.innerHTML = `
      <div class="card">
        <h3>Citoyens</h3>
        <table class="table">
          <thead><tr><th>ID</th><th>Nom</th><th>Naissance</th><th>Permis</th><th>Drapeaux</th></tr></thead>
          <tbody>
            ${DB.citizens.map(c => `
              <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.dob}</td>
                <td>${c.license}</td>
                <td>${(c.flags||[]).map(f => `<span class="badge warn">${f}</span>`).join(' ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (route === 'vehicles') {
    v.innerHTML = `
      <div class="card">
        <h3>Véhicules</h3>
        <table class="table">
          <thead><tr><th>ID</th><th>Plaque</th><th>Modèle</th><th>Statut</th></tr></thead>
          <tbody>
            ${DB.vehicles.map(vh => `
              <tr>
                <td>${vh.id}</td>
                <td>${vh.plate}</td>
                <td>${vh.model}</td>
                <td><span class="badge ${vh.status==='Volé'?'danger':'success'}">${vh.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (route === 'reports') {
    v.innerHTML = `
      <div class="card">
        <h3>Rapports</h3>
        ${DB.reports.length === 0 ? '<p class="hint">Aucun rapport pour le moment.</p>' : `
          <table class="table">
            <thead><tr><th>Titre</th><th>Auteur</th><th>Date</th></tr></thead>
            <tbody>
              ${DB.reports.map(r => `
                <tr>
                  <td>${r.title}</td>
                  <td>${r.author}</td>
                  <td>${new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  }

  if (route === 'admin') {
    v.innerHTML = `
      <div class="card">
        <h3>Administration</h3>
        <p class="hint">Accès réservé aux administrateurs.</p>
        <ul>
          <li>Gestion des agents</li>
          <li>Paramètres système</li>
        </ul>
      </div>
    `;
  }

  if (route === 'dispatch') {
    v.innerHTML = `
      <div class="card">
        <h3>Centre de Dispatch</h3>
        <div class="dispatch-grid">
          <div class="dispatch-column">
            <h4>Unités en patrouille</h4>
            <ul>
              ${DB.dispatch.units.map(u => `
                <li class="unit-status">
                  <span><strong>${u.id}</strong> — ${u.officer} — ${u.call}</span>
                  <select onchange="updateUnitStatus('${u.id}', this.value)">
                    <option ${u.status==='En procédure'?'selected':''}>En procédure</option>
                    <option ${u.status==='10-56'?'selected':''}>10-56</option>
                    <option ${u.status==='10-98'?'selected':''}>10-98</option>
                    <option ${u.status==='10-91'?'selected':''}>10-91</option>
                  </select>
                </li>
              `).join('')}
            </ul>
          </div>
          <div class="dispatch-column">
            <h4>Appels en cours</h4>
            <ul>
              ${DB.dispatch.calls.map(c => `
                <li><strong>#${c.id}</strong> — ${c.desc} — ${c.details} — ${c.time}</li>
              `).join('')}
            </ul>
          </div>
          <div class="dispatch-column">
            <h4>Agents en service</h4>
            <ul>
              ${DB.dispatch.agents.map(a => `
                <li>${a.role} — ${a.name}</li>
              `).join('')}
            </ul>
          </div>
        </div>
        <p class="hint">Fréquences radio : LAPD 911 MHz | LAMD 913 | GND 902 MHz</p>
        <p class="hint">Niveau d’alerte : DEFCON 5</p>
      </div>
    `;
  }
}

// Fonction pour mettre à jour le statut d’une unité
function updateUnitStatus(unitId, newStatus) {
  const unit = DB.dispatch.units.find(u => u.id === unitId);
  if (unit) {
    unit.status = newStatus;
    render('dispatch'); // rafraîchir la vue
  }
}

// Recherche globale
function runSearch() {
  const q = $('#global-search').value.trim().toLowerCase();
  const v = $('#view');
  if (!q) return;

  const citizens = DB.citizens.filter(c =>
    c.id.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q)
  );
  const vehicles = DB.vehicles.filter(vh =>
    vh.plate.toLowerCase().includes(q) ||
    vh.model.toLowerCase().includes(q)
  );
  const reports = DB.reports.filter(r =>
    r
