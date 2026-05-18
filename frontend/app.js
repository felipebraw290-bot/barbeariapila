const SUPABASE_URL = 'https://esmgvjdfmghvmbbmiwwr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_33LFn0rafHYSWp_6aKe73g_-QZLQxX9';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══════════════════════════════════════════
   BARBERKING — app.js  (com Sistema de Planos)
   Barbeiro: Pila | Premium Studio
══════════════════════════════════════════ */

'use strict';

// ════════════════════════════════════════════════════
//  DATABASE — LocalStorage
// ════════════════════════════════════════════════════
const DB_KEY    = 'barberking_pila_v2';
const THEME_KEY = 'barberking_theme';

// ════════════════════════════════════════════════════
//  THEME MANAGEMENT
// ════════════════════════════════════════════════════
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);
}
function toggleTheme() {
  const html = document.documentElement;
  const newTheme = html.classList.contains('light-mode') ? 'dark' : 'light';
  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
}
function applyTheme(theme) {
  const html = document.documentElement;
  const btn  = document.querySelector('[onclick="toggleTheme()"] i');
  if (theme === 'light') {
    html.classList.add('light-mode');
    if (btn) btn.className = 'fas fa-sun';
  } else {
    html.classList.remove('light-mode');
    if (btn) btn.className = 'fas fa-moon';
  }
}

// ════════════════════════════════════════════════════
//  DB
// ════════════════════════════════════════════════════
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
    activeSlots: [
      '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
      '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'
    ],
  };
}

function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

function addAppointment(appt) {
  const db = getDB();
  appt.id        = Date.now().toString() + Math.random().toString(36).slice(2,6);
  appt.createdAt = new Date().toISOString();
  appt.status    = 'confirmed';
  appt.doneByAdmin = false;
  db.appointments.unshift(appt);
  saveDB(db);
  return appt;
}

function cancelAppointment(id) {
  const db   = getDB();
  const appt = db.appointments.find(a => a.id === id);
  if (appt) { appt.status = 'cancelled'; saveDB(db); }
}

function markDone(id) {
  const db   = getDB();
  const appt = db.appointments.find(a => a.id === id);
  if (appt) { appt.status = 'past'; appt.doneByAdmin = true; saveDB(db); }
}

function getProfile()         { const db = getDB(); return db.profile || { name:'Visitante', phone:'', email:'' }; }
function saveProfile(profile) { const db = getDB(); db.profile = profile; saveDB(db); }

function saveRegisterProfile() {
  const name  = document.getElementById('register-name')?.value.trim();
  const phone = document.getElementById('register-phone')?.value.trim();
  if (!name || name.length < 3)                      return showToast('Digite seu nome completo para continuar.','error');
  if (!phone || phone.replace(/\D/g,'').length < 10) return showToast('Informe um WhatsApp válido.','error');
  saveProfile({ name, phone, email:'' });
  showPage('home');
  renderHome();
  renderProfile();
  showToast('Seja bem-vindo, ' + name + '!','success');
}

// ════════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════════
const BARBER = { id:1, name:'Pila', fullName:'Pila', role:'Mestre Barbeiro', rating:'5.0', emoji:'P' };

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

// ════════════════════════════════════════════════════
//  ★  PLANOS MENSAIS
// ════════════════════════════════════════════════════
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    emoji: '✂️',
    price: 119.90,
    priceStr: 'R$ 119,90',
    period: '/mês',
    color: '#c9a84c',
    colorBg: 'rgba(201,168,76,.12)',
    colorBorder: 'rgba(201,168,76,.35)',
    services: ['2 Cortes de Cabelo', '1 Barba'],
    highlight: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    emoji: '💈',
    price: 129.90,
    priceStr: 'R$ 129,90',
    period: '/mês',
    color: '#4c82c8',
    colorBg: 'rgba(76,130,200,.12)',
    colorBorder: 'rgba(76,130,200,.35)',
    services: ['3 Cortes de Cabelo', '2 Barbas', 'Hidratação'],
    highlight: true,  // card em destaque
  },
  {
    id: 'gold',
    name: 'Gold',
    emoji: '🔥',
    price: 175.90,
    priceStr: 'R$ 175,90',
    period: '/mês',
    color: '#f0c060',
    colorBg: 'rgba(240,192,96,.12)',
    colorBorder: 'rgba(240,192,96,.5)',
    services: ['Cortes ilimitados', 'Barba ilimitada', 'Hidratação', 'Degradê incluso'],
    highlight: false,
  },
];

const ADMIN_PASSWORD = 'pila123';

// ════════════════════════════════════════════════════
//  APP STATE
// ════════════════════════════════════════════════════
const state = {
  selectedService: null,
  selectedDate:    null,
  selectedSlot:    null,
  currentStep:     1,
  cancelId:        null,
  apptFilter:      'all',
  adminApptFilter: 'all',
  isAdmin:         false,
  weekOffset:      0,
  supabaseAppts:   [],

  // ── PLANOS ──
  activePlan:      null,   // { id, name, clientName, clientPhone } preenchido ao ativar plano
  adminTab:        'hoje', // 'hoje' | 'receita' | 'bloqueios' | 'horarios' | 'planos'
};

// ════════════════════════════════════════════════════
//  PARTICLES
// ════════════════════════════════════════════════════
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
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
  notifications:null, admin:null, plans:null,
};

function showPage(name) {
  document.querySelectorAll('.page').forEach(p  => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));

  const page = document.getElementById('page-' + name) || document.getElementById(name);
  if (page) page.classList.add('active');

  const navBtn = NAV_MAP[name];
  if (navBtn) document.getElementById(navBtn)?.classList.add('active');

  const nav = document.querySelector('nav');
  if (nav) nav.style.display = (name === 'register' || name === 'plans') ? 'none' : 'flex';

  if (name === 'home')         renderHome();
  if (name === 'appointments') renderAppointments();
  if (name === 'profile')      renderProfile();
  if (name === 'admin')        renderAdmin();
  if (name === 'plans')        renderPlansPage();

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
      <div class="barber-big-avatar">P<div class="online-dot"></div></div>
      <div class="barber-hero-info">
        <div class="barber-hero-name">${BARBER.fullName}</div>
        <div class="barber-hero-role">${BARBER.role}</div>
        <div class="barber-hero-stars"><span>★★★★★</span> ${BARBER.rating} · <span style="color:var(--green);">Disponível agora</span></div>
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

  const db       = getDB();
  const upcoming = db.appointments.filter(a => a.status === 'confirmed');
  const cont     = document.getElementById('home-next-appt');
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
    const planBadge = a.planName
      ? `<span style="margin-left:6px;background:rgba(201,168,76,.15);color:var(--gold);font-size:9px;font-weight:800;padding:2px 8px;border-radius:20px;letter-spacing:.8px;border:1px solid rgba(201,168,76,.3);">PLANO ${a.planName.toUpperCase()}</span>`
      : '';
    cont.innerHTML = `
      <div class="mini-appt-card">
        <div class="appt-top">
          <div class="appt-service">${a.service}${planBadge}</div>
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
//  ★  PÁGINA DE PLANOS (cliente)
// ════════════════════════════════════════════════════
function renderPlansPage() {
  const container = document.getElementById('plans-cards');
  if (!container) return;

  container.innerHTML = PLANS.map(plan => `
    <div class="plan-card ${plan.highlight ? 'plan-highlight' : ''}"
         style="border-color:${plan.colorBorder};background:linear-gradient(145deg,var(--dark3),${plan.colorBg});"
         onclick="openPlanModal('${plan.id}')">
      ${plan.highlight ? `<div class="plan-popular-badge">⭐ Mais Popular</div>` : ''}
      <div class="plan-emoji">${plan.emoji}</div>
      <div class="plan-name" style="color:${plan.color};">${plan.name}</div>
      <div class="plan-price-wrap">
        <span class="plan-price">${plan.priceStr}</span>
        <span class="plan-period">${plan.period}</span>
      </div>
      <ul class="plan-features">
        ${plan.services.map(s => `<li><i class="fas fa-check" style="color:${plan.color};margin-right:7px;font-size:11px;"></i>${s}</li>`).join('')}
      </ul>
      <button class="plan-select-btn" style="background:${plan.color};color:var(--dark);">
        Usar este plano
      </button>
    </div>
  `).join('');
}

// ── Abrir modal de identificação do cliente para o plano ──
function openPlanModal(planId) {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) return;

  const modal = document.getElementById('plan-modal');
  if (!modal) return;

  // Preencher título
  document.getElementById('plan-modal-title').textContent  = `Plano ${plan.name}`;
  document.getElementById('plan-modal-price').textContent  = plan.priceStr + plan.period;
  document.getElementById('plan-modal-price').style.color  = plan.color;
  document.getElementById('plan-modal-emoji').textContent  = plan.emoji;

  // Guardar plano no dataset do modal para uso no confirmar
  modal.dataset.planId = planId;

  // Limpar campos
  const nameInput  = document.getElementById('plan-client-name');
  const phoneInput = document.getElementById('plan-client-phone');
  if (nameInput)  nameInput.value  = '';
  if (phoneInput) phoneInput.value = '';

  // Preencher com perfil salvo se houver
  const profile = getProfile();
  if (profile.name !== 'Visitante') {
    if (nameInput)  nameInput.value  = profile.name;
    if (phoneInput) phoneInput.value = profile.phone || '';
  }

  modal.classList.add('open');
}

function closePlanModal() {
  document.getElementById('plan-modal')?.classList.remove('open');
}

// ── Confirmar plano e ir para agendamento ──
function confirmPlanAndBook() {
  const modal   = document.getElementById('plan-modal');
  const planId  = modal?.dataset.planId;
  const plan    = PLANS.find(p => p.id === planId);
  if (!plan) return;

  const nameInput  = document.getElementById('plan-client-name');
  const phoneInput = document.getElementById('plan-client-phone');
  const name  = nameInput?.value.trim();
  const phone = phoneInput?.value.trim();

  if (!name  || name.length < 3)                       return showToast('Digite seu nome completo.','error');
  if (!phone || phone.replace(/\D/g,'').length < 10)   return showToast('Informe um WhatsApp válido.','error');

  // Ativar plano no estado
  state.activePlan = { id: plan.id, name: plan.name, clientName: name, clientPhone: phone };

  // Salvar perfil se for novo visitante
  const profile = getProfile();
  if (profile.name === 'Visitante') saveProfile({ name, phone, email:'' });

  closePlanModal();
  showToast(`✅ Plano ${plan.name} ativado! Escolha o serviço.`, 'success');

  // Ir para agendamento
  setTimeout(() => {
    showPage('book');
    resetBooking();
  }, 600);
}

// ── Cancelar plano ativo (ao sair do fluxo) ──
function clearActivePlan() {
  state.activePlan = null;
}

// ════════════════════════════════════════════════════
//  BOOK FLOW
// ════════════════════════════════════════════════════
function resetBooking() {
  state.selectedService = null;
  state.selectedDate    = null;
  state.selectedSlot    = null;
  state.weekOffset      = 0;
  // NÃO limpar state.activePlan aqui — ele persiste até confirmar ou cancelar
  goStep(1);
}

function goBack() {
  if (state.currentStep > 1) {
    goStep(state.currentStep - 1);
  } else {
    clearActivePlan();   // se voltar para home, cancela plano ativo
    showPage('home');
  }
}

function goStep(n) {
  for (let i = 1; i <= 3; i++) {
    const el  = document.getElementById('step-' + i);
    if (el)  el.style.display = i === n ? 'block' : 'none';
    const dot = document.getElementById('dot-' + i);
    if (dot) dot.classList.toggle('active', i <= n);
  }
  state.currentStep = n;
  if (n === 1) renderServicesGrid();
  if (n === 2) renderDateSlots();
  if (n === 3) renderSummary();
  window.scrollTo(0, 0);
}

/* ── Aviso de plano ativo no topo do book ── */
function renderPlanBanner() {
  let banner = document.getElementById('active-plan-banner');
  const bookPage = document.getElementById('page-book');
  if (!bookPage) return;

  if (state.activePlan) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'active-plan-banner';
      banner.className = 'active-plan-banner';
      bookPage.insertBefore(banner, bookPage.firstChild);
    }
    banner.innerHTML = `
      <i class="fas fa-crown" style="color:var(--gold);"></i>
      <span>Agendando com <strong>Plano ${state.activePlan.name}</strong> · ${state.activePlan.clientName}</span>
      <button onclick="clearActivePlan();renderPlanBanner();renderServicesGrid();" title="Cancelar plano">
        <i class="fas fa-times"></i>
      </button>`;
    banner.style.display = 'flex';
  } else {
    if (banner) banner.style.display = 'none';
  }
}

/* SERVICES */
function renderServicesGrid() {
  renderPlanBanner();

  const grid = document.getElementById('services-grid');
  if (!grid) return;

  const isPlan = !!state.activePlan;

  grid.innerHTML = SERVICES.map(s => {
    const displayPrice = isPlan ? '<span style="text-decoration:line-through;opacity:.4;font-size:12px;">' + s.priceStr + '</span> <span style="color:var(--green);font-size:15px;font-weight:800;">R$ 0,00</span>' : s.priceStr;
    return `
    <div class="service-card ripple" onclick="selectService(${s.id})" id="scard-${s.id}">
      <div class="service-icon">${s.icon}</div>
      <div class="service-name">${s.name}</div>
      <div class="service-duration"><i class="fas fa-clock" style="font-size:9px;margin-right:3px;"></i>${s.duration}</div>
      <div class="service-price">${displayPrice}</div>
    </div>`;
  }).join('');

  // Restaurar seleção anterior ao voltar
  if (state.selectedService) {
    document.getElementById('scard-' + state.selectedService.id)?.classList.add('selected');
    const btn1 = document.getElementById('btn-step1');
    if (btn1) btn1.disabled = false;
  }
}

function selectService(id) {
  SERVICES.forEach(s => document.getElementById('scard-'+s.id)?.classList.remove('selected'));
  state.selectedService = SERVICES.find(s => s.id === id);
  const card = document.getElementById('scard-'+id);
  if (card) { card.classList.add('selected'); rippleEffect(card); }
  const btn1 = document.getElementById('btn-step1');
  if (btn1) btn1.disabled = false;
  vibrate();
}

/* DATE & SLOTS */
function getWeekStart(offset) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const day    = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day + offset * 7);
  return sunday;
}

function isDateBlockedBySupa(dateStr) {
  return state.supabaseAppts.some(r => {
    if (r.client_name !== '__BLOCKED_DAY__') return false;
    const p = (r.appointment_date||'').split('-');
    return p.length===3 && `${p[2]}/${p[1]}/${p[0]}` === dateStr;
  });
}

function renderDateSlots() {
  const db    = getDB();
  const scroll = document.getElementById('date-scroll');
  if (!scroll) return;

  const days   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const today  = new Date(); today.setHours(0,0,0,0);

  const weekStart = getWeekStart(state.weekOffset);

  let firstAvailable = null;
  for (let i = 0; i < 7; i++) {
    const d       = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    const dateStr = fmtDate(d);
    const isPast  = d < today;
    const isBlocked = db.blockedDates.includes(dateStr) || isDateBlockedBySupa(dateStr);
    if (!isPast && !isBlocked && !firstAvailable) firstAvailable = dateStr;
  }

  const isSelBlocked = db.blockedDates.includes(state.selectedDate) || isDateBlockedBySupa(state.selectedDate);
  const selectedDate = (!state.selectedDate || isSelBlocked)
    ? (firstAvailable || fmtDate(today))
    : state.selectedDate;
  state.selectedDate = selectedDate;

  let html = '';
  for (let i = 0; i < 7; i++) {
    const d       = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    const dateStr = fmtDate(d);
    const isPast  = d < today;
    const isToday = d.toDateString() === today.toDateString();
    const isBlocked  = db.blockedDates.includes(dateStr) || isDateBlockedBySupa(dateStr) || isPast;
    const isSelected = dateStr === selectedDate;

    html += `<div class="date-item ${isSelected?'selected':''} ${isBlocked?'blocked':''}"
      data-date="${dateStr}" ${isBlocked?'title="Indisponível"':''}>
      <div class="date-day">${isToday ? 'Hoje' : days[d.getDay()]}</div>
      <div class="date-num">${d.getDate()}</div>
      <div class="date-month">${months[d.getMonth()]}</div>
    </div>`;
  }

  const weekLabel  = `${fmtDate(weekStart)} — ${fmtDate(new Date(weekStart.getTime() + 6*86400000))}`;
  const canGoPrev  = state.weekOffset > 0;

  const wrapper = scroll.parentElement;
  let nav = wrapper.querySelector('.week-nav');
  if (!nav) {
    nav = document.createElement('div');
    nav.className = 'week-nav';
    nav.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:0 20px 10px;';
    wrapper.insertBefore(nav, scroll);
  }
  nav.innerHTML = `
    <button onclick="changeWeek(-1)" ${!canGoPrev?'disabled':''} style="
      background:${canGoPrev?'var(--dark3)':'var(--dark4)'};border:1px solid rgba(255,255,255,.1);
      color:${canGoPrev?'var(--gold)':'var(--gray)'};border-radius:10px;padding:7px 13px;
      cursor:${canGoPrev?'pointer':'not-allowed'};font-size:13px;font-family:Inter,sans-serif;">
      ← Anterior
    </button>
    <span style="font-size:12px;color:var(--gray);font-weight:600;">${weekLabel}</span>
    <button onclick="changeWeek(1)" style="
      background:var(--dark3);border:1px solid rgba(255,255,255,.1);
      color:var(--gold);border-radius:10px;padding:7px 13px;
      cursor:pointer;font-size:13px;font-family:Inter,sans-serif;">
      Próxima →
    </button>`;

  scroll.innerHTML = html;

  scroll.querySelectorAll('.date-item:not(.blocked)').forEach(el => {
    el.addEventListener('click', function() { selectDate(this, this.dataset.date); });
  });

  renderSlots();
}

function changeWeek(dir) {
  const next = state.weekOffset + dir;
  if (next < 0) return;
  state.weekOffset   = next;
  state.selectedDate = null;
  state.selectedSlot = null;
  const btn2 = document.getElementById('btn-step2');
  if (btn2) btn2.disabled = true;
  renderDateSlots();
}

function selectDate(el, dateStr) {
  document.querySelectorAll('.date-item').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  state.selectedDate = dateStr;
  state.selectedSlot = null;
  const btn2 = document.getElementById('btn-step2');
  if (btn2) btn2.disabled = true;
  renderSlots();
}

function renderSlots() {
  const db          = getDB();
  const activeSlots = db.activeSlots || ALL_SLOTS;

  const isDayBlocked = db.blockedDates.includes(state.selectedDate) || isDateBlockedBySupa(state.selectedDate);
  const grid = document.getElementById('slots-grid');
  if (!grid) return;

  if (isDayBlocked) {
    grid.innerHTML = `<div style="grid-column:span 3;text-align:center;padding:30px 0;">
      <div style="font-size:38px;margin-bottom:10px;">🚫</div>
      <div style="color:var(--red);font-weight:700;font-size:15px;">Dia Bloqueado</div>
      <div style="color:var(--gray);font-size:12px;margin-top:6px;">Este dia não está disponível para agendamentos.</div>
    </div>`;
    const btn2 = document.getElementById('btn-step2');
    if (btn2) btn2.disabled = true;
    return;
  }

  // Slots ocupados localmente
  const busySlots = db.appointments
    .filter(a => a.status === 'confirmed' && a.date === state.selectedDate)
    .map(a => a.time);

  // Slots ocupados no Supabase — inclui agendamentos de PLANO também
  // (ambos bloqueiam o horário igualmente)
  const sbBusy = state.supabaseAppts
    .filter(a => {
      if (a.client_name === '__BLOCKED_DAY__') return false;
      const d = new Date(a.appointment_date);
      return fmtDate(d) === state.selectedDate && a.status !== 'cancelled';
    })
    .map(a => a.appointment_time ? a.appointment_time.slice(0,5) : '');

  const allBusy = [...new Set([...busySlots, ...sbBusy])];

  const isSlotInInterval = (slot, intervals) =>
    intervals.some(iv => slot >= iv.start && slot < iv.end);

  grid.innerHTML = activeSlots.map(s => {
    const isBusy    = allBusy.includes(s);
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
  const btn2 = document.getElementById('btn-step2');
  if (btn2) btn2.disabled = false;
  vibrate();
}

/* SUMMARY */
function renderSummary() {
  const s = state.selectedService;
  const isPlan = !!state.activePlan;

  // Preço exibido: R$0,00 se for plano, valor normal caso contrário
  const priceDisplay = isPlan
    ? `<span style="text-decoration:line-through;opacity:.4;font-size:13px;">${s?.priceStr}</span>
       &nbsp;<span style="color:var(--green);font-size:18px;font-weight:800;">R$ 0,00</span>`
    : `<span class="gold">${s?.priceStr}</span>`;

  const planRow = isPlan
    ? `<div class="confirm-row">
         <span class="confirm-label">Plano Mensal</span>
         <span class="confirm-value" style="color:var(--gold);">
           <i class="fas fa-crown" style="margin-right:4px;font-size:11px;"></i>
           Plano ${state.activePlan.name}
         </span>
       </div>` : '';

  document.getElementById('booking-summary').innerHTML = `
    ${planRow}
    <div class="confirm-row"><span class="confirm-label">Barbeiro</span><span class="confirm-value">${BARBER.name} 💈</span></div>
    <div class="confirm-row"><span class="confirm-label">Serviço</span><span class="confirm-value">${s?.icon} ${s?.name}</span></div>
    <div class="confirm-row"><span class="confirm-label">Data</span><span class="confirm-value">${state.selectedDate}</span></div>
    <div class="confirm-row"><span class="confirm-label">Horário</span><span class="confirm-value">${state.selectedSlot}</span></div>
    <div class="confirm-row"><span class="confirm-label">Duração</span><span class="confirm-value">${s?.duration}</span></div>
    <div class="confirm-row"><span class="confirm-label">Valor</span><span class="confirm-value">${priceDisplay}</span></div>`;

  // Preencher campos com dados do plano se disponíveis
  if (isPlan) {
    const nameInput  = document.getElementById('input-name');
    const phoneInput = document.getElementById('input-phone');
    if (nameInput && !nameInput.value)  nameInput.value  = state.activePlan.clientName;
    if (phoneInput && !phoneInput.value) phoneInput.value = state.activePlan.clientPhone;
  }

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
  if (!email || !email.includes('@')) return showToast('❌ Por favor, informe um e-mail válido.','error');

  const isPlan = !!state.activePlan;
  const planRow = isPlan
    ? `<div class="confirm-row">
         <span class="confirm-label">Plano</span>
         <span class="confirm-value" style="color:var(--gold);">
           <i class="fas fa-crown" style="margin-right:4px;font-size:11px;"></i>
           Plano ${state.activePlan.name}
         </span>
       </div>` : '';

  const totalDisplay = isPlan
    ? `<span style="text-decoration:line-through;opacity:.4;font-size:15px;">${s.priceStr}</span>
       &nbsp;<span style="color:var(--green);font-size:22px;font-weight:800;">R$ 0,00</span>`
    : s.priceStr;

  document.getElementById('modal-content').innerHTML = `
    ${planRow}
    <div class="confirm-row"><span class="confirm-label">Cliente</span><span class="confirm-value">${name}</span></div>
    <div class="confirm-row"><span class="confirm-label">Contato</span><span class="confirm-value">${phone}</span></div>
    <div class="confirm-row"><span class="confirm-label">E-mail</span><span class="confirm-value">${email}</span></div>
    <div class="confirm-row"><span class="confirm-label">Barbeiro</span><span class="confirm-value">${BARBER.name}</span></div>
    <div class="confirm-row"><span class="confirm-label">Serviço</span><span class="confirm-value">${s.icon} ${s.name}</span></div>
    <div class="confirm-row"><span class="confirm-label">Data &amp; Hora</span><span class="confirm-value">${state.selectedDate} às ${state.selectedSlot}</span></div>
    <div class="confirm-row"><span class="confirm-label">Total</span><span class="confirm-value gold" style="font-size:20px;">${totalDisplay}</span></div>`;

  document.getElementById('confirm-modal').classList.add('open');
}

function closeModal() { document.getElementById('confirm-modal').classList.remove('open'); }

async function confirmBooking() {
  const name  = document.getElementById('input-name').value.trim();
  const phone = document.getElementById('input-phone').value.trim();
  const email = document.getElementById('input-email').value.trim();
  const s     = state.selectedService;
  const isPlan = !!state.activePlan;

  // Preço final: R$0,00 se plano ativo
  const finalPrice    = isPlan ? 0 : s.price;
  const finalPriceStr = isPlan ? 'R$ 0,00' : s.priceStr;
  const planName      = isPlan ? state.activePlan.name : null;

  const profile = getProfile();
  if (profile.name === 'Visitante') saveProfile({ name, phone, email });

  const localAppt = addAppointment({
    barberId: BARBER.id, barber: BARBER.name,
    serviceId: s.id, service: s.name,
    date: state.selectedDate, time: state.selectedSlot,
    price: finalPrice, priceStr: finalPriceStr,
    duration: s.duration,
    clientName: name, clientPhone: phone, clientEmail: email,
    planName,  // <-- guarda qual plano foi usado (null se nenhum)
  });

  // Nome do serviço inclui o plano para ficar visível no admin
  const serviceForSupa = isPlan
    ? `${s.name} · Plano ${state.activePlan.name}`
    : s.name;

  const sbId = await salvarAgendamento({
    name, phone, service: serviceForSupa,
    date: state.selectedDate, time: state.selectedSlot,
    planName,
  });

  if (sbId === null) return;

  // Salvar referência do Supabase no localStorage
  const dbRef   = getDB();
  const apptRef = dbRef.appointments.find(a => a.id === localAppt.id);
  if (apptRef) { apptRef._supabaseId = sbId; saveDB(dbRef); }

  // Limpar plano ativo após confirmação
  state.activePlan = null;

  closeModal();
  showToast('✅ Agendamento confirmado! Até logo.','success');
  vibrate(200);
  setTimeout(() => { showPage('appointments'); resetBooking(); }, 1400);
}

// ════════════════════════════════════════════════════
//  SUPABASE — salvar agendamento
//  (campo 'service' já carrega a info do plano se houver)
// ════════════════════════════════════════════════════
async function salvarAgendamento(data) {
  const { data: result, error } = await supabaseClient
    .from('appointments')
    .insert([{
      client_name:      data.name,
      phone:            data.phone,
      service:          data.service,          // ex: "Corte de Cabelo · Plano Basic"
      appointment_date: data.date.split('/').reverse().join('-'),
      appointment_time: data.time,
      status:           'confirmed',
    }])
    .select('id')
    .single();

  if (error) {
    console.error('Erro Supabase:', error);
    showToast('❌ Erro ao salvar no banco: ' + (error.message || 'tente novamente'),'error');
    return null;
  }
  return result?.id || null;
}

// ════════════════════════════════════════════════════
//  SUPABASE — buscar agendamentos
// ════════════════════════════════════════════════════
async function fetchSupabaseAppointments() {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });

    if (error) { console.error('Supabase fetch error:', error); return []; }
    const rows = data || [];

    // Sincronizar datas bloqueadas
    const blockedRows = rows.filter(r => r.client_name === '__BLOCKED_DAY__');
    if (blockedRows.length) {
      const db = getDB();
      let changed = false;
      blockedRows.forEach(r => {
        const p  = (r.appointment_date||'').split('-');
        const ds = p.length===3 ? `${p[2]}/${p[1]}/${p[0]}` : '';
        if (ds && !db.blockedDates.includes(ds)) { db.blockedDates.push(ds); changed = true; }
      });
      if (changed) saveDB(db);
    }

    return rows;
  } catch(e) { console.error(e); return []; }
}

// Converte registro Supabase → formato interno
// Detecta plano automaticamente no campo 'service'
function supabaseToLocal(row) {
  if (row.client_name === '__BLOCKED_DAY__') return null;

  const parts   = (row.appointment_date || '').split('-');
  const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : '';
  const timeStr = row.appointment_time ? row.appointment_time.slice(0,5) : '';

  // Detectar plano no campo service: "Corte de Cabelo · Plano Basic"
  let serviceName = row.service || '—';
  let planName    = null;
  const planMatch = serviceName.match(/·\s*Plano\s+(\w+)$/i);
  if (planMatch) {
    planName    = planMatch[1];
    serviceName = serviceName.replace(/\s*·\s*Plano\s+\w+$/i, '').trim();
  }

  const svc = SERVICES.find(s => s.name === serviceName) ||
              { id:0, name: serviceName, icon:'💈', duration:'—', price: 0, priceStr: planName ? 'R$ 0,00' : '—' };

  return {
    id:          'sb_' + row.id,
    _supabaseId: row.id,
    barberId:    BARBER.id,
    barber:      BARBER.name,
    serviceId:   svc.id,
    service:     svc.name,
    date:        dateStr,
    time:        timeStr,
    price:       planName ? 0 : svc.price,
    priceStr:    planName ? 'R$ 0,00' : svc.priceStr,
    duration:    svc.duration,
    clientName:  row.client_name  || '—',
    clientPhone: row.phone        || '—',
    clientEmail: row.email        || '',
    status:      row.status       || 'confirmed',
    createdAt:   row.created_at   || '',
    doneByAdmin: false,
    planName,   // ← nome do plano ou null
  };
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
  const db   = getDB();
  let appts  = [...db.appointments];
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
    </div>`; return;
  }

  list.innerHTML = appts.map(a => {
    const sc  = a.status === 'confirmed' ? 'confirmed' : a.status === 'cancelled' ? 'cancelled' : 'past';
    const lbl = a.status === 'confirmed' ? 'Confirmado' : a.status === 'cancelled' ? 'Cancelado' : 'Realizado';
    const planBadge = a.planName
      ? `<span class="plan-badge-inline">PLANO ${a.planName.toUpperCase()}</span>` : '';
    return `
    <div class="appt-card ${sc}" id="appt-${a.id}">
      <div class="appt-top">
        <div class="appt-service">${a.service} ${planBadge}</div>
        <span class="appt-badge badge-${sc}">${lbl}</span>
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
  const db   = getDB();
  const a    = db.appointments.find(ap => ap.id === id);
  if (!a) return;
  const apptTime   = new Date(`${a.date.split('/').reverse().join('-')}T${a.time}:00`);
  const hoursUntil = (apptTime - new Date()) / (1000*60*60);
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

async function doCancel() {
  const db   = getDB();
  const appt = db.appointments.find(a => a.id === state.cancelId);
  cancelAppointment(state.cancelId);

  if (appt?._supabaseId) {
    await supabaseClient
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appt._supabaseId);
  }

  closeCancelModal();
  renderAppointments();
  renderHome();
  showToast('❌ Agendamento cancelado.','error');
}

function rescheduleAppt(id) {
  const db      = getDB();
  const a       = db.appointments.find(ap => ap.id === id);
  if (!a) return;
  const service = SERVICES.find(s => s.id === a.serviceId);
  if (service) state.selectedService = service;
  document.getElementById('input-name').value  = a.clientName;
  document.getElementById('input-phone').value = a.clientPhone;
  document.getElementById('input-email').value = a.clientEmail || '';
  cancelAppointment(id);
  showPage('book');
  goStep(2);
  showToast('🔄 Escolha uma nova data e horário.','info');
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
  const initials= profile.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

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

  // Botão Chamar Pila no WhatsApp
  const menuList = document.querySelector('.menu-list');
  if (menuList && !document.getElementById('whatsapp-pila-btn')) {
    const waItem = document.createElement('div');
    waItem.className = 'menu-item';
    waItem.id = 'whatsapp-pila-btn';
    waItem.setAttribute('onclick', 'callPilaWhatsApp()');
    waItem.innerHTML = `
      <div class="menu-icon" style="background:rgba(37,211,102,.15);color:#25D366;">
        <i class="fab fa-whatsapp"></i>
      </div>
      <div class="menu-text">
        <strong>Chamar Pila</strong>
        <span>Abrir conversa no WhatsApp</span>
      </div>
      <i class="fas fa-chevron-right menu-arrow"></i>`;
    menuList.insertBefore(waItem, menuList.firstChild);
  }
}

function callPilaWhatsApp() {
  const phone = '5517992680298';
  const msg   = encodeURIComponent('Olá Pila! Gostaria de verificar os horários disponíveis.');
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

function saveProfileForm() {
  const name  = document.getElementById('profile-name-input')?.value.trim();
  const phone = document.getElementById('profile-phone-input')?.value.trim();
  const email = document.getElementById('profile-email-input')?.value.trim();
  if (!name || name.length < 3)                      return showToast('Informe seu nome completo para salvar.','error');
  if (/[0-9]/.test(name))                            return showToast('O nome não pode conter números.','error');
  if (!phone || phone.replace(/\D/g,'').length < 10) return showToast('Digite um WhatsApp válido (mínimo 10 dígitos).','error');
  saveProfile({ name, phone, email });
  renderProfile();
  renderHome();
  scrollToProfileForm();
  showToast('✅ Dados salvos com sucesso.','success');
}

function scrollToProfileForm() {
  const card = document.getElementById('profile-edit-card');
  if (card) {
    card.style.display = card.style.display === 'none' ? 'block' : 'none';
    if (card.style.display === 'block')
      setTimeout(() => document.getElementById('profile-name-input')?.focus(), 100);
  }
}

function clearData() {
  if (!confirm('Tem certeza? Todos os dados locais serão apagados.')) return;
  localStorage.removeItem(DB_KEY);
  renderProfile();
  renderHome();
  showToast('🗑️ Dados limpos!','error');
}

function exportBackup() {
  const db      = getDB();
  const profile = getProfile();
  const backup  = {
    exportedAt:   new Date().toISOString(),
    profile,
    appointments: db.appointments,
    statistics: {
      totalAppointments: db.appointments.length,
      totalSpent: db.appointments.filter(a => a.status !== 'cancelled').reduce((s,a) => s+a.price, 0),
      cancelledCount: db.appointments.filter(a => a.status === 'cancelled').length,
    }
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.download = `barberking-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('📥 Backup salvo com sucesso!','success');
}

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
    showToast('🔓 Bem-vindo, Pila!','success');
  } else {
    showToast('❌ Senha incorreta!','error');
    document.getElementById('admin-pass').value = '';
    document.getElementById('admin-pass').focus();
    vibrate(300);
  }
}

// ════════════════════════════════════════════════════
//  ADMIN PANEL
// ════════════════════════════════════════════════════
async function renderAdmin() {
  // Loading
  ['admin-stats','admin-needs','admin-appt-list'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    el.style.display = 'none';
    const prev = el.previousElementSibling;
    if (prev && (prev.classList.contains('section-header') || prev.classList.contains('needs-grid')))
      prev.style.display = 'none';
  });
  ['adm-filter-all','adm-filter-today','adm-filter-confirmed','adm-filter-cancelled'].forEach(fid => {
    const fb = document.getElementById(fid);
    if (fb) { const bar = fb.closest('.filter-bar'); if (bar) bar.style.display='none'; }
  });

  // Buscar Supabase
  const sbData = await fetchSupabaseAppointments();
  state.supabaseAppts = sbData;

  const sbAppts = sbData.map(supabaseToLocal).filter(Boolean);

  // Tabs do admin
  renderAdminTabs();
  switchAdminTab(state.adminTab, sbAppts);

  const todayEl = document.getElementById('admin-today-date');
  if (todayEl) {
    const d    = new Date();
    const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    todayEl.textContent = `${days[d.getDay()]}, ${fmtDate(d)}`;
  }
}

// ── Renderizar barra de tabs do admin ──
function renderAdminTabs() {
  const header = document.querySelector('.admin-header');
  if (!header) return;

  let tabBar = document.getElementById('admin-tab-bar');
  if (!tabBar) {
    tabBar = document.createElement('div');
    tabBar.id = 'admin-tab-bar';
    tabBar.className = 'admin-tab-bar';
    header.after(tabBar);
  }

  const tabs = [
    { id:'hoje',      icon:'fas fa-calendar-day',  label:'Hoje'      },
    { id:'receita',   icon:'fas fa-chart-bar',      label:'Receita'   },
    { id:'bloqueios', icon:'fas fa-ban',            label:'Bloqueios' },
    { id:'horarios',  icon:'fas fa-clock',          label:'Horários'  },
    { id:'planos',    icon:'fas fa-shield-halved',  label:'Planos'    },
  ];

  tabBar.innerHTML = tabs.map(t => `
    <button class="admin-tab-btn ${state.adminTab===t.id?'active':''}"
            onclick="switchAdminTab('${t.id}')">
      <i class="${t.icon}"></i>
      <span>${t.label}</span>
    </button>
  `).join('');
}

// ── Trocar de aba no admin ──
function switchAdminTab(tabId, sbAppts) {
  state.adminTab = tabId;

  // Atualizar botões
  document.querySelectorAll('.admin-tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick')?.includes(`'${tabId}'`));
  });

  // Conteúdo dinâmico
  const area = document.getElementById('admin-tab-content');
  if (!area) return;
  area.innerHTML = '';

  const appts = sbAppts || state.supabaseAppts.map(supabaseToLocal).filter(Boolean);

  switch (tabId) {
    case 'hoje':      renderTodayList(appts);    break;
    case 'receita':   renderRevenueChart(appts); break;
    case 'bloqueios': renderBlockPanel();         break;
    case 'horarios':  renderSchedulePanel();      break;
    case 'planos':    renderPlansAdmin(appts);    break;
  }
}

// ════════════════════════════════════════════════════
//  ADMIN — ABA HOJE
// ════════════════════════════════════════════════════
function renderTodayList(sbAppts) {
  const area = document.getElementById('admin-tab-content');
  if (!area) return;

  area.innerHTML = `
    <div style="padding:0 20px 14px;display:flex;align-items:center;gap:10px;">
      <input type="date" id="today-date-picker" style="
        flex:1;background:var(--dark3);border:1px solid rgba(255,255,255,.1);
        border-radius:12px;padding:11px 14px;color:var(--white);font-size:14px;
        font-family:Inter,sans-serif;outline:none;color-scheme:dark;" />
      <button onclick="renderTodayListByPicker()" style="
        background:var(--gold);color:var(--dark);border:none;border-radius:12px;
        padding:11px 16px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;">
        Ver Cortes
      </button>
    </div>
    <div id="today-list" class="today-list"></div>`;

  // Data padrão = hoje
  const todayISO = new Date().toISOString().split('T')[0];
  document.getElementById('today-date-picker').value = todayISO;

  window._adminSbAppts = sbAppts;
  _renderTodaySlots(sbAppts, todayISO);
}

function renderTodayListByPicker() {
  const pickerVal = document.getElementById('today-date-picker')?.value;
  const appts = window._adminSbAppts || state.supabaseAppts.map(supabaseToLocal).filter(Boolean);
  _renderTodaySlots(appts, pickerVal);
}

function _renderTodaySlots(sbAppts, dateISO) {
  const parts   = (dateISO || '').split('-');
  const dateStr = parts.length===3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : fmtDate(new Date());

  const list = document.getElementById('today-list');
  if (!list) return;

  const todayAppts = sbAppts
    .filter(a => a.date === dateStr)
    .sort((a,b) => a.time.localeCompare(b.time));

  if (!todayAppts.length) {
    list.innerHTML = `<div class="empty-state" style="padding:30px 20px;">
      <div class="empty-icon" style="font-size:48px;">😴</div>
      <div class="empty-text">Nenhum agendamento para esta data</div>
    </div>`; return;
  }

  list.innerHTML = todayAppts.map(a => {
    const isDone      = a.status === 'past';
    const isCancelled = a.status === 'cancelled';

    // Badge de plano
    const planBadge = a.planName
      ? `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(201,168,76,.15);
            color:var(--gold);font-size:9px;font-weight:800;padding:2px 8px;border-radius:20px;
            border:1px solid rgba(201,168,76,.3);margin-left:6px;letter-spacing:.8px;">
           <i class="fas fa-crown" style="font-size:8px;"></i>PLANO ${a.planName.toUpperCase()}
         </span>` : '';

    return `
    <div class="today-slot ${isDone?'done':''} ${isCancelled?'cancelled-slot':''}" id="ts-${a.id}">
      <div class="today-time">${a.time}</div>
      <div class="today-info">
        <div class="today-client">
          ${a.clientName}
          ${planBadge}
          <span style="font-size:11px;color:var(--gray);margin-left:4px;">${a.clientPhone}</span>
        </div>
        <div class="today-service">${a.service}</div>
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
  if (!id.startsWith('sb_')) markDone(id);
  renderAdmin();
  showToast('✅ Atendimento concluído!','success');
}

async function adminCancelAppt(id) {
  if (!confirm('Cancelar este agendamento?')) return;
  if (!id.startsWith('sb_')) {
    const db   = getDB();
    const appt = db.appointments.find(a => a.id === id);
    cancelAppointment(id);
    if (appt?._supabaseId)
      await supabaseClient.from('appointments').update({ status:'cancelled' }).eq('id', appt._supabaseId);
  } else {
    const sbId = id.replace('sb_', '');
    await supabaseClient.from('appointments').update({ status:'cancelled' }).eq('id', sbId);
  }
  renderAdmin();
  showToast('❌ Agendamento cancelado.','error');
}

// ════════════════════════════════════════════════════
//  ADMIN — ABA RECEITA
// ════════════════════════════════════════════════════
function calcWeekRevenue(sbAppts) {
  const revenue = [];
  for (let i = 6; i >= 0; i--) {
    const d   = new Date(); d.setDate(d.getDate() - i);
    const ds  = fmtDate(d);
    const day = sbAppts
      .filter(a => a.date === ds && a.status !== 'cancelled')
      .reduce((s,a) => s + a.price, 0);
    revenue.push(day);
  }
  return revenue;
}

function renderRevenueChart(sbAppts) {
  const area = document.getElementById('admin-tab-content');
  if (!area) return;

  const revenue = calcWeekRevenue(sbAppts);
  const total   = revenue.reduce((s,v) => s+v, 0);

  const days   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const labels = [];
  for (let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); labels.push(days[d.getDay()]); }

  area.innerHTML = `
    <div class="chart-container" style="margin:16px 20px;">
      <div class="chart-header">
        <div>
          <div class="chart-title">Receita dos últimos 7 dias</div>
          <div style="font-size:12px;color:var(--gray);margin-top:2px;">Agendamentos confirmados</div>
        </div>
        <div class="chart-total">
          <div class="chart-total-val" id="chart-total-val">R$ ${total.toFixed(0)}</div>
          <div class="chart-total-label">Esta semana</div>
        </div>
      </div>
      <canvas id="revenue-chart" style="width:100%;height:160px;display:block;"></canvas>
      <div class="chart-days" id="chart-days">
        ${labels.map(d => `<div class="chart-day-label">${d}</div>`).join('')}
      </div>
    </div>`;

  // Desenhar canvas
  setTimeout(() => {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const dpr  = window.devicePixelRatio || 1;
    const W    = canvas.parentElement.clientWidth - 40;
    const H    = 160;
    canvas.width  = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const max    = Math.max(...revenue, 100);
    const pad    = { top:10, right:10, bottom:20, left:10 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top  - pad.bottom;
    const barW   = chartW / revenue.length;
    ctx.clearRect(0,0,W,H);

    ctx.strokeStyle = 'rgba(255,255,255,.05)';
    ctx.lineWidth   = 1;
    [0,.25,.5,.75,1].forEach(pct => {
      const y = pad.top + chartH * (1-pct);
      ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(W-pad.right,y); ctx.stroke();
    });

    revenue.forEach((val,i) => {
      const x    = pad.left + i * barW + barW * .15;
      const bW   = barW * .7;
      const bH   = (val/max) * chartH;
      const y    = pad.top + chartH - bH;
      const isToday = i === 6;
      const grad = ctx.createLinearGradient(0,y,0,y+bH);
      grad.addColorStop(0, isToday?'#f0c060':'#c9a84c');
      grad.addColorStop(1, isToday?'#a07830':'rgba(201,168,76,.2)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x,y,bW,bH,[6,6,2,2]);
      ctx.fill();
      if (val > 0) {
        ctx.fillStyle = isToday?'#f0c060':'rgba(255,255,255,.7)';
        ctx.font      = `bold ${Math.min(10,bW*.4)}px Inter`;
        ctx.textAlign = 'center';
        ctx.fillText('R$'+val.toFixed(0), x+bW/2, Math.max(y-4,pad.top+8));
      }
    });
  }, 80);
}

// ════════════════════════════════════════════════════
//  ADMIN — ABA BLOQUEIOS
// ════════════════════════════════════════════════════
function renderBlockPanel() {
  const area = document.getElementById('admin-tab-content');
  if (!area) return;

  const db = getDB();

  area.innerHTML = `
    <div style="padding:0 20px;">
      <div class="block-form" style="margin:0 0 16px;">
        <input type="date" id="block-date-input" style="color-scheme:dark;" />
        <button onclick="blockDate()">Bloquear</button>
      </div>
      <div id="blocked-dates" class="blocked-dates"></div>
    </div>`;

  renderBlockedDates();
}

function renderBlockedDates() {
  const db   = getDB();
  const cont = document.getElementById('blocked-dates');
  if (!cont) return;
  if (!db.blockedDates.length) {
    cont.innerHTML = `<div style="font-size:13px;color:var(--gray);padding:4px 0;">Nenhuma data bloqueada.</div>`;
    return;
  }
  cont.innerHTML = db.blockedDates.map(d => `
    <div class="blocked-tag">
      <i class="fas fa-ban"></i>${d}
      <button onclick="unblockDate('${d}')" title="Remover"><i class="fas fa-times"></i></button>
    </div>`).join('');
}

async function blockDate() {
  const input = document.getElementById('block-date-input');
  if (!input?.value) return showToast('⚠️ Escolha uma data!','error');
  const dateISO = input.value;
  const d  = new Date(dateISO + 'T12:00:00');
  const ds = fmtDate(d);
  const db = getDB();
  if (db.blockedDates.includes(ds)) return showToast('⚠️ Data já bloqueada!','error');
  db.blockedDates.push(ds);
  saveDB(db);

  await supabaseClient.from('appointments').insert([{
    client_name:'__BLOCKED_DAY__', phone:'', service:'__block__',
    appointment_date: dateISO, appointment_time: '00:00', status:'confirmed',
  }]);

  fetchSupabaseAppointments().then(data => { state.supabaseAppts = data; });
  renderBlockedDates();
  input.value = '';
  showToast(`🚫 ${ds} bloqueado!`,'success');
}

async function unblockDate(d) {
  const db = getDB();
  db.blockedDates = db.blockedDates.filter(bd => bd !== d);
  saveDB(db);

  const dateISO = d.split('/').reverse().join('-');
  await supabaseClient.from('appointments')
    .delete()
    .eq('client_name', '__BLOCKED_DAY__')
    .eq('appointment_date', dateISO);

  fetchSupabaseAppointments().then(data => { state.supabaseAppts = data; });
  renderBlockedDates();
  showToast(`✅ ${d} desbloqueado!`,'success');
}

// ════════════════════════════════════════════════════
//  ADMIN — ABA HORÁRIOS
// ════════════════════════════════════════════════════
function renderSchedulePanel() {
  const area = document.getElementById('admin-tab-content');
  if (!area) return;

  area.innerHTML = `
    <div style="padding:0 20px;">
      <p style="font-size:13px;color:var(--gray);margin-bottom:14px;">
        Toque para ativar/desativar um horário. 
        <span style="color:var(--green);">Verde = ativo</span>.
      </p>
      <div id="schedule-grid" class="schedule-grid"></div>
      <button class="btn-primary" style="margin:20px 0 0;" onclick="saveSchedule()">
        <i class="fas fa-save" style="margin-right:8px;"></i>Salvar Horários
      </button>
    </div>`;

  renderScheduleGrid();
}

function renderScheduleGrid() {
  const db     = getDB();
  const active = new Set(db.activeSlots || ALL_SLOTS);
  const grid   = document.getElementById('schedule-grid');
  if (!grid) return;
  grid.innerHTML = ALL_SLOTS.map(s => `
    <div class="sched-slot ${active.has(s)?'active-slot':'inactive-slot'}"
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

function saveSchedule() { showToast('✅ Horários salvos!','success'); }

// ════════════════════════════════════════════════════
//  ★  ADMIN — ABA PLANOS
//     Lista todos os agendamentos feitos via plano
// ════════════════════════════════════════════════════
function renderPlansAdmin(sbAppts) {
  const area = document.getElementById('admin-tab-content');
  if (!area) return;

  // Filtrar apenas agendamentos com plano
  const planAppts = sbAppts
    .filter(a => !!a.planName && a.status !== 'cancelled')
    .sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time));

  // Contar por plano
  const counts = { basic:0, plus:0, gold:0 };
  planAppts.forEach(a => {
    const k = a.planName?.toLowerCase();
    if (counts[k] !== undefined) counts[k]++;
  });

  area.innerHTML = `
    <!-- Resumo dos planos -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 20px 20px;">
      ${PLANS.map(p => `
        <div style="background:${p.colorBg};border:1px solid ${p.colorBorder};
            border-radius:14px;padding:16px 12px;text-align:center;">
          <div style="font-size:22px;margin-bottom:4px;">${p.emoji}</div>
          <div style="font-family:Oswald,sans-serif;font-size:16px;font-weight:700;color:${p.color};">${p.name}</div>
          <div style="font-family:Oswald,sans-serif;font-size:26px;font-weight:700;color:var(--white);margin:4px 0;">
            ${counts[p.id]}
          </div>
          <div style="font-size:10px;color:var(--gray);letter-spacing:.5px;">agendamentos</div>
        </div>`).join('')}
    </div>

    <!-- Lista dos clientes com plano -->
    <div style="padding:0 20px;">
      <div style="font-family:Oswald,sans-serif;font-size:16px;font-weight:700;margin-bottom:12px;
          display:flex;align-items:center;gap:8px;">
        <i class="fas fa-shield-halved" style="color:var(--gold);font-size:14px;"></i>
        Clientes com Plano
      </div>
      ${planAppts.length === 0
        ? `<div class="empty-state" style="padding:30px 0;">
            <div class="empty-icon" style="font-size:44px;">🛡️</div>
            <div class="empty-text">Nenhum cliente usou plano ainda</div>
           </div>`
        : planAppts.map(a => {
            const plan = PLANS.find(p => p.name.toLowerCase() === a.planName?.toLowerCase()) || PLANS[0];
            return `
            <div class="today-slot" style="margin-bottom:10px;border-color:${plan.colorBorder};background:${plan.colorBg};">
              <div style="min-width:52px;text-align:center;">
                <div style="font-size:20px;">${plan.emoji}</div>
                <div style="font-family:Oswald,sans-serif;font-size:10px;font-weight:700;
                    color:${plan.color};letter-spacing:.5px;">${plan.name.toUpperCase()}</div>
              </div>
              <div class="today-info">
                <div class="today-client">
                  ${a.clientName}
                  <span style="font-size:11px;color:var(--gray);margin-left:6px;">${a.clientPhone}</span>
                </div>
                <div class="today-service">${a.service}</div>
                <div style="font-size:12px;color:var(--gray);margin-top:2px;">
                  <i class="fas fa-calendar" style="margin-right:4px;color:var(--gold);font-size:10px;"></i>
                  ${a.date} às ${a.time}
                </div>
              </div>
              <span class="appt-badge badge-confirmed" style="white-space:nowrap;">Confirmado</span>
            </div>`;
          }).join('')
      }
    </div>`;
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

// Fechar modais ao clicar no overlay
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => {
    if (e.target === ov) {
      closeModal();
      closeCancelModal();
      closeAdminModal();
      closePlanModal();
    }
  });
});

window.addEventListener('resize', () => {
  if (state.adminTab === 'receita') {
    renderRevenueChart(state.supabaseAppts.map(supabaseToLocal).filter(Boolean));
  }
});

// ════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════
function init() {
  initTheme();
  const db = getDB();
  if (!db.profile || !db.profile.phone || db.profile.name === 'Visitante') {
    showPage('register');
  } else {
    showPage('home');
  }
  renderProfile();
  fetchSupabaseAppointments().then(data => { state.supabaseAppts = data; });
}

init();
