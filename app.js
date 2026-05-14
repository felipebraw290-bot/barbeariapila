
const SUPABASE_URL = 'https://esmgvjdfmghvmbbmiwwr.supabase.co';

const SUPABASE_KEY = 'sb_publishable_33LFn0rafHYSWp_6aKe73g_-QZLQxX9';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* ══════════════════════════════════════════
   BARBERKING — app.js
   Barbeiro: Pila | Premium Studio
══════════════════════════════════════════ */

'use strict';

// ════════════════════════════════════════════════════
//  DATABASE — LocalStorage
// ════════════════════════════════════════════════════
const DB_KEY = 'barberking_pila_v2';

// ════════════════════════════════════════════════════
//  THEME — dark only (dark mode removido)
// ════════════════════════════════════════════════════
function initTheme() {}
function toggleTheme() {}
function applyTheme() {}

function getDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : defaultDB();
  } catch(e) { return defaultDB(); }
}

function defaultDB() {
  return {
    appointments: [],
    profile: null,
    blockedDates: [],
    blockedIntervals: [],
    activeSlots: ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'],
  };
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function addAppointment(appt) {
  const db = getDB();
  appt.id = Date.now().toString() + Math.random().toString(36).slice(2,6);
  appt.createdAt = new Date().toISOString();
  appt.status = 'confirmed';
  appt.doneByAdmin = false;
  db.appointments.unshift(appt);
  saveDB(db);
  return appt;
}

function cancelAppointment(id) {
  const db = getDB();
  const appt = db.appointments.find(a => a.id === id);
  if (appt) { appt.status = 'cancelled'; saveDB(db); }
}

function markDone(id) {
  const db = getDB();
  const appt = db.appointments.find(a => a.id === id);
  if (appt) { appt.status = 'past'; appt.doneByAdmin = true; saveDB(db); }
}

function getProfile() {
  const db = getDB();
  return db.profile || { name: 'Visitante', phone: '', email: '' };
}

function saveProfile(profile) {
  const db = getDB();
  db.profile = profile;
  saveDB(db);
}

function saveRegisterProfile() {
  const name = document.getElementById('register-name')?.value.trim();
  const phone = document.getElementById('register-phone')?.value.trim();
  if (!name || name.length < 3) {
    return showToast('Digite seu nome completo para continuar.', 'error');
  }
  if (!phone || phone.replace(/\D/g, '').length < 10) {
    return showToast('Informe um WhatsApp válido.', 'error');
  }
  saveProfile({ name, phone, email: '' });
  showPage('home');
  renderHome();
  renderProfile();
  showToast('Seja bem-vindo, ' + name + '!', 'success');
}

// ════════════════════════════════════════════════════
//  CONSTANTS — Single Barber: Pila
// ════════════════════════════════════════════════════
const BARBER = {
  id: 1, name: 'Pila', fullName: 'Pila',
  role: 'Mestre Barbeiro', rating: '5.0', emoji: 'P',
};

const ALL_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'
];

const SERVICES = [
  { id:1, name:'Corte de Cabelo', icon:'✂️', duration:'30 min', price:35,    priceStr:'R$ 35,00' },
  { id:2, name:'Barba Completa',  icon:'🪒', duration:'20 min', price:30,    priceStr:'R$ 30,00' },
  { id:3, name:'Cabelo + Barba',  icon:'💈', duration:'50 min', price:59.90, priceStr:'R$ 59,90' },
  { id:4, name:'Degradê',         icon:'🔥', duration:'45 min', price:45,    priceStr:'R$ 45,00' },
  { id:5, name:'Navalhado',       icon:'⚡', duration:'25 min', price:25,    priceStr:'R$ 25,00' },
  { id:6, name:'Hidratação',      icon:'💧', duration:'30 min', price:40,    priceStr:'R$ 40,00' },
];

const ADMIN_PASSWORD = 'pila123';

// ════════════════════════════════════════════════════
//  APP STATE
// ════════════════════════════════════════════════════
const state = {
  selectedService: null,
  selectedDate: null,
  selectedSlot: null,
  currentStep: 1,
  cancelId: null,
  apptFilter: 'all',
  adminApptFilter: 'all',
  isAdmin: false,
};

// ════════════════════════════════════════════════════
//  PARTICLES
// ════════════════════════════════════════════════════
(function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#c9a84c','#f0c060','#a07830','rgba(255,255,255,.5)'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3.5 + 1;
    p.style.cssText = [
      `width:${size}px`,`height:${size}px`,
      `background:${colors[Math.floor(Math.random()*colors.length)]}`,
      `left:${Math.random()*100}%`,
      `animation-duration:${Math.random()*14+8}s`,
      `animation-delay:${Math.random()*12}s`,
    ].join(';');
    container.appendChild(p);
  }
})();

// ════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════
const NAV_MAP = {
  home:'nav-home', book:'nav-book',
  appointments:'nav-appointments', profile:'nav-profile',
  notifications:null, admin:null,
};

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));

  const page = document.getElementById('page-' + name) || document.getElementById(name);
  if (page) page.classList.add('active');

  const navBtn = NAV_MAP[name];
  if (navBtn) document.getElementById(navBtn)?.classList.add('active');

  const nav = document.querySelector('nav');
  if (nav) nav.style.display = name === 'register' ? 'none' : 'flex';

  if (name === 'home') renderHome();
  if (name === 'appointments') renderAppointments();
  if (name === 'profile') renderProfile();
  if (name === 'admin') renderAdmin();

  window.scrollTo(0, 0);
}

function goToBook() {
  showPage('book');
  resetBooking();
}

// ════════════════════════════════════════════════════
//  HOME PAGE
// ════════════════════════════════════════════════════
function renderHome() {
  const profile = getProfile();
  const greetEl = document.getElementById('user-greeting');
  if (greetEl) greetEl.textContent = profile.name === 'Visitante'
    ? 'Bem-vindo! Agende seu horário com o Pila.' : 'Olá, ' + profile.name;

  const bc = document.getElementById('home-barber-card');
  if (bc) bc.innerHTML = `
    <div class="barber-hero-card" onclick="goToBook()">
      <div class="barber-big-avatar">
        P<div class="online-dot"></div>
      </div>
      <div class="barber-hero-info">
        <div class="barber-hero-name">${BARBER.fullName}</div>
        <div class="barber-hero-role">${BARBER.role}</div>
        <div class="barber-hero-stars">
          <span>★★★★★</span> ${BARBER.rating} · <span style="color:var(--green);">Disponível agora</span>
        </div>
      </div>
      <button class="barber-book-btn">Agendar</button>
    </div>`;

  const sg = document.getElementById('home-services');
  if (sg) sg.innerHTML = SERVICES.slice(0,4).map(s => `
    <div class="service-mini ripple" onclick="goToBook()">
      <div class="s-icon">${s.icon}</div>
      <div class="s-name">${s.name}</div>
      <div class="s-dur"><i class="fas fa-clock" style="font-size:9px;margin-right:3px;"></i>${s.duration}</div>
      <div class="s-price">${s.priceStr}</div>
    </div>`).join('');

  const db = getDB();
  const upcoming = db.appointments.filter(a => a.status === 'confirmed');
  const cont = document.getElementById('home-next-appt');
  if (!cont) return;
  if (!upcoming.length) {
    cont.innerHTML = `
      <div style="background:var(--dark3);border-radius:16px;padding:22px;border:1px solid rgba(255,255,255,.06);text-align:center;">
        <div style="font-size:38px;margin-bottom:8px;">📅</div>
        <div style="font-size:14px;color:var(--gray);">Nenhum agendamento próximo</div>
        <button class="btn-outline" onclick="goToBook()" style="margin-top:14px;width:100%;">Agendar com Pila</button>
      </div>`;
  } else {
    const a = upcoming[0];
    cont.innerHTML = `
      <div class="mini-appt-card">
        <div class="appt-top">
          <div class="appt-service">${a.service}</div>
          <span class="appt-badge badge-confirmed">Confirmado</span>
        </div>
        <div class="appt-info" style="margin-top:10px;">
          <div class="appt-detail"><i class="fas fa-scissors"></i>${BARBER.name}</div>
          <div class="appt-detail"><i class="fas fa-calendar"></i>${a.date}</div>
          <div class="appt-detail"><i class="fas fa-clock"></i>${a.time}</div>
          <div class="appt-detail"><i class="fas fa-tag"></i>${a.priceStr}</div>
        </div>
      </div>`;
  }
}

// ════════════════════════════════════════════════════
//  BOOK FLOW
// ════════════════════════════════════════════════════
function resetBooking() {
  state.selectedService = null;
  state.selectedDate = null;
  state.selectedSlot = null;
  goStep(1);
}

function goStep(n) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('step-' + i);
    if (el) el.style.display = i === n ? 'block' : 'none';
    const dot = document.getElementById('dot-' + i);
    if (dot) dot.classList.toggle('active', i <= n);
  }
  state.currentStep = n;
  if (n === 1) renderServicesGrid();
  if (n === 2) renderDateSlots();
  if (n === 3) renderSummary();
  window.scrollTo(0, 0);
}

function renderServicesGrid() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  grid.innerHTML = SERVICES.map(s => `
    <div class="service-card ripple" onclick="selectService(${s.id})" id="scard-${s.id}">
      <div class="service-icon">${s.icon}</div>
      <div class="service-name">${s.name}</div>
      <div class="service-duration"><i class="fas fa-clock" style="font-size:9px;margin-right:3px;"></i>${s.duration}</div>
      <div class="service-price">${s.priceStr}</div>
    </div>`).join('');
}

function selectService(id) {
  SERVICES.forEach(s => document.getElementById('scard-'+s.id)?.classList.remove('selected'));
  state.selectedService = SERVICES.find(s => s.id === id);
  const card = document.getElementById('scard-'+id);
  if (card) { card.classList.add('selected'); rippleEffect(card); }
  document.getElementById('btn-step1').disabled = false;
  vibrate();
}

// ════════════════════════════════════════════════════
//  DATA — corrigido: addEventListener garante toque em mobile
// ════════════════════════════════════════════════════
function renderDateSlots() {
  const db = getDB();
  const scroll = document.getElementById('date-scroll');
  if (!scroll) return;
  const days   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const today  = new Date();
  let html = '';
  let firstAvailable = null;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const dateStr = fmtDate(d);
    const isBlocked = db.blockedDates.includes(dateStr);
    if (!isBlocked && !firstAvailable) firstAvailable = dateStr;
  }

  const selectedDate = (!state.selectedDate || db.blockedDates.includes(state.selectedDate))
    ? (firstAvailable || fmtDate(today))
    : state.selectedDate;
  state.selectedDate = selectedDate;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const dateStr = fmtDate(d);
    const isBlocked = db.blockedDates.includes(dateStr);
    html += `<div class="date-item ${dateStr===selectedDate?'selected':''} ${isBlocked?'blocked':''}"
      data-date="${dateStr}" id="date-${i}" ${isBlocked ? 'title="Data bloqueada"' : ''}>
      <div class="date-day">${i===0?'Hoje':days[d.getDay()]}</div>
      <div class="date-num">${d.getDate()}</div>
      <div class="date-month">${months[d.getMonth()]}</div>
    </div>`;
  }
  scroll.innerHTML = html;

  // Fix mobile: vincula click via JS (não inline) para garantir seleção por toque
  scroll.querySelectorAll('.date-item:not(.blocked)').forEach(el => {
    el.addEventListener('click', function() {
      selectDate(this, this.dataset.date);
    });
  });

  renderSlots();
}

function selectDate(el, dateStr) {
  document.querySelectorAll('.date-item').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  state.selectedDate = dateStr;
  state.selectedSlot = null;
  document.getElementById('btn-step2').disabled = true;
  renderSlots();
}

function renderSlots() {
  const db = getDB();
  const activeSlots = db.activeSlots || ALL_SLOTS;
  const busySlots = db.appointments
    .filter(a => a.status === 'confirmed' && a.date === state.selectedDate)
    .map(a => a.time);

  const isSlotInInterval = (slot, intervals) => {
    return intervals.some(iv => slot >= iv.start && slot < iv.end);
  };

  const grid = document.getElementById('slots-grid');
  if (!grid) return;
  grid.innerHTML = activeSlots.map(s => {
    const isBusy    = busySlots.includes(s);
    const isBlocked = isSlotInInterval(s, db.blockedIntervals || []);
    const status    = isBlocked ? 'blocked' : isBusy ? 'busy' : 'available';
    const label     = isBlocked ? 'Bloqueado' : isBusy ? 'Ocupado' : 'Livre';
    return `<div class="slot ${status}"
      ${!isBusy && !isBlocked ? `onclick="selectSlot(this,'${s}')"` : ''}>
      ${s}<div class="slot-label">${label}</div>
    </div>`;
  }).join('');
}

function selectSlot(el, time) {
  document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  state.selectedSlot = time;
  document.getElementById('btn-step2').disabled = false;
  vibrate();
}

function renderSummary() {
  const s = state.selectedService;
  document.getElementById('booking-summary').innerHTML = `
    <div class="confirm-row"><span class="confirm-label">Barbeiro</span><span class="confirm-value">${BARBER.name} 💈</span></div>
    <div class="confirm-row"><span class="confirm-label">Serviço</span><span class="confirm-value">${s?.icon} ${s?.name}</span></div>
    <div class="confirm-row"><span class="confirm-label">Data</span><span class="confirm-value">${state.selectedDate}</span></div>
    <div class="confirm-row"><span class="confirm-label">Horário</span><span class="confirm-value">${state.selectedSlot}</span></div>
    <div class="confirm-row"><span class="confirm-label">Duração</span><span class="confirm-value">${s?.duration}</span></div>
    <div class="confirm-row"><span class="confirm-label">Valor</span><span class="confirm-value gold">${s?.priceStr}</span></div>`;
  validateForm();
}

function validateForm() {
  const name  = document.getElementById('input-name')?.value.trim();
  const phone = document.getElementById('input-phone')?.value.trim();
  const email = document.getElementById('input-email')?.value.trim();
  const btn   = document.getElementById('btn-confirm');
  const isValid = name && name.length > 2 && phone && phone.length > 9 && email && email.includes('@');
  if (btn) btn.disabled = !isValid;
}

// ════════════════════════════════════════════════════
//  CONFIRM MODAL
// ════════════════════════════════════════════════════
function openConfirmModal() {
  const s     = state.selectedService;
  const name  = document.getElementById('input-name').value.trim();
  const phone = document.getElementById('input-phone').value.trim();
  const email = document.getElementById('input-email').value.trim();

  if (!email || !email.includes('@')) {
    return showToast('❌ Por favor, informe um e-mail válido.', 'error');
  }

  document.getElementById('modal-content').innerHTML = `
    <div class="confirm-row"><span class="confirm-label">Cliente</span><span class="confirm-value">${name}</span></div>
    <div class="confirm-row"><span class="confirm-label">Contato</span><span class="confirm-value">${phone}</span></div>
    <div class="confirm-row"><span class="confirm-label">E-mail</span><span class="confirm-value">${email}</span></div>
    <div class="confirm-row"><span class="confirm-label">Barbeiro</span><span class="confirm-value">${BARBER.name}</span></div>
    <div class="confirm-row"><span class="confirm-label">Serviço</span><span class="confirm-value">${s.icon} ${s.name}</span></div>
    <div class="confirm-row"><span class="confirm-label">Data &amp; Hora</span><span class="confirm-value">${state.selectedDate} às ${state.selectedSlot}</span></div>
    <div class="confirm-row"><span class="confirm-label">Total</span><span class="confirm-value gold" style="font-size:20px;">${s.priceStr}</span></div>`;
  document.getElementById('confirm-modal').classList.add('open');
}

function closeModal() { document.getElementById('confirm-modal').classList.remove('open'); }

async function confirmBooking() {
  const name  = document.getElementById('input-name').value.trim();
  const phone = document.getElementById('input-phone').value.trim();
  const email = document.getElementById('input-email').value.trim();
  const s     = state.selectedService;

  const profile = getProfile();
  if (profile.name === 'Visitante') saveProfile({ name, phone, email });

  addAppointment({
    barberId: BARBER.id, barber: BARBER.name,
    serviceId: s.id, service: s.name,
    date: state.selectedDate, time: state.selectedSlot,
    price: s.price, priceStr: s.priceStr,
    duration: s.duration, clientName: name, clientPhone: phone, clientEmail: email,
  });

  const ok = await salvarAgendamento({
    name:    name,
    phone:   phone,
    service: s.name,
    date:    state.selectedDate,
    time:    state.selectedSlot,
  });

  if (!ok) return;

  closeModal();
  showToast('✅ Agendamento confirmado! Até logo.', 'success');
  vibrate(200);
  setTimeout(() => {
    showPage('appointments');
    resetBooking();
  }, 1400);
}

// ════════════════════════════════════════════════════
//  SUPABASE — salvar agendamento
// ════════════════════════════════════════════════════
async function salvarAgendamento(data) {
  const { error } = await supabaseClient
    .from('appointments')
    .insert([{
      client_name:       data.name,
      phone:             data.phone,
      service:           data.service,
      appointment_date:  data.date.split('/').reverse().join('-'),
      appointment_time:  data.time,
    }]);

  if (error) {
    console.error('Erro Supabase:', error);
    showToast('❌ Erro ao salvar no banco: ' + (error.message || 'tente novamente'), 'error');
    return false;
  }

  return true;
}

// ════════════════════════════════════════════════════
//  APPOINTMENTS PAGE
// ════════════════════════════════════════════════════
function filterAppts(filter) {
  state.apptFilter = filter;
  document.querySelectorAll('#page-appointments .filter-btn').forEach(b => {
    b.classList.toggle('active', b.id === 'filter-' + filter);
  });
  renderAppointments();
}

function renderAppointments() {
  const db = getDB();
  let appts = [...db.appointments];
  if (state.apptFilter === 'upcoming')   appts = appts.filter(a => a.status === 'confirmed');
  else if (state.apptFilter === 'past')  appts = appts.filter(a => a.status === 'past');
  else if (state.apptFilter === 'cancelled') appts = appts.filter(a => a.status === 'cancelled');

  const list = document.getElementById('appt-list');
  if (!list) return;
  if (!appts.length) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📅</div>
      <div class="empty-text">Nenhum agendamento aqui</div>
      <div class="empty-sub">Que tal agendar com o Pila?</div>
      <button class="btn-outline" onclick="goToBook()" style="margin-top:20px;">Agendar Agora</button>
    </div>`;
    return;
  }

  list.innerHTML = appts.map(a => {
    const sc  = a.status === 'confirmed' ? 'confirmed' : a.status === 'cancelled' ? 'cancelled' : 'past';
    const bc  = `badge-${sc}`;
    const lbl = a.status === 'confirmed' ? 'Confirmado' : a.status === 'cancelled' ? 'Cancelado' : 'Realizado';
    return `
    <div class="appt-card ${sc}" id="appt-${a.id}">
      <div class="appt-top">
        <div class="appt-service">${a.service}</div>
        <span class="appt-badge ${bc}">${lbl}</span>
      </div>
      <div class="appt-info">
        <div class="appt-detail"><i class="fas fa-scissors"></i>${a.barber}</div>
        <div class="appt-detail"><i class="fas fa-calendar"></i>${a.date}</div>
        <div class="appt-detail"><i class="fas fa-clock"></i>${a.time}</div>
        <div class="appt-detail"><i class="fas fa-tag"></i>${a.priceStr}</div>
      </div>
      ${a.status === 'confirmed' ? `
      <div class="appt-actions">
        <button class="appt-btn appt-btn-reschedule" onclick="rescheduleAppt('${a.id}')">
          <i class="fas fa-calendar-alt"></i> Reagendar
        </button>
        <button class="appt-btn appt-btn-cancel" onclick="openCancelModal('${a.id}')">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </div>` : ''}
    </div>`;
  }).join('');
}

function openCancelModal(id) {
  state.cancelId = id;
  const db = getDB();
  const a = db.appointments.find(ap => ap.id === id);
  if (!a) return;

  const apptTime   = new Date(`${a.date.split('/').reverse().join('-')}T${a.time}:00`);
  const hoursUntil = (apptTime - new Date()) / (1000 * 60 * 60);
  const isTooLate  = hoursUntil < 2 && hoursUntil > 0;

  const warningText = isTooLate
    ? `<div style="background:rgba(224,80,80,.15);border:1px solid var(--red);border-radius:12px;padding:12px;margin-bottom:16px;color:var(--red);font-size:13px;text-align:center;"><strong>⚠️ Aviso!</strong><br>Faltam menos de 2 horas. Cancelamento pode ter taxa.</div>`
    : '';

  document.getElementById('cancel-content').innerHTML = warningText + `
    <div class="confirm-row"><span class="confirm-label">Serviço</span><span class="confirm-value">${a.service}</span></div>
    <div class="confirm-row"><span class="confirm-label">Data &amp; Hora</span><span class="confirm-value">${a.date} às ${a.time}</span></div>`;
  document.getElementById('cancel-modal').classList.add('open');
}

function closeCancelModal() { document.getElementById('cancel-modal').classList.remove('open'); }

function doCancel() {
  cancelAppointment(state.cancelId);
  closeCancelModal();
  renderAppointments();
  renderHome();
  showToast('❌ Agendamento cancelado.', 'error');
}

function rescheduleAppt(id) {
  const db  = getDB();
  const a   = db.appointments.find(ap => ap.id === id);
  if (!a) return;

  const service = SERVICES.find(s => s.id === a.serviceId);
  if (service) state.selectedService = service;

  document.getElementById('input-name').value  = a.clientName;
  document.getElementById('input-phone').value = a.clientPhone;
  document.getElementById('input-email').value = a.clientEmail || '';

  cancelAppointment(id);
  showPage('book');
  goStep(2);
  showToast('🔄 Escolha uma nova data e horário.', 'info');
}

// ════════════════════════════════════════════════════
//  PROFILE PAGE
// ════════════════════════════════════════════════════
function renderProfile() {
  const profile = getProfile();
  const db      = getDB();
  const appts   = db.appointments;
  const total   = appts.filter(a => a.status !== 'cancelled').length;
  const spent   = appts.filter(a => a.status !== 'cancelled').reduce((s,a) => s + a.price, 0);

  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('profile-avatar').textContent = initials || '?';
  document.getElementById('profile-name').textContent   = profile.name;
  document.getElementById('stat-total').textContent     = total;
  document.getElementById('stat-spent').textContent     = 'R$' + spent.toFixed(0);

  const nameInput  = document.getElementById('profile-name-input');
  const phoneInput = document.getElementById('profile-phone-input');
  const emailInput = document.getElementById('profile-email-input');
  if (nameInput)  nameInput.value  = profile.name !== 'Visitante' ? profile.name : '';
  if (phoneInput) phoneInput.value = profile.phone || '';
  if (emailInput) emailInput.value = profile.email || '';
}

function saveProfileForm() {
  const name  = document.getElementById('profile-name-input')?.value.trim();
  const phone = document.getElementById('profile-phone-input')?.value.trim();
  const email = document.getElementById('profile-email-input')?.value.trim();

  if (!name || name.length < 3)                         return showToast('Informe seu nome completo para salvar.', 'error');
  if (/[0-9]/.test(name))                               return showToast('O nome não pode conter números.', 'error');
  if (!phone || phone.replace(/\D/g,'').length < 10)    return showToast('Digite um WhatsApp válido (mínimo 10 dígitos).', 'error');

  saveProfile({ name, phone, email });
  renderProfile();
  renderHome();
  scrollToProfileForm();
  showToast('✅ Dados salvos com sucesso.', 'success');
}

function scrollToProfileForm() {
  const card = document.getElementById('profile-edit-card');
  if (card) {
    card.style.display = card.style.display === 'none' ? 'block' : 'none';
    if (card.style.display === 'block') {
      setTimeout(() => document.getElementById('profile-name-input')?.focus(), 100);
    }
  }
}

// clearData e exportBackup REMOVIDOS conforme solicitado

// ════════════════════════════════════════════════════
//  ADMIN LOGIN
// ════════════════════════════════════════════════════
function showAdminLogin() {
  document.getElementById('admin-pass').value = '';
  document.getElementById('admin-login-modal').classList.add('open');
  setTimeout(() => document.getElementById('admin-pass').focus(), 400);
}

function closeAdminModal() { document.getElementById('admin-login-modal').classList.remove('open'); }

function checkAdmin() {
  const pass = document.getElementById('admin-pass').value;
  if (pass === ADMIN_PASSWORD) {
    state.isAdmin = true;
    closeAdminModal();
    showPage('admin');
    showToast('🔓 Bem-vindo, Pila!', 'success');
  } else {
    showToast('❌ Senha incorreta!', 'error');
    document.getElementById('admin-pass').value = '';
    document.getElementById('admin-pass').focus();
    vibrate(300);
  }
}

// ════════════════════════════════════════════════════
//  ADMIN PANEL
// ════════════════════════════════════════════════════
function renderAdmin() {
  renderAdminStats();
  renderAdminNeeds();
  renderTodayList();
  renderRevenueChart();
  renderBlockedDates();
  renderScheduleGrid();
  renderAdminAppts();

  const todayEl = document.getElementById('admin-today-date');
  if (todayEl) {
    const d    = new Date();
    const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    todayEl.textContent = `${days[d.getDay()]}, ${fmtDate(d)}`;
  }
}

function renderAdminStats() {
  const db           = getDB();
  const today        = fmtDate(new Date());
  const todayAppts   = db.appointments.filter(a => a.date === today && a.status !== 'cancelled');
  const weekRevenue  = calcWeekRevenue().reduce((s,v) => s+v, 0);
  const totalRevenue = db.appointments.filter(a => a.status !== 'cancelled').reduce((s,a) => s+a.price, 0);
  const cancelled    = db.appointments.filter(a => a.status === 'cancelled').length;

  document.getElementById('admin-stats').innerHTML = `
    <div class="admin-stat">
      <div class="admin-stat-icon">📅</div>
      <div class="admin-stat-val">${todayAppts.length}</div>
      <div class="admin-stat-label">Agend. Hoje</div>
    </div>
    <div class="admin-stat green">
      <div class="admin-stat-icon">💰</div>
      <div class="admin-stat-val">R$${weekRevenue.toFixed(0)}</div>
      <div class="admin-stat-label">Esta Semana</div>
    </div>
    <div class="admin-stat blue">
      <div class="admin-stat-icon">📊</div>
      <div class="admin-stat-val">R$${totalRevenue.toFixed(0)}</div>
      <div class="admin-stat-label">Total Geral</div>
    </div>
    <div class="admin-stat red">
      <div class="admin-stat-icon">❌</div>
      <div class="admin-stat-val">${cancelled}</div>
      <div class="admin-stat-label">Cancelados</div>
    </div>`;
}

function renderTodayList() {
  const db    = getDB();
  const today = fmtDate(new Date());
  const list  = document.getElementById('today-list');
  if (!list) return;

  const todayAppts = db.appointments
    .filter(a => a.date === today)
    .sort((a,b) => a.time.localeCompare(b.time));

  if (!todayAppts.length) {
    list.innerHTML = `<div class="empty-state" style="padding:30px 20px;">
      <div class="empty-icon" style="font-size:48px;">😴</div>
      <div class="empty-text">Nenhum agendamento hoje</div>
    </div>`;
    return;
  }

  list.innerHTML = todayAppts.map(a => {
    const isDone      = a.status === 'past';
    const isCancelled = a.status === 'cancelled';
    return `
    <div class="today-slot ${isDone?'done':''} ${isCancelled?'cancelled-slot':''}" id="ts-${a.id}">
      <div class="today-time">${a.time}</div>
      <div class="today-info">
        <div class="today-client">${a.clientName} <span style="font-size:11px;color:var(--gray);">${a.clientPhone}</span></div>
        <div class="today-service">${a.service} · ${a.duration}</div>
        <div class="today-price">${a.priceStr}</div>
      </div>
      ${!isCancelled ? `
      <div class="today-actions">
        <button class="today-btn today-btn-done ${isDone?'active':''}" title="${isDone?'Feito':'Marcar como feito'}" onclick="adminMarkDone('${a.id}')">
          <i class="fas fa-check"></i>
        </button>
        ${!isDone ? `<button class="today-btn today-btn-cancel" title="Cancelar" onclick="adminCancelAppt('${a.id}')">
          <i class="fas fa-times"></i>
        </button>` : ''}
      </div>` : `<span class="appt-badge badge-cancelled">Cancelado</span>`}
    </div>`;
  }).join('');
}

function adminMarkDone(id) {
  markDone(id);
  renderAdmin();
  showToast('✅ Atendimento concluído!', 'success');
}

function adminCancelAppt(id) {
  if (!confirm('Cancelar este agendamento?')) return;
  cancelAppointment(id);
  renderAdmin();
  showToast('❌ Agendamento cancelado.', 'error');
}

function calcWeekRevenue() {
  const db      = getDB();
  const revenue = [];
  for (let i = 6; i >= 0; i--) {
    const d   = new Date(); d.setDate(d.getDate() - i);
    const ds  = fmtDate(d);
    const day = db.appointments
      .filter(a => a.date === ds && a.status !== 'cancelled')
      .reduce((s,a) => s + a.price, 0);
    revenue.push(day);
  }
  return revenue;
}

function renderAdminNeeds() {
  const db          = getDB();
  const today       = fmtDate(new Date());
  const confirmed   = db.appointments.filter(a => a.status === 'confirmed').length;
  const todayAppts  = db.appointments.filter(a => a.date === today && a.status === 'confirmed').length;
  const activeCount = (db.activeSlots || ALL_SLOTS).length;
  const blockedCount= db.blockedDates.length;

  const needs = [
    { title:'Agendamentos confirmados', detail:`${confirmed} agend. no total`,   status: confirmed    ? 'ok':'warn', note: confirmed    ? 'Agenda ativa'               : 'Sem confirmações. Incentive clientes.' },
    { title:'Horários ativos',          detail:`${activeCount}/${ALL_SLOTS.length}`, status: activeCount>=12?'ok':'warn', note: activeCount===ALL_SLOTS.length?'Todos os horários liberados':'Revise slots disponíveis' },
    { title:'Bloqueio de datas',        detail:`${blockedCount} data(s)`,        status: blockedCount ? 'ok':'warn', note: blockedCount ? 'Proteção configurada'       : 'Adicione bloqueios na agenda' },
    { title:'Atendimentos hoje',        detail:`${todayAppts} confirmação(ões)`, status: todayAppts   ? 'ok':'warn', note: todayAppts   ? 'Hoje tem horário marcado'   : 'Sem agendamentos para hoje' },
  ];

  const container = document.getElementById('admin-needs');
  if (!container) return;
  container.innerHTML = needs.map(item => `
    <div class="admin-need-card">
      <div class="admin-need-title">${item.title}</div>
      <div class="admin-need-detail">${item.detail}</div>
      <div class="admin-need-status ${item.status}">${item.note}</div>
    </div>`).join('');
}

function renderRevenueChart() {
  const canvas = document.getElementById('revenue-chart');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const revenue = calcWeekRevenue();
  const total   = revenue.reduce((s,v) => s+v, 0);

  const totalEl = document.getElementById('chart-total-val');
  if (totalEl) totalEl.textContent = 'R$ ' + total.toFixed(0);

  const days   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const daysEl = document.getElementById('chart-days');
  if (daysEl) {
    const labels = [];
    for (let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); labels.push(days[d.getDay()]); }
    daysEl.innerHTML = labels.map(d => `<div class="chart-day-label">${d}</div>`).join('');
  }

  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.parentElement.clientWidth - 40;
  const H   = 160;
  canvas.width  = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const max    = Math.max(...revenue, 100);
  const pad    = { top:10, right:10, bottom:20, left:10 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;
  const barW   = chartW / revenue.length;

  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,.05)';
  ctx.lineWidth   = 1;
  [0,.25,.5,.75,1].forEach(pct => {
    const y = pad.top + chartH * (1-pct);
    ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(W-pad.right,y); ctx.stroke();
  });

  revenue.forEach((val, i) => {
    const x    = pad.left + i * barW + barW * .15;
    const bW   = barW * .7;
    const bH   = (val / max) * chartH;
    const y    = pad.top + chartH - bH;
    const isToday = i === 6;

    const grad = ctx.createLinearGradient(0, y, 0, y+bH);
    grad.addColorStop(0, isToday ? '#f0c060' : '#c9a84c');
    grad.addColorStop(1, isToday ? '#a07830' : 'rgba(201,168,76,.2)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, bW, bH, [6,6,2,2]);
    ctx.fill();

    if (val > 0) {
      ctx.fillStyle  = isToday ? '#f0c060' : 'rgba(255,255,255,.7)';
      ctx.font       = `bold ${Math.min(10,bW*.4)}px Inter`;
      ctx.textAlign  = 'center';
      ctx.fillText('R$'+val.toFixed(0), x+bW/2, Math.max(y-4, pad.top+8));
    }
  });
}

function renderBlockedDates() {
  const db   = getDB();
  const cont = document.getElementById('blocked-dates');
  if (!cont) return;
  if (!db.blockedDates.length) {
    cont.innerHTML = `<div style="font-size:13px;color:var(--gray);padding:0 0 4px;">Nenhuma data bloqueada.</div>`;
    return;
  }
  cont.innerHTML = db.blockedDates.map(d => `
    <div class="blocked-tag">
      <i class="fas fa-ban"></i>${d}
      <button onclick="unblockDate('${d}')" title="Remover"><i class="fas fa-times"></i></button>
    </div>`).join('');
}

function blockDate() {
  const input = document.getElementById('block-date-input');
  if (!input.value) return showToast('⚠️ Escolha uma data!', 'error');
  const d  = new Date(input.value + 'T12:00:00');
  const ds = fmtDate(d);
  const db = getDB();
  if (db.blockedDates.includes(ds)) return showToast('⚠️ Data já bloqueada!', 'error');
  db.blockedDates.push(ds);
  saveDB(db);
  renderBlockedDates();
  input.value = '';
  showToast(`🚫 ${ds} bloqueado!`, 'success');
}

function unblockDate(d) {
  const db = getDB();
  db.blockedDates = db.blockedDates.filter(bd => bd !== d);
  saveDB(db);
  renderBlockedDates();
  showToast(`✅ ${d} desbloqueado!`, 'success');
}

function renderScheduleGrid() {
  const db     = getDB();
  const active = new Set(db.activeSlots || ALL_SLOTS);
  const grid   = document.getElementById('schedule-grid');
  if (!grid) return;
  grid.innerHTML = ALL_SLOTS.map(s => `
    <div class="sched-slot ${active.has(s) ? 'active-slot' : 'inactive-slot'}"
         id="ss-${s.replace(':','')}" onclick="toggleSlot('${s}')">
      ${s}
    </div>`).join('');
}

function toggleSlot(slot) {
  const db     = getDB();
  const active = new Set(db.activeSlots || ALL_SLOTS);
  if (active.has(slot)) active.delete(slot); else active.add(slot);
  db.activeSlots = [...active].sort();
  saveDB(db);
  renderScheduleGrid();
  vibrate(30);
}

function saveSchedule() {
  showToast('✅ Horários salvos!', 'success');
}

function adminFilterAppts(filter) {
  state.adminApptFilter = filter;
  ['all','today','confirmed','cancelled'].forEach(f => {
    document.getElementById('adm-filter-'+f)?.classList.toggle('active', f === filter);
  });
  renderAdminAppts();
}

function renderAdminAppts() {
  const db    = getDB();
  const today = fmtDate(new Date());
  let appts   = [...db.appointments];
  if (state.adminApptFilter === 'today')      appts = appts.filter(a => a.date === today);
  else if (state.adminApptFilter === 'confirmed') appts = appts.filter(a => a.status === 'confirmed');
  else if (state.adminApptFilter === 'cancelled') appts = appts.filter(a => a.status === 'cancelled');

  const list = document.getElementById('admin-appt-list');
  if (!list) return;
  if (!appts.length) {
    list.innerHTML = `<div class="empty-state" style="padding:30px 20px;">
      <div class="empty-icon" style="font-size:48px;">📋</div>
      <div class="empty-text">Nenhum agendamento aqui</div>
    </div>`; return;
  }
  list.innerHTML = appts.map(a => {
    const sc  = a.status === 'confirmed' ? 'confirmed' : a.status === 'cancelled' ? 'cancelled' : 'past';
    const bc  = `badge-${sc}`;
    const lbl = a.status === 'confirmed' ? 'Confirmado' : a.status === 'cancelled' ? 'Cancelado' : 'Realizado';
    return `
    <div class="appt-card ${sc}">
      <div class="appt-top">
        <div class="appt-service">${a.service}</div>
        <span class="appt-badge ${bc}">${lbl}</span>
      </div>
      <div class="appt-info">
        <div class="appt-detail"><i class="fas fa-user"></i>${a.clientName}</div>
        <div class="appt-detail"><i class="fas fa-phone"></i>${a.clientPhone}</div>
        <div class="appt-detail"><i class="fas fa-calendar"></i>${a.date}</div>
        <div class="appt-detail"><i class="fas fa-clock"></i>${a.time}</div>
        <div class="appt-detail"><i class="fas fa-tag"></i>${a.priceStr}</div>
      </div>
      ${a.status === 'confirmed' ? `
      <div class="appt-actions">
        <button class="appt-btn appt-btn-reschedule" onclick="adminMarkDone('${a.id}')">
          <i class="fas fa-check"></i> Concluir
        </button>
        <button class="appt-btn appt-btn-cancel" onclick="adminCancelAppt('${a.id}')">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </div>` : ''}
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════════════
function fmtDate(d) {
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
}

let toastTimer;
function showToast(msg, type='success') {
  const toast = document.getElementById('toast');
  const icon  = toast.querySelector('i');
  const classes = { success:'fa-check-circle', error:'fa-times-circle', info:'fa-circle-info' };
  icon.className = 'fas ' + (classes[type] || 'fa-check-circle');
  document.getElementById('toast-msg').textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function formatPhone(input) {
  let v = input.value.replace(/\D/g,'');
  if (v.length > 11) v = v.slice(0,11);
  input.value = v;
}

function vibrate(ms=50) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch(e) {}
}

function rippleEffect(el) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  const size = Math.max(el.offsetWidth, el.offsetHeight);
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${el.offsetWidth/2-size/2}px;top:${el.offsetHeight/2-size/2}px;`;
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => {
    if (e.target === ov) { closeModal(); closeCancelModal(); closeAdminModal(); }
  });
});

window.addEventListener('resize', () => {
  if (document.getElementById('page-admin').classList.contains('active')) renderRevenueChart();
});

// ════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════
function init() {
  const db = getDB();
  if (!db.profile || !db.profile.phone || db.profile.name === 'Visitante') {
    showPage('register');
  } else {
    showPage('home');
  }
  renderProfile();
}

init();