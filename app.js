(function () {
  const FRAME_W = 440;
  const FRAME_H = 956;

  const screens = Object.fromEntries(window.QIS_SCREENS.map(s => [s.id, s]));
  const firstId = window.QIS_SCREENS[0].id;
  const deviceEl = document.getElementById('device');
  const stageEl = document.getElementById('stage');
  const screenEl = document.getElementById('screen');
  const toastEl = document.getElementById('toast');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let toastTimer;

  // Simulated status bar clock (preview only)
  const sbTime = document.getElementById('sb-time');
  function tick() {
    const d = new Date();
    sbTime.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  tick();
  setInterval(tick, 15000);

  const params = new URLSearchParams(location.search);
  if (params.has('debug')) document.body.classList.add('debug');
  if (params.get('demo') === '0') document.body.classList.add('no-demo');

  // Installed PWA: real screen size + system safe areas, no demo bar, no scaling
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) document.body.classList.add('standalone');

  // Preview: a fixed 440 × 956 canvas scaled down to fit the stage
  function fit() {
    if (standalone) return;
    const s = Math.min(stageEl.clientWidth / FRAME_W, stageEl.clientHeight / FRAME_H, 1);
    deviceEl.style.transform = `scale(${s})`;
    deviceEl.style.margin = `${(FRAME_H * (s - 1)) / 2}px ${(FRAME_W * (s - 1)) / 2}px`;
  }
  new ResizeObserver(fit).observe(stageEl);

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1500);
  }

  // ── Demo bar: page code, its description, page list, reset ──
  const pagenumEl = document.getElementById('demo-bar-pagenum');
  const descEl = document.getElementById('demo-bar-desc');
  const pagelistEl = document.getElementById('demo-bar-pagelist');

  function updateDemoBar(s) {
    pagenumEl.textContent = s.code || '--';
    descEl.textContent = s.description || s.name;
    descEl.title = descEl.textContent;
  }

  function renderPageList(currentId) {
    const sorted = [...window.QIS_SCREENS].sort((a, b) => {
      const [aFlow, aSeq] = a.code.split('_').map(Number);
      const [bFlow, bSeq] = b.code.split('_').map(Number);
      return aFlow - bFlow || aSeq - bSeq;
    });
    pagelistEl.replaceChildren(...sorted.map(s => {
      const item = document.createElement('div');
      item.className = 'demo-bar-pagelist-item' + (s.id === currentId ? ' current' : '');
      item.innerHTML = '<span class="demo-bar-pagelist-num"></span><span class="demo-bar-pagelist-desc"></span>';
      item.children[0].textContent = s.code;
      item.children[1].textContent = s.description || s.name;
      item.addEventListener('click', () => {
        pagelistEl.classList.remove('show');
        location.hash = s.id;
      });
      return item;
    }));
  }

  document.getElementById('demo-bar-pagenum-btn').addEventListener('click', () => {
    if (pagelistEl.classList.toggle('show')) renderPageList(currentId());
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.demo-bar-pagenum-wrap')) pagelistEl.classList.remove('show');
  });
  document.getElementById('demo-bar-reset').addEventListener('click', () => {
    decisions = [];
    renderDecisionBar();
    closeDecision();
    location.hash = firstId;
  });

  // ── Demo decisions (flow branch points) ──
  // A screen element with data-decide="<name>" opens that decision's panel
  // (config in window.QIS_DECISIONS). Each decision reached so far gets a
  // re-selectable dropdown in the demo bar; re-picking one clears the ones after it.
  const decisionDefs = window.QIS_DECISIONS || {};
  const decisionEl = document.getElementById('flow-decision');
  const decisionTitleEl = document.getElementById('flow-decision-title');
  const decisionOptionsEl = document.getElementById('flow-decision-options');
  const decisionBarEl = document.getElementById('demo-bar-decisions');
  let decisions = [];

  function openDecision(name) {
    const d = decisionDefs[name];
    decisionTitleEl.textContent = d.title;
    decisionOptionsEl.replaceChildren(...d.options.map(o => {
      const btn = document.createElement('button');
      btn.className = 'flow-decision-option';
      btn.textContent = o.label;
      btn.addEventListener('click', () => chooseDecision(name, o.value));
      return btn;
    }));
    decisionEl.classList.remove('show');
    void decisionEl.offsetWidth; // restart the pop-in animation
    decisionEl.classList.add('show');
  }

  function closeDecision() {
    decisionEl.classList.remove('show');
  }

  function chooseDecision(name, value) {
    const d = decisionDefs[name];
    const opt = d.options.find(o => o.value === value);
    decisions = decisions.slice(0, d.index);
    decisions[d.index] = { name, value };
    renderDecisionBar();
    closeDecision();
    go(opt.to, opt.label);
  }

  function renderDecisionBar() {
    decisionBarEl.replaceChildren(...decisions.filter(Boolean).map(({ name, value }) => {
      const d = decisionDefs[name];
      const sel = document.createElement('select');
      sel.className = 'demo-bar-decision';
      sel.title = d.title;
      d.options.forEach(o => sel.add(new Option(`${d.label}: ${o.short || o.label}`, o.value, false, o.value === value)));
      sel.addEventListener('change', () => chooseDecision(name, sel.value));
      return sel;
    }));
  }

  document.getElementById('flow-decision-close').addEventListener('click', closeDecision);

  // ── Screens ──
  function currentId() {
    const id = location.hash.slice(1);
    return screens[id] ? id : firstId;
  }

  let unmount = null;

  function render() {
    const s = screens[currentId()];
    document.title = `QIS · ${s.name}`;
    updateDemoBar(s);
    screenEl.className = `screen screen-${s.id}`;
    deviceEl.dataset.theme = s.theme || 'dark';
    // Real status bar takes the page background; the OS picks black or white text to match
    themeMeta.content = getComputedStyle(deviceEl).backgroundColor;
    screenEl.innerHTML = s.render();
    screenEl.scrollTop = 0;

    // Optional per-screen behavior; mount() may return a cleanup run on leaving the screen
    closeDecision();
    if (unmount) unmount();
    unmount = s.mount ? s.mount(screenEl) : null;
  }

  // Any element with data-go="<screen id>" navigates; data-go="back" goes back
  screenEl.addEventListener('click', e => {
    const dec = e.target.closest('[data-decide]');
    if (dec) return openDecision(dec.dataset.decide);
    const el = e.target.closest('[data-go]');
    if (!el) return;
    const id = el.dataset.go;
    go(id, el.dataset.label || el.textContent.trim());
  });

  function go(id, label) {
    if (id === 'back') return history.back();
    if (!screens[id]) return toast(`「${label}」頁面尚未加入`);
    location.hash = id;
  }

  window.addEventListener('hashchange', render);
  render();
})();
