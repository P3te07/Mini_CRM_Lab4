//branch bugfix 
let clients = JSON.parse(localStorage.getItem('crm_clients')) || [...DEMO_CLIENTS];
let editingId = null;

const table       = document.getElementById('clientTable');
const emptyMsg    = document.getElementById('emptyMsg');
const modal       = document.getElementById('modal');
const modalTitle  = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const filterSel   = document.getElementById('filterStatus');
const formError   = document.getElementById('formError');

const fName    = document.getElementById('fName');
const fEmail   = document.getElementById('fEmail');
const fPhone   = document.getElementById('fPhone');
const fCompany = document.getElementById('fCompany');
const fStatus  = document.getElementById('fStatus');
const fNotes   = document.getElementById('fNotes');

function save() {
  localStorage.setItem('crm_clients', JSON.stringify(clients));
}

function updateStats() {
  document.getElementById('totalCount').textContent    = clients.length;
  document.getElementById('activeCount').textContent   = clients.filter(c => c.status === 'Activ').length;
  document.getElementById('leadCount').textContent     = clients.filter(c => c.status === 'Lead').length;
  document.getElementById('inactiveCount').textContent = clients.filter(c => c.status === 'Inactiv').length;
}

function render() {
  const q      = searchInput.value.toLowerCase();
  const status = filterSel.value;

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(q) ||
                        c.email.toLowerCase().includes(q);
    const matchStatus = status === 'all' || c.status === status;
    return matchSearch && matchStatus;
  });

  table.innerHTML = '';
  emptyMsg.style.display = filtered.length === 0 ? 'block' : 'none';

  filtered.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td>${c.email}</td>
      <td>${c.phone || '—'}</td>
      <td>${c.company || '—'}</td>
      <td><span class="badge badge-${c.status}">${c.status}</span></td>
      <td>
        <button class="btn-edit"   onclick="openEdit(${c.id})">✏️ Editează</button>
        <button class="btn-delete" onclick="deleteClient(${c.id})">🗑️ Șterge</button>
      </td>
    `;
    table.appendChild(tr);
  });

  updateStats();
}

function openModal() {
  modal.classList.remove('hidden');
  formError.classList.add('hidden');
}
function closeModal() {
  modal.classList.add('hidden');
  editingId = null;
  [fName, fEmail, fPhone, fCompany, fNotes].forEach(f => f.value = '');
  fStatus.value = 'Lead';
}

function openEdit(id) {
  const c = clients.find(x => x.id === id);
  if (!c) return;
  editingId       = id;
  modalTitle.textContent = 'Editează Client';
  fName.value    = c.name;
  fEmail.value   = c.email;
  fPhone.value   = c.phone;
  fCompany.value = c.company;
  fStatus.value  = c.status;
  fNotes.value   = c.notes;
  openModal();
}

function saveClient() {
  if (!fName.value.trim() || !fEmail.value.trim()) {
    formError.classList.remove('hidden');
    return;
  }
  const data = {
    name:    fName.value.trim(),
    email:   fEmail.value.trim(),
    phone:   fPhone.value.trim(),
    company: fCompany.value.trim(),
    status:  fStatus.value,
    notes:   fNotes.value.trim()
  };

  if (editingId) {
    clients = clients.map(c => c.id === editingId ? { ...c, ...data } : c);
  } else {
    clients.push({ id: Date.now(), ...data });
  }

  save();
  closeModal();
  render();
}

function deleteClient(id) {
  if (!confirm('Ești sigur că vrei să ștergi acest client?')) return;
  clients = clients.filter(c => c.id !== id);
  save();
  render();
}

function render() {
  const filtered = getFilteredClients();
  renderTable(filtered);
  updateStats();      
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getFilteredClients() {
  const query  = searchInput.value.toLowerCase().trim();
  const status = filterSel.value;

  return clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(query)  ||
      client.email.toLowerCase().includes(query) ||
      (client.company && client.company.toLowerCase().includes(query));

    const matchesStatus =
      status === 'all' || client.status === status;

    return matchesSearch && matchesStatus;
  });
}

function updateStats() {
  const total    = clients.length;
  const active   = clients.filter(c => c.status === 'Activ').length;
  const leads    = clients.filter(c => c.status === 'Lead').length;
  const inactive = clients.filter(c => c.status === 'Inactiv').length;

  animateCount(totalCount,    total);
  animateCount(activeCount,   active);
  animateCount(leadCount,     leads);
  animateCount(inactiveCount, inactive);
}

function animateCount(el, end) {
  const start    = parseInt(el.textContent) || 0;
  if (start === end) return;

  const duration = 400; // ms
  const steps    = 20;
  const stepTime = duration / steps;
  const diff     = end - start;
  let   current  = start;
  let   step     = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.round(start + (diff * step) / steps);
    el.textContent = current;
    if (step >= steps) {
      el.textContent = end;
      clearInterval(timer);
    }
  }, stepTime);
}

function validateForm() {
  const errors = [];
  const name   = fName.value.trim();
  const email  = fEmail.value.trim();

  // Reset stare de eroare
  fName.classList.remove('error-field');
  fEmail.classList.remove('error-field');

  if (!name) {
    errors.push('Numele este obligatoriu.');
    fName.classList.add('error-field');
  }

  if (!email) {
    errors.push('Email-ul este obligatoriu.');
    fEmail.classList.add('error-field');
  } else if (!isValidEmail(email)) {
    errors.push('Email-ul nu are un format valid.');
    fEmail.classList.add('error-field');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function saveClient() {
  const { valid, errors } = validateForm();

  if (!valid) {
    formError.textContent = '⚠️ ' + errors.join(' ');
    formError.classList.remove('hidden');
    return;
  }

  const clientData = {
    name:    fName.value.trim(),
    email:   fEmail.value.trim(),
    phone:   fPhone.value.trim(),
    company: fCompany.value.trim(),
    status:  fStatus.value,
    notes:   fNotes.value.trim()
  };

  if (editingId !== null) {
    clients = clients.map(c =>
      c.id === editingId ? { ...c, ...clientData } : c
    );
  } else {
    clients.push({
      id:        Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      ...clientData
    });
  }

  persistClients(clients);
  closeModal();
  render();
}

addClientBtn.addEventListener('click', openAddModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('saveBtn').addEventListener('click', saveClient);
searchInput.addEventListener('input', render);
filterSel.addEventListener('change', render);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// Init
render();