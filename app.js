// =========================
// Variables globales
// =========================
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

// =========================
// Helpers
// =========================
function $(sel) { return document.querySelector(sel); }

function roleToLabel(role) {
  switch(role) {
    case "officer": return "Agent";
    case "sergeant": return "Sergent";
    case "detective": return "Détective";
    case "admin": return "Administrateur";
    default: return "—";
  }
}

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

function applySession() {
  document.getElementById("login-screen").style.display = "none";
  updateUserUI();
  render("dashboard");
}

// =========================
// Rendu des vues
// =========================
function render(route) {
  const v = $('#view');
  v.innerHTML = '';
  setActive(route);

  if (route === 'dashboard') {
    v.innerHTML = `
      <div class="card">
        <h3>Bienvenue dans le MDT</h3>
        <p>Utilise la barre latérale pour naviguer.</p>
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
      </div>
    `;
  }
}

// =========================
// Gestion login
// =========================
function setupLogin() {
  const form = $('#login-form');
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

  // Discord OAuth2 simulation
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const discordStatus = document.getElementById("discord-status");
  if (code) {
    SESSION = {
      username: "DiscordUser",
      role: "officer",
      roleLabel: "Agent"
    };
    localStorage.setItem("MDT_SESSION", JSON.stringify(SESSION));
    applySession();
    if (discordStatus) discordStatus.textContent = "Connecté via Discord (simulation)";
  } else {
    if (discordStatus) discordStatus.textContent = "Statut: En attente — clique sur “Connexion via Discord”";
  }
}

// =========================
// Initialisation
// =========================
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("MDT_SESSION");
  if (saved) {
    SESSION = JSON.parse(saved);
    applySession();
  } else {
    setupLogin();
  }

  // Navigation
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => render(btn.dataset.route));
  });

  // Déconnexion
  document.getElementById("logout").addEventListener("click", () => {
    SESSION = null;
    localStorage.removeItem("MDT_SESSION");
    document.getElementById("login-screen").style.display = "block";
    document.getElementById("view").innerHTML = "";
    document.getElementById("user-name").textContent = "Invité";
    document.getElementById("user-role").textContent = "—";
  });

  render("dashboard");
});
