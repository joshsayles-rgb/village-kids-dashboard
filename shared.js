(function(){
  'use strict';

  const CONFIG = {
    WORKER_URL: 'https://sparkling-surf-f15f.joshsayles.workers.dev',
    APP_ROOT: '/village-kids-dashboard/'
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

  window.VKShared = {
    CONFIG,
    dom: { el, qs, qsa, esc },
    api,
    bindDeclarativeActions,
    toggleDark,
  };
})();
