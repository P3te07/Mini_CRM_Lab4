const STATUS_OPTIONS = ['Lead', 'Activ', 'Inactiv'];

const DEMO_CLIENTS = [
  {
    id: 1,
    name: "Ion Popescu",
    email: "ion.popescu@firma.ro",
    phone: "0721 123 456",
    company: "Firma SRL",
    status: "Activ",
    notes: "Client fidel din 2022",
    createdAt: "2022-03-15"
  },
  {
    id: 2,
    name: "Maria Ionescu",
    email: "maria@startup.ro",
    phone: "0732 987 654",
    company: "StartupXYZ",
    status: "Lead",
    notes: "Interesat de pachetul Premium",
    createdAt: "2024-11-02"
  },
  {
    id: 3,
    name: "Andrei Constantin",
    email: "andrei.c@corp.com",
    phone: "0755 111 222",
    company: "Corp SA",
    status: "Inactiv",
    notes: "Contract expirat în 2024",
    createdAt: "2021-07-20"
  },
  {
    id: 4,
    name: "Elena Dumitrescu",
    email: "elena.d@agentie.ro",
    phone: "0766 444 333",
    company: "Agenție Media",
    status: "Lead",
    notes: "Contactată la conferința din mai",
    createdAt: "2025-05-10"
  },
  {
    id: 5,
    name: "Mihai Georgescu",
    email: "mihai.g@tech.ro",
    phone: "0744 777 888",
    company: "TechRo SRL",
    status: "Activ",
    notes: "Utilizează planul Enterprise",
    createdAt: "2023-01-08"
  }
];

function loadClients() {
  const saved = localStorage.getItem('crm_clients');
  if (saved) {
    return JSON.parse(saved);
  }
  localStorage.setItem('crm_clients', JSON.stringify(DEMO_CLIENTS));
  return [...DEMO_CLIENTS];
}

function persistClients(clients) {
  localStorage.setItem('crm_clients', JSON.stringify(clients));
}