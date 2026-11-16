/* =========================================================
   BOOKING APP - Logic (Glow Studio)
   ========================================================= */

/* ============ CONFIG (Glow Studio) ============ */
const CONFIG = {
  slug: 'glow-studio',
  name: 'Glow Studio',
  type: 'Beauty & Hair Salon',
  refPrefix: 'GS',
  tagline: 'Book your glow-up in seconds. Choose a service, pick a time that suits you, and we will take care of the rest.',
  phone: '+1 555 000 1234',
  address: '123 Beauty Lane, New York',
  currency: '$',
  openTime: '10:00',
  closeTime: '20:00',
  slotMinutes: 60,
  closedDays: [0],
  icon: 'sparkles',
  accent: '#e11d74',
  accentSoft: '#fde7f1',
  accentDark: '#9d174d',
  services: [
    { id: 'haircut', name: 'Haircut & Styling', duration: 60, price: 35, desc: 'Precision cut with wash and blow-dry.' },
    { id: 'facial', name: 'Facial Treatment', duration: 60, price: 55, desc: 'Deep cleansing and glow boosting facial.' },
    { id: 'color', name: 'Hair Coloring', duration: 120, price: 90, desc: 'Full color or highlights with a premium finish.' },
    { id: 'mani', name: 'Manicure & Pedicure', duration: 45, price: 40, desc: 'Nail care, shaping and polish.' }
  ]
};

/* ============ STORAGE ============ */
const STORE_KEY = 'booking_' + CONFIG.slug;
const SERVICES_KEY = 'services_' + CONFIG.slug;

function getBookings() {
  return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
}
function saveBookings(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

// Apply saved service edits (price/duration) from the admin page
(function loadServiceOverrides() {
  const saved = localStorage.getItem(SERVICES_KEY);
  if (!saved) return;
  const list = JSON.parse(saved);
  CONFIG.services.forEach(s => {
    const o = list.find(x => x.id === s.id);
    if (o) { s.duration = o.duration; s.price = o.price; }
  });
})();

/* ============ HELPERS ============ */
function toMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function fmtTime(min) {
  let h = Math.floor(min / 60);
  const m = min % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}
function todayStr() {
  return new Date().toLocaleDateString('en-CA');
}
function fmtDate(s) {
  return new Date(s + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function money(n) {
  return CONFIG.currency + Number(n || 0).toLocaleString('en-US');
}
function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function getService(id) {
  return CONFIG.services.find(s => s.id === id);
}
function showToast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast px-4 py-3 rounded-xl text-sm font-medium shadow-xl text-white ${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`;
  el.textContent = message;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

/* ============ SLOT ENGINE ============ */
function getSlots(dateStr, duration) {
  const day = new Date(dateStr + 'T00:00').getDay();
  if (CONFIG.closedDays.includes(day)) return null;

  const bookings = getBookings().filter(b => b.date === dateStr && b.status !== 'Cancelled');
  const open = toMin(CONFIG.openTime);
  const close = toMin(CONFIG.closeTime);

  const now = new Date();
  const isToday = dateStr === todayStr();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (let s = open; s + duration <= close; s += CONFIG.slotMinutes) {
    const passed = isToday && s <= nowMin;
    const clash = bookings.some(b => s < b.start + b.duration && b.start < s + duration);
    slots.push({ start: s, available: !passed && !clash });
  }
  return slots;
}

/* ============ BOOKING PAGE ONLY ============ */
const isBookingPage = !!document.getElementById('bookingForm');
let state = { serviceId: null, date: '', start: null };

function renderBrand() {
  document.title = `${CONFIG.name} | Book Online`;
  const root = document.documentElement.style;
  root.setProperty('--accent', CONFIG.accent);
  root.setProperty('--accent-soft', CONFIG.accentSoft);
  root.setProperty('--accent-dark', CONFIG.accentDark);

  document.getElementById('brandIcon').innerHTML = `<i data-lucide="${CONFIG.icon}" class="w-5 h-5 text-white"></i>`;
  document.getElementById('brandName').textContent = CONFIG.name;
  document.getElementById('brandType').textContent = CONFIG.type;
  document.getElementById('heroTitle').textContent = `Book your visit at ${CONFIG.name}`;
  document.getElementById('heroTag').textContent = CONFIG.tagline;
  document.getElementById('chipHours').textContent = `Open ${fmtTime(toMin(CONFIG.openTime))} – ${fmtTime(toMin(CONFIG.closeTime))}`;
  document.getElementById('chipSlot').textContent = `Slots every ${CONFIG.slotMinutes} min`;
  document.getElementById('chipAddress').textContent = CONFIG.address;
  document.getElementById('headerPhoneText').textContent = CONFIG.phone;
  document.getElementById('headerPhone').href = 'tel:' + CONFIG.phone.replace(/\s/g, '');
  document.getElementById('footerName').textContent = CONFIG.name;
}

function renderServices() {
  document.getElementById('serviceGrid').innerHTML = CONFIG.services.map(s => `
    <button type="button" data-service="${s.id}" class="service-card ${state.serviceId === s.id ? 'selected' : ''}">
      <div class="flex justify-between items-start gap-3">
        <div>
          <p class="font-semibold text-slate-900">${esc(s.name)}</p>
          <p class="text-sm text-slate-500 mt-1">${esc(s.desc)}</p>
        </div>
        <span class="check"><i data-lucide="check" class="w-3.5 h-3.5"></i></span>
      </div>
      <div class="flex justify-between items-center mt-4 text-sm">
        <span class="text-slate-500 flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> ${s.duration} min</span>
        <span class="font-bold text-slate-900">${money(s.price)}</span>
      </div>
    </button>`).join('');
}

function renderSlots() {
  const grid = document.getElementById('slotGrid');
  const note = document.getElementById('slotNote');
  grid.innerHTML = '';

  const svc = getService(state.serviceId);
  if (!svc) { note.textContent = '👆 Select a service first to see available times.'; return; }
  if (!state.date) { note.textContent = '📅 Choose a date to see available times.'; return; }

  const slots = getSlots(state.date, svc.duration);
  if (!slots) { note.textContent = '🚫 We are closed on this day. Please choose another date.'; return; }

  const free = slots.filter(s => s.available).length;
  note.textContent = free
    ? `${free} of ${slots.length} slots available · ${svc.duration} min service`
    : '😔 No slots left on this day. Please try another date.';

  grid.innerHTML = slots.map(s => `
    <button type="button" data-start="${s.start}"
      class="slot-btn ${state.start === s.start ? 'selected' : ''}"
      ${s.available ? '' : 'disabled'}>${fmtTime(s.start)}</button>`).join('');
}

function renderSummary() {
  const svc = getService(state.serviceId);
  document.getElementById('sumService').textContent = svc ? svc.name : '—';
  document.getElementById('sumDate').textContent = state.date ? fmtDate(state.date) : '—';
  document.getElementById('sumTime').textContent =
    (svc && state.start !== null) ? `${fmtTime(state.start)} – ${fmtTime(state.start + svc.duration)}` : '—';
  document.getElementById('sumTotal').textContent = money(svc ? svc.price : 0);
}

function renderAll() {
  renderServices();
  renderSlots();
  renderSummary();
  lucide.createIcons();
}

if (isBookingPage) {
  document.getElementById('serviceGrid').addEventListener('click', e => {
    const card = e.target.closest('[data-service]');
    if (!card) return;
    state.serviceId = card.dataset.service;
    state.start = null;
    renderAll();
  });

  document.getElementById('dateInput').addEventListener('change', e => {
    state.date = e.target.value;
    state.start = null;
    renderAll();
  });

  document.getElementById('slotGrid').addEventListener('click', e => {
    const btn = e.target.closest('[data-start]');
    if (!btn || btn.disabled) return;
    state.start = Number(btn.dataset.start);
    renderAll();
  });

  document.getElementById('bookingForm').addEventListener('submit', e => {
    e.preventDefault();
    const svc = getService(state.serviceId);
    if (!svc) return showToast('Please select a service.', 'error');
    if (!state.date) return showToast('Please pick a date.', 'error');
    if (state.start === null) return showToast('Please pick a time slot.', 'error');

    const slot = (getSlots(state.date, svc.duration) || []).find(s => s.start === state.start);
    if (!slot || !slot.available) {
      showToast('Sorry, this slot was just taken. Please choose another.', 'error');
      state.start = null;
      renderAll();
      return;
    }

    const form = e.target;
    const fd = Object.fromEntries(new FormData(form).entries());
    const ref = CONFIG.refPrefix + '-' + Date.now().toString().slice(-6);

    const booking = {
      ref,
      serviceId: svc.id,
      serviceName: svc.name,
      price: svc.price,
      date: state.date,
      start: state.start,
      duration: svc.duration,
      name: fd.name.trim(),
      phone: fd.phone.trim(),
      email: (fd.email || '').trim(),
      notes: (fd.notes || '').trim(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const list = getBookings();
    list.push(booking);
    saveBookings(list);

    document.getElementById('refCode').textContent = ref;
    document.getElementById('successDetails').innerHTML = `
      <div class="flex justify-between"><span class="text-slate-500">Service</span><span class="font-semibold text-slate-900">${esc(svc.name)}</span></div>
      <div class="flex justify-between"><span class="text-slate-500">Date</span><span class="font-semibold text-slate-900">${fmtDate(state.date)}</span></div>
      <div class="flex justify-between"><span class="text-slate-500">Time</span><span class="font-semibold text-slate-900">${fmtTime(state.start)}</span></div>
      <div class="flex justify-between"><span class="text-slate-500">Name</span><span class="font-semibold text-slate-900">${esc(booking.name)}</span></div>
      <div class="flex justify-between"><span class="text-slate-500">Status</span><span class="font-semibold text-amber-600">Pending confirmation</span></div>`;
    document.getElementById('successModal').classList.add('open');
    lucide.createIcons();

    form.reset();
    state = { serviceId: null, date: '', start: null };
    document.getElementById('dateInput').value = '';
    renderAll();
  });

  document.getElementById('closeSuccess').addEventListener('click', () => {
    document.getElementById('successModal').classList.remove('open');
  });
  document.getElementById('successModal').addEventListener('click', e => {
    if (e.target.id === 'successModal') e.target.classList.remove('open');
  });

  renderBrand();
  document.getElementById('dateInput').min = todayStr();
  renderAll();
  lucide.createIcons();
}
