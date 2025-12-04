let SESSION = null;
let DB = {
  citizens: [
    { id: 'C-0001', name: 'John Doe', dob: '1992-05-12', license: 'Valide', flags: ['Propriétaire d’arme'], notes: 'Coopératif.' },
    { id: 'C-0002', name: 'Jane Smith', dob: '1988-11-03', license: 'Suspendue', flags: ['Recherché'], notes: 'Prudence.' }
  ],
  vehicles: [
    { id: 'V-0001', plate: 'LSPD-001', model: 'Vapid Stanier', ownerId: 'C-0001', status: 'Actif' },
    { id: 'V-0002', plate: '4RZK572', model: 'Obey 9F', ownerId: 'C-0002', status: 'Volé' }
  ]
};

function navigate(route) {
  const v = document.getElementById('view');
  v.innerHTML = '';
  if (route === 'dashboard') {
    v.innerHTML = `<div class="card"><h3>Bienvenue</h3><p>Utilise la barre latérale pour naviguer.</p></div>`;
  }
  if (route === 'citizens') renderCitizens();
  if (route === 'vehicles') renderVehicles();
}

function renderCitizens() {
  const v = document.getElementById('view');
  v.innerHTML = `
    <div class="card">
      <h3>Citoyens</h3>
      <table class="table">
        <thead><tr><th>ID</th><th>Nom</th><th>Naissance</th><th>Permis</th></tr></thead>
        <tbody>
          ${DB.citizens.map(c => `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.dob}</td><td>${c.license}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderVehicles() {
  const v = document.getElementById('view');
  v.innerHTML = `
    <div class="card">
      <h3>Véhicules</h3>
      <table class="table">
        <thead><tr><th>ID</th><th>Plaque</th><th>Modèle</th><th>Statut</th></tr></thead>
        <tbody>
          ${DB.vehicles.map(vh => `<tr><td>${vh.id}</td><td>${vh.plate}</td><td>${vh
