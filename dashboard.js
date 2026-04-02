// ===== Helpers =====
function el(id) {
  return document.getElementById(id);
}
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ===== State (must already be populated elsewhere) =====
// Expecting something like:
// State.volunteers = {
//   "Nursery": { first: [{name, role}], second: [...] },
//   "Preschool": { first: [...], second: [...] },
//   ...
// };
// State.roomMode = boolean
// State.room = "Preschool" (etc)

const CLASS_ORDER = [
  'Nursery',
  'Toddler/Wobbler',
  'Preschool',
  'Kindergarten - 1st Grade',
  '2nd - 3rd Grade',
  '4th - 6th Grade'
];

// ===== Volunteers Module =====
const Volunteers = {
  activeTab: null,

  render() {
    const vols = (window.State && State.volunteers) || {};
    const card = el('volCard');
    const tabBar = el('volTabBar');
    const panels = el('volPanels');

    // Basic guards
    if (!card || !tabBar || !panels) {
      console.warn('Volunteers: missing required elements', { card, tabBar, panels });
      return;
    }'

    // Debug (leave for now)
    console.log('volunteers:', vols);

    // Determine which classes actually have volunteers
    const classes = CLASS_ORDER.filter(cls => {
      const v = vols[cls];
      return v && ((v.first && v.first.length) || (v.second && v.second.length));
    });

    console.log('filtered classes:', classes);

    // If no volunteers anywhere → hide card
    if (!classes.length) {
      card.style.display = 'none';
      tabBar.innerHTML = '';
      panels.innerHTML = '';
      return;
    }

    // Show card
    card.style.display = 'block';
    tabBar.innerHTML = '';
    panels.innerHTML = '';

    // ===== Room Mode: show only that room, no tabs =====
    if (window.State && State.roomMode) {
      const room = State.room;
      const roomVols = vols[room];

      if (!roomVols || (!roomVols.first?.length && !roomVols.second?.length)) {
        card.style.display = 'none';
        return;
      }

      tabBar.style.display = 'none';
      panels.appendChild(this.buildPanel(roomVols));
      return;
    }

    // ===== Normal Mode: tabs by class =====
    tabBar.style.display = '';

    const defaultTab =
      this.activeTab && classes.includes(this.activeTab)
        ? this.activeTab
        : classes[0];

    classes.forEach(cls => {
      const tab = document.createElement('button');
      tab.className = 'class-tab' + (cls === defaultTab ? ' active' : '');
      tab.textContent = this.shortName(cls);

      tab.addEventListener('click', () => {
        this.activeTab = cls;

        tabBar.querySelectorAll('.class-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        panels.innerHTML = '';
        panels.appendChild(this.buildPanel(vols[cls]));
      });

      tabBar.appendChild(tab);
    });

    this.activeTab = defaultTab;
    panels.appendChild(this.buildPanel(vols[defaultTab]));
  },

  // Build a panel for a single class (with 1st/2nd service sections)
  buildPanel(volsForClass) {
    const wrap = document.createElement('div');
    wrap.className = 'vol-panel';

    const hasFirst = volsForClass.first && volsForClass.first.length;
    const hasSecond = volsForClass.second && volsForClass.second.length;

    // 1st Service
    if (hasFirst) {
      const sec = document.createElement('div');
      sec.className = 'vol-section';

      sec.innerHTML = `
        <div class="vol-svc-label vol-svc-label-1">1st Service</div>
        <div class="vol-roster">
          ${volsForClass.first.map(v => `
            <div class="vol-chip">
              <span class="vol-chip-name">${esc(v.name)}</span>
              <span class="vol-chip-role">${esc(v.role || '')}</span>
            </div>
          `).join('')}
        </div>
      `;
      wrap.appendChild(sec);
    }

    // 2nd Service
    if (hasSecond) {
      const sec = document.createElement('div');
      sec.className = 'vol-section';

      sec.innerHTML = `
        <div class="vol-svc-label vol-svc-label-2">2nd Service</div>
        <div class="vol-roster">
          ${volsForClass.second.map(v => `
            <div class="vol-chip">
              <span class="vol-chip-name">${esc(v.name)}</span>
              <span class="vol-chip-role">${esc(v.role || '')}</span>
            </div>
          `).join('')}
        </div>
      `;
      wrap.appendChild(sec);
    }

    return wrap;
  },

  // Shorten long class names for tabs
  shortName(cls) {
    return cls
      .replace('Kindergarten - ', 'K–')
      .replace('1st Grade', '1st')
      .replace('2nd - 3rd Grade', '2nd–3rd')
      .replace('4th - 6th Grade', '4th–6th');
  }
};

// ===== Call this after data loads =====
// Example:
// loadData().then(() => {
//   Volunteers.render();
// });

// If you already have a global renderAll(), just call Volunteers.render() inside it.
