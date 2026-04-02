'use strict';

const WORKER_URL = VKShared.CONFIG.WORKER_URL;
const ADMIN_PIN  = '2024';
const PIN_KEY    = 'vk_pin_exp';
const PIN_TTL    = 4 * 60 * 60 * 1000;
const DARK_KEY   = 'vk_dark';

// \u2500\u2500 STATE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const S = {
  announcements: [],
  ticker:        [],
  settings:      {},
  classes:       [],
  alerts:        [],
};

const { el, esc } = VKShared.dom;

function setStatus(cls, txt) {
  const el2 = el('saveStatus');
  el2.className = 'save-status ' + (cls || '');
  el2.textContent = txt;
  if (cls === 'save-ok') setTimeout(() => { el2.textContent = ''; }, 3000);
}

function toggleDark() {
  return VKShared.toggleDark({ key: DARK_KEY });
}

// \u2500\u2500 PIN \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Pin = {
  entry: '',

  init() {
    const exp = parseInt(localStorage.getItem(PIN_KEY) || '0');
    if (Date.now() < exp) { this.unlock(); return; }
    el('pinScreen').classList.add('open');
  },

  key(k) {
    if (this.entry.length >= 4) return;
    this.entry += k;
    this.syncDots();
    if (this.entry.length === 4) setTimeout(() => this.check(), 120);
  },

  del() { this.entry = this.entry.slice(0, -1); this.syncDots(); },

  syncDots() {
    for (let i = 0; i < 4; i++) {
      el('pd' + i).classList.toggle('filled', i < this.entry.length);
    }
  },

  check() {
    if (this.entry === ADMIN_PIN) {
      localStorage.setItem(PIN_KEY, (Date.now() + PIN_TTL).toString());
      el('pinScreen').classList.remove('open');
      this.entry = '';
      this.syncDots();
      this.unlock();
    } else {
      el('pinError').textContent = 'Incorrect PIN';
      this.entry = '';
      this.syncDots();
      setTimeout(() => { el('pinError').textContent = ''; }, 1500);
    }
  },

  unlock() { loadData(); }
};

// \u2500\u2500 DATA LOAD \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
async function loadData() {
  try {
    const data = await VKShared.api.read();
    S.announcements = data.announcements || [];
    S.ticker        = data.ticker        || [];
    S.settings      = data.settings      || {};
    S.classes       = data.classes       || [];
    S.alerts        = data.alerts        || [];
    renderAll();
  } catch (err) {
    setStatus('save-error', 'Load failed: ' + err.message);
  }
}

async function notionWrite(payload) {
  return VKShared.api.write(payload);
}

// \u2500\u2500 RENDER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function renderAll() {
  renderAnnouncements();
  renderTicker();
  renderSettings();
  renderNowSelector();
  renderAlerts();
}

const ANN_COLORS = { Info:'#5d8da1', Urgent:'#954a4b', Event:'#a0b46a', Prayer:'#a9794d' };

function renderAnnouncements() {
  const list = el('annList');
  if (!S.announcements.length) {
    list.innerHTML = '<p style="font-size:13px;color:var(--muted);font-style:italic;margin-bottom:8px">No announcements.</p>';
    return;
  }
  list.innerHTML = S.announcements.map((a, i) => {
    const col = ANN_COLORS[a.tag] || ANN_COLORS.Info;
    return '<div class="list-item" style="border-left:3px solid ' + col + '">'
      + '<div class="list-item-body">'
      + '<div class="list-item-title">' + esc(a.title) + '</div>'
      + '<div class="list-item-sub">'
      + '<span class="badge" style="background:rgba(0,0,0,.06)">' + esc(a.scope||'All') + '</span>'
      + '<span class="badge" style="background:rgba(0,0,0,.06)">' + esc(a.tag||'Info') + '</span>'
      + (a.detail ? esc(a.detail) : '')
      + '</div></div>'
      + '<button class="list-item-del" onclick="Announcements.remove(\'' + a.id + '\')" title="Delete">&times;</button>'
      + '</div>';
  }).join('');
}

function renderTicker() {
  const list = el('tickerList');
  if (!S.ticker.length) {
    list.innerHTML = '<p style="font-size:13px;color:var(--muted);font-style:italic;margin-bottom:8px">No ticker messages.</p>';
    return;
  }
  list.innerHTML = S.ticker.map((t) =>
    '<div class="list-item">'
    + '<div class="list-item-body"><div class="list-item-title">' + esc(t.message) + '</div></div>'
    + '<button class="list-item-del" onclick="Ticker.remove(\'' + t.id + '\')" title="Delete">&times;</button>'
    + '</div>'
  ).join('');
}

function renderSettings() {
  const s = S.settings;
  el('ws1').value    = s.service1_time    || '';
  el('ws2').value    = s.service2_time    || '';
  el('wsCat').value  = s.catechism_number || '';
  el('wsNote').value = s.service_note     || '';
  el('wsVerse').value= s.verse_full       || '';
  el('wsRef').value  = s.verse_ref        || '';
}

function renderNowSelector() {
  const sel = el('nowClassSel');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Choose a class...</option>';
  const classes = ['Nursery','Toddler/Wobbler','Preschool','Kindergarten - 1st Grade','2nd - 3rd Grade','4th - 6th Grade'];
  classes.forEach(c => {
    const rows = S.classes.filter(r => r.class === c && (r.service||'').toLowerCase() !== '2nd');
    if (!rows.length) return;
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    if (c === cur) opt.selected = true;
    sel.appendChild(opt);
  });
  NowToggle.render();
}

function renderAlerts() {
  const urgent = S.alerts.find(a => a.type === 'Urgent');
  const sec    = el('alertActiveSection');
  if (urgent) {
    sec.innerHTML = '<div class="alert-active">'
      + '<span class="alert-active-text">' + esc(urgent.message) + '</span>'
      + '<button class="btn btn-ghost" onclick="Alert.clear(\'' + urgent.id + '\')">Clear</button>'
      + '</div>';
  } else {
    sec.innerHTML = '';
  }
}

// \u2500\u2500 ANNOUNCEMENTS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Announcements = {
  async add() {
    const title  = el('newAnnTitle').value.trim();
    const detail = el('newAnnDetail').value.trim();
    const scope  = el('newAnnScope').value;
    const tag    = el('newAnnTag').value;
    if (!title) { el('newAnnTitle').focus(); return; }
    setStatus('save-saving', 'Saving...');
    try {
      await notionWrite({
        operation: 'create',
        database:  'announcements',
        data: {
          Title:  [{ text: { content: title } }],
          Detail: [{ text: { content: detail } }],
          Scope:  { name: scope },
          Tag:    { name: tag },
          Active: true,
        }
      });
      el('newAnnTitle').value = '';
      el('newAnnDetail').value = '';
      setStatus('save-ok', 'Saved');
      await loadData();
    } catch (err) { setStatus('save-error', err.message); }
  },

  async remove(id) {
    setStatus('save-saving', 'Removing...');
    try {
      await notionWrite({ operation: 'delete', pageId: id });
      S.announcements = S.announcements.filter(a => a.id !== id);
      renderAnnouncements();
      setStatus('save-ok', 'Removed');
    } catch (err) { setStatus('save-error', err.message); }
  }
};

// \u2500\u2500 TICKER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Ticker = {
  async add() {
    const msg = el('newTickerMsg').value.trim();
    if (!msg) { el('newTickerMsg').focus(); return; }
    setStatus('save-saving', 'Saving...');
    try {
      await notionWrite({
        operation: 'create',
        database:  'ticker',
        data: { Message: [{ text: { content: msg } }], Active: true }
      });
      el('newTickerMsg').value = '';
      setStatus('save-ok', 'Saved');
      await loadData();
    } catch (err) { setStatus('save-error', err.message); }
  },

  async remove(id) {
    setStatus('save-saving', 'Removing...');
    try {
      await notionWrite({ operation: 'delete', pageId: id });
      S.ticker = S.ticker.filter(t => t.id !== id);
      renderTicker();
      setStatus('save-ok', 'Removed');
    } catch (err) { setStatus('save-error', err.message); }
  }
};

// \u2500\u2500 SETTINGS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Settings = {
  async save() {
    const s = S.settings;
    if (!s.id) { setStatus('save-error', 'No settings page found'); return; }
    setStatus('save-saving', 'Saving...');
    try {
      await notionWrite({
        operation: 'update',
        pageId:    s.id,
        data: {
          '1st Service Time': [{ text: { content: el('ws1').value.trim() } }],
          '2nd Service Time': [{ text: { content: el('ws2').value.trim() } }],
          'Service Note':     [{ text: { content: el('wsNote').value.trim() } }],
          'Catechism Number': parseFloat(el('wsCat').value) || null,
          'Memory Verse':     [{ text: { content: el('wsVerse').value.trim() } }],
          'Verse Reference':  [{ text: { content: el('wsRef').value.trim() } }],
        }
      });
      setStatus('save-ok', 'Saved');
    } catch (err) { setStatus('save-error', err.message); }
  }
};

// \u2500\u2500 NOW TOGGLE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const NowToggle = {
  render() {
    const cls  = el('nowClassSel').value;
    const list = el('nowList');
    if (!cls) { list.innerHTML = ''; return; }
    const rows = S.classes.filter(r => r.class === cls && (r.service||'').toLowerCase() !== '2nd');
    list.innerHTML = rows.map((r, i) =>
      '<div class="now-row' + (r.now ? ' active' : '') + '" onclick="NowToggle.toggle(\'' + r.id + '\',\'' + cls + '\')">'
      + '<div class="now-dot"></div>'
      + '<span class="now-label">' + esc(r.event) + '</span>'
      + '<span class="now-time">' + esc(r.time) + '</span>'
      + '</div>'
    ).join('');
  },

  async toggle(id, cls) {
    // Clear all in class, set this one if not already set
    const rows   = S.classes.filter(r => r.class === cls && (r.service||'').toLowerCase() !== '2nd');
    const target = rows.find(r => r.id === id);
    const wasNow = target && target.now;
    setStatus('save-saving', 'Saving...');
    try {
      // Update all rows in class (clear now)
      await Promise.all(rows.map(r =>
        notionWrite({ operation: 'update', pageId: r.id, data: { Now: !wasNow && r.id === id } })
      ));
      // Update local state
      rows.forEach(r => { r.now = (!wasNow && r.id === id); });
      this.render();
      setStatus('save-ok', 'Saved');
    } catch (err) { setStatus('save-error', err.message); }
  }
};

// \u2500\u2500 URGENT ALERT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Alert = {
  async send() {
    const msg = el('newAlertMsg').value.trim();
    if (!msg) { el('newAlertMsg').focus(); return; }
    // Clear any existing urgent alert first
    const existing = S.alerts.find(a => a.type === 'Urgent');
    if (existing) await this.clear(existing.id, true);
    setStatus('save-saving', 'Sending...');
    try {
      await notionWrite({
        operation: 'create',
        database:  'alerts',
        data: {
          Message: [{ text: { content: msg } }],
          Type:    { name: 'Urgent' },
          Active:  true,
        }
      });
      el('newAlertMsg').value = '';
      setStatus('save-ok', 'Alert sent');
      await loadData();
    } catch (err) { setStatus('save-error', err.message); }
  },

  async clear(id, silent) {
    if (!silent) setStatus('save-saving', 'Clearing...');
    try {
      await notionWrite({ operation: 'delete', pageId: id });
      if (!silent) { setStatus('save-ok', 'Alert cleared'); await loadData(); }
    } catch (err) { if (!silent) setStatus('save-error', err.message); }
  }
};

// \u2500\u2500 INIT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
if (localStorage.getItem(DARK_KEY) === '1') document.body.classList.add('dark');
Pin.init();

VKShared.bindDeclarativeActions(document);
