/* =========================================================
   ADMIN PANEL - Logic
   Uses CONFIG, getBookings(), saveBookings(), helpers from app.js
   ========================================================= */

const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const statusStyle = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Completed: 'bg-sky-50 text-sky-700 ring-sky-200',
  Cancelled: 'bg-rose-50 text-rose-700 ring-rose-200'
};

let adminFilter = { search: '', status: 'all' };
let pendingDeleteRef = null;

/* ============ BRAND ============ */
document.title = `${CONFIG.name} | Admin`;
document.getElementById('brandIcon').innerHTML = `<i data-lucide="${CONFIG.icon}" class="w-5 h-5 text-white"></i>`;
document.getElementById('brandName').textContent = CONFIG.name;
document.documentElement.style.setProperty('--accent', CONFIG.accent);
document.documentElement.style.setProperty('--accent-soft', CONFIG.accentSoft);
document.documentElement.style.setProperty('--accent-dark', CONFIG.accentDark);

/* ============ STATS ============ */
function renderStats() {
  const list = getBookings();
  const today = todayStr();
  document.getElementById('stat-today').textContent = list.filter(b => b.date === today && b.status !== 'Cancelled').length;
  document.getElementById('stat-pending').textContent = list.filter(b => b.status === 'Pending').length;
  document.getElementById('stat-confirmed').textContent = list.filter(b => b.status === 'Confirmed').length;
  const revenue = list.filter(b => b.status === 'Completed').reduce((s, b) => s + Number(b.price || 0), 0);
  document.getElementById('stat-revenue').textContent = money(revenue);
}

/* ============ BOOKINGS TABLE ============ */
function filteredBookings() {
  const term = adminFilter.search.trim().toLowerCase();
  return getBookings()
    .filter(b => adminFilter.status === 'all' || b.status === adminFilter.status)
    .filter(b => !term || [b.name, b.phone, b.ref].some(v => String(v).toLowerCase().includes(term)))
    .sort((a, b) => (b.date + b.start).localeCompare(a.date + String(a.start).padStart(4, '0')));
}

function renderBookings() {
  const rows = filteredBookings();
  const tbody = document.getElementById('bookingsTable');
  tbody.innerHTML = rows.map(b => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-6 py-4 font-semibold text-slate-900">${esc(b.ref)}</td>
      <td class="px-6 py-4">
        <p class="font-semibold text-slate-900">${esc(b.name)}</p>
        <p class="text-xs text-slate-500">${esc(b.phone)}</p>
      </td>
      <td class="px-6 py-4 text-slate-600">${esc(b.serviceName)}</td>
      <td class="px-6 py-4 text-slate-600 whitespace-nowrap">${fmtDate(b.date)}<br><span class="text-xs text-slate-500">${fmtTime(b.start)}</span></td>
      <td class="px-6 py-4">
        <select data-status="${esc(b.ref)}" class="status-select ring-1 ${statusStyle[b.status] || ''}">
          ${STATUSES.map(s => `<option ${s === b.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td class="px-6 py-4 text-right whitespace-nowrap">
        <button data-view="${esc(b.ref)}" class="p-2 rounded-lg hover:bg-slate-100" title="View details"><i data-lucide="eye" class="w-4 h-4 text-slate-500"></i></button>
        <button data-delete="${esc(b.ref)}" class="p-2 rounded-lg hover:bg-rose-50" title="Delete"><i data-lucide="trash-2" class="w-4 h-4 text-slate-500 hover:text-rose-500"></i></button>
      </td>
    </tr>`).join('');

  document.getElementById('emptyState').classList.toggle('hidden', rows.length > 0);
  lucide.createIcons();
}

/* ============ ACTIONS ============ */
function updateStatus(ref, status) {
  const list = getBookings().map(b => b.ref === ref ? { ...b, status } : b);
  saveBookings(list);
  renderAll();
  showToast(`Booking ${ref} marked as ${status}.`);
}

function openDetail(ref) {
  const b = getBookings().find(x => x.ref === ref);
  if (!b) return;
  document.getElementById('detailBody').innerHTML = `
    <div class="flex justify-between"><span class="text-slate-500">Reference</span><span class="font-semibold">${esc(b.ref)}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Customer</span><span class="font-semibold">${esc(b.name)}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Phone</span><span class="font-semibold">${esc(b.phone)}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Email</span><span class="font-semibold">${esc(b.email || '—')}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Service</span><span class="font-semibold">${esc(b.serviceName)}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Date</span><span class="font-semibold">${fmtDate(b.date)}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Time</span><span class="font-semibold">${fmtTime(b.start)} – ${fmtTime(b.start + b.duration)}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Price</span><span class="font-semibold">${money(b.price)}</span></div>
    <div class="flex justify-between"><span class="text-slate-500">Status</span><span class="font-semibold">${b.status}</span></div>
    <div class="pt-3 border-t border-slate-100"><p class="text-slate-500 mb-1">Notes</p><p class="text-slate-800">${esc(b.notes || 'No notes')}</p></div>`;
  document.getElementById('detailModal').classList.add('open');
  lucide.createIcons();
}

function askDelete(ref) {
  pendingDeleteRef = ref;
  document.getElementById('confirmTitle').textContent = 'Delete booking?';
  document.getElementById('confirmMessage').textContent = `Booking ${ref} will be removed permanently.`;
  document.getElementById('confirmModal').classList.add('open');
}

/* ============ SERVICES EDITOR ============ */
function renderServicesEditor() {
  document.getElementById('servicesEditor').innerHTML = CONFIG.services.map(s => `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-2xl border border-slate-100">
      <div class="md:col-span-6">
        <p class="font-semibold text-slate-900">${esc(s.name)}</p>
        <p class="text-xs text-slate-500">${esc(s.desc)}</p>
      </div>
      <div class="md:col-span-3">
        <label class="label">Duration (min)</label>
        <input type="number" min="15" step="15" class="input" data-svc-duration="${s.id}" value="${s.duration}" />
      </div>
      <div class="md:col-span-3">
        <label class="label">Price (${esc(CONFIG.currency)})</label>
        <input type="number" min="0" class="input" data-svc-price="${s.id}" value="${s.price}" />
      </div>
    </div>`).join('');
}

function saveServices() {
  CONFIG.services.forEach(s => {
    s.duration = Number(document.querySelector(`[data-svc-duration="${s.id}"]`).value) || s.duration;
    s.price = Number(document.querySelector(`[data-svc-price="${s.id}"]`).value) || 0;
  });
  localStorage.setItem('services_' + CONFIG.slug, JSON.stringify(CONFIG.services));
  showToast('Services saved.');
}

// Load saved service edits on start
function loadServiceOverrides() {
  const saved = localStorage.getItem('services_' + CONFIG.slug);
  if (!saved) return;
  const list = JSON.parse(saved);
  CONFIG.services.forEach(s => {
    const o = list.find(x => x.id === s.id);
    if (o) { s.duration = o.duration; s.price = o.price; }
  });
}

/* ============ RENDER ALL ============ */
function renderAll() {
  renderStats();
  renderBookings();
}

/* ============ EVENTS ============ */
document.getElementById('searchInput').addEventListener('input', e => {
  adminFilter.search = e.target.value;
  renderBookings();
});
document.getElementById('statusFilter').addEventListener('change', e => {
  adminFilter.status = e.target.value;
  renderBookings();
});

document.getElementById('bookingsTable').addEventListener('change', e => {
  const sel = e.target.closest('[data-status]');
  if (sel) updateStatus(sel.dataset.status, sel.value);
});

document.getElementById('bookingsTable').addEventListener('click', e => {
  const view = e.target.closest('[data-view]');
  const del = e.target.closest('[data-delete]');
  if (view) openDetail(view.dataset.view);
  if (del) askDelete(del.dataset.delete);
});

document.getElementById('closeDetail').addEventListener('click', () => {
  document.getElementById('detailModal').classList.remove('open');
});

document.getElementById('confirmCancel').addEventListener('click', () => {
  document.getElementById('confirmModal').classList.remove('open');
});
document.getElementById('confirmOk').addEventListener('click', () => {
  const list = getBookings().filter(b => b.ref !== pendingDeleteRef);
  saveBookings(list);
  document.getElementById('confirmModal').classList.remove('open');
  renderAll();
  showToast('Booking deleted.', 'error');
});

document.getElementById('saveServices').addEventListener('click', saveServices);

// Close modals on backdrop click
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

/* ============ INIT ============ */
loadServiceOverrides();
renderAll();
renderServicesEditor();
lucide.createIcons();
