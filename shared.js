(function(){
  'use strict';

  const CONFIG = {
    WORKER_URL: 'https://sparkling-surf-f15f.joshsayles.workers.dev',
    APP_ROOT: '/village-kids-dashboard/',
    // PCO credentials - called directly from browser (Cloudflare blocks PCO auth)
    PCO_APP_ID: 'd151bd6b0532cb317c690201669c858d46cae9b51d931bf2661c4f88ee50fde9',
    PCO_SECRET:  'pco_app_a8689f94dafc3ee7319ea14a866983ff202daa35c55735fdb1214fbdb33d53d134ebb85f',
    PCO_SERVICE_TYPE:   '420429',
    PCO_CHECKIN_EVENT:  '338182',
    PCO_LOCATIONS: {
      'Nursery':                  '852593',
      'Toddler/Wobbler':          '933868',
      'Preschool':                '683779',
      'Kindergarten - 1st Grade': '1991723',
      '2nd-3rd Grade':            '683780',
      '4th-6th Grade':            '909667',
    },
  };

  function el(id){ return document.getElementById(id); }
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function esc(s){ return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  async function fetchJson(url, options={}){
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data && data.error) throw new Error(data.error);
    return data;
  }

  const api = {
    async read(){
      return fetchJson(CONFIG.WORKER_URL + '?action=read', { cache: 'no-store' });
    },
    async write(payload){
      return fetchJson(CONFIG.WORKER_URL + '?action=write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
    }
  };

  function bindDeclarativeActions(root=document){
    root.addEventListener('click', event => {
      const node = event.target.closest('[data-click]');
      if (!node) return;
      const code = node.getAttribute('data-click');
      if (!code) return;
      try {
        Function('event', code).call(node, event);
      } catch (err) {
        console.error('data-click failed:', code, err);
      }
    });

    root.addEventListener('change', event => {
      const node = event.target.closest('[data-change]');
      if (!node) return;
      const code = node.getAttribute('data-change');
      if (!code) return;
      try {
        Function('event', code).call(node, event);
      } catch (err) {
        console.error('data-change failed:', code, err);
      }
    });
  }

  function toggleDark({key='vk_dark'}={}){
    const on = document.body.classList.toggle('dark');
    localStorage.setItem(key, on ? '1' : '0');
    return on;
  }


  // PCO Basic Auth header
  function pcoHeaders() {
    const b64 = btoa(CONFIG.PCO_APP_ID + ':' + CONFIG.PCO_SECRET);
    return {
      'Authorization': 'Basic ' + b64,
      'Content-Type': 'application/json',
    };
  }

  const pco = {
    async fetchVolunteers() {
      const base = 'https://api.planningcenteronline.com/services/v2/service_types/' + CONFIG.PCO_SERVICE_TYPE;
      // Get upcoming plans
      const plansRes = await fetch(base + '/plans?filter=future&per_page=5&order=sort_date', { headers: pcoHeaders() });
      if (!plansRes.ok) {
        // Fall back to most recent
        const allRes = await fetch(base + '/plans?per_page=3&order=-sort_date', { headers: pcoHeaders() });
        if (!allRes.ok) throw new Error('PCO plans error: ' + allRes.status);
        const allData = await allRes.json();
        if (!allData.data?.length) throw new Error('No PCO plans found');
        return this._getVolunteersForPlan(allData.data[0].id);
      }
      const plansData = await plansRes.json();
      const plan = plansData.data?.[0];
      if (!plan) {
        const allRes = await fetch(base + '/plans?per_page=3&order=-sort_date', { headers: pcoHeaders() });
        const allData = await allRes.json();
        if (!allData.data?.length) return {};
        return this._getVolunteersForPlan(allData.data[0].id);
      }
      return this._getVolunteersForPlan(plan.id);
    },

    async _getVolunteersForPlan(planId) {
      const base = 'https://api.planningcenteronline.com/services/v2/service_types/' + CONFIG.PCO_SERVICE_TYPE;

      // Fetch plan times and team members in parallel
      const [timesRes, membersRes] = await Promise.all([
        fetch(base + '/plans/' + planId + '/plan_times', { headers: pcoHeaders() }),
        fetch(base + '/plans/' + planId + '/team_members?per_page=100&include=team', { headers: pcoHeaders() }),
      ]);

      const timesData = await timesRes.json();
      const membersData = await membersRes.json();

      // Map plan time IDs to service (first/second)
      const timeIdToSvc = {};
      (timesData.data || [])
        .filter(t => t.attributes?.time_type === 'service')
        .sort((a, b) => new Date(a.attributes.starts_at) - new Date(b.attributes.starts_at))
        .forEach((t, i) => { timeIdToSvc[t.id] = i === 0 ? 'first' : 'second'; });

      // Build team name map from included
      const teamNameMap = {};
      (membersData.included || []).forEach(t => {
        if (t.type === 'Team') teamNameMap[t.id] = t.attributes?.name || '';
      });

      const PCO_TEAM_MAP = {
        'Nursery': 'Nursery', 'Toddler-Wobbler': 'Toddler/Wobbler',
        'Toddler/Wobbler': 'Toddler/Wobbler', 'Toddler': 'Toddler/Wobbler',
        'Preschool': 'Preschool', 'Kinder-1st': 'Kindergarten - 1st Grade',
        'Kinder/1st': 'Kindergarten - 1st Grade', 'K-1st': 'Kindergarten - 1st Grade',
        'Kindergarten': 'Kindergarten - 1st Grade', 'Kinder': 'Kindergarten - 1st Grade',
        '2nd-3rd': '2nd-3rd Grade', '2nd/3rd': '2nd-3rd Grade',
        '2nd-3rd Grade': '2nd-3rd Grade', '2nd3rd': '2nd-3rd Grade',
        '4th-6th': '4th-6th Grade', '4th/6th': '4th-6th Grade',
        '4th-6th Grade': '4th-6th Grade', '4th6th': '4th-6th Grade',
      };

      const CLASS_ORDER = ['Nursery','Toddler/Wobbler','Preschool','Kindergarten - 1st Grade','2nd-3rd Grade','4th-6th Grade'];
      const volunteers = {};

      // Group members by team
      const membersByTeam = {};
      (membersData.data || []).forEach(m => {
        const teamId = m.relationships?.team?.data?.id || '';
        const teamName = teamNameMap[teamId] || '';
        if (!membersByTeam[teamName]) membersByTeam[teamName] = [];
        membersByTeam[teamName].push(m);
      });

      Object.entries(membersByTeam).forEach(([teamName, members]) => {
        const key = PCO_TEAM_MAP[teamName] || CLASS_ORDER.find(cls =>
          cls.toLowerCase() === teamName.toLowerCase() ||
          teamName.toLowerCase().replace(/[-/]/g,' ').includes(cls.toLowerCase().replace(/[-/]/g,' '))
        ) || null;
        if (!key) return;
        if (!volunteers[key]) volunteers[key] = { first: [], second: [] };
        members.forEach(m => {
          const name = m.attributes?.name || '';
          const status = m.attributes?.status || '';
          if (!name || status === 'D') return;
          const vol = { name, role: m.attributes?.team_position_name || '', status };
          const svcIds = (m.relationships?.service_times?.data || []).map(t => t.id);
          const svcs = [...new Set(svcIds.map(id => timeIdToSvc[id]).filter(Boolean))];
          if (svcs.includes('first'))  volunteers[key].first.push(vol);
          if (svcs.includes('second')) volunteers[key].second.push(vol);
          if (!svcs.length) { volunteers[key].first.push(vol); volunteers[key].second.push(vol); }
        });
      });

      // Paginate if needed
      if (membersData.links?.next) {
        let nextUrl = membersData.links.next;
        while (nextUrl) {
          const r = await fetch(nextUrl, { headers: pcoHeaders() });
          const d = await r.json();
          (d.data || []).forEach(m => {
            const teamId = m.relationships?.team?.data?.id || '';
            const teamName = teamNameMap[teamId] || '';
            const key = PCO_TEAM_MAP[teamName] || null;
            if (!key) return;
            if (!volunteers[key]) volunteers[key] = { first: [], second: [] };
            const name = m.attributes?.name || '';
            const status = m.attributes?.status || '';
            if (!name || status === 'D') return;
            const vol = { name, role: m.attributes?.team_position_name || '', status };
            const svcIds = (m.relationships?.service_times?.data || []).map(t => t.id);
            const svcs = [...new Set(svcIds.map(id => timeIdToSvc[id]).filter(Boolean))];
            if (svcs.includes('first'))  volunteers[key].first.push(vol);
            if (svcs.includes('second')) volunteers[key].second.push(vol);
            if (!svcs.length) { volunteers[key].first.push(vol); volunteers[key].second.push(vol); }
          });
          nextUrl = d.links?.next || null;
        }
      }

      return volunteers;
    },

    async fetchCheckIns() {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const etRes = await fetch(
        'https://api.planningcenteronline.com/check-ins/v2/event_times' +
        '?where[event_id]=' + CONFIG.PCO_CHECKIN_EVENT + '&order=-starts_at&per_page=10',
        { headers: pcoHeaders() }
      );
      if (!etRes.ok) throw new Error('Check-ins error: ' + etRes.status);
      const etData = await etRes.json();

      let times = (etData.data || []).filter(et =>
        (et.attributes.starts_at || '').split('T')[0] === todayStr &&
        et.relationships?.event?.data?.id === CONFIG.PCO_CHECKIN_EVENT
      );

      if (!times.length) {
        const recent = (etData.data || []).filter(et =>
          et.relationships?.event?.data?.id === CONFIG.PCO_CHECKIN_EVENT
        );
        if (!recent.length) return null;
        const latestPeriod = recent[0].relationships?.event_period?.data?.id;
        times = recent.filter(et => et.relationships?.event_period?.data?.id === latestPeriod);
      }
      if (!times.length) return null;

      times.sort((a, b) => new Date(a.attributes.starts_at) - new Date(b.attributes.starts_at));
      const firstId = times[0]?.id;
      const secondId = times[1]?.id;

      const PCO_LOC_MAP = {
        'Nursery': 'Nursery', 'Toddler/Wobbler': 'Toddler/Wobbler',
        'Preschool': 'Preschool', 'Kindergarten - 1st Grade': 'Kindergarten - 1st Grade',
        '2nd - 3rd Grade': '2nd-3rd Grade', '4th - 6th Grade': '4th-6th Grade',
      };

      async function getcounts(eventTimeId) {
        if (!eventTimeId) return {};
        const counts = {};
        let url = 'https://api.planningcenteronline.com/check-ins/v2/check_ins' +
          '?where[event_time_id]=' + eventTimeId + '&where[kind]=Regular&include=location&per_page=100';
        while (url) {
          const r = await fetch(url, { headers: pcoHeaders() });
          const d = await r.json();
          const locMap = {};
          (d.included || []).forEach(item => { if (item.type === 'Location') locMap[item.id] = item.attributes?.name || ''; });
          (d.data || []).forEach(ci => {
            if (ci.attributes?.checked_out_at) return;
            const locName = locMap[ci.relationships?.location?.data?.id || ''] || '';
            const dashName = PCO_LOC_MAP[locName] || locName;
            if (dashName) counts[dashName] = (counts[dashName] || 0) + 1;
          });
          url = d.links?.next || null;
        }
        return counts;
      }

      const [firstCounts, secondCounts] = await Promise.all([getcounts(firstId), getcounts(secondId)]);

      const byRoom = {};
      Object.keys(CONFIG.PCO_LOCATIONS).forEach(name => {
        byRoom[name] = { first: firstCounts[name] || 0, second: secondCounts[name] || 0 };
      });

      const totalFirst  = Object.values(byRoom).reduce((s, r) => s + r.first, 0);
      const totalSecond = Object.values(byRoom).reduce((s, r) => s + r.second, 0);

      return {
        byRoom,
        totals: { first: totalFirst, second: totalSecond, overall: totalFirst + totalSecond },
        eventTimes: times.map(t => ({ id: t.id, starts_at: t.attributes.starts_at })),
      };
    }
  };

  window.VKShared = {
    CONFIG,
    dom: { el, qs, qsa, esc },
    api,
    pco,
    bindDeclarativeActions,
    toggleDark,
  };
})();
