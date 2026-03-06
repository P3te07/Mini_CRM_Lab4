let clients   = loadClients();   
let editingId = null;            

const clientTable  = document.getElementById('clientTable');
const emptyMsg     = document.getElementById('emptyMsg');
const modal        = document.getElementById('modal');
const modalTitle   = document.getElementById('modalTitle');
const formError    = document.getElementById('formError');
const addClientBtn = document.getElementById('addClientBtn');

const fName    = document.getElementById('fName');
const fEmail   = document.getElementById('fEmail');
const fPhone   = document.getElementById('fPhone');
const fCompany = document.getElementById('fCompany');
const fStatus  = document.getElementById('fStatus');
const fNotes   = document.getElementById('fNotes');

const searchInput = document.getElementById('searchInput');
const filterSel   = document.getElementById('filterStatus');

const totalCount    = document.getElementById('totalCount');
const activeCount   = document.getElementById('activeCount');
const leadCount     = document.getElementById('leadCount');
const inactiveCount = document.getElementById('inactiveCount');

function renderTable(list) {
  clientTable.innerHTML = '';

  if (list.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  list.forEach(client => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(client.name)}</strong></td>
      <td>${escapeHtml(client.email)}</td>
      <td>${escapeHtml(client.phone || '—')}</td>
      <td>${escapeHtml(client.company || '—')}</td>
      <td>
        <span class="badge badge-${client.status}">
          ${client.status}
        </span>
      </td>
      <td>
        <button class="btn-edit"   onclick="openEditModal(${client.id})">
           Editează
        </button>
        <button class="btn-delete" onclick="deleteClient(${client.id})">
           Șterge
        </button>
      </td>
    `;
    clientTable.appendChild(tr);
  });
}

function openModal() {
  modal.classList.remove('hidden');
  formError.classList.add('hidden');
  fName.classList.remove('error-field');
  fEmail.classList.remove('error-field');
  setTimeout(() => fName.focus(), 100);
}

function closeModal() {
  modal.classList.add('hidden');
  editingId = null;
  clearForm();
}

function clearForm() {
  fName.value    = '';
  fEmail.value   = '';
  fPhone.value   = '';
  fCompany.value = '';
  fStatus.value  = 'Lead';
  fNotes.value   = '';
}

function openAddModal() {
  editingId              = null;
  modalTitle.textContent = ' Client Nou';
  clearForm();
  openModal();
}

function openEditModal(id) {
  const client = clients.find(c => c.id === id);
  if (!client) return;

  editingId              = id;
  modalTitle.textContent = ' Editează Client';

  fName.value    = client.name;
  fEmail.value   = client.email;
  fPhone.value   = client.phone    || '';
  fCompany.value = client.company  || '';
  fStatus.value  = client.status;
  fNotes.value   = client.notes    || '';

  openModal();
}

function saveClient() {
  const name  = fName.value.trim();
  const email = fEmail.value.trim();

  if (!name || !email) {
    formError.classList.remove('hidden');
    if (!name)  fName.classList.add('error-field');
    if (!email) fEmail.classList.add('error-field');
    return;
  }

  const clientData = {
    name,
    email,
    phone:   fPhone.value.trim(),
    company: fCompany.value.trim(),
    status:  fStatus.value,
    notes:   fNotes.value.trim()
  };

  if (editingId !== null) {
    clients = clients.map(c =>
      c.id === editingId
        ? { ...c, ...clientData }
        : c
    );
  } else {
    const newClient = {
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      ...clientData
    };
    clients.push(newClient);
  }

  persistClients(clients);
  closeModal();
  render();
}

function deleteClient(id) {
  const client = clients.find(c => c.id === id);
  if (!client) return;

  const confirmed = confirm(
    `Ești sigur că vrei să ștergi clientul "${client.name}"?\nAceastă acțiune nu poate fi anulată.`
  );
  if (!confirmed) return;

  clients = clients.filter(c => c.id !== id);
  persistClients(clients);
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
document.getElementById('closeBtn').addEventListener('click', closeModal);
document.getElementById('saveBtn').addEventListener('click', saveClient);
searchInput.addEventListener('input', render);
filterSel.addEventListener('change', render);

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

render();