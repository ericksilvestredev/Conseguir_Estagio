import { contacts as initialData } from './data.js';
import { reports } from './reports.js';

// State
const savedContacts = localStorage.getItem('backend_tracker_contacts');
let contacts = savedContacts ? JSON.parse(savedContacts) : [...initialData];
let searchTerm = '';
let statusFilter = 'all';
let currentView = 'table'; // 'table' or 'grid'

// Elements
const contactsListEl = document.getElementById('contacts-list');
const contactsGridEl = document.getElementById('contacts-grid');
const searchInput = document.getElementById('search-input');
const totalCountEl = document.getElementById('total-count');
const pendingCountEl = document.getElementById('pending-count');
const appliedCountEl = document.getElementById('applied-count');
const interviewCountEl = document.getElementById('interview-count');
const rejectedCountEl = document.getElementById('rejected-count');
const approvedCountEl = document.getElementById('approved-count');
const emptyStateEl = document.getElementById('empty-state');
const contentAreaEl = document.getElementById('content-area');

// Modal Elements
const reportModal = document.getElementById('report-modal');
const modalCompanyName = document.getElementById('modal-company-name');
const modalSummary = document.getElementById('report-summary');
const modalDetails = document.getElementById('report-details');
const modalBullets = document.getElementById('report-bullets');
const closeModalBtn = document.getElementById('close-report-modal');
const modalApplyBtn = document.getElementById('modal-apply-btn');
const viewButtons = document.querySelectorAll('.view-btn');
const btnDownload = document.getElementById('btn-download');

// Icons
const ICONS = {
    mail: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    talk: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    reject: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`
};

const statCards = document.querySelectorAll('.stat-card');
const searchInputElement = document.getElementById('search-input');

// Utilities
const getStatusClass = (status) => {
    const map = {
        'Para Aplicar': 'status-para-aplicar',
        'Aplicado': 'status-aplicado',
        'Entrevista': 'status-entrevista',
        'Recusado': 'status-recusado',
        'Aprovado': 'status-aprovado'
    };
    return map[status] || 'status-para-aplicar';
};

// Initialization
function init() {
    render();
    setupEventListeners();
    updateStats();

    // Lucide icons are handled by the library, but for dynamically added content 
    // we might need to refresh or just use SVG strings like above.
    // The library <script> checks for [data-lucide] on load.
    // Since we are injecting HTML, we should use the `lucide.createIcons()` method if available,
    // or better, just use raw SVGs for performance in lists. 
    // I used raw SVGs in ICONS constant for the list items.
    if (window.lucide) window.lucide.createIcons();
}

function setupEventListeners() {
    // Search
    searchInputElement.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        render();
    });

    // Stat card filters
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.dataset.filter;
            setStatusFilter(filter);
        });
    });

    // View Toggles
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            setView(view);
        });
    });

    // Download
    btnDownload.addEventListener('click', downloadCSV);

    // Close Modal
    closeModalBtn.addEventListener('click', () => {
        reportModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === reportModal) reportModal.classList.add('hidden');
    });
}

function setView(view) {
    currentView = view;
    // Update buttons
    viewButtons.forEach(btn => {
        if (btn.dataset.view === view) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Toggle Containers
    const tableContainer = document.querySelector('.table-container');
    if (view === 'table') {
        tableContainer.classList.remove('hidden');
        contactsGridEl.classList.add('hidden');
    } else {
        tableContainer.classList.add('hidden');
        contactsGridEl.classList.remove('hidden');
    }
}

function setStatusFilter(filter) {
    statusFilter = filter;

    // Update active class
    statCards.forEach(card => {
        if (card.dataset.filter === filter) card.classList.add('active');
        else card.classList.remove('active');
    });

    render();
}

window.showReport = (id) => {
    const report = reports[id];
    const contact = contacts.find(c => c.id == id);

    if (!report || !contact) {
        alert("Relatório de IA ainda não gerado para esta empresa.");
        return;
    }

    modalCompanyName.textContent = contact.empresa;
    modalSummary.textContent = report.summary;
    modalDetails.textContent = report.details;
    modalBullets.innerHTML = report.bullets.map(b => `<li>${b}</li>`).join('');

    modalApplyBtn.onclick = () => window.open(contact.link, '_blank');

    reportModal.classList.remove('hidden');
};

function getFilteredContacts() {
    return contacts.filter(c => {
        const matchesSearch =
            c.empresa.toLowerCase().includes(searchTerm) ||
            c.foco.toLowerCase().includes(searchTerm) ||
            c.setor.toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

        return matchesSearch && matchesStatus;
    });
}

function render() {
    const filtered = getFilteredContacts();

    // Empty state
    if (filtered.length === 0) {
        emptyStateEl.classList.remove('hidden');
        contactsListEl.innerHTML = '';
        contactsGridEl.innerHTML = '';
        return;
    }
    emptyStateEl.classList.add('hidden');

    // Render Table
    renderTable(filtered);

    // Render Grid
    renderGrid(filtered);

    // Stats (Always show global stats even when filtering)
    updateStats();
}

function renderTable(data) {
    contactsListEl.innerHTML = data.map(item => {
        const trClass = item.status === 'Aplicado' ? 'status-applied' :
            item.status === 'Entrevista' ? 'status-interview' :
                item.status === 'Recusado' ? 'status-rejected' :
                    item.status === 'Aprovado' ? 'status-approved' : '';

        return `
        <tr class="group ${trClass}">
            <td class="empresa-cell">
                <h3>${item.empresa}</h3>
                <span>${item.setor}</span>
            </td>
            <td>
                <span class="badge-stack">${item.foco}</span>
            </td>
            <td>
                <div class="contact-info">
                    <div class="email-row">
                        ${ICONS.mail} ${item.email}
                    </div>
                    <a href="${item.link}" target="_blank" class="link-row">
                        Candidatar ${ICONS.externalLink}
                    </a>
                </div>
            </td>
            <td>
                <div class="quick-actions">
                    <button onclick="window.updateStatus('${item.id}', 'Aplicado')" class="action-btn btn-applied" title="Marcar como Aplicado">
                        ${ICONS.send}
                    </button>
                    <button onclick="window.updateStatus('${item.id}', 'Entrevista')" class="action-btn btn-interview" title="Marcar como Entrevista">
                        ${ICONS.talk}
                    </button>
                    <button onclick="window.updateStatus('${item.id}', 'Recusado')" class="action-btn btn-rejected" title="Marcar como Recusado">
                        ${ICONS.reject}
                    </button>
                    ${reports[item.id] ? `
                    <button onclick="window.showReport('${item.id}')" class="action-btn" title="Ver Relatório IA" style="background: #eef2ff; color: #4f46e5;">
                        ${ICONS.sparkles}
                    </button>` : ''}
                </div>
            </td>
            <td>
                <select 
                    onchange="window.updateStatus('${item.id}', this.value)" 
                    class="status-select ${getStatusClass(item.status)}"
                >
                    <option value="Para Aplicar" ${item.status === 'Para Aplicar' ? 'selected' : ''}>Para Aplicar</option>
                    <option value="Aplicado" ${item.status === 'Aplicado' ? 'selected' : ''}>Aplicado</option>
                    <option value="Entrevista" ${item.status === 'Entrevista' ? 'selected' : ''}>Entrevista</option>
                    <option value="Recusado" ${item.status === 'Recusado' ? 'selected' : ''}>Recusado</option>
                    <option value="Aprovado" ${item.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
                </select>
            </td>
        </tr>
        `;
    }).join('');
}

function renderGrid(data) {
    contactsGridEl.innerHTML = data.map(item => {
        const cardClass = item.status === 'Aplicado' ? 'status-applied' :
            item.status === 'Entrevista' ? 'status-interview' :
                item.status === 'Recusado' ? 'status-rejected' :
                    item.status === 'Aprovado' ? 'status-approved' : '';

        return `
        <div class="grid-card ${cardClass}">
            <div class="grid-header">
                <div>
                    <h3 class="text-lg font-bold text-slate-800">${item.empresa}</h3>
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">${item.setor}</span>
                </div>
                <select 
                    onchange="window.updateStatus('${item.id}', this.value)"
                    class="status-select ${getStatusClass(item.status)}"
                >
                    <option value="Para Aplicar" ${item.status === 'Para Aplicar' ? 'selected' : ''}>Para Aplicar</option>
                    <option value="Aplicado" ${item.status === 'Aplicado' ? 'selected' : ''}>Aplicado</option>
                    <option value="Entrevista" ${item.status === 'Entrevista' ? 'selected' : ''}>Entrevista</option>
                    <option value="Recusado" ${item.status === 'Recusado' ? 'selected' : ''}>Recusado</option>
                    <option value="Aprovado" ${item.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
                </select>
            </div>
            
            <div class="mb-4">
               <span class="badge-stack">${item.foco}</span>
            </div>
            
            <div class="contact-info mb-4">
                <div class="email-row">
                    ${ICONS.mail} ${item.email}
                </div>
            </div>
            
            <div class="card-footer">
                <a href="${item.link}" target="_blank" class="btn-card">Ver Portal</a>
                <div class="quick-actions mini">
                    <button onclick="window.updateStatus('${item.id}', 'Aplicado')" class="action-btn btn-applied" title="Aplicado">
                        ${ICONS.send}
                    </button>
                    <button onclick="window.updateStatus('${item.id}', 'Entrevista')" class="action-btn btn-interview" title="Entrevista">
                        ${ICONS.talk}
                    </button>
                    <button onclick="window.updateStatus('${item.id}', 'Recusado')" class="action-btn btn-rejected" title="Recusado">
                        ${ICONS.reject}
                    </button>
                    ${reports[item.id] ? `
                    <button onclick="window.showReport('${item.id}')" class="action-btn" title="Relatório IA" style="background: #eef2ff; color: #4f46e5;">
                        ${ICONS.sparkles}
                    </button>` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function updateStats() {
    totalCountEl.textContent = contacts.length;
    pendingCountEl.textContent = contacts.filter(c => c.status === 'Para Aplicar').length;
    appliedCountEl.textContent = contacts.filter(c => c.status === 'Aplicado').length;
    interviewCountEl.textContent = contacts.filter(c => c.status === 'Entrevista').length;
    rejectedCountEl.textContent = contacts.filter(c => c.status === 'Recusado').length;
    approvedCountEl.textContent = contacts.filter(c => c.status === 'Aprovado').length;
}

// Global function for inline event handlers
window.updateStatus = (id, newStatus) => {
    // Find item
    const index = contacts.findIndex(c => c.id.toString() === id.toString());
    if (index !== -1) {
        contacts[index].status = newStatus;

        // Save to local storage for persistence
        localStorage.setItem('backend_tracker_contacts', JSON.stringify(contacts));

        render(); // Re-render to update UI and classes
    }
};

function downloadCSV() {
    const headers = ["ID", "Empresa", "Setor", "Link", "Email", "Foco", "Status"];
    const rows = contacts.map(c => [c.id, c.empresa, c.setor, c.link, c.email, c.foco, c.status]);

    // Helper to escape CSV fields
    const escape = (text) => {
        if (text === null || text === undefined) return '';
        const str = text.toString();
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvContent = [
        headers.join(";"),
        ...rows.map(row => row.map(escape).join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "lista_atualizada.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Run
init();
