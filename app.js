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
  reports: []
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
    r.title.toLowerCase().includes(q) ||
    r.author.toLowerCase().includes(q)
  );

  v.innerHTML = `
    <div class="card">
      <h3>Résultats de recherche</h3>
      <h4>Citoyens</h4>
      ${citizens.length ? `
        <table class="table"><tbody>
          ${citizens.map(c => `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.dob}</td></tr>`).join('')}
        </tbody></table>` : `<p class="hint">Aucun citoyen.</p>`}
      <h4>Véhicules</h4>
      ${vehicles.length ? `
        <table class="table"><tbody>
          ${vehicles.map(vh => `<tr><td>${vh.id}</td><td>${vh.plate}</td><td>${vh.model}</td></tr>`).join('')}
        </tbody></table>` : `<p class="hint">Aucun véhicule.</p>`}
      <h4>Rapports</h4>
      ${reports.length ? `
        <table class="table"><tbody>
          ${reports.map(r => `<tr><td>${r.title}</td><td>${r.author}</td><td>${new Date(r.createdAt).toLocaleString()}</td></tr>`).join('')}
        </tbody></table>` : `<p class="hint">Aucun rapport.</p>`}
    </div>
  `;
}

// Modale création rapport
function openCreateReportModal() {
  $('#modal-title').textContent = 'Nouveau rapport';
  $('#modal-body').innerHTML = `
    <label>Titre
      <input id="report-title" placeholder="Ex: Intervention Bijouterie"/>
    </label>
    <label>Contenu
      <textarea id="report-content" rows="6" placeholder="Décrire les faits, unités, preuves…"></textarea>
    </label>
  `;
  $('#modal-confirm').onclick = () => {
    const title = $('#report-title').value.trim();
    const content = $('#report-content').value.trim();
    if (!title) return;
    DB.reports.unshift({
      title,
      content,
      author: SESSION ? SESSION.username : 'Invité',
      createdAt: Date.now()
    });
    closeModal();
    render('reports');
  };
  showModal();
}

function showModal() {
  $('#modal').classList.remove('hidden');
  $('#modal-close').onclick = closeModal;
  $('#modal-cancel').onclick = closeModal;
}
function closeModal() {
  $('#modal').classList.add('hidden');
  $('#modal-confirm').onclick = null;
}

// Login / Logout
function applySession() {
  updateUserUI();
  document.getElementById('login-screen').style.display = SESSION ? 'none' : 'grid';
  render('dashboard');
}

function setupLogin() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    SESSION = {
      username: data.username || 'Invité',
      role: data.role || 'officer',
      roleLabel: roleToLabel(data.role || 'officer')
    };
    localStorage.setItem('MDT_SESSION', JSON.stringify(SESSION));
    applySession();
  });

  // Si un code Discord est présent, le backend doit compléter la session.
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  if (code) {
    // Placeholder: en pratique, tu appelles ton backend pour échanger le code.
    // fetch('/api/discord/callback?code=' + code).then(...)
    // Pour la démo, on affiche seulement le statut.
    document.getElementById('discord-status').textContent =
      'Statut: Code reçu de Discord ✔ — configure ton backend pour terminer la connexion';
  }
}

function roleToLabel(role) {
  switch (role) {
    case 'officer': return 'Agent';
    case 'sergeant': return 'Sergent';
    case 'detective': return 'Détective';
    case 'admin': return 'Administrateur';
    default: return 'Agent';
  }
}

// Navigation et actions
function setupUI() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      render(route);
    });
  });
  document.getElementById('logout').addEventListener('click', () => {
    SESSION = null;
    localStorage.removeItem('MDT_SESSION');
    applySession();
  });
  document.getElementById('search-btn').addEventListener('click', runSearch);
  document.getElementById('quick-create').addEventListener('click', openCreateReportModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
}

// Init
(function init() {
  // Charger une session si présente
  try {
    const raw = localStorage.getItem('MDT_SESSION');
    if (raw) SESSION = JSON.parse(raw);
  } catch {}
  setupUI();
  setupLogin();
  applySession();
})();

