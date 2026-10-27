// QIS flow screens, in flow order.
// code: page number shown in the demo bar, <flow>_<seq> (e.g. 1_010).
// description: plain-language line shown in the demo bar's page list.
// render(): the screen's HTML. Elements with data-go="<screen id>" navigate;
// screens not added yet show a toast. Layout is in pt on the 440 × 956 canvas.
(function () {
  const ICON = {
    plus: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
    login: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4h9v16h-9"/><path d="M3 12h11M10 8l4 4-4 4"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4l-8 8 8 8"/></svg>',
    help: '<svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.4-2.8 4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.2" fill="#fff"/></svg>',
    qr: '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M3 3h7v7H3zm2 2v3h3V5zm9-2h7v7h-7zm2 2v3h3V5zM3 14h7v7H3zm2 2v3h3v-3zm9-2h2v2h-2zm2 2h2v2h-2zm2-2h3v2h-3zm-4 4h2v3h-2zm4 0h3v3h-3z"/></svg>',
    wifiSolid: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M6 12.8a9 9 0 0 1 12 0"/><path d="M9.5 16.5a4 4 0 0 1 5 0"/><circle cx="12" cy="19.6" r="1.4" fill="currentColor" stroke="none"/></svg>',
    helpOutline: '<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="11" stroke-width="1.4"/><path d="M9.3 9.4a2.8 2.8 0 0 1 5.4 1c0 1.8-2.7 2.3-2.7 3.9" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="17.4" r="1.1" fill="currentColor" stroke="none"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  };

  // Placeholder product drawings (stand-ins until real product images exist)
  function device(type) {
    return `<span class="dev dev-${type}" aria-hidden="true"><span></span></span>`;
  }

  // Placeholder QR code (finder squares + a fixed pattern), not scannable
  const QR_PLACEHOLDER = (() => {
    const finder = (x, y) => `<path d="M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z M${x + 2} ${y + 2}h3v3h-3z" fill-rule="evenodd"/>`;
    const dots = [[9,1],[11,2],[9,4],[12,5],[10,7],[1,9],[3,10],[5,9],[8,9],[10,10],[12,9],[14,11],[17,9],[19,10],[9,12],[11,13],[13,14],[15,13],[18,13],[9,15],[12,16],[14,17],[16,15],[19,16],[10,18],[13,19],[15,19],[17,18],[19,19],[11,20],[18,20]];
    return `<svg viewBox="0 0 21 21" width="44" height="44" shape-rendering="crispEdges">${finder(0, 0)}${finder(14, 0)}${finder(0, 14)}${dots.map(([x, y]) => `<rect x="${x}" y="${y}" width="1.5" height="1.5"/>`).join('')}</svg>`;
  })();


  // ── Setup forms: shared values (prefilled with reasonable demo values) ──
  const FORM = {
    ssid: 'timmmbt8',
    wifiPassword: 'Asus2026@BT8!',
    separate: false,
    iotSsid: '',
    iotPassword: 'Asus2026@IoT!',
    username: 'timmmbt8',
    adminPassword: 'Admin2026@BT8!',
    adminConfirm: 'Admin2026@BT8!',
  };

  const FIELD_ICON = {
    clear: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9.5"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke-linecap="round"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="3"/></svg>',
  };

  // Big round icon at the top of each setup form (light-blue disc + long shadow)
  const SETUP_ICON = (() => {
    const disc = inner => `<svg viewBox="0 0 112 112" width="112" height="112" aria-hidden="true">
      <defs><clipPath id="disc"><circle cx="56" cy="56" r="56"/></clipPath></defs>
      <circle cx="56" cy="56" r="56" fill="#d6e9fb"/>
      <path d="M56 56L112 112V44L80 30z" fill="#b9d8f7" clip-path="url(#disc)"/>
      ${inner}</svg>`;
    return {
      wifi: disc('<g fill="none" stroke="#1b74e4" stroke-width="6" stroke-linecap="round"><path d="M28 46a40 40 0 0 1 56 0"/><path d="M37 56a27 27 0 0 1 38 0"/><path d="M46 66a14 14 0 0 1 20 0"/></g><circle cx="56" cy="77" r="6" fill="#1b74e4"/>'),
      iot: disc('<path d="M34 54l22-18 22 18v26H34z" fill="none" stroke="#1b74e4" stroke-width="4.5" stroke-linejoin="round"/><g fill="none" stroke="#1b74e4" stroke-width="3.5" stroke-linecap="round"><path d="M44 58a17 17 0 0 1 24 0"/><path d="M49 64a9 9 0 0 1 14 0"/></g><circle cx="56" cy="70" r="2.8" fill="#1b74e4"/><path d="M76 62l10 6v12l-10 6-10-6V68z" fill="#d6e9fb" stroke="#1b74e4" stroke-width="4" stroke-linejoin="round"/><circle cx="76" cy="74" r="4" fill="none" stroke="#1b74e4" stroke-width="3.5"/>'),
      user: disc('<circle cx="56" cy="44" r="14" fill="#1b74e4"/><path d="M30 82c0-14 11-22 26-22s26 8 26 22z" fill="#1b74e4"/>'),
    };
  })();

  // Underlined form field; password fields get an eye toggle and optional strength meter
  function field({ key, label, type = 'text', clear = false, strength = false }) {
    const id = `f-${key}`;
    const pwd = type === 'password';
    return `<div class="field">
      <label class="field-label" for="${id}">${label}</label>
      <div class="field-row${strength ? ' has-strength' : ''}">
        <input class="field-input" id="${id}" data-key="${key}" type="${type}" value="${FORM[key]}" autocomplete="off" autocapitalize="off" spellcheck="false">
        ${pwd ? `<button class="field-icon" data-action="toggle" aria-label="顯示密碼">${FIELD_ICON.eyeOff}</button>`
              : clear ? `<button class="field-icon" data-action="clear" aria-label="清除">${FIELD_ICON.clear}</button>` : ''}
      </div>
      ${strength ? `<div class="strength" data-for="${key}"><i></i><i></i><i></i><i></i><span></span></div>` : ''}
    </div>`;
  }

  function passwordScore(v) {
    let s = 0;
    if (v.length >= 8) s++;
    if (v.length >= 12) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
    return v ? Math.max(1, s) : 0;
  }

  const STRENGTH = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  // Wires inputs to FORM, clear / show-password buttons and strength meters
  function bindForm(el, onChange) {
    const update = () => {
      el.querySelectorAll('.strength').forEach(m => {
        const score = passwordScore(FORM[m.dataset.for]);
        m.dataset.score = score;
        m.querySelector('span').textContent = STRENGTH[score];
      });
      if (onChange) onChange();
    };
    el.addEventListener('input', e => {
      const k = e.target.dataset.key;
      if (k) FORM[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      update();
    });
    el.querySelectorAll('.field-icon').forEach(btn => btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (btn.dataset.action === 'clear') {
        input.value = '';
        FORM[input.dataset.key] = '';
        input.focus();
        update();
      } else {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? FIELD_ICON.eye : FIELD_ICON.eyeOff;
        btn.setAttribute('aria-label', show ? '隱藏密碼' : '顯示密碼');
      }
    }));
    update();
  }

  function setupHeader(backTo) {
    return `<header class="navbar navbar-guide">
      ${backTo ? `<button class="navbar-btn" data-go="${backTo}" aria-label="返回">${ICON.back}</button>` : ''}
      <h1 class="navbar-title navbar-title-bold">System Setup</h1>
      <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
    </header>`;
  }

  // ── 1_210 completion: confetti shapes, burst out from behind the router ──
  const CONFETTI_SHAPE = {
    tri: '<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 2l8 15H2z" fill="currentColor"/></svg>',
    ring: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="4"/></svg>',
    bar: '<svg viewBox="0 0 10 44" width="10" height="44"><rect x="1" y="0" width="8" height="44" rx="2" fill="currentColor"/></svg>',
    chip: '<svg viewBox="0 0 26 16" width="26" height="16"><rect width="26" height="16" rx="2" fill="currentColor"/></svg>',
    dot: '<svg viewBox="0 0 30 30" width="30" height="30"><circle cx="15" cy="15" r="15" fill="currentColor"/></svg>',
    pill: '<svg viewBox="0 0 8 22" width="8" height="22"><rect width="8" height="22" rx="4" fill="currentColor"/></svg>',
    gear: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/><circle cx="12" cy="12" r="6.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3 3 3 16 0 19M12 2.5c-3 3-3 16 0 19"/></svg>',
    star: '<svg viewBox="0 0 20 20" width="18" height="18"><path d="M10 1l2.6 6 6.4.6-4.9 4.2 1.5 6.3L10 14.8 4.4 18l1.5-6.3L1 7.6 7.4 7z" fill="currentColor"/></svg>',
  };

  // [shape, color, x, y, rotate, delay] — final offsets from the router's top centre
  const DONE_CONFETTI = [
    ['tri', '#6c63e8', 20, -150, 18, 0],
    ['tri', '#e0574f', -150, -100, -30, .05],
    ['ring', '#d9dde3', -6, -132, 0, .1],
    ['bar', '#2a5bd7', -52, -96, -22, 0],
    ['dot', '#bfe3c0', 62, -110, 0, .08],
    ['globe', '#3a7be0', -150, -58, 0, .12],
    ['ring', '#e0574f', 130, -70, 0, .04],
    ['pill', '#7a74ea', -130, -18, 40, .1],
    ['chip', '#1f3fd6', 104, -30, 20, .02],
    ['gear', '#8f8ae0', -160, 16, 0, .14],
    ['gear', '#8f8ae0', 165, 70, 0, .16],
    ['pill', '#bfe3c0', -118, 34, 70, .06],
    ['star', '#f2c94c', 120, -140, 12, .09],
    ['tri', '#2ec4b6', 150, 10, 80, .11],
    ['dot', '#f7c6d9', -70, -138, 0, .13],
  ];

  const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // 1_220 summary row icons: Wi-Fi with band label, user outline
  const SUMMARY_ICON = {
    wifi: (band, color) => `<span class="summary-icon" style="color:${color}" aria-hidden="true">
      <svg viewBox="0 0 30 22" width="30" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M3 8a17 17 0 0 1 24 0"/><path d="M7.5 12.5a10.5 10.5 0 0 1 15 0"/><path d="M12 17a4 4 0 0 1 6 0"/></svg>
      <em>${band}</em></span>`,
    user: `<span class="summary-icon" style="color:#1b74e4" aria-hidden="true"><svg viewBox="0 0 30 30" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><circle cx="15" cy="10" r="6"/><path d="M4 28c0-7 5-11 11-11s11 4 11 11z" stroke-linejoin="round"/></svg></span>`,
  };

  // ── 1_230 home dashboard icons ──
  const HOME_ICON = {
    google: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285f4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34a853"/><path d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z" fill="#fbbc05"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.8 9.4 6 12 6z" fill="#ea4335"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10.5"/><circle cx="12.8" cy="7.3" r="1.1" fill="currentColor" stroke="none"/><path d="M10.6 10.6h2.4l-1.4 6.4h2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.6 2H4.4z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3.5v17M3.5 12h17"/></svg>',
    gauge: '<svg viewBox="0 0 52 40" width="52" height="40" fill="none" stroke="#9b9b9b" stroke-width="4.5"><path d="M5 36a21 21 0 1 1 42 0z" stroke-linejoin="round"/><circle cx="26" cy="27" r="3.2" stroke-width="3"/><path d="M28.5 25l11-8" stroke-linecap="round" stroke-width="3"/></svg>',
    chevrons: '<svg viewBox="0 0 16 12" width="16" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 1l5 5-5 5M9 1l5 5-5 5"/></svg>',
    down: '<svg viewBox="0 0 34 34" width="34" height="34" fill="none" stroke="#5ac8fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="17" cy="17" r="15.5"/><path d="M17 9v13M11.5 16.5L17 22l5.5-5.5M11 25.5h12"/></svg>',
    up: '<svg viewBox="0 0 34 34" width="34" height="34" fill="none" stroke="#7ed321" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="17" cy="17" r="15.5"/><path d="M17 25V12M11.5 17.5L17 12l5.5 5.5M11 8.5h12"/></svg>',
    www: '<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="21"/><path d="M3 24h42M24 3c-8 9-8 33 0 42M24 3c8 9 8 33 0 42M7 13h34M7 35h34"/><rect x="5" y="17" width="38" height="14" rx="2" fill="#fff" stroke="none"/><text x="24" y="29" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor" stroke="none" font-family="-apple-system, sans-serif">www</text></svg>',
    homeWifi: '<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M10 40A20 20 0 1 1 38 40"/><path d="M16 19a11 11 0 0 1 16 0M20 23a5.5 5.5 0 0 1 8 0"/><path d="M15 33l9-8 9 8v9H15z" fill="currentColor" stroke="none"/><circle cx="24" cy="26" r="2" fill="#fff" stroke="none"/></svg>',
    wifiRing: '<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="24" cy="24" r="21"/><path d="M12 20a17 17 0 0 1 24 0M16 25a11 11 0 0 1 16 0M20 30a5 5 0 0 1 8 0"/><circle cx="24" cy="34" r="2.2" fill="currentColor" stroke="none"/></svg>',
    tabHome: '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 15L16 4l13 11"/><path d="M7 12v16h18V12" fill="#dbe7fa"/></svg>',
    tabDevices: '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="13" y="4" width="13" height="21" rx="2"/><path d="M3 15h12v12H3z"/><path d="M2 27h28"/></svg>',
    tabTips: '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 19a8.5 8.5 0 1 1 11 0c-1 .9-1.5 2-1.5 3.3V23h-8v-.7c0-1.3-.5-2.4-1.5-3.3z"/><path d="M12.5 27h7M14 30h4"/></svg>',
    tabFamily: '<svg viewBox="0 0 36 32" width="36" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="8" r="4.5"/><circle cx="26" cy="8" r="4.5"/><circle cx="18" cy="16" r="4"/><path d="M2 26c0-5 3.5-8 8-8 2 0 3.6.6 4.8 1.6M34 26c0-5-3.5-8-8-8-2 0-3.6.6-4.8 1.6M10 30c0-4 3.5-7 8-7s8 3 8 7z" stroke-linejoin="round"/></svg>',
    tabSettings: '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13.5 3h5l.8 3.4 2.6 1.5 3.3-1 2.5 4.3-2.5 2.4v3l2.5 2.4-2.5 4.3-3.3-1-2.6 1.5-.8 3.4h-5l-.8-3.4-2.6-1.5-3.3 1-2.5-4.3 2.5-2.4v-3L3.8 11.2l2.5-4.3 3.3 1 2.6-1.5z"/><circle cx="16" cy="16" r="4.5"/></svg>',
  };

  // Live traffic chart: scrolls left continuously; download (blue) and upload (green) in Kbps
  function startTrafficChart(canvas, onValue) {
    const W = 416, H = 253, N = 70, STEP = 600;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Starts like the design: quiet on the left, a burst on the right
    const down = [], up = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const burst = t < .62 ? 0 : t > .86 && t < .93 ? 900 * Math.sin((t - .86) / .07 * Math.PI) : 90 * Math.random() * (t > .7 ? 2 : 1);
      down.push(Math.max(0, burst + (t < .62 ? Math.random() * 2 : 0)));
      up.push(down[i] * (.25 + Math.random() * .2));
    }

    let burstLeft = 0, burstPeak = 0;
    function nextValue() {
      if (burstLeft <= 0 && Math.random() < .12) { burstLeft = 4 + Math.floor(Math.random() * 6); burstPeak = 150 + Math.random() * 850; }
      let v;
      if (burstLeft > 0) { v = burstPeak * (.4 + Math.random() * .6); burstLeft--; }
      else v = Math.random() < .5 ? Math.random() * 6 : 20 + Math.random() * 80;
      return v;
    }

    let last = performance.now(), offset = 0, raf, scale = 1000;
    function path(vals, top) {
      const dx = W / (N - 2);
      const pts = vals.map((v, i) => [i * dx - offset * dx, H - 2 - Math.min(v / top, 1) * (H - 16)]);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], H);
      ctx.lineTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        const cx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cx, y0, cx, y1, x1, y1);
      }
      return pts;
    }
    function fill(vals, top, fillColor, lineColor) {
      const pts = path(vals, top);
      ctx.lineTo(pts[pts.length - 1][0], H);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      path(vals, top);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    function frame(now) {
      offset += (now - last) / STEP;
      last = now;
      while (offset >= 1) {
        offset -= 1;
        down.shift(); up.shift();
        const d = nextValue();
        down.push(d);
        up.push(d * (.15 + Math.random() * .35));
        onValue(d, up[up.length - 1]);
      }
      // Ease the vertical scale toward the visible peak
      const peak = Math.max(60, ...down) * 1.08;
      scale += (peak - scale) * .05;
      ctx.clearRect(0, 0, W, H);
      fill(down, scale, 'rgba(120, 200, 245, .75)', '#5bb8ee');
      fill(up, scale, 'rgba(126, 216, 138, .7)', '#62c96f');
      ctx.fillStyle = '#5ec43c';
      ctx.fillRect(0, H - 2, W, 1.5);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(t => { last = t; frame(t); });
    return () => cancelAnimationFrame(raf);
  }

  const formatRate = kbps => kbps >= 1000
    ? `${(kbps / 1000).toFixed(kbps >= 10000 ? 1 : 2)}<small>Mbps</small>`
    : `${kbps >= 100 ? kbps.toFixed(0) : kbps >= 10 ? kbps.toFixed(1) : kbps.toFixed(2)}<small>Kbps</small>`;

  window.QIS_SCREENS = [
    {
      id: 'opening',
      code: '1_010',
      name: '啟動頁',
      description: '啟動頁：打開 App 的第一個畫面，選擇「設定新網路」或「管理已連接的路由器」',
      figmaNode: '711:109',
      render: () => `
        <div class="opening-hero">
          <img src="assets/opening-hero.webp" alt="手機、電腦等各種裝置透過路由器連上網路" width="722" height="902">
        </div>

        <div class="opening-actions">
          <button class="action-card" data-go="series">
            <span class="action-icon">${ICON.plus}</span>
            <span class="action-text">
              <span class="action-title">設定</span>
              <span class="action-sub">設定新網路</span>
            </span>
            <span class="chevron">${ICON.chevron}</span>
          </button>
          <button class="action-card" data-go="manage" data-label="管理">
            <span class="action-icon">${ICON.login}</span>
            <span class="action-text">
              <span class="action-title">管理</span>
              <span class="action-sub">管理已連接的路由器</span>
            </span>
            <span class="chevron">${ICON.chevron}</span>
          </button>
        </div>

        <div class="opening-links">
          <button class="text-link" data-go="feedback">問題回報</button>
          <button class="text-link" data-go="login">帳號登入</button>
        </div>
      `,
    },
    {
      id: 'series',
      code: '1_020',
      name: '選擇系列裝置',
      description: '選擇設定裝置：選要設定的產品系列（無線路由器 / ZenWiFi / Lyra）',
      figmaNode: '711:111',
      render: () => `
        <header class="navbar">
          <button class="navbar-btn" data-go="opening" aria-label="關閉">${ICON.close}</button>
          <h1 class="navbar-title">選擇設定裝置</h1>
        </header>

        <div class="series-list">
          ${[
            {
              to: 'series-router',
              title: '華碩無線路由器',
              models: 'RT-AX86U、GT-BE98、RT-BE96U、TUF-AX5400、GT6 ...等',
              devices: ['router', 'gaming', 'router-wide', 'gaming-cube'],
            },
            {
              to: 'series-zenwifi',
              title: '華碩 ZenWiFi 系列',
              models: 'ZenWiFi AX、XD6、XT9、ET9、Pro XT12/ET12、BQ16/BQ16 Pro 等',
              devices: ['cube-white', 'tower-white', 'mini-white', 'slim-white', 'tower-black'],
            },
            {
              to: 'series-lyra',
              title: '華碩 Lyra 系列',
              models: 'Lyra, Lyra Mini, Lyra Trio, Lyra Voice',
              devices: ['disc', 'trio', 'bar'],
            },
          ].map(c => `
            <button class="series-card" data-go="${c.to}" data-label="${c.title}">
              <span class="series-title">${c.title}</span>
              <span class="series-models">${c.models}</span>
              <span class="series-devices">${c.devices.map(device).join('')}</span>
              <span class="chevron">${ICON.chevron}</span>
            </button>
          `).join('')}
        </div>
      `,
    },
    {
      id: 'series-zenwifi',
      code: '1_030',
      name: '選擇 ZenWiFi 裝置',
      description: '華碩 ZenWiFi 系列：從清單中點選要設定的 ZenWiFi 型號',
      figmaNode: '711:115',
      theme: 'light',
      render: () => `
        <header class="navbar">
          <button class="navbar-btn" data-go="series" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">華碩 ZenWiFi 系列</h1>
        </header>

        <div class="scroll-body">
          <div class="model-grid">
            ${[
              ['BD5 Outdoor', 'slim-white'],
              ['BD4 Outdoor', 'slim-white'],
              ['BE5000', 'cube-white'],
              ['BE3600', 'cube-white'],
              ['BD5', 'cube-white'],
              ['BD4', 'cube-white'],
              ['BE14000', 'tower-white'],
              ['BT8P', 'tower-white'],
              ['BT6/BT8', 'tower-white'],
              ['BT10', 'tower-white'],
              ['BQ16 Pro/BE30000', 'tower-white'],
              ['BQ16', 'tower-white'],
              ['ET9/AXE7800', 'cube-white'],
              ['Pro ET12', 'tower-black'],
              ['Pro XT12', 'tower-black'],
            ].map(([model, type]) => `
              <button class="model-tile" data-go="led-check" data-label="${model}">
                <span class="model-img">${device(type)}</span>
                <span class="model-name">${model}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `,
    },
    {
      id: 'led-check',
      code: '1_040',
      name: '燈號顯示頁',
      description: '確認燈號：請使用者看路由器的燈，從呼吸綠燈變成恆亮藍燈才能開始設定',
      figmaNode: '1867:1962',
      theme: 'light',
      render: () => `
        <header class="navbar">
          <h1 class="navbar-title navbar-title-plain">系統設定</h1>
        </header>

        <div class="led-body">
          <img class="led-device" src="assets/zenwifi-device.png" alt="ZenWiFi 路由器" width="120" height="146">
          <h2 class="led-heading">Please check the indicator lights on your router.</h2>

          <ol class="led-steps">
            <li class="led-step">
              <span class="led-swatch led-swatch-green led-breathing"></span>
              <span class="led-text">
                <span class="led-name">Breathing Green</span>
                <span class="led-desc">Your router is starting up. Please wait until the light becomes solid.</span>
              </span>
            </li>
            <li class="led-step">
              <span class="led-swatch led-swatch-blue"></span>
              <span class="led-text">
                <span class="led-name">Solid Blue</span>
                <span class="led-desc">Ready for setup.</span>
              </span>
            </li>
          </ol>

          <div class="led-actions">
            <label class="checkbox">
              <input type="checkbox">
              <span class="checkbox-box"></span>
              <span>I confirm it is solid blue light on the router.</span>
            </label>
            <button class="btn-primary" data-go="qr-intro">Next</button>
            <button class="text-link" data-go="led-not-blue">It is not solid blue light.</button>
          </div>
        </div>
      `,
    },
    {
      id: 'qr-intro',
      code: '1_050',
      name: 'QR Code 找裝置',
      description: '掃描 QR Code：說明路由器上的 QR Code 在哪裡，選擇用相機掃描或手動連 WiFi',
      figmaNode: '711:117',
      theme: 'light',
      render: () => `
        <header class="navbar">
          <button class="navbar-btn" data-go="led-check" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">華碩 ZenWiFi 系列</h1>
          <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.help}</button>
        </header>

        <div class="qr-body">
          <p class="qr-subtitle">掃描 ASUS Router 上的 QR Code。</p>

          <div class="qr-illust" aria-hidden="true">
            <img src="assets/zenwifi-device.png" alt="" width="120" height="146">
            <span class="qr-sticker">${QR_PLACEHOLDER}</span>
          </div>

          <div class="qr-hint">
            <p>在您的 ASUS 路由器上可以找到 QR Code。</p>
            <ol>
              <li>在可拆除的透明塑膠環上。</li>
              <li>在背面/底部的標籤上。</li>
            </ol>
          </div>

          <div class="qr-actions">
            <button class="pill-btn" data-go="qr-scan">${ICON.qr}<span>啟用相機和掃描</span></button>
            <button class="pill-btn" data-go="manual-wifi" data-label="手動 WiFi 連線">${ICON.wifiSolid}<span>手動 WiFi 連線</span></button>
            <button class="text-link text-link-small" data-go="setup-guide">設定指南</button>
          </div>
        </div>
      `,
    },
    {
      id: 'qr-scan',
      code: '1_060',
      name: '啟用相機掃描',
      description: '相機掃描：把相機對準路由器上的 QR Code，掃到後系統詢問是否加入路由器的 Wi-Fi',
      figmaNode: '711:155',
      theme: 'light',
      render: () => `
        <header class="navbar">
          <button class="navbar-btn" data-go="qr-intro" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">連線到ASUS Router</h1>
        </header>

        <div class="scan-body">
          <p class="qr-subtitle">將相機對準 QR Code。</p>

          <button class="scan-view" data-action="scan" aria-label="模擬掃描到 QR Code">
            <span class="scan-feed">相機畫面</span>
            <span class="scan-line"></span>
            <span class="scan-corner tl"></span><span class="scan-corner tr"></span>
            <span class="scan-corner bl"></span><span class="scan-corner br"></span>
          </button>

          <div class="scan-hint">
            <p>在您的 ASUS 路由器上可以找到 QR Code。</p>
            <p>1. 在可拆除的透明塑膠環上。<br>2. 在背面/底部的標籤上。</p>
            <p>確定您在光線充足的環境下進行掃描。</p>
          </div>

          <div class="scan-actions">
            <button class="pill-btn" data-go="manual-wifi" data-label="手動 WiFi 連線">${ICON.wifiSolid}<span>手動 WiFi 連線</span></button>
          </div>
        </div>

        <!-- Simulated iOS system alert shown once the QR code is "found" -->
        <div class="ios-alert-layer" hidden>
          <div class="ios-alert" role="alertdialog" aria-labelledby="join-wifi-title">
            <p class="ios-alert-title" id="join-wifi-title">「華碩路由器」想要<br>加入 Wi-Fi 網路「ASUS_14_BT8」嗎？</p>
            <div class="ios-alert-buttons">
              <button data-action="cancel">取消</button>
              <button data-go="detecting">加入</button>
            </div>
          </div>
        </div>
      `,
      // Pretend the camera finds the QR code after a moment (or right away on tap)
      mount: el => {
        const layer = el.querySelector('.ios-alert-layer');
        let timer;
        const found = () => { clearTimeout(timer); layer.hidden = false; el.classList.add('scan-found'); };
        const rescan = () => { layer.hidden = true; el.classList.remove('scan-found'); timer = setTimeout(found, 2500); };
        el.querySelector('[data-action="scan"]').addEventListener('click', found);
        el.querySelector('[data-action="cancel"]').addEventListener('click', rescan);
        rescan();
        return () => clearTimeout(timer);
      },
    },
    {
      id: 'detecting',
      code: '1_070',
      name: '偵測路由器',
      description: '偵測中：加入路由器的 Wi-Fi 後，App 正在搜尋 ASUS 路由器',
      figmaNode: '711:107',
      theme: 'light',
      render: () => `
        <header class="navbar">
          <h1 class="navbar-title">Detecting</h1>
        </header>

        <div class="detecting-body">
          <p class="detecting-text">Searching for ASUS router...</p>
          <span class="ios-spinner" role="progressbar" aria-label="搜尋中">${'<i></i>'.repeat(8)}</span>
        </div>
      `,
      // Router "found" after ~2s; replace so Back from the guide skips this screen
      mount: () => {
        const timer = setTimeout(() => location.replace('#guide-1'), 2000);
        return () => clearTimeout(timer);
      },
    },
    ...[
      {
        code: '1_080',
        title: 'Position AiMesh devices Properly',
        desc: 'Ensure AiMesh devices are in an open area and on a flat hard surface.',
        summary: '擺放位置：AiMesh 裝置要放在空曠處、平坦堅硬的表面上',
        figmaNode: '802:285',
        img: 'guide-1.jpg', w: 406, h: 334, top: 19,
      },
      {
        code: '1_090',
        title: 'Maintain Proper Distance',
        desc: 'Place AiMesh devices within 3 meters of each other.',
        summary: '保持距離：AiMesh 裝置之間距離 3 公尺以內',
        figmaNode: '802:266',
        img: 'guide-2.jpg', w: 422, h: 340, top: 19,
      },
      {
        code: '1_100',
        title: 'Avoid Signal Interference',
        desc: 'Keep the AiMesh devices away from appliances and devices that use the 2.4GHz band to avoid interference.',
        summary: '避免干擾：遠離使用 2.4GHz 頻段的家電和裝置',
        figmaNode: '802:246',
        img: 'guide-3.jpg', w: 422, h: 335, top: 19,
      },
      {
        code: '1_110',
        title: 'Power on AiMesh Node',
        desc: 'Turn on the node. It will automatically look for the AiMesh router, and the light will blink blue while connecting.',
        summary: '開啟節點電源：節點會自動尋找 AiMesh 路由器，連線時燈號閃藍燈',
        figmaNode: '802:221',
        img: 'guide-4.jpg', w: 422, h: 284, top: 40,
        extra: `
          <ul class="guide-legend">
            <li><span class="led-swatch-sm led-swatch-green"></span>AiMesh node is starting up.</li>
            <li><span class="led-swatch-sm led-swatch-brand"></span>AiMesh node is syncing with the AiMesh router.</li>
          </ul>
          <button class="guide-link" data-go="led-not-match">LED Color Not Matching Above?</button>
        `,
      },
    ].map((g, i, all) => ({
      id: `guide-${i + 1}`,
      code: g.code,
      name: `設定指南 ${i + 1}/${all.length}`,
      description: `設定指南 ${i + 1}/${all.length}：${g.summary}`,
      figmaNode: g.figmaNode,
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="${i === 0 ? 'qr-scan' : 'back'}" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">Setup Guide</h1>
          <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
        </header>

        <div class="guide-body">
          <div class="guide-illust">
            <img src="assets/${g.img}" alt="" width="${g.w}" height="${g.h}" style="margin-top:${g.top}px">
          </div>
          <h2 class="guide-title">${g.title}</h2>
          <p class="guide-desc">${g.desc}</p>
          ${g.extra || ''}
          <button class="btn-brand" data-go="${i + 1 < all.length ? `guide-${i + 2}` : 'welcome'}" data-label="Next">Next</button>
        </div>
      `,
    })),
    {
      id: 'welcome',
      code: '1_120',
      name: '安裝歡迎頁',
      description: '安裝歡迎頁：顯示偵測到的機型 ZenWiFi BT8，按 Get Started 開始設定',
      figmaNode: '757:192',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title navbar-title-bold">System Setup</h1>
          <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
        </header>

        <div class="welcome-body">
          <img class="welcome-device" src="assets/bt8-3pack.jpg" alt="ZenWiFi BT8 三入組" width="276" height="176">
          <h2 class="welcome-model">ZenWiFi BT8</h2>
          <button class="btn-brand welcome-start" data-decide="wan">Get Started</button>
          <button class="guide-link welcome-advanced" data-go="advanced-settings">Advanced Settings</button>
        </div>
      `,
    },
    {
      id: 'wan-detecting',
      code: '1_130',
      name: '偵測網路連線',
      description: 'WAN 偵測中：已偵測到 WAN（網路線已接），正在檢查網際網路連線狀態',
      figmaNode: '757:189',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn navbar-btn-ink" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title navbar-title-bold">System Setup</h1>
          <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
        </header>

        <div class="welcome-body">
          <img class="welcome-device" src="assets/bt8-3pack.jpg" alt="ZenWiFi BT8 三入組" width="276" height="176">
          <h2 class="welcome-model">ZenWiFi BT8</h2>
          <div class="progress" role="progressbar" aria-label="偵測網路連線"><span class="progress-fill"></span></div>
          <p class="wan-status">Detecting your Internet<br>connection status...</p>
          <button class="btn-brand welcome-start" disabled>Get Started</button>
          <span class="guide-link welcome-advanced is-disabled">Advanced Settings</span>
        </div>
      `,
      // Internet check finishes with the progress bar (4s), then on to WiFi setup
      mount: () => {
        const timer = setTimeout(() => location.replace('#setup-ssid'), 4200);
        return () => clearTimeout(timer);
      },
    },
    {
      id: 'setup-ssid',
      code: '1_140',
      name: '建立 WiFi 網路',
      description: '建立 WiFi 網路：設定主要 WiFi 的名稱（SSID）和密碼（已預先填好）',
      figmaNode: '757:185',
      theme: 'light',
      render: () => `
        ${setupHeader('welcome')}
        <div class="setup-body">
          <span class="setup-icon">${SETUP_ICON.wifi}</span>
          <h2 class="setup-title">Create WiFi Network</h2>
          <p class="setup-sub">Personalize your WiFi network name(SSID)<br>and password</p>
          <div class="setup-fields">
            ${field({ key: 'ssid', label: 'WiFi Network Name (SSID)', clear: true })}
            ${field({ key: 'wifiPassword', label: 'WiFi Network Password', type: 'password', strength: true })}
            <label class="checkbox checkbox-small">
              <input type="checkbox" data-key="separate"${FORM.separate ? ' checked' : ''}>
              <span class="checkbox-box"></span>
              <span>Separate WiFi network</span>
            </label>
          </div>
          <button class="btn-brand setup-next" data-go="setup-iot">Next</button>
        </div>
      `,
      mount: el => bindForm(el, () => {
        el.querySelector('.setup-next').disabled = !FORM.ssid || passwordScore(FORM.wifiPassword) < 2;
      }),
    },
    {
      id: 'setup-iot',
      code: '1_150',
      name: '建立 IoT 網路',
      description: '建立 IoT 網路：為 IoT／舊裝置另建一個 WiFi，名稱預設為主網路名稱加 _IoT，可稍後再設',
      figmaNode: '757:182',
      theme: 'light',
      render: () => {
        if (!FORM.iotSsid) FORM.iotSsid = `${FORM.ssid}_IoT`;
        return `
        ${setupHeader('back')}
        <div class="setup-body">
          <span class="setup-icon">${SETUP_ICON.iot}</span>
          <h2 class="setup-title">Create Iot Network</h2>
          <p class="setup-sub">The main wireless network has been set.<br>Some IoT or Legacy devices may experience compatibility issues with your WiFi7 advanced technology. To ensure seamless operation, we recommend creating a separate network for these devices.</p>
          <div class="setup-fields setup-fields-iot">
            ${field({ key: 'iotSsid', label: 'WiFi Network Name (SSID)', clear: true })}
            ${field({ key: 'iotPassword', label: 'WiFi Network Password', type: 'password', strength: true })}
          </div>
          <button class="btn-brand setup-next" data-go="setup-account">Next</button>
          <button class="setup-later" data-go="setup-account">Set Up Later</button>
        </div>
      `;
      },
      mount: el => bindForm(el, () => {
        el.querySelector('.setup-next').disabled = !FORM.iotSsid || passwordScore(FORM.iotPassword) < 2;
      }),
    },
    {
      id: 'setup-account',
      code: '1_160',
      name: '設定登入帳號',
      description: '設定本機登入帳號：設定路由器管理介面的帳號和密碼（已預先填好）',
      figmaNode: '757:179',
      theme: 'light',
      render: () => `
        ${setupHeader('back')}
        <div class="setup-body">
          <span class="setup-icon">${SETUP_ICON.user}</span>
          <h2 class="setup-title">Set up Local Login Account</h2>
          <p class="setup-sub">Set up your ASUS networking device's admin<br>username and password.</p>
          <div class="setup-fields setup-fields-account">
            ${field({ key: 'username', label: 'Username' })}
            ${field({ key: 'adminPassword', label: 'Password', type: 'password', strength: true })}
            ${field({ key: 'adminConfirm', label: 'Confirm Password', type: 'password' })}
            <p class="field-error" hidden>Passwords do not match.</p>
          </div>
          <button class="btn-brand setup-next" data-go="setup-apply">Next</button>
        </div>
      `,
      mount: el => bindForm(el, () => {
        const mismatch = FORM.adminConfirm !== FORM.adminPassword;
        el.querySelector('.field-error').hidden = !mismatch || !FORM.adminConfirm;
        el.querySelector('.setup-next').disabled = !FORM.username || passwordScore(FORM.adminPassword) < 2 || mismatch;
      }),
    },
    {
      id: 'setup-apply',
      code: '1_170',
      name: '套用設定',
      description: '套用設定：路由器正在套用剛才的 WiFi 和帳號設定',
      figmaNode: '757:176',
      theme: 'light',
      render: () => `
        ${setupHeader(null)}
        <div class="welcome-body">
          <img class="apply-device" src="assets/zenwifi-device.png" alt="ZenWiFi 路由器" width="166" height="202">
          <h2 class="apply-title">Setting up your network</h2>
          <div class="progress apply-progress" role="progressbar" aria-label="套用設定"><span class="progress-fill"></span></div>
          <p class="apply-status">Now applying your settings.</p>
        </div>
      `,
      mount: () => {
        const timer = setTimeout(() => location.replace('#mesh-1'), 6200);
        return () => clearTimeout(timer);
      },
    },
    // AiMesh build-up: one progress bar that carries on across the three steps
    ...[
      {
        code: '1_180', figmaNode: '803:414', img: 'mesh-1.jpg', h: 338, top: 15, from: 0, to: 33,
        title: 'Establishing AiMesh Network',
        desc: 'Keep the AiMesh devices away from appliances and devices that use the 2.4GHz band to avoid interference.',
        summary: '建立 AiMesh 網路：路由器和節點開始連線',
      },
      {
        code: '1_190', figmaNode: '803:400', img: 'mesh-2.jpg', h: 336, top: 14, from: 33, to: 66,
        title: 'AiMesh Network optimization',
        desc: 'The AiMesh node(s) are now automatically joining the network, no manual setup is needed.',
        summary: 'AiMesh 最佳化：節點自動加入網路，不需要手動設定',
      },
      {
        code: '1_200', figmaNode: '803:383', img: 'mesh-3.jpg', h: 340, top: 20, from: 66, to: 100,
        title: 'AiMesh Network optimization',
        desc: 'We could run the optimization in the background so you can start browsing instantly.',
        summary: 'AiMesh 最佳化：可以改到背景執行，先開始上網',
        background: true,
      },
    ].map((m, i, all) => ({
      id: `mesh-${i + 1}`,
      code: m.code,
      name: `AiMesh 建立中 ${i + 1}/${all.length}`,
      description: m.summary,
      figmaNode: m.figmaNode,
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">Setup Guide</h1>
        </header>

        <div class="guide-body">
          <div class="guide-illust">
            <img src="assets/${m.img}" alt="" width="422" height="${m.h}" style="margin-top:${m.top}px">
          </div>
          <h2 class="guide-title guide-title-plain">${m.title}</h2>
          <div class="progress mesh-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.to}">
            <span class="progress-fill" style="--from:${m.from}%;--to:${m.to}%"></span>
          </div>
          <p class="guide-desc">${m.desc}</p>
          ${m.background ? '<button class="mesh-background" data-go="internet-live">Run in background</button>' : ''}
        </div>
      `,
      // Each step takes ~3s, then the next one picks up the bar where this one stopped
      mount: () => {
        const timer = setTimeout(() => location.replace(`#${i + 1 < all.length ? `mesh-${i + 2}` : 'internet-live'}`), 3200);
        return () => clearTimeout(timer);
      },
    })),
    {
      id: 'internet-live',
      code: '1_210',
      name: '完成：網路已連線',
      description: '設定完成：網際網路已連線（Internet Connection is Live!）',
      figmaNode: '1867:2040',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <h1 class="navbar-title">Setup Guide</h1>
        </header>

        <div class="done-body">
          <div class="done-stage" aria-hidden="true">
            ${[0, 1, 2].map(n => `<span class="done-ripple" style="--n:${n}"></span>`).join('')}
            ${DONE_CONFETTI.map(([shape, color, x, y, r, d]) =>
              `<span class="confetti" style="--x:${x}px;--y:${y}px;--r:${r}deg;--d:${d}s;color:${color}">${CONFETTI_SHAPE[shape]}</span>`
            ).join('')}
            <span class="done-shelf"></span>
            <img class="done-router" src="assets/zenwifi-device.png" alt="" width="92" height="112">
            <span class="done-check"><svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="18" fill="#3bbf5a"/><path class="done-check-mark" d="M12 20.5l5.5 5.5L28.5 14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          </div>
          <h2 class="done-title">Internet Connection is Live!</h2>
          <button class="pill-btn done-next" data-go="summary">Next</button>
        </div>
      `,
    },
    {
      id: 'summary',
      code: '1_220',
      name: '設定摘要',
      description: '設定摘要：列出剛設定好的 WiFi 名稱／密碼、登入帳號和 IoT 訪客網路，按 Finish 完成',
      figmaNode: '819:320',
      theme: 'light',
      render: () => {
        const row = (icon, lines) => `<li class="summary-row">${icon}<span>${lines.map(([k, v]) => `${k} : <b>${esc(v)}</b>`).join('<br>')}</span></li>`;
        const wifi = band => row(SUMMARY_ICON.wifi(band, '#1b74e4'), [['WiFi Name', band === '2G' ? FORM.ssid : `${FORM.ssid}_${band}`], ['WiFi Password', FORM.wifiPassword]]);
        return `
        <header class="navbar navbar-guide">
          <h1 class="navbar-title navbar-title-bold">System Setup</h1>
        </header>

        <div class="summary-body">
          <img class="summary-device" src="assets/bt8-3pack.jpg" alt="ZenWiFi BT8 三入組" width="264" height="169">
          <section class="summary-section">
            <h2>Summary</h2>
            <ul>
              ${wifi('2G')}${wifi('5G')}${wifi('6G')}
              ${row(SUMMARY_ICON.user, [['Username', FORM.username], ['Password', FORM.adminPassword]])}
            </ul>
          </section>
          <section class="summary-section">
            <h2>Guest Network</h2>
            <ul>
              ${row(SUMMARY_ICON.wifi('IOT', '#5ec43c'), [['WiFi Name', FORM.iotSsid || `${FORM.ssid}_IoT`], ['WiFi Password', FORM.iotPassword]])}
            </ul>
          </section>
          <button class="btn-brand setup-next" data-go="home">Finish</button>
        </div>
      `;
      },
    },
    {
      id: 'home',
      code: '1_230',
      name: '首頁',
      description: '首頁：設定完成後進入 App 首頁，顯示路由器資訊和即時上傳／下載流量',
      figmaNode: '1728:569',
      theme: 'light',
      render: () => `
        <header class="home-top">
          <button class="home-avatar" data-go="account" data-label="帳號">${HOME_ICON.google}</button>
          <h1 class="home-title">首頁</h1>
          <div class="home-actions">
            <button data-go="router-info" data-label="資訊" aria-label="資訊">${HOME_ICON.info}</button>
            <button data-go="notifications" data-label="通知" aria-label="通知">${HOME_ICON.bell}</button>
            <button data-go="add-device" data-label="新增" aria-label="新增">${HOME_ICON.plus}</button>
          </div>
        </header>

        <div class="home-body">
          <section class="router-card">
            <button class="router-card-device" data-go="router-detail" data-label="ZenWiFi BT8">
              <img src="assets/zenwifi-device.png" alt="" width="36" height="44">
              <span>ZenWiFi BT8</span>
            </button>
            <button class="router-card-info" data-go="router-detail" data-label="區域網路 IP">
              <span class="rc-label">區域網路 IP <i>${HOME_ICON.chevrons}</i></span>
              <span class="rc-value">192.168.50.1</span>
              <span class="rc-label">無線網路名稱</span>
              <span class="rc-value">${esc(FORM.ssid)}</span>
            </button>
            <button class="router-card-speed" data-go="speed-test" data-label="速度測試" aria-label="速度測試">${HOME_ICON.gauge}</button>
          </section>

          <h2 class="traffic-title">即時流量</h2>
          <canvas class="traffic-chart" width="416" height="253" aria-label="即時上傳和下載流量圖"></canvas>

          <div class="traffic-stats">
            <div class="traffic-stat">${HOME_ICON.down}<span><em>下載</em><b class="rate-down">36.3<small>Kbps</small></b></span></div>
            <div class="traffic-stat">${HOME_ICON.up}<span><em>上傳</em><b class="rate-up">3.54<small>Kbps</small></b></span></div>
          </div>

          <div class="page-dots" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></div>

          <div class="home-shortcuts">
            <button class="on" data-go="internet-status" data-label="網際網路" aria-label="網際網路">${HOME_ICON.www}</button>
            <button data-go="aimesh" data-label="AiMesh" aria-label="AiMesh">${HOME_ICON.homeWifi}</button>
            <button data-go="wifi" data-label="無線網路" aria-label="無線網路">${HOME_ICON.wifiRing}</button>
          </div>
        </div>

        <nav class="tab-bar">
          <button class="tab on">${HOME_ICON.tabHome}<span>首頁</span></button>
          <button class="tab" data-go="devices" data-label="裝置">${HOME_ICON.tabDevices}<span>裝置</span><b class="tab-badge">2</b></button>
          <button class="tab" data-go="tips" data-label="提示">${HOME_ICON.tabTips}<span>提示</span></button>
          <button class="tab" data-go="family" data-label="家庭">${HOME_ICON.tabFamily}<span>家庭</span></button>
          <button class="tab" data-go="settings" data-label="設定">${HOME_ICON.tabSettings}<span>設定</span></button>
        </nav>
      `,
      mount: el => {
        const downEl = el.querySelector('.rate-down');
        const upEl = el.querySelector('.rate-up');
        return startTrafficChart(el.querySelector('.traffic-chart'), (d, u) => {
          downEl.innerHTML = formatRate(d);
          upEl.innerHTML = formatRate(u);
        });
      },
    },
  ];

  // Demo-only branch points; see app.js (data-decide="<name>")
  window.QIS_DECISIONS = {
    wan: {
      index: 0,
      label: 'WAN',
      title: '是否偵測到 WAN（網路線已接上）？',
      options: [
        { label: 'Yes · WAN Detected', short: 'Yes', value: 'yes', to: 'wan-detecting' },
        { label: 'No · WAN 未偵測到', short: 'No', value: 'no', to: 'wan-not-detected' },
      ],
    },
  };
})();
