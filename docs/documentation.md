# Documentație Mini-CRM

## Arhitectura aplicației

```
src/
├── index.html  — Structura paginii (sidebar, tabel, modal)
├── style.css   — Stilizare completă (layout, componente, animații)
├── data.js     — Strat de date: date demo + funcții localStorage
└── app.js      — Logica CRUD, filtre, statistici, validare
```

## Funcționalități implementate

### Gestionare clienți (CRUD)

- **Create** — formular modal cu validare câmpuri obligatorii
- **Read** — tabel cu toate înregistrările, paginat vizual
- **Update** — editare inline prin același modal
- **Delete** — confirmare înainte de ștergere

### Filtrare și căutare

- Căutare în timp real după nume, email sau companie
- Filtrare după status: Lead / Activ / Inactiv

### Dashboard statistici

- Contor animat pentru: Total, Activi, Leads, Inactivi
- Actualizare automată la orice modificare

### Persistență date

- Date salvate în `localStorage` sub cheia `crm_clients`
- Date demo pre-încărcate la prima rulare

## Cum se rulează

1. Deschide `src/index.html` în orice browser modern
2. Nu sunt necesare server, instalări sau dependențe

## Tehnologii

| Tehnologie   | Utilizare                         |
| ------------ | --------------------------------- |
| HTML5        | Structura paginii                 |
| CSS3         | Layout Grid/Flex, animații        |
| JavaScript   | Logică CRUD, DOM manipulation     |
| localStorage | Persistența datelor între sesiuni |
