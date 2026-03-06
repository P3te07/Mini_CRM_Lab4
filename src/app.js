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