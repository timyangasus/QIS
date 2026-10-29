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


  // Realistic-looking (but not scannable) 25×25 QR for the simulated camera feed
  const QR_CAMERA = (() => {
    const N = 25;
    let seed = 20260;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    const finder = (x, y) => `<path d="M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z M${x + 2} ${y + 2}h3v3h-3z" fill-rule="evenodd"/>`;
    let cells = '';
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (inFinder(x, y)) continue;
        const timing = (x === 6 || y === 6);
        const on = timing ? (x + y) % 2 === 0 : rand() < 0.48;
        if (on) cells += `M${x} ${y}h1v1h-1z`;
      }
    }
    const align = `<path d="M16 16h5v5h-5z M17 17v3h3v-3z M18 18h1v1h-1z" fill-rule="evenodd"/>`;
    return `<svg viewBox="-1 -1 ${N + 2} ${N + 2}" width="112" height="112" shape-rendering="crispEdges" fill="#111">
      <rect x="-1" y="-1" width="${N + 2}" height="${N + 2}" fill="#fff"/>
      ${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}${align}<path d="${cells}"/>
    </svg>`;
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
    // el is the shared screen container, so the listener is removed when the page unmounts
    const onInput = e => {
      const k = e.target.dataset.key;
      if (k) FORM[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      update();
    };
    el.addEventListener('input', onInput);
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
    return () => el.removeEventListener('input', onInput);
  }

  function setupHeader() {
    return `<header class="navbar navbar-guide">
      <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
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

  // 1_230 summary row icons: Wi-Fi with band label, user outline
  const SUMMARY_ICON = {
    wifi: (band, color) => `<span class="summary-icon" style="color:${color}" aria-hidden="true">
      <svg viewBox="0 0 30 22" width="30" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M3 8a17 17 0 0 1 24 0"/><path d="M7.5 12.5a10.5 10.5 0 0 1 15 0"/><path d="M12 17a4 4 0 0 1 6 0"/></svg>
      <em>${band}</em></span>`,
    user: `<span class="summary-icon" style="color:#1b74e4" aria-hidden="true"><svg viewBox="0 0 30 30" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><circle cx="15" cy="10" r="6"/><path d="M4 28c0-7 5-11 11-11s11 4 11 11z" stroke-linejoin="round"/></svg></span>`,
  };

  // ── 1_280 home dashboard icons ──
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

  // ── App pages after setup (1_280, 1_290, 1_360): shared top bar, router card, shortcuts, tab bar ──
  const homeTop = () => `
    <header class="home-top">
      <button class="home-back" data-go="back" aria-label="返回">${ICON.back}</button>
      <button class="home-avatar" data-go="account" data-label="帳號">${HOME_ICON.google}</button>
      <h1 class="home-title">首頁</h1>
      <div class="home-actions">
        <button data-go="router-info" data-label="資訊" aria-label="資訊">${HOME_ICON.info}</button>
        <button data-go="notifications" data-label="通知" aria-label="通知">${HOME_ICON.bell}</button>
        <button data-go="opening" aria-label="新增裝置（重新開始 QIS 設定）">${HOME_ICON.plus}</button>
      </div>
    </header>`;

  // connecting: the router is still coming online (狀態：正在連線…) instead of showing its LAN IP
  const routerCard = (connecting = false) => `
    <section class="router-card">
      <button class="router-card-device" data-go="router-detail" data-label="ZenWiFi BT8">
        <img src="assets/zenwifi-device.png" alt="" width="36" height="44">
        <span>ZenWiFi BT8</span>
      </button>
      <button class="router-card-info" data-go="router-detail" data-label="${connecting ? '狀態' : '區域網路 IP'}">
        <span class="rc-label">${connecting ? '狀態' : '區域網路 IP'} <i>${HOME_ICON.chevrons}</i></span>
        <span class="rc-value">${connecting ? '正在連線… <span class="rc-spin" aria-hidden="true"></span>' : '192.168.50.1'}</span>
        <span class="rc-label">無線網路名稱</span>
        <span class="rc-value">${esc(FORM.ssid)}</span>
      </button>
      <button class="router-card-speed" data-go="speed-test" data-label="速度測試" aria-label="速度測試">${HOME_ICON.gauge}</button>
    </section>`;

  const homeShortcuts = on => `
    <div class="home-shortcuts">
      <button${on === 'internet' ? ' class="on"' : ''} data-go="internet-status" data-label="網際網路" aria-label="網際網路">${HOME_ICON.www}</button>
      <button${on === 'aimesh' ? ' class="on"' : ''} data-go="aimesh" data-label="AiMesh" aria-label="AiMesh">${HOME_ICON.homeWifi}</button>
      <button data-go="wifi" data-label="無線網路" aria-label="無線網路">${HOME_ICON.wifiRing}</button>
    </div>`;

  const homeTabs = () => `
    <nav class="tab-bar">
      <button class="tab on">${HOME_ICON.tabHome}<span>首頁</span></button>
      <button class="tab" data-go="devices" data-label="裝置">${HOME_ICON.tabDevices}<span>裝置</span><b class="tab-badge">2</b></button>
      <button class="tab" data-go="tips" data-label="提示">${HOME_ICON.tabTips}<span>提示</span></button>
      <button class="tab" data-go="family" data-label="家庭">${HOME_ICON.tabFamily}<span>家庭</span></button>
      <button class="tab" data-go="settings" data-label="設定">${HOME_ICON.tabSettings}<span>設定</span></button>
    </nav>`;

  // 1_300 navbar: ‹ back, bold "System Setup", ?
  const systemSetupHeader = () => `
    <header class="navbar navbar-guide">
      <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
      <h1 class="navbar-title navbar-title-bold">System Setup</h1>
      <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
    </header>`;

  const AIMESH_ICON = {
    optimize: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9a7.5 7.5 0 0 0-13.6-1.8M5 15a7.5 7.5 0 0 0 13.6 1.8"/><path d="M5 4v3.5h3.5M19 20v-3.5h-3.5"/><circle cx="12" cy="12" r="2"/></svg>',
  };

  // 1_340 Feedback card icon, 1_350 clear-field button
  const FEEDBACK_ICON = '<svg viewBox="0 0 36 36" width="36" height="36" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><path d="M4 5h28v21H14l-8 6v-6H4z"/><path d="M18 10v8" stroke-linecap="round"/><circle cx="18" cy="22" r="1.3" fill="#fff" stroke="none"/></svg>';
  const FB_CLEAR = '<span class="fb-clear" aria-hidden="true"><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="8.5"/><path d="M7 7l6 6M13 7l-6 6" stroke-linecap="round"/></svg></span>';


  // The modem power-cycle pages are shared by two flows: right after 1_030 (setup), and when
  // 1_120 finds no WAN (wan), where each step is followed by a timed wait before continuing.
  let MODEM_FLOW = 'setup';

  // 1_125 Auto Detect → No: the "can't detect WAN" alert pops up over 1_125 (opening 1_125 first
  // when picked again from the demo bar on another page)
  let WAN_ALERT_PENDING = false;

  // After AiMesh (1_200): Internet Connected? → node 台數 (same options either way; see nodeCountAction).
  // INTERNET: answer to Internet Connected?; FINISH: which branch the 1_230 summary closes;
  // NODE_STATE: which 1_300 node status is shown — 'optimising' (moving blue line), 'weak' (yellow line,
  // connection quality can be improved) or 'offline' (grey line, not responding / no MAC address)
  let INTERNET = true;
  let FINISH = 'single';
  let NODE_STATE = 'optimising';
  // 1_230 product image: one BT8 when only the router is set up (node 台數 0), else the 3-pack
  let SINGLE_DEVICE = true;
  // Each node state has its own light guide after 1_300: optimising → 1_310 (blinking blue),
  // weak → 1_320 (yellow), not responding → 1_330 (power on)
  const NODE_STATUS = {
    optimising: { guide: 1, text: 'AiMesh Node is optimising.' },
    weak: { guide: 2, text: 'AiMesh Node connection quality can be improved.', warn: true },
    offline: { guide: 3, text: 'AiMesh Node is not responding. (No MAC address)', warn: true },
  };
  const afterMesh = () => window.QIS_decide('internet');
  // node 台數？ is asked after Internet Connected? either way.
  // With Internet: 0 台 → 1_210 (single); ≥ 1 台 → 1_220 (its Trouble shooting shows this node state).
  // Without: 0 台 → mobile data check; ≥ 1 台 → 1_300 node status.
  const nodeCountTarget = () => INTERNET ? 'internet-live-mesh' : 'node-status';
  const nodeCountAction = state => () => {
    SINGLE_DEVICE = !state;
    if (state) NODE_STATE = state;
    if (INTERNET) FINISH = state ? 'mesh' : 'single';
    else if (!state) window.QIS_decide('mobile');
  };
  function showWanAlert() {
    const alert = document.querySelector('.wan-type-alert');
    if (alert) return alert.classList.add('show');
    WAN_ALERT_PENDING = true;
    location.hash = 'wan-type';
  }

  // WAN flow only (1_120 → 2): the user may have already restarted the modem back at 1_030,
  // so each step says why it is needed again
  const MODEM_WHY = {
    waitOff: 'The modem needs a few minutes without power to fully reset and forget the device it was locked to. Plugging it in too soon may keep the old connection.',
    waitStart: 'Starting up and reconnecting to your Internet provider takes a few minutes. Once it finishes, your router can get an Internet address from it.',
  };

  // Small modem for the wait pages: 'off' = unplugged, all lights off; 'starting' = lights blinking
  function modemMini(mode) {
    const starting = mode === 'starting';
    const leds = ['POWER', 'DS', 'US', 'ONLINE'].map((name, i) => {
      const y = 48 + i * 15;
      return `
        <text x="22" y="${y + 2.5}" text-anchor="end" class="modem-mini-label">${name}</text>
        <circle cx="31" cy="${y}" r="3.2" class="modem-mini-led${starting ? ' is-blink' : ''}" style="--i:${i}"/>`;
    }).join('');
    return `
      <svg class="modem-mini" viewBox="0 0 240 150" width="240" height="150" aria-hidden="true">
        <ellipse cx="28" cy="140" rx="44" ry="5" fill="#e4e7ec"/>
        <rect x="2" y="10" width="54" height="128" rx="11" fill="#2b323b"/>
        <rect x="4" y="12" width="50" height="4" rx="2" fill="#3a434e"/>
        <rect x="10" y="22" width="38" height="108" rx="7" fill="#353d47"/>
        <text x="29" y="36" text-anchor="middle" class="modem-mini-name">MODEM</text>
        ${leds}
        ${starting ? `
          <path d="M56 120 C80 140 110 140 124 128" fill="none" stroke="#6f7780" stroke-width="4" stroke-linecap="round"/>
        ` : `
          <path d="M56 120 C80 146 150 146 176 126" fill="none" stroke="#6f7780" stroke-width="4" stroke-linecap="round"/>
          <g transform="translate(196 122) rotate(-12)">
            <rect x="-22" y="-7" width="18" height="14" rx="3" fill="#3a4452"/>
            <rect x="-5" y="-5" width="5" height="10" rx="1.5" fill="#5b6573"/>
            <rect x="0" y="-4" width="9" height="2.2" rx="1" fill="#a3abb5"/>
            <rect x="0" y="1.8" width="9" height="2.2" rx="1" fill="#a3abb5"/>
          </g>
        `}
        <text x="${starting ? 172 : 150}" y="${starting ? 66 : 56}" text-anchor="middle" class="modem-mini-tag${starting ? '' : ' is-off'}">${starting ? 'STARTING UP' : 'POWER OFF'}</text>
        <line x1="${starting ? 126 : 112}" x2="${starting ? 218 : 188}" y1="${starting ? 73 : 63}" y2="${starting ? 73 : 63}" class="modem-mini-dash"/>
        ${starting ? '<text x="172" y="88" text-anchor="middle" class="modem-mini-tag is-brand">LIGHTS MAY BLINK</text>' : ''}
      </svg>`;
  }

  // Wait page countdown. Demo: the first 10 s tick in real time, then the rest runs down in 3 s
  // so the grey → blue Continue can be shown without waiting minutes
  const REAL_SEC = 10;
  const FAST_MS = 3000;
  function startCountdown(el, totalSec) {
    const timeEl = el.querySelector('.wait-time');
    const fill = el.querySelector('.wait-progress .progress-fill');
    const btn = el.querySelector('.wait-continue');
    const fmt = sec => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
    const t0 = performance.now();
    let raf;
    const tick = now => {
      const ms = now - t0;
      const elapsed = ms < REAL_SEC * 1000 ? ms / 1000 : REAL_SEC + (totalSec - REAL_SEC) * (ms - REAL_SEC * 1000) / FAST_MS;
      const p = Math.min(1, elapsed / totalSec);
      timeEl.textContent = fmt(Math.ceil(totalSec * (1 - p)));
      fill.style.width = `${Math.max(3, p * 100)}%`;
      if (p < 1) raf = requestAnimationFrame(tick);
      else { btn.classList.remove('is-waiting'); el.querySelector('.wait-card').classList.add('is-done'); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }

  function waitPage({ title, label, totalSec, hint, mode, next, why }) {
    return `
      <header class="navbar navbar-guide">
        <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
        <h1 class="navbar-title">Setup Guide</h1>
        <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
      </header>

      <div class="guide-body">
        <div class="guide-illust wait-illust">
          <div class="wait-card">
            <p class="wait-label">${label}</p>
            <p class="wait-time">${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}</p>
            <div class="progress wait-progress"><div class="progress-fill"></div></div>
            <p class="wait-hint">${hint}</p>
            ${modemMini(mode)}
          </div>
        </div>
        <h2 class="guide-title">${title}</h2>
        <p class="modem-why">${MODEM_WHY[why]}</p>
        <button class="btn-brand wait-continue is-waiting" data-go="${next}" data-label="Continue">Continue</button>
      </div>`;
  }

  // 1_033 / 1_036 modem power-cycle illustration, drawn in the Setup Guide style
  // 1_033 flat illustrations in the 1_080–1_110 guide style (no background circle); one per step in the list
  // Each slide is its own <svg> with SMIL timed from 0; showing a slide swaps in a fresh copy so it replays from the start
  const UNPLUG_OUTLET = (x, y) => `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="46" height="66" rx="9" fill="#f4f5f7" stroke="#d5d9de" stroke-width="2"/>
      <rect x="12" y="20" width="5" height="12" rx="2" fill="#b9bfc7"/>
      <rect x="29" y="20" width="5" height="12" rx="2" fill="#b9bfc7"/>
      <circle cx="23" cy="46" r="4" fill="#b9bfc7"/>
    </g>`;
  const UNPLUG_OFF_BADGE = (x, y, at) => `
    <g transform="translate(${x} ${y})" opacity="0">
      <animate attributeName="opacity" from="0" to="1" begin="${at}s" dur=".3s" fill="freeze"/>
      <circle r="19" fill="#fff" stroke="#e8eaee" stroke-width="2"/>
      <path d="M-6.5 -5.5 A9 9 0 1 0 6.5 -5.5" fill="none" stroke="#9aa2ac" stroke-width="3" stroke-linecap="round"/>
      <path d="M0 -11 V-1" stroke="#9aa2ac" stroke-width="3" stroke-linecap="round"/>
      <path d="M-12 -12 L12 12" stroke="#e5413b" stroke-width="3.5" stroke-linecap="round"/>
    </g>`;
  // Green LED that blinks until the power is pulled at `off` s, then stays grey
  const UNPLUG_LED = (cx, cy, r, off, i) => `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#5ee250">
      <animate attributeName="opacity" values="1;.25;1" dur="${0.6 + i * 0.15}s" begin="0s" end="${off}s" repeatCount="indefinite"/>
      <set attributeName="fill" to="#d0d4da" begin="${off}s" fill="freeze"/>
    </circle>`;
  // Plug pointing down into the power strip; lifts out at `at` s, its cord bending with it
  const UNPLUG_STRIP_PLUG = (x, cord, at) => {
    const d = top => cord(top);
    return `
      <path d="${d(298)}" fill="none" stroke="#aab1ba" stroke-width="3.5" stroke-linecap="round">
        <animate attributeName="d" from="${d(298)}" to="${d(264)}" begin="${at}s" dur=".5s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>
      </path>
      <g transform="translate(${x} 298)">
        <animateTransform attributeName="transform" type="translate" from="${x} 298" to="${x} 264" begin="${at}s" dur=".5s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>
        <rect x="-11" y="0" width="22" height="20" rx="5" fill="#d3d7dd"/>
        <rect x="-7" y="20" width="4" height="9" rx="1.5" fill="#a9b0b9"/>
        <rect x="3" y="20" width="4" height="9" rx="1.5" fill="#a9b0b9"/>
      </g>`;
  };
  const UNPLUG_FLOOR = '<rect x="26" y="300" width="370" height="8" rx="4" fill="#ececef"/>';
  // 1_033 step 1: plug starts in the wall; the arrow fades in and nudges left twice, then the plug pulls out.
  // Then the same for the backup battery (⚡, not charge bars): arrow nudges, battery slides out of its bay and fades
  const PLUG_IN = 316, PLUG_OUT = 286;
  const plugCord = x => `M205 276 C 236 276 238 296 262 296 C 290 296 ${x - 14} 238 ${x} 238`;
  const UNPLUG_ILLUST = [
    `<svg viewBox="0 0 422 340" width="422" height="340" aria-hidden="true">
      ${UNPLUG_FLOOR}
      <rect x="208" y="98" width="20" height="200" rx="8" fill="#e6e8ec"/>
      <rect x="128" y="88" width="90" height="212" rx="14" fill="#fff" stroke="#d9dce1" stroke-width="2"/>
      <rect x="146" y="114" width="18" height="16" rx="3" fill="#c9ced5"/>
      <rect x="146" y="138" width="18" height="16" rx="3" fill="#f5c84c"/>
      <rect x="146" y="160" width="18" height="16" rx="3" fill="#f5c84c"/>
      <rect x="146" y="182" width="18" height="16" rx="3" fill="#f5c84c"/>
      <rect x="146" y="204" width="18" height="16" rx="3" fill="#3aa0e0"/>
      <rect x="140" y="240" width="46" height="26" rx="4" fill="#f2f3f5" stroke="#c9ced5" stroke-width="2" stroke-dasharray="4 3"/>
      <circle cx="198" cy="276" r="7" fill="#e4e6ea" stroke="#c4c9d0" stroke-width="2"/>
      <path d="${plugCord(PLUG_IN)}" fill="none" stroke="#c4c9d0" stroke-width="4" stroke-linecap="round">
        <animate attributeName="d" from="${plugCord(PLUG_IN)}" to="${plugCord(PLUG_OUT)}" begin="1.9s" dur=".6s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>
      </path>
      <g transform="translate(${PLUG_IN} 238)">
        <animateTransform attributeName="transform" type="translate" from="${PLUG_IN} 238" to="${PLUG_OUT} 238" begin="1.9s" dur=".6s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>
        <rect x="0" y="-13" width="30" height="26" rx="6" fill="#d3d7dd"/>
        <rect x="30" y="-8" width="11" height="4" rx="1.5" fill="#a9b0b9"/>
        <rect x="30" y="4" width="11" height="4" rx="1.5" fill="#a9b0b9"/>
      </g>
      ${UNPLUG_OUTLET(346, 205)}
      <g opacity="0">
        <animate attributeName="opacity" from="0" to="1" begin=".2s" dur=".3s" fill="freeze"/>
        <animate attributeName="opacity" from="1" to="0" begin="1.7s" dur=".3s" fill="freeze"/>
        <g transform="translate(338 186)">
          <animateTransform attributeName="transform" type="translate" values="338 186;326 186;338 186;326 186;338 186" begin=".5s" dur="1.1s" fill="freeze"/>
          <path d="M0 0 H-34" stroke="#f5c84c" stroke-width="7" stroke-linecap="round"/>
          <path d="M-26 -11 L-40 0 L-26 11" fill="none" stroke="#f5c84c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
      <g transform="translate(142 241)">
        <animateTransform attributeName="transform" type="translate" from="142 241" to="58 241" begin="4.4s" dur=".6s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>
        <animate attributeName="opacity" from="1" to="0" begin="5s" dur=".4s" fill="freeze"/>
        <rect x="0" y="0" width="38" height="24" rx="4" fill="#fff" stroke="#9aa2ac" stroke-width="2.5"/>
        <rect x="38" y="7" width="4" height="10" rx="1.5" fill="#9aa2ac"/>
        <path d="M21 3 L12 13.5 H18.5 L16 21 L26 10 H19.5 Z" fill="#f5c84c"/>
      </g>
      <g opacity="0">
        <animate attributeName="opacity" from="0" to="1" begin="2.7s" dur=".3s" fill="freeze"/>
        <animate attributeName="opacity" from="1" to="0" begin="4.2s" dur=".3s" fill="freeze"/>
        <g transform="translate(122 214)">
          <animateTransform attributeName="transform" type="translate" values="122 214;110 214;122 214;110 214;122 214" begin="3s" dur="1.1s" fill="freeze"/>
          <path d="M0 0 H-34" stroke="#f5c84c" stroke-width="7" stroke-linecap="round"/>
          <path d="M-26 -11 L-40 0 L-26 11" fill="none" stroke="#f5c84c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>`,
    // 1_033 step 2: old router and extender on the modem; lights blink, plugs lift out of the strip, lights go out
    `<svg viewBox="0 0 422 340" width="422" height="340" aria-hidden="true">
      ${UNPLUG_FLOOR}
      <path d="M176 268 C 160 268 162 262 146 262" fill="none" stroke="#3aa0e0" stroke-width="4" stroke-linecap="round"/>
      <path d="M236 268 C 262 268 264 262 290 262" fill="none" stroke="#3aa0e0" stroke-width="4" stroke-linecap="round"/>
      <rect x="226" y="158" width="14" height="140" rx="6" fill="#e6e8ec"/>
      <rect x="176" y="150" width="56" height="150" rx="12" fill="#fff" stroke="#d9dce1" stroke-width="2"/>
      <rect x="188" y="170" width="14" height="12" rx="2.5" fill="#f5c84c"/>
      <rect x="188" y="188" width="14" height="12" rx="2.5" fill="#f5c84c"/>
      <rect x="188" y="206" width="14" height="12" rx="2.5" fill="#3aa0e0"/>
      <rect x="58" y="164" width="7" height="70" rx="3.5" fill="#d3d7dd"/>
      <rect x="122" y="164" width="7" height="70" rx="3.5" fill="#d3d7dd"/>
      <rect x="40" y="230" width="106" height="62" rx="12" fill="#fff" stroke="#d9dce1" stroke-width="2"/>
      ${UNPLUG_LED(62, 270, 4, 1.7, 0)}${UNPLUG_LED(77, 270, 4, 1.7, 1)}${UNPLUG_LED(92, 270, 4, 1.7, 2)}
      <rect x="290" y="210" width="84" height="82" rx="16" fill="#fff" stroke="#d9dce1" stroke-width="2"/>
      <path d="M314 244 a24 24 0 0 1 36 0 M320 252 a15 15 0 0 1 24 0" fill="none" stroke="#c9ced5" stroke-width="3.5" stroke-linecap="round"/>
      ${UNPLUG_LED(332, 274, 4, 1.7, 1)}
      ${UNPLUG_STRIP_PLUG(150, top => `M64 292 C 60 326 150 ${top - 40} 150 ${top}`, 1)}
      ${UNPLUG_STRIP_PLUG(270, top => `M350 292 C 354 326 270 ${top - 40} 270 ${top}`, 1)}
      <rect x="120" y="318" width="182" height="20" rx="7" fill="#f4f5f7" stroke="#d5d9de" stroke-width="2"/>
      <circle cx="290" cy="328" r="3.5" fill="#e5413b"/>
      ${UNPLUG_OFF_BADGE(146, 222, 2.1)}
      ${UNPLUG_OFF_BADGE(374, 206, 2.1)}
    </svg>`,
  ];

  // 1_036 step pictures, same flat style as 1_033: ZenWiFi router on the left, modem on the right
  const PLUGIN_ROUTER = (ledOn) => `
      <rect x="40" y="124" width="172" height="156" rx="20" fill="#fff" stroke="#d9dce1" stroke-width="2"/>
      <rect x="48" y="130" width="156" height="14" rx="7" fill="#f2f3f5"/>
      <rect x="116" y="200" width="20" height="5" rx="2.5" fill="#d0d4da">${ledOn || ''}</rect>
      <rect x="92" y="242" width="104" height="24" rx="4" fill="#e9ebef"/>
      <circle cx="106" cy="254" r="5.5" fill="#fff" stroke="#b9bfc7" stroke-width="2"/>
      <rect x="120" y="248" width="14" height="12" rx="2" fill="#f5c84c"/>
      <rect x="140" y="248" width="14" height="12" rx="2" fill="#f5c84c"/>
      <rect x="166" y="247" width="16" height="14" rx="2" fill="#3aa0e0"/>`;
  const PLUGIN_MODEM = (leds) => `
      <rect x="352" y="98" width="16" height="202" rx="7" fill="#e6e8ec"/>
      <rect x="290" y="88" width="66" height="212" rx="13" fill="#fff" stroke="#d9dce1" stroke-width="2"/>
      <rect x="304" y="106" width="16" height="13" rx="2.5" fill="#c9ced5"/>
      <rect x="304" y="126" width="16" height="13" rx="2.5" fill="#f5c84c"/>
      <rect x="304" y="146" width="16" height="13" rx="2.5" fill="#f5c84c"/>
      <rect x="304" y="166" width="16" height="13" rx="2.5" fill="#f5c84c"/>
      <rect x="304" y="186" width="16" height="13" rx="2.5" fill="#3aa0e0"/>
      <circle cx="312" cy="270" r="7" fill="#fff" stroke="#b9bfc7" stroke-width="2"/>
      ${[0, 1, 2, 3].map(i => `<circle cx="338" cy="${112 + i * 14}" r="3.5" fill="#d0d4da">${leds ? leds(i) : ''}</circle>`).join('')}`;
  // Modem LAN (3rd yellow port) → router WAN (blue), under the floor line
  const PLUGIN_CABLE = 'M304 172 H274 Q264 172 264 182 V286 Q264 296 254 296 H184 Q174 296 174 286 V266';
  const PLUGIN_HEADS = `
      <rect x="292" y="167" width="14" height="10" rx="2" fill="#1f86d6"/>
      <rect x="169" y="264" width="10" height="12" rx="2" fill="#1f86d6"/>`;
  // Dark-blue round badge that pops in at `at` s (like the old app's callouts)
  const PLUGIN_BADGE = (x, y, at, icon) => `
    <g transform="translate(${x} ${y})">
      <g transform="scale(0)">
        <animateTransform attributeName="transform" type="scale" values="0;1.15;1" keyTimes="0;.7;1" begin="${at}s" dur=".45s" fill="freeze"/>
        <circle r="30" fill="#0b4fb3"/>
        ${icon}
      </g>
    </g>`;
  const PLUGIN_PORT_ICON = `
        <rect x="-15" y="-15" width="30" height="30" rx="3" fill="#06306e"/>
        <path d="M-10 -10 H10 V4 H5 V9 H-5 V4 H-10 Z" fill="#3aa0e0"/>`;
  // Power plug pointing up at a power jack: starts 40 below, nudge arrow beside it, pushes in at 1.5 s
  const PLUGIN_POWER_PLUG = (x, y) => `
    <g transform="translate(${x} ${y + 40})">
      <animateTransform attributeName="transform" type="translate" from="${x} ${y + 40}" to="${x} ${y}" begin="1.5s" dur=".5s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>
      <path d="M0 22 V120" stroke="#aab1ba" stroke-width="4" stroke-linecap="round"/>
      <rect x="-4" y="-9" width="3" height="10" rx="1" fill="#a9b0b9"/>
      <rect x="1" y="-9" width="3" height="10" rx="1" fill="#a9b0b9"/>
      <rect x="-11" y="0" width="22" height="24" rx="6" fill="#d3d7dd"/>
    </g>
    <g opacity="0">
      <animate attributeName="opacity" from="0" to="1" begin=".2s" dur=".3s" fill="freeze"/>
      <animate attributeName="opacity" from="1" to="0" begin="1.4s" dur=".3s" fill="freeze"/>
      <g transform="translate(${x - 30} ${y + 52})">
        <animateTransform attributeName="transform" type="translate" values="${x - 30} ${y + 52};${x - 30} ${y + 42};${x - 30} ${y + 52};${x - 30} ${y + 42};${x - 30} ${y + 52}" begin=".3s" dur="1.1s" fill="freeze"/>
        <path d="M0 0 V-30" stroke="#f5c84c" stroke-width="6" stroke-linecap="round"/>
        <path d="M-10 -22 L0 -34 L10 -22" fill="none" stroke="#f5c84c" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </g>`;
  // Little yellow flash at a jack the moment the plug goes in
  const PLUGIN_SPARK = (x, y) => `
    <g transform="translate(${x} ${y})" opacity="0" stroke="#f5c84c" stroke-width="3" stroke-linecap="round">
      <animate attributeName="opacity" values="0;1;0" begin="2s" dur=".5s" fill="freeze"/>
      <path d="M-12 -12 L-18 -18 M12 -12 L18 -18 M0 -15 V-23 M-15 0 H-23 M15 0 H23"/>
    </g>`;
  const PLUGIN_ILLUST = [
    // 1. Find the router's blue WAN port: a callout pops over it, then a ring keeps pulsing
    `<svg viewBox="0 0 422 340" width="422" height="340" aria-hidden="true">
      ${UNPLUG_FLOOR}
      ${PLUGIN_ROUTER()}
      ${PLUGIN_MODEM()}
      <circle cx="174" cy="254" r="32" fill="none" stroke="#3aa0e0" stroke-width="3" opacity="0">
        <animate attributeName="r" values="32;48" begin="1s" dur="1.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".8;0" begin="1s" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      ${PLUGIN_BADGE(174, 254, 0.4, PLUGIN_PORT_ICON)}
    </svg>`,
    // 2. Cable draws itself from the modem's LAN port to the router's WAN port
    `<svg viewBox="0 0 422 340" width="422" height="340" aria-hidden="true">
      ${UNPLUG_FLOOR}
      ${PLUGIN_ROUTER()}
      ${PLUGIN_MODEM()}
      <path d="${PLUGIN_CABLE}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" fill="none" stroke="#1f86d6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <animate attributeName="stroke-dashoffset" from="1" to="0" begin=".5s" dur="1.4s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>
      </path>
      <g opacity="0"><set attributeName="opacity" to="1" begin=".5s" fill="freeze"/><rect x="292" y="167" width="14" height="10" rx="2" fill="#1f86d6"/></g>
      <g opacity="0"><set attributeName="opacity" to="1" begin="1.9s" fill="freeze"/><rect x="169" y="264" width="10" height="12" rx="2" fill="#1f86d6"/></g>
    </svg>`,
    // 3. Power on both: arrows nudge up twice, plugs push into both power jacks with a spark,
    // then the router LED and the modem lights come on one by one with a glow and keep blinking
    `<svg viewBox="0 0 422 340" width="422" height="340" aria-hidden="true">
      <defs><filter id="plugin-glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="4"/></filter></defs>
      ${UNPLUG_FLOOR}
      ${PLUGIN_ROUTER()}
      ${PLUGIN_MODEM()}
      <path d="${PLUGIN_CABLE}" fill="none" stroke="#1f86d6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${PLUGIN_HEADS}
      ${PLUGIN_POWER_PLUG(106, 259)}
      ${PLUGIN_POWER_PLUG(312, 275)}
      ${PLUGIN_SPARK(106, 254)}${PLUGIN_SPARK(312, 270)}
      <ellipse cx="126" cy="202" rx="26" ry="9" fill="#3aa0e0" opacity="0" filter="url(#plugin-glow)">
        <animate attributeName="opacity" values="0;.95;.15;.95" dur="1s" begin="2.1s" repeatCount="indefinite"/>
      </ellipse>
      <rect x="110" y="199" width="32" height="6" rx="3" fill="#d0d4da">
        <set attributeName="fill" to="#3aa0e0" begin="2.1s" fill="freeze"/>
        <animate attributeName="opacity" values="1;.35;1" dur="1s" begin="2.1s" repeatCount="indefinite"/>
      </rect>
      ${[0, 1, 2, 3].map(i => {
        const at = 2.3 + i * 0.25, y = 112 + i * 14;
        return `
      <circle cx="338" cy="${y}" r="10" fill="#5ee250" opacity="0" filter="url(#plugin-glow)">
        <animate attributeName="opacity" values="0;.8;.2;.8" dur="${0.7 + i * 0.15}s" begin="${at}s" repeatCount="indefinite"/>
      </circle>
      <circle cx="338" cy="${y}" r="4.5" fill="#d0d4da">
        <set attributeName="fill" to="#3ccf3a" begin="${at}s" fill="freeze"/>
        <animate attributeName="opacity" values="1;.35;1" dur="${0.7 + i * 0.15}s" begin="${at}s" repeatCount="indefinite"/>
      </circle>`;
      }).join('')}
    </svg>`,
  ];

  // 1_054: router (left, solid blue) and a node, both ZenWiFi cubes scaled from PLUGIN_ROUTER
  const NODE_CUBE = (x, led = '', extra = '') => `
      <g transform="translate(${x} 76)"><g transform="scale(.8)">${PLUGIN_ROUTER(led)}${extra}</g></g>`;
  const NODE_BLUE = '<set attributeName="fill" to="#3aa0e0" begin="0s" fill="freeze"/>';
  const NODE_ILLUST = [
    // 1. Node slides in next to the router, then a "within 3 m" distance marker appears
    `<svg viewBox="0 0 422 340" width="422" height="340" aria-hidden="true">
      ${UNPLUG_FLOOR}
      ${NODE_CUBE(-22, NODE_BLUE)}
      <g transform="translate(330 0)" opacity=".4">
        <animateTransform attributeName="transform" type="translate" from="330 0" to="230 0" begin=".3s" dur=".9s" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1" keyTimes="0;1"/>
        <animate attributeName="opacity" from=".4" to="1" begin=".3s" dur=".9s" fill="freeze"/>
        ${NODE_CUBE(0)}
      </g>
      <g opacity="0">
        <animate attributeName="opacity" from="0" to="1" begin="1.4s" dur=".4s" fill="freeze"/>
        <path d="M160 176 H252" stroke="#0b4fb3" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>
        <path d="M168 168 L158 176 L168 184 M244 168 L254 176 L244 184" fill="none" stroke="#0b4fb3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="178" y="138" width="56" height="26" rx="13" fill="#0b4fb3"/>
        <text x="206" y="156" text-anchor="middle" font-size="14" font-weight="600" fill="#fff">≤ 3 m</text>
      </g>
    </svg>`,
    // 2. Plug the node in: it breathes green while starting up, then turns solid blue
    `<svg viewBox="0 0 422 340" width="422" height="340" aria-hidden="true">
      <defs><filter id="node-glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="4"/></filter></defs>
      ${UNPLUG_FLOOR}
      ${NODE_CUBE(-22, NODE_BLUE)}
      ${NODE_CUBE(230, `
        <set attributeName="fill" to="#5ee250" begin="2.1s" fill="freeze"/>
        <animate attributeName="opacity" values="1;.25;1" dur="1.2s" begin="2.1s" end="4.5s" repeatCount="indefinite"/>
        <set attributeName="fill" to="#3aa0e0" begin="4.5s" fill="freeze"/>`, `
        <ellipse cx="126" cy="202" rx="26" ry="9" fill="#5ee250" opacity="0" filter="url(#node-glow)">
          <animate attributeName="opacity" values=".9;.15;.9" dur="1.2s" begin="2.1s" end="4.5s" repeatCount="indefinite"/>
          <set attributeName="fill" to="#3aa0e0" begin="4.5s" fill="freeze"/>
          <set attributeName="opacity" to=".75" begin="4.5s" fill="freeze"/>
        </ellipse>
        ${PLUGIN_POWER_PLUG(106, 259)}`)}
    </svg>`,
  ];

  // 1_051 What we'll need: flat drawings of the four items, popping in one by one
  const NEED_ITEMS = [
    ['Modem', `
      <rect x="66" y="16" width="10" height="94" rx="5" fill="#e6e8ec"/>
      <rect x="40" y="10" width="32" height="102" rx="8" fill="#fff" stroke="#d9dce1" stroke-width="2"/>
      <rect x="47" y="22" width="10" height="8" rx="2" fill="#c9ced5"/>
      <rect x="47" y="34" width="10" height="8" rx="2" fill="#f5c84c"/>
      <rect x="47" y="46" width="10" height="8" rx="2" fill="#f5c84c"/>
      <rect x="47" y="58" width="10" height="8" rx="2" fill="#3aa0e0"/>
      <circle cx="52" cy="96" r="4" fill="#fff" stroke="#b9bfc7" stroke-width="2"/>`],
    ['Router', `
      <rect x="14" y="26" width="92" height="84" rx="13" fill="#fff" stroke="#d9dce1" stroke-width="2"/>
      <rect x="20" y="31" width="80" height="9" rx="4.5" fill="#f2f3f5"/>
      <rect x="51" y="68" width="18" height="4" rx="2" fill="#3aa0e0"/>`],
    ['Power cord', `
      <rect x="18" y="36" width="44" height="48" rx="9" fill="#fff" stroke="#d9dce1" stroke-width="2"/>
      <rect x="28" y="26" width="5" height="11" rx="1.5" fill="#a9b0b9"/>
      <rect x="47" y="26" width="5" height="11" rx="1.5" fill="#a9b0b9"/>
      <path d="M40 84 C 40 104 70 104 76 84 S 96 56 96 40" fill="none" stroke="#aab1ba" stroke-width="4" stroke-linecap="round"/>
      <rect x="90" y="24" width="12" height="18" rx="3" fill="#d3d7dd"/>
      <rect x="94" y="16" width="4" height="9" rx="1" fill="#a9b0b9"/>`],
    ['Ethernet cord', `
      <path d="M26 92 C 10 60 44 34 60 52 S 74 94 92 72 S 104 40 96 30" fill="none" stroke="#1f86d6" stroke-width="5" stroke-linecap="round"/>
      <rect x="18" y="90" width="16" height="20" rx="3" fill="#1f86d6"/><rect x="21" y="104" width="10" height="6" fill="#0b4fb3"/>
      <rect x="88" y="12" width="16" height="20" rx="3" fill="#1f86d6"/><rect x="91" y="12" width="10" height="6" fill="#0b4fb3"/>`],
  ];

  // 1_040 (setup flow) and 1_055 (end of the 1_050 Setup Guide) are the same LED check page
  function ledCheck(next) {
    return `
        <header class="navbar">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
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
            <button class="btn-primary" data-go="${next}">Next</button>
            <button class="text-link" data-go="led-not-blue">It is not solid blue light.</button>
          </div>
        </div>
    `;
  }

  // Guide page whose top picture is a carousel synced 1:1 with a numbered list (1_033, 1_036)
  function stepCarousel({ illust, title, steps, next, label = 'I am ready', help = true }) {
    return `
      <header class="navbar navbar-guide">
        <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
        <h1 class="navbar-title">Setup Guide</h1>
        ${help ? `<button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>` : ''}
      </header>

      <div class="guide-body">
        <div class="guide-illust unplug-carousel">
          <div class="unplug-track">${illust.map(svg => `<div class="unplug-slide">${svg}</div>`).join('')}</div>
        </div>
        <div class="unplug-dots">${illust.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
        <h2 class="guide-title">${title}</h2>
        <ol class="unplug-steps">${steps.map((t, i) => `<li class="${i ? '' : 'on'}">${t}</li>`).join('')}</ol>
        <button class="btn-brand" data-go="${next}" data-label="${label}">${label}</button>
      </div>
    `;
  }

  // Swipe the picture or tap a step/dot; it also advances by itself every `every` ms until the user touches it
  function mountStepCarousel(el, every) {
    const track = el.querySelector('.unplug-track');
    const dots = [...el.querySelectorAll('.unplug-dots i')];
    const steps = [...el.querySelectorAll('.unplug-steps li')];
    const slides = [...el.querySelectorAll('.unplug-slide')];
    let cur = 0;
    const mark = i => {
      cur = i;
      // A fresh copy restarts SMIL everywhere (setCurrentTime alone doesn't reliably rewind in Safari)
      const svg = slides[i].querySelector('svg');
      svg.replaceWith(svg.cloneNode(true));
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
      steps.forEach((s, j) => s.classList.toggle('on', j === i));
    };
    const show = i => {
      if (i === cur) return mark(i);
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    };
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== cur) mark(i);
    });
    const auto = setInterval(() => show((cur + 1) % steps.length), every);
    const stopAuto = () => clearInterval(auto);
    track.addEventListener('pointerdown', stopAuto);
    steps.forEach((s, i) => s.addEventListener('click', () => { stopAuto(); show(i); }));
    dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); show(i); }));
    return stopAuto;
  }




  // ── 1_370 網路診斷 (ported from Network-Diagnostic) ──
  const DIAG_STEPS = [
    { key: 'device', label: '您的裝置', icon: '<rect x="2.5" y="5" width="13" height="9" rx="1.5"/><path d="M1 17h16"/><rect x="15.5" y="8" width="6" height="10" rx="1.4"/>' },
    { key: 'router', label: '華碩路由器', icon: '<rect x="3" y="13" width="18" height="6" rx="2"/><path d="M7 16h.01M11 16h.01"/><path d="M8 13V9M16 13V9"/><path d="M9.5 6.5a3.5 3.5 0 015 0"/>' },
    { key: 'upstream', label: '上游網路設備', icon: '<rect x="9" y="7" width="6" height="12" rx="1.5"/><path d="M12 16h.01"/><path d="M6.5 9.5a4 4 0 000 5M17.5 9.5a4 4 0 010 5M4 7.5a7.5 7.5 0 000 9M20 7.5a7.5 7.5 0 010 9"/>' },
    { key: 'internet', label: '網際網路', icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>' },
  ];
  // DNS is folded into Router / Gateway / Internet (the device row is ping only)
  const DIAG_PING_FAIL = {
    device: { title: 'Wi‑Fi 已關閉。', lines: ['請啟用您行動裝置的 Wi‑Fi。'] },
    router: { title: '華碩路由器似乎是離線狀態。', lines: ['請確認華碩路由器是電源開啟的狀態。', '請檢查是否訊號太遠或干擾。', '請重開路由器後再試一次。'] },
    upstream: { title: '上游網路設備似乎是離線狀態。', lines: ['請確認您的上游網路設備是開啟的狀態。', '請重新插拔線路，並確認所有的線路都有正確連接。', '請嘗試重啟上游網路設備。', '請與您的網路服務供應商聯繫，以修正網路連線問題。'] },
    internet: { title: '您的網路服務供應商似乎出了點問題。', lines: ['請與您的網路服務供應商聯繫，以修正網路連線問題。'] },
  };
  const DIAG_DNS_FAIL = {
    router: { title: '路由器無法解析網站名稱。', lines: ['請重新啟動華碩路由器後再試一次。', '若問題持續，請檢查路由器的 DNS 設定，或變更其他 DNS 服務。'] },
    upstream: { title: '網路服務供應商的 DNS 服務可能異常。', lines: ['請嘗試重啟您的上游網路設備。', '您可以嘗試在華碩路由器中改用其他 DNS 服務。', '若問題持續，請聯絡您的網路服務供應商。'] },
    internet: { title: '網域名稱解析異常。', lines: ['部分網站暫時無法使用，請稍後再試。若問題持續，請聯絡網路服務供應商。'] },
  };
  const DIAG_WARN = { title: '此段連線不穩定。', lines: ['偵測到此段連線偶有中斷，可能影響上網穩定性。'] };
  // Per-row result: ok | warn (ping partly failed) | fail (ping failed) | dns (ping ok, DNS failed)
  // | warndns | faildns. Anything but ok/warn is ❌ and stops the run.
  const DIAG_SCENARIOS = {
    success: ['ok', 'ok', 'ok', 'ok'],
    warn: ['ok', 'warn', 'ok', 'warn'],
    fail: ['ok', 'fail', 'pending', 'pending'],
    mixed: ['ok', 'warn', 'fail', 'pending'],
    dns: ['ok', 'ok', 'dns', 'pending'],
    warndns: ['ok', 'warndns', 'pending', 'pending'],
    faildns: ['ok', 'ok', 'faildns', 'pending'],
  };
  let DIAG_SCENARIO = 'fail';
  const diagSev = st => ['fail', 'dns', 'warndns', 'faildns'].includes(st) ? 'fail' : st;
  const DIAG_HERO_ICON = {
    search: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>',
    success: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    warn: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="14"/><line x1="12" y1="18.6" x2="12.01" y2="18.6" stroke-width="4.2"/></svg>',
    fail: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
  };
  function diagStatusIcon(st) {
    const sev = diagSev(st);
    if (sev === 'ok') return '<span class="diag-badge ok"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
    if (sev === 'warn') return '<span class="diag-badge warn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="13.5"/><line x1="12" y1="18.4" x2="12.01" y2="18.4" stroke-width="4"/></svg></span>';
    if (sev === 'fail') return '<span class="diag-badge fail"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></span>';
    if (sev === 'checking') return '<span class="diag-spin"></span>';
    return '<span class="diag-dash">--</span>';
  }

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
          <button class="text-link" data-go="feedback-consent">問題回報</button>
          <button class="text-link" data-go="login">帳號登入</button>
        </div>
      `,
    },
    {
      id: 'series',
      back: 'opening',
      code: '1_020',
      name: '選擇系列裝置',
      description: '選擇設定裝置：選要設定的產品系列（無線路由器 / ZenWiFi / Lyra）',
      figmaNode: '711:111',
      render: () => `
        <header class="navbar">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
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
      back: 'series',
      code: '1_030',
      name: '選擇 ZenWiFi 裝置',
      description: '華碩 ZenWiFi 系列：從清單中點選要設定的 ZenWiFi 型號',
      figmaNode: '711:115',
      theme: 'light',
      mount: () => { MODEM_FLOW = 'setup'; },
      render: () => `
        <header class="navbar">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
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
              <button class="model-tile" data-go="modem-unplug" data-label="${model}">
                <span class="model-img">${device(type)}</span>
                <span class="model-name">${model}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `,
    },
    {
      id: 'modem-unplug',
      get back() { return MODEM_FLOW === 'wan' ? 'welcome' : 'series-zenwifi'; },
      code: '1_033',
      name: '拔下數據機和舊路由器的電源線',
      description: '重新啟動數據機（1/2）：拔下數據機電源線、取出備用電池，連到數據機的其他無線設備也要拔電，上方圖片跟著條列輪播',
      theme: 'light',
      render: () => stepCarousel({
        illust: UNPLUG_ILLUST,
        title: '拔下數據機和舊路由器的電源線',
        steps: [
          '拔下纜線／DSL 數據機電源線。如有備用電池，請取出電池。',
          '如果有其他無線設備連接到數據機，也請拔掉設備的電源。',
        ],
        next: MODEM_FLOW === 'wan' ? 'modem-wait-off' : 'modem-plug',
      }),
      mount: el => mountStepCarousel(el, 6500),
    },
    {
      id: 'modem-plug',
      get back() { return MODEM_FLOW === 'wan' ? 'modem-wait-off' : 'modem-unplug'; },
      code: '1_036',
      name: '插入您的裝置',
      description: '重新啟動數據機（2/2）：找到路由器的 WAN 埠、用網路線接到數據機的 LAN 埠，再同時打開兩台電源，上方圖片跟著條列輪播',
      theme: 'light',
      render: () => stepCarousel({
        illust: PLUGIN_ILLUST,
        title: '插入您的裝置',
        steps: [
          '找到路由器上的 WAN 網路埠（藍色）。',
          '用網路線將數據機的 LAN 網路埠連接到路由器的 WAN 網路埠。',
          '同時打開數據機和路由器的電源。',
        ],
        next: MODEM_FLOW === 'wan' ? 'modem-wait-start' : 'led-check',
      }),
      mount: el => mountStepCarousel(el, 5000),
    },
    {
      id: 'modem-wait-off',
      back: 'modem-unplug',
      code: '1_034',
      name: '等待 3 分鐘（拔電）',
      description: '未偵測到 WAN：數據機保持拔電 3 分鐘，Continue 倒數中灰色（demo 時也可按），倒數結束變藍',
      theme: 'light',
      render: () => waitPage({
        title: 'Keep the modem unplugged.',
        label: 'WAIT 3 MINUTES',
        totalSec: 180,
        hint: 'Continue unlocks when the timer ends.',
        mode: 'off',
        next: 'modem-plug',
        why: 'waitOff',
      }),
      mount: el => { MODEM_FLOW = 'wan'; return startCountdown(el, 180); },
    },
    {
      id: 'modem-wait-start',
      back: 'modem-plug',
      code: '1_037',
      name: '等待數據機啟動 3½ 分鐘',
      description: '未偵測到 WAN：插回電源後等數據機啟動 3½ 分鐘，燈可能會閃，Continue 倒數中灰色（demo 時也可按），倒數結束變藍，按 Continue 到 1_140',
      theme: 'light',
      render: () => waitPage({
        title: 'Wait for the modem to start.',
        label: 'WAIT AT LEAST 3½ MINUTES',
        totalSec: 210,
        hint: 'Blinking lights? Keep waiting.',
        mode: 'starting',
        next: 'setup-ssid',
        why: 'waitStart',
      }),
      mount: el => { MODEM_FLOW = 'wan'; return startCountdown(el, 210); },
    },
    {
      id: 'led-check',
      back: 'modem-plug',
      code: '1_040',
      name: '燈號顯示頁',
      description: '確認燈號：請使用者看路由器的燈，從呼吸綠燈變成恆亮藍燈才能開始設定',
      figmaNode: '1867:1962',
      theme: 'light',
      render: () => ledCheck('qr-intro'),
    },
    {
      id: 'qr-intro',
      back: 'led-check',
      code: '1_050',
      name: 'QR Code 找裝置',
      description: '掃描 QR Code：說明路由器上的 QR Code 在哪裡，選擇用相機掃描或手動連 WiFi',
      figmaNode: '711:117',
      theme: 'light',
      render: () => `
        <header class="navbar">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">華碩 ZenWiFi 系列</h1>
          <button class="navbar-btn navbar-btn-right" data-sheet="open" aria-label="說明">${ICON.help}</button>
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

        <div class="action-sheet" data-sheet="close">
          <div class="action-sheet-panel">
            <div class="action-sheet-group">
              <button class="action-sheet-btn" data-go="setup-guide">Setup Guide</button>
              <button class="action-sheet-btn" data-go="led-guide">LED Guide</button>
            </div>
            <button class="action-sheet-btn action-sheet-cancel" data-sheet="close">Cancel</button>
          </div>
        </div>
      `,
      // ? opens an iOS action sheet; tapping Cancel or the dimmed area closes it
      mount: el => {
        const sheet = el.querySelector('.action-sheet');
        const onClick = e => {
          const t = e.target.closest('[data-sheet]');
          if (!t || (t === sheet && e.target !== sheet)) return;
          sheet.classList.toggle('show', t.dataset.sheet === 'open');
        };
        el.addEventListener('click', onClick);
        return () => el.removeEventListener('click', onClick);
      },
    },
    {
      id: 'setup-guide',
      back: 'qr-intro',
      code: '1_051',
      name: 'Setup Guide 1/5',
      description: '1_050 的 ? → Setup Guide 1/5：準備物品（數據機、路由器、電源線、網路線），四樣東西依序浮現',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">Setup Guide</h1>
        </header>

        <div class="guide-body">
          <div class="guide-illust">
            <ul class="sg-need">
              ${NEED_ITEMS.map(([label, art], i) => `
                <li style="--i:${i}"><svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">${art}</svg><span>${label}</span></li>`).join('')}
            </ul>
          </div>
          <h2 class="guide-title">What we’ll need</h2>
          <p class="guide-desc">Find these in your ASUS router’s packaging. You’ll only need one router for now if you have more than one device. More can be set up later.</p>
          <button class="btn-brand" data-go="setup-guide-2" data-label="Next">Next</button>
        </div>
      `,
    },
    {
      id: 'setup-guide-2',
      back: 'setup-guide',
      code: '1_052',
      name: 'Setup Guide 2/5',
      description: 'Setup Guide 2/5：同 1_033，拔下數據機電源線、取出備用電池，其他無線設備也拔電',
      theme: 'light',
      render: () => stepCarousel({
        illust: UNPLUG_ILLUST,
        title: '拔下數據機和舊路由器的電源線',
        steps: [
          '拔下纜線／DSL 數據機電源線。如有備用電池，請取出電池。',
          '如果有其他無線設備連接到數據機，也請拔掉設備的電源。',
        ],
        next: 'setup-guide-3',
        help: false,
      }),
      mount: el => mountStepCarousel(el, 6500),
    },
    {
      id: 'setup-guide-3',
      back: 'setup-guide-2',
      code: '1_053',
      name: 'Setup Guide 3/5',
      description: 'Setup Guide 3/5：同 1_036，找到 WAN 埠、數據機 LAN 接路由器 WAN，兩台同時開電',
      theme: 'light',
      render: () => stepCarousel({
        illust: PLUGIN_ILLUST,
        title: '插入您的裝置',
        steps: [
          '找到路由器上的 WAN 網路埠（藍色）。',
          '用網路線將數據機的 LAN 網路埠連接到路由器的 WAN 網路埠。',
          '同時打開數據機和路由器的電源。',
        ],
        next: 'setup-guide-4',
        help: false,
      }),
      mount: el => mountStepCarousel(el, 5000),
    },
    {
      id: 'setup-guide-4',
      back: 'setup-guide-3',
      code: '1_054',
      name: 'Setup Guide 4/5',
      description: 'Setup Guide 4/5：準備節點，放在路由器 3 公尺內，開機等呼吸綠燈變恆亮藍燈',
      theme: 'light',
      render: () => stepCarousel({
        illust: NODE_ILLUST,
        title: 'Prepare Another Node',
        steps: [
          'Place your node(s) and router within a proper distance.',
          'Power node(s) on and wait until you see a static blue light. Your node(s) will automatically connect to your router afterwards.',
        ],
        next: 'setup-guide-5',
        label: 'Next',
        help: false,
      }),
      mount: el => mountStepCarousel(el, 6000),
    },
    {
      id: 'setup-guide-5',
      back: 'setup-guide-4',
      code: '1_055',
      name: 'Setup Guide 5/5',
      description: 'Setup Guide 5/5：同 1_040 燈號顯示頁，確認路由器恆亮藍燈，Next 回 1_050',
      figmaNode: '1867:1962',
      theme: 'light',
      render: () => ledCheck('qr-intro'),
    },
    {
      id: 'led-guide',
      back: 'qr-intro',
      code: '1_056',
      name: 'LED Guide',
      description: '1_050 的 ? → LED Guide：路由器正面燈號顏色代表的狀態',
      figmaNode: '1891:1333',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <h1 class="navbar-title">LED Guide</h1>
        </header>

        <div class="led-guide-body">
          <img class="led-guide-device" src="assets/led-guide-device.jpg" alt="" width="164" height="155">
          <p class="led-guide-intro">The light on the front of your ZenWiFi BT8 provides a general status update at a glance.</p>
          <ul class="led-guide-list">
            ${[
              ['green', 'Your ZenWiFi BT8 is starting up.'],
              ['blue', 'Your ZenWiFi BT8 is ready for setup.'],
              ['blue-blink', 'Your node is syncing with the router.'],
              ['white', 'Your ZenWiFi BT8 is online and all is well.'],
              ['yellow', 'The connection between your ZenWiFi BT8 router and the node is weak.'],
              ['red', 'Your ZenWiFi BT8 router has no Internet connection / Your node is disconnected from the router.'],
              ['green-glow', 'Your mesh system is under optimization.<br>*This process might last for 1-10 minutes to verify that any radar in proximity is not using DFS frequencies in compliance with local government regulation.'],
            ].map(([c, t]) => `<li><span class="led-guide-swatch is-${c}"></span><span>${t}</span></li>`).join('')}
          </ul>
          <button class="pill-btn led-guide-ok" data-go="back">OK</button>
        </div>
      `,
    },
    {
      id: 'qr-scan',
      back: 'qr-intro',
      code: '1_060',
      name: '啟用相機掃描',
      description: '相機掃描：把相機對準路由器上的 QR Code，掃到後系統詢問是否加入路由器的 Wi-Fi',
      figmaNode: '711:155',
      theme: 'light',
      render: () => `
        <header class="navbar">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">連線到ASUS Router</h1>
        </header>

        <div class="scan-body">
          <p class="qr-subtitle">將相機對準 QR Code。</p>

          <button class="scan-view" data-action="scan" aria-label="模擬掃描到 QR Code">
            <!-- Simulated camera feed: close-up of the router with its QR sticker, drifting like a handheld phone -->
            <span class="scan-feed" aria-hidden="true">
              <span class="cam-scene">
                <span class="cam-router"></span>
                <span class="cam-label">
                  ${QR_CAMERA}
                  <span class="cam-label-text">SSID: ASUS_14_BT8</span>
                </span>
              </span>
              <span class="cam-vignette"></span>
              <span class="cam-focus"></span>
            </span>
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
      back: 'qr-scan',
      code: '1_070',
      name: '偵測路由器',
      description: '偵測中：加入路由器的 Wi-Fi 後，App 正在搜尋 ASUS 路由器',
      figmaNode: '711:107',
      theme: 'light',
      render: () => `
        <header class="navbar">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
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
      back: i === 0 ? 'qr-scan' : `guide-${i}`,
      code: g.code,
      name: `設定指南 ${i + 1}/${all.length}`,
      description: `設定指南 ${i + 1}/${all.length}：${g.summary}`,
      figmaNode: g.figmaNode,
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
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
      back: 'guide-4',
      code: '1_120',
      name: '安裝歡迎頁',
      description: '安裝歡迎頁：顯示偵測到的機型 ZenWiFi BT8，按 Get Started 開始設定',
      figmaNode: '757:192',
      theme: 'light',
      mount: () => { MODEM_FLOW = 'wan'; },
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
      id: 'wan-type',
      back: 'welcome',
      code: '1_125',
      name: '選擇網路連線類型',
      description: '沒有偵測到 WAN：請使用者選擇 WAN Type（DHCP／PPPoE／Static IP），或按 Auto Detect 再偵測一次',
      figmaNode: '1867:563',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn navbar-btn-ink" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title navbar-title-bold">System Setup</h1>
          <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
        </header>

        <div class="wan-type-body">
          <p class="wan-type-intro">請選擇您的網路連線類型（WAN Type）</p>
          <p class="wan-type-section">Wan Type</p>
          <div class="wan-type-list">
            ${[
              ['dhcp', 'DHCP（Default）', '最常見，接線即可上網，不需要設定帳號、密碼或 IP。'],
              ['pppoe', 'PPPoE', '需輸入ISP提供的使用者帳號與密碼才能上網。'],
              ['static', 'Static IP', '需輸入特定 IP、遮罩設定資訊。'],
            ].map(([v, t, d]) => `
              <label class="wan-type-option">
                <input type="radio" name="wan-type" value="${v}"${v === 'dhcp' ? ' checked' : ''}>
                <span><b>${t}</b><small>${d}</small></span>
              </label>`).join('')}
          </div>
          <button class="wan-type-special" aria-expanded="false">Special options<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>
          <div class="wan-type-more">
            <p class="wan-type-section">Phone Modem</p>
            <div class="wan-type-list">
              ${['iPhone', 'Android'].map(v => `
                <label class="wan-type-option wan-type-phone">
                  <input type="radio" name="wan-type" value="${v.toLowerCase()}">
                  <span><b>${v}</b></span>
                </label>`).join('')}
            </div>
            <p class="wan-type-note">No wired internet service, but mobile hotspot is available.</p>
          </div>
          <button class="btn-brand welcome-start wan-type-next" data-go="setup-ssid" data-label="Next">Next</button>
          <button class="wan-type-detect">Auto Detect</button>
        </div>

        <div class="wan-type-hud" role="status">
          <span class="wan-type-spinner">${Array.from({ length: 12 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>
          Detecting...
        </div>

        <div class="wan-type-alert" role="alertdialog" aria-labelledby="wan-alert-title">
          <div class="wan-alert-card">
            <h2 id="wan-alert-title">連線無線路由器</h2>
            <p>無法偵測到您的 WAN 狀態。請檢查網路線是否已插入路由器的 WAN 連接埠和數據機的連接埠。若皆已插入，請將網路線拔下然後重新插入，或使用其他網路線嘗試連線。</p>
            <button class="wan-alert-ok">確定</button>
          </div>
        </div>
      `,
      // Special options expands in place; Auto Detect shows the Detecting... HUD, then the demo decision;
      // No pops up an alert and 確定 leaves the user on this page to pick a WAN type
      mount: el => {
        const more = el.querySelector('.wan-type-special');
        const hud = el.querySelector('.wan-type-hud');
        const alert = el.querySelector('.wan-type-alert');
        let timer;
        if (WAN_ALERT_PENDING) { WAN_ALERT_PENDING = false; alert.classList.add('show'); }
        el.querySelector('.wan-alert-ok').addEventListener('click', () => alert.classList.remove('show'));
        more.addEventListener('click', () => more.setAttribute('aria-expanded', more.getAttribute('aria-expanded') !== 'true'));
        el.querySelector('.wan-type-detect').addEventListener('click', () => {
          hud.classList.add('show');
          clearTimeout(timer);
          timer = setTimeout(() => { hud.classList.remove('show'); window.QIS_decide('wanDetect'); }, 1800);
        });
        return () => clearTimeout(timer);
      },
    },
    {
      id: 'wan-detecting',
      back: 'welcome',
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
      // Internet check finishes with the progress bar (2s), then on to WiFi setup
      mount: () => {
        const timer = setTimeout(() => location.replace('#setup-ssid'), 2200);
        return () => clearTimeout(timer);
      },
    },
    {
      id: 'setup-ssid',
      back: 'welcome',
      code: '1_140',
      name: '建立 WiFi 網路',
      description: '建立 WiFi 網路：設定主要 WiFi 的名稱（SSID）和密碼（已預先填好）',
      figmaNode: '757:185',
      theme: 'light',
      render: () => `
        ${setupHeader()}
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
      back: 'setup-ssid',
      code: '1_150',
      name: '建立 IoT 網路',
      description: '建立 IoT 網路：為 IoT／舊裝置另建一個 WiFi，名稱預設為主網路名稱加 _IoT，可稍後再設',
      figmaNode: '757:182',
      theme: 'light',
      render: () => {
        if (!FORM.iotSsid) FORM.iotSsid = `${FORM.ssid}_IoT`;
        return `
        ${setupHeader()}
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
      back: 'setup-iot',
      code: '1_160',
      name: '設定登入帳號',
      description: '設定本機登入帳號：設定路由器管理介面的帳號和密碼（已預先填好）',
      figmaNode: '757:179',
      theme: 'light',
      render: () => `
        ${setupHeader()}
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
      back: 'setup-account',
      code: '1_170',
      name: '套用設定',
      description: '套用設定：路由器正在套用剛才的 WiFi 和帳號設定',
      figmaNode: '757:176',
      theme: 'light',
      render: () => `
        ${setupHeader()}
        <div class="welcome-body">
          <img class="apply-device" src="assets/zenwifi-device.png" alt="ZenWiFi 路由器" width="166" height="202">
          <h2 class="apply-title">Setting up your network</h2>
          <div class="progress apply-progress" role="progressbar" aria-label="套用設定"><span class="progress-fill"></span></div>
          <p class="apply-status">Now applying your settings.</p>
        </div>
      `,
      mount: () => {
        const timer = setTimeout(() => location.replace('#join-wifi'), 3200);
        return () => clearTimeout(timer);
      },
    },
    {
      id: 'join-wifi',
      back: 'setup-account',
      code: '1_175',
      name: '加入新的 Wi-Fi',
      description: '加入新 Wi-Fi：設定套用後路由器換成新的 WiFi 名稱，系統詢問是否加入，按 Join 繼續建立 AiMesh',
      figmaNode: '1867:1018',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title navbar-title-bold">System Setup</h1>
        </header>
        <div class="welcome-body">
          <img class="welcome-device" src="assets/bt8-3pack.jpg" alt="ZenWiFi BT8 三入組" width="276" height="176">
        </div>

        <!-- Simulated iOS system alert: the phone has to join the WiFi name set on 1_140 -->
        <div class="ios-alert-layer">
          <div class="ios-alert" role="alertdialog" aria-labelledby="join-new-wifi-title">
            <p class="ios-alert-title" id="join-new-wifi-title">“ASUS Router” Wants to Join Wi-Fi Network “${esc(FORM.ssid)}”?</p>
            <div class="ios-alert-buttons">
              <button data-go="join-wifi-cancel" data-label="Cancel">Cancel</button>
              <button data-go="mesh-1" data-label="Join">Join</button>
            </div>
          </div>
        </div>
      `,
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
      back: 'setup-account',
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
          ${m.background ? '<button class="mesh-background">Run in background</button>' : ''}
        </div>
      `,
      // Each step takes ~3s, then the next one picks up the bar where this one stopped;
      // the last one ends in the Internet Connected? check (or node count when there is no WAN)
      mount: el => {
        const last = i + 1 === all.length;
        el.querySelector('.mesh-background')?.addEventListener('click', afterMesh);
        const timer = setTimeout(() => last ? afterMesh() : location.replace(`#mesh-${i + 2}`), 1700);
        return () => clearTimeout(timer);
      },
    })),
    // Internet is live: node 台數 0 (1_210), or ≥ 1 node (1_220),
    // which adds a note and a Trouble shooting link to the node status pages
    ...[
      {
        id: 'internet-live', code: '1_210', figmaNode: '1867:2040',
        name: '完成：網路已連線',
        description: '網路已連線（單台）：node 台數 0 台時，顯示 Internet Connection is Live!，按 Next 看設定摘要',
      },
      {
        id: 'internet-live-mesh', code: '1_220', figmaNode: '0:377', mesh: true,
        name: '網路已連線：繼續檢查節點',
        description: '網路已連線（有節點）：node 台數 ≥ 1 台時，提示接下來繼續檢查 AiMesh 節點；Next 看設定摘要，Trouble shooting 看節點連線狀態',
      },
    ].map(p => ({
      id: p.id,
      back: 'mesh-3',
      code: p.code,
      name: p.name,
      description: p.description,
      figmaNode: p.figmaNode,
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
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
          ${p.mesh ? '<p class="done-desc">Let’s keep checking your AiMesh node(s) status in following steps.</p>' : ''}
          <button class="pill-btn done-next" data-go="summary">Next</button>
          ${p.mesh ? '<button class="guide-link done-trouble" data-go="node-status">Trouble shooting</button>' : ''}
        </div>
      `,
    })),
    {
      id: 'summary',
      get back() { return { single: 'internet-live', mesh: 'internet-live-mesh' }[FINISH] || 'mesh-3'; },
      code: '1_230',
      name: '設定摘要',
      description: '設定摘要：列出剛設定好的 WiFi 名稱／密碼、登入帳號和 IoT 訪客網路；依前面的分支接到首頁、AiMesh 拓撲或尚未連網',
      figmaNode: '819:320',
      theme: 'light',
      render: () => {
        const row = (icon, lines) => `<li class="summary-row">${icon}<span>${lines.map(([k, v]) => `${k} : <b>${esc(v)}</b>`).join('<br>')}</span></li>`;
        const wifi = band => row(SUMMARY_ICON.wifi(band, '#1b74e4'), [['WiFi Name', band === '2G' ? FORM.ssid : `${FORM.ssid}_${band}`], ['WiFi Password', FORM.wifiPassword]]);
        // Where Finish / Next goes depends on the branch that led here
        const [label, target] = {
          single: ['Finish', 'data-go="home"'],
          mesh: ['Finish', 'data-go="aimesh-topology"'],
          mobile: ['Next', 'data-go="no-internet"'],
          offline: ['Finish', 'data-go="home-offline"'],
        }[FINISH];
        return `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title navbar-title-bold">System Setup</h1>
        </header>

        <div class="summary-body">
          ${SINGLE_DEVICE
            ? '<img class="summary-device" src="assets/home-offline-device.jpg" alt="ZenWiFi BT8" width="139" height="169">'
            : '<img class="summary-device" src="assets/bt8-3pack.jpg" alt="ZenWiFi BT8 三入組" width="264" height="169">'}
          ${FINISH === 'single' ? '' : '<p class="summary-done">Setup complete</p>'}
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
          <button class="btn-brand setup-next" ${target}>${label}</button>
        </div>
      `;
      },
    },
    {
      id: 'home',
      back: 'summary',
      code: '1_280',
      name: '首頁',
      description: '首頁：設定完成後進入 App 首頁，顯示路由器資訊和即時上傳／下載流量',
      figmaNode: '1728:569',
      theme: 'light',
      render: () => `
        ${homeTop()}

        <div class="home-body">
          ${routerCard()}

          <h2 class="traffic-title">即時流量</h2>
          <canvas class="traffic-chart" width="416" height="253" aria-label="即時上傳和下載流量圖"></canvas>

          <div class="traffic-stats">
            <div class="traffic-stat">${HOME_ICON.down}<span><em>下載</em><b class="rate-down">36.3<small>Kbps</small></b></span></div>
            <div class="traffic-stat">${HOME_ICON.up}<span><em>上傳</em><b class="rate-up">3.54<small>Kbps</small></b></span></div>
          </div>

          <div class="page-dots" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></div>
          ${homeShortcuts('internet')}
        </div>

        ${homeTabs()}
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
    {
      id: 'aimesh-topology',
      back: 'summary',
      code: '1_290',
      name: 'AiMesh 拓撲',
      description: 'AiMesh 拓撲：多台時設定完成後進入 App 的 AiMesh 頁，顯示路由器和節點的連線狀態',
      figmaNode: '0:81',
      theme: 'light',
      render: () => `
        ${homeTop()}

        <div class="home-body">
          ${routerCard()}
          <h2 class="aimesh-title">AiMesh WiFi 系統</h2>
          <img class="aimesh-topology" src="assets/aimesh-topology.jpg" alt="網際網路連到 ZenWiFi 路由器，再以 MLO 連到兩台節點" width="356" height="328">
          <div class="aimesh-actions">
            <button data-go="add-node" data-label="新增節點">${ICON.wifiSolid}新增節點</button>
            <button data-go="aimesh-optimize" data-label="最佳化">${AIMESH_ICON.optimize}最佳化</button>
          </div>
          ${homeShortcuts('aimesh')}
        </div>

        ${homeTabs()}
      `,
    },
    // ≥ 1 node: connection status, then three LED troubleshooting steps
    {
      id: 'node-status',
      get back() { return INTERNET ? 'internet-live-mesh' : 'mesh-3'; },
      code: '1_300',
      name: 'AiMesh 節點連線狀態',
      description: 'AiMesh 節點連線狀態：列出每台節點的狀況（已就緒／優化中／連線品質待優化／沒有回應），接著看對應的燈號頁',
      figmaNode: '0:182',
      theme: 'light',
      render: () => {
        const st = NODE_STATUS[NODE_STATE];
        return `
        ${systemSetupHeader()}
        <div class="guide-body">
          <img class="node-status-illust" src="assets/node-status-${NODE_STATE}.jpg" alt="" width="370" height="317">
          <h2 class="guide-title node-status-title">AiMesh Node(s) Connection Status</h2>
          <ul class="node-status-list">
            <li><span class="node-num">1</span>AiMesh Node is ready.</li>
            <li><span class="node-num${st.warn ? ' node-num-warn' : ''}">2</span>${st.text}</li>
          </ul>
          <button class="btn-brand setup-next" data-go="node-guide-${st.guide}">Next</button>
        </div>
      `;
      },
    },
    ...[
      {
        code: '1_310', figmaNode: '0:85', img: 'node-guide-white.jpg',
        title: 'Stand by the blinking blue light turns white',
        summary: '節點優化中（藍線）：藍燈閃爍代表正在優化，完成後變白燈；一直閃藍燈就用網路線連接',
        body: `
          <p>The blinking blue light indicates connection optimization. Once it is complete, it will turn solid white.</p>
          <p>The device supports MLO connection may take longer.</p>
          <p>If the blinking blue persists, connect the AiMesh router and node using an ethernet cable.</p>`,
      },
      {
        code: '1_320', figmaNode: '0:97', img: 'node-guide-yellow.jpg',
        title: 'Improve connection quality when the light is yellow',
        summary: '連線品質待優化（黃線）：黃燈代表連線品質不佳，調整擺放位置',
        body: `
          <p>To improve the connection quality, please ensure:</p>
          <p>1. Make sure your node is in an open area and on a flat hard surface.</p>
          <p>2. Place AiMesh devices within 3 meters of each other.</p>
          <p>3. Keep the node away from appliances and devices that use the 2.4GHz band to avoid interference.</p>`,
      },
      {
        code: '1_330', figmaNode: '0:109', img: 'node-guide-power.jpg',
        title: 'Power on the node if indicator remains off',
        summary: '節點沒有回應（灰線）：燈不亮就打開節點電源，綠燈啟動中、藍燈同步中',
        body: `
          <p>Turn on the node. It will automatically look for the AiMesh router, and the light will blink blue while connecting.</p>
          <ul class="guide-legend node-guide-legend">
            <li><span class="led-swatch-sm led-swatch-green"></span>AiMesh node is starting up.</li>
            <li><span class="led-swatch-sm led-swatch-brand"></span>AiMesh node is syncing with the AiMesh router.</li>
          </ul>`,
      },
    ].map((g, i) => ({
      id: `node-guide-${i + 1}`,
      back: 'node-status',
      code: g.code,
      name: `節點燈號排除：${['優化中', '連線品質待優化', '沒有回應'][i]}`,
      description: g.summary,
      figmaNode: g.figmaNode,
      theme: 'light',
      render: () => {
        // With Internet (Trouble shooting) back to the summary, without it the mobile data check
        const next = INTERNET ? 'data-go="summary"' : 'data-decide="mobile"';
        return `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">Setup Guide</h1>
          <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
        </header>
        <div class="guide-body">
          <div class="guide-illust node-guide-illust">
            <img src="assets/${g.img}" alt="" width="439" height="334">
          </div>
          <h2 class="guide-title guide-title-plain node-guide-title">${g.title}</h2>
          <div class="guide-desc node-guide-desc">${g.body}</div>
          <button class="btn-brand setup-next" ${next}>Next</button>
        </div>
      `;
      },
    })),
    // No Internet + mobile data: setup is done but the network is not online yet
    {
      id: 'no-internet',
      back: 'summary',
      code: '1_340',
      name: '尚未連上網際網路',
      description: '尚未連上網際網路：裝置設定已完成但環境還沒連上網，可以回報問題，或按完成設定進首頁',
      figmaNode: '0:150',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title navbar-title-bold">System Setup</h1>
        </header>
        <div class="welcome-body">
          <img class="noinet-globe" src="assets/no-internet-globe.jpg" alt="" width="211" height="143">
          <h2 class="noinet-title">裝置設定已完成</h2>
          <p class="noinet-sub">您的環境目前尚未連上網際網路</p>
          <button class="feedback-card" data-go="feedback-consent" data-label="Feedback">
            ${FEEDBACK_ICON}
            <span><b>Feedback</b><small>提供問題資訊，協助我們了解您的連線狀況</small></span>
          </button>
          <button class="noinet-done" data-go="home-offline">完成設定</button>
        </div>
      `,
    },
    // Feedback needs the user's consent to send device info first; 拒絕 goes back, 同意 opens the form
    {
      id: 'feedback-consent',
      back: 'no-internet',
      code: '1_345',
      name: '協助改善使用體驗',
      description: '協助改善使用體驗：問題回報會附上裝置資訊，按同意才進 1_350 問題回報，拒絕回上一頁',
      theme: 'light',
      render: () => `
        <header class="navbar consent-navbar">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title consent-title">協助改善使用體驗</h1>
        </header>
        <div class="consent-body">
          <p>當您提交回饋時，系統將包含裝置資訊以協助我們診斷問題並提升使用體驗。點擊同意，即表示我同意華碩以下事項：</p>
          <p><b class="consent-head">- 華碩隱私權聲明</b>: 我同意「<a class="consent-link">華碩隱私權保護政策</a>」並提供我的華碩路由器之型號、韌體版本、手機型號、OS與APP版本、MAC位址、IP地址、網際網路狀態、路由器系統資訊、提交此表單的時間—供華碩診斷及改善您的路由器問題與使用者經驗調查及分析，用來開發、評估華碩的新服務及新功能。</p>
          <p><b class="consent-head">- 華碩歐盟數據法聲明（適用於歐盟產品）</b></p>
          <p>根據《歐盟資料法》第 3(2) 條之規定，請參閱下列關於您資料（「產品資料」）的詳細資訊，此等資料是您使用此華碩產品（「連線產品」）時所產生，並受《歐盟資料法》規範：</p>
          <ol class="consent-list">
            <li>關於產品數據的類型、格式及估計容量的資訊：
              <ol>
                <li>連線產品會產生以下類型的產品數據：如上述華碩隱私權聲明第1段所提及的數據</li>
                <li>產品數據可提供以下格式：json, txt</li>
                <li>產品數據的估計容量：[10 MB]/ 每筆數據。</li>
              </ol>
            </li>
            <li>關於連線產品是否能持續且即時產生產品數據的資訊：是</li>
            <li>關於連線產品是否能在裝置或遠端伺服器儲存產品數據，以及 (如適用) 預計的儲存期限：
              <ol>
                <li>連線產品能在伺服器上儲存產品數據。</li>
                <li>產品數據將儲存 2 年，之後自動刪除。</li>
              </ol>
            </li>
            <li>關於使用者如何存取、取回或刪除產品數據的資訊，包括技術方式，以及使用條款與服務品質：使用者可透過華碩官方網站的「<a class="consent-link">個人資料客戶申請</a>」介面存取、取回或刪除產品數據。</li>
          </ol>
        </div>
        <div class="consent-actions">
          <button class="consent-btn" data-go="back">拒絕</button>
          <button class="consent-btn" data-go="feedback" data-label="同意">同意</button>
        </div>
      `,
    },
    {
      id: 'feedback',
      back: 'feedback-consent',
      code: '1_350',
      name: '問題回報',
      description: '問題回報：填寫地區、電子郵件和問題描述，按發送後到首頁',
      figmaNode: '0:169',
      theme: 'light',
      render: () => `
        <header class="navbar fb-navbar">
          <button class="navbar-btn" data-go="back" aria-label="關閉">${ICON.close}</button>
          <h1 class="navbar-title">問題回報</h1>
          <button class="navbar-btn navbar-btn-right fb-send" data-go="home-offline">發送</button>
        </header>
        <div class="fb-body">
          <p class="fb-label">您所在的地區</p>
          <div class="fb-field">台灣${FB_CLEAR}</div>
          <label class="fb-label" for="fb-email">您的電子郵件地址<span class="fb-required">* 必填</span></label>
          <div class="fb-field fb-input fb-email filled"><input id="fb-email" type="email" value="asus1234@asus.com" placeholder="例如 name@example.com" autocomplete="off" required><button class="fb-email-clear" type="button" aria-label="清除">${FB_CLEAR}</button></div>
          <p class="fb-error" hidden>請輸入有效的電子郵件地址</p>
          <p class="fb-label">問題回報類型</p>
          <button class="fb-field fb-select" data-go="feedback-type" data-label="問題回報類型">設定問題${ICON.chevron}</button>
          <p class="fb-label">問題回報描述</p>
          <button class="fb-field fb-select" data-go="feedback-topic" data-label="問題回報描述">網路設定精靈${ICON.chevron}</button>
          <label class="fb-label" for="fb-comment">評論 / 建議</label>
          <div class="fb-field fb-input fb-comment">
            <textarea id="fb-comment" placeholder="在此輸入" maxlength="2000"></textarea>
            <span class="fb-count">0/2000</span>
          </div>
          <button class="fb-field fb-select fb-attach" data-go="feedback-image" data-label="附加圖片">附加圖片${ICON.chevron}</button>
        </div>

        <div class="wan-type-hud fb-loading show" role="status">
          <span class="wan-type-spinner">${Array.from({ length: 12 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>
          Loading...
        </div>
      `,
      mount: el => {
        // Arriving from 1_345 同意: same black spinner HUD as 1_125 Auto Detect for 2 s while the form loads
        const loading = setTimeout(() => el.querySelector('.fb-loading').classList.remove('show'), 2000);

        const text = el.querySelector('#fb-comment');
        const count = el.querySelector('.fb-count');
        text.addEventListener('input', () => { count.textContent = `${text.value.length}/2000`; });

        // Email is required: show the clear button only when filled, and block 發送 until it is valid
        const email = el.querySelector('#fb-email');
        const box = el.querySelector('.fb-email');
        const error = el.querySelector('.fb-error');
        const valid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        const showError = on => { box.classList.toggle('invalid', on); error.hidden = !on; };
        email.addEventListener('input', () => {
          box.classList.toggle('filled', email.value !== '');
          if (valid()) showError(false);
        });
        el.querySelector('.fb-email-clear').addEventListener('click', () => {
          email.value = '';
          box.classList.remove('filled');
          email.focus();
        });
        const onSend = e => {
          if (!e.target.closest('.fb-send') || valid()) return;
          e.stopPropagation();
          showError(true);
          email.focus();
        };
        el.addEventListener('click', onSend, true);
        return () => { clearTimeout(loading); el.removeEventListener('click', onSend, true); };
      },
    },
    {
      id: 'home-offline',
      back: 'no-internet',
      code: '1_360',
      name: '首頁：網路異常',
      description: '首頁（尚未連網）：路由器還在連線中，下方橘色提示「網路連線可能異常」，可以進入詳細診斷',
      figmaNode: '0:398',
      theme: 'light',
      render: () => `
        ${homeTop()}

        <div class="home-body">
          ${routerCard(true)}
          <h2 class="home-welcome">歡迎使用</h2>
          <p class="home-model">ZenWiFi BT8</p>
          <img class="home-offline-device" src="assets/home-offline-device.jpg" alt="ZenWiFi BT8" width="180" height="219">
          <div class="page-dots" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></div>
          ${homeShortcuts()}
        </div>

        <div class="home-alert">
          <span>網路連線可能異常</span>
          <button data-go="diagnosis" data-label="詳細診斷">詳細診斷</button>
        </div>

        ${homeTabs()}
      `,
    },
    {
      id: 'diagnosis',
      back: 'home-offline',
      code: '1_370',
      name: '網路診斷',
      description: '網路診斷：從 1_360「詳細診斷」進來直接開始檢查，依序檢查裝置 → 路由器 → 上游設備 → 網際網路，顯示正常／不穩／異常和排除建議',
      theme: 'light',
      render: () => `
        <div class="diag-hero">
          <header class="navbar diag-navbar">
            <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
            <h1 class="navbar-title">Network Diagnostic</h1>
          </header>
          <div class="diag-head">
            <div class="diag-icon"></div>
            <div><h2 class="diag-title"></h2><p class="diag-sub"></p></div>
          </div>
          <button class="diag-btn" type="button"></button>
        </div>
        <button class="diag-sec" data-decide="diagnosis">連線檢查</button>
        <div class="diag-steps"></div>
      `,
      mount: el => {
        const hero = el.querySelector('.diag-hero');
        const btn = el.querySelector('.diag-btn');
        let statuses = DIAG_STEPS.map(() => 'pending');
        let timers = [];
        const stop = () => { timers.forEach(clearTimeout); timers = []; };

        function renderHero(state, o) {
          hero.dataset.state = state;
          el.querySelector('.diag-icon').innerHTML = DIAG_HERO_ICON[state] || DIAG_HERO_ICON.search;
          el.querySelector('.diag-title').textContent = o.title;
          el.querySelector('.diag-sub').textContent = o.sub;
          btn.textContent = o.btn;
          btn.disabled = !!o.disabled;
        }

        function renderSteps() {
          el.querySelector('.diag-steps').innerHTML = DIAG_STEPS.map((s, i) => {
            const st = statuses[i];
            const pingFail = st === 'fail' || st === 'faildns';
            const dnsFail = st === 'dns' || st === 'warndns' || st === 'faildns';
            const parts = [];
            if (st === 'warn' || st === 'warndns') parts.push(DIAG_WARN);
            if (pingFail) parts.push(DIAG_PING_FAIL[s.key]);
            if (dnsFail) parts.push(DIAG_DNS_FAIL[s.key]);
            // Any error → red callout; ping-unstable alone → orange
            const box = parts.length ? `<div class="diag-box${pingFail || dnsFail ? '' : ' warn'}">${parts.map(p => `
              <div class="diag-part"><b>${p.title}</b>${p.lines.map(l => `<span>${p.lines.length > 1 ? '• ' : ''}${l}</span>`).join('')}</div>`).join('')}</div>` : '';
            return `
              <div class="diag-row">
                <div class="diag-row-icon"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#5f6368" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg></div>
                <div class="diag-row-main">
                  <div class="diag-row-top"><span>${s.label}</span>${diagStatusIcon(st)}</div>
                  ${box}
                </div>
              </div>`;
          }).join('');
        }

        // Page-level state follows the worst row: fail > warn > success
        function applyStatuses() {
          if (statuses.some(x => diagSev(x) === 'fail')) renderHero('fail', { title: '網路連線異常', sub: '請依下方步驟排除問題後，再重新診斷', btn: '重新診斷' });
          else if (statuses.includes('warn')) renderHero('warn', { title: '網路連線不穩定', sub: '目前仍可連線，但部分檢測顯示可能影響上網體驗', btn: '重新診斷' });
          else renderHero('success', { title: '網路連線正常', sub: '網路連線正常運作中，好好享受網際網路吧', btn: '重新診斷' });
          renderSteps();
        }

        // First row spins 4 s, then each next row reveals 1 s apart; a failed row (❌) stops the chain
        function run() {
          stop();
          const plan = DIAG_SCENARIOS[DIAG_SCENARIO];
          statuses = DIAG_STEPS.map(() => 'pending');
          renderHero('running', { title: '診斷您的網路連線', sub: '診斷中，請稍候...', btn: '診斷中...', disabled: true });
          statuses[0] = 'checking';
          renderSteps();
          let i = 0;
          const reveal = () => {
            statuses[i] = plan[i];
            if (diagSev(plan[i]) === 'fail' || i >= DIAG_STEPS.length - 1) return applyStatuses();
            statuses[++i] = 'checking';
            renderSteps();
            timers.push(setTimeout(reveal, 1000));
          };
          timers.push(setTimeout(reveal, 4000));
        }

        btn.addEventListener('click', run);
        run(); // 詳細診斷 from the alert bar goes straight into 診斷中
        return stop;
      },
    },
  ];

  // Demo-only branch points; see app.js (data-decide="<name>")
  window.QIS_DECISIONS = {
    wan: {
      index: 0,
      label: 'WAN',
      title: 'WAN 偵測結果？',
      options: [
        { label: '1 · 正常', short: '正常', value: 'ok', to: 'wan-detecting' },
        { label: '2 · 沒有偵測到 WAN、要不到 IP、US SKU', short: '沒有 WAN、要不到 IP、US SKU', value: 'no-ip-us', to: 'modem-unplug' },
        { label: '3 · 沒有偵測到 WAN', short: '沒有 WAN', value: 'no-wan', to: 'wan-type' },
      ],
    },
    wanDetect: {
      index: 1,
      label: 'Auto Detect',
      title: 'Auto Detect：這次有偵測到 WAN 嗎？',
      options: [
        { label: 'Yes · WAN Detected', short: 'Yes', value: 'yes', to: 'setup-ssid' },
        { label: 'No · 仍未偵測到 WAN（跳出提示，留在 1_125）', short: 'No', value: 'no', action: showWanAlert },
      ],
    },
    // After AiMesh (1_200). Picked again from the demo bar, each one also replays the step it decides
    internet: {
      index: 2,
      label: 'Internet',
      title: 'Internet Connected?（link internet = 2 & ping 通 internet）',
      options: [
        { label: 'Yes · 已連上網際網路', short: 'Yes', value: 'yes', action: () => { INTERNET = true; window.QIS_decide('nodeCount'); } },
        { label: 'No · 沒有連上網際網路', short: 'No', value: 'no', action: () => { INTERNET = false; window.QIS_decide('nodeCount'); } },
      ],
    },
    nodeCount: {
      index: 3,
      label: '節點台數',
      title: 'node 台數？',
      options: [
        { label: '0 台', short: '0 台', value: 'none', get to() { return INTERNET ? 'internet-live' : null; }, action: nodeCountAction(null) },
        { label: '≥ 1 台 · 節點優化中（藍線）', short: '≥1 台 優化中', value: 'optimising', get to() { return nodeCountTarget(); }, action: nodeCountAction('optimising') },
        { label: '≥ 1 台 · 連線品質待優化（黃線）', short: '≥1 台 品質待優化', value: 'weak', get to() { return nodeCountTarget(); }, action: nodeCountAction('weak') },
        { label: '≥ 1 台 · 節點沒有回應（灰線）', short: '≥1 台 沒回應', value: 'offline', get to() { return nodeCountTarget(); }, action: nodeCountAction('offline') },
      ],
    },
    mobile: {
      index: 4,
      label: '行動網路',
      title: 'Mobile 行動網路？',
      options: [
        { label: 'Yes', short: 'Yes', value: 'yes', to: 'summary', action: () => { FINISH = 'mobile'; } },
        { label: 'No', short: 'No', value: 'no', to: 'summary', action: () => { FINISH = 'offline'; } },
      ],
    },
    diagnosis: {
      index: 5,
      label: '診斷',
      title: '網路診斷結果？',
      options: [
        ['success', '都正常'],
        ['warn', '不穩'],
        ['fail', '有錯誤'],
        ['mixed', '錯誤＋不穩'],
        ['dns', 'DNS 異常'],
        ['warndns', 'Ping 不穩＋DNS 異常'],
        ['faildns', 'Ping 異常＋DNS 異常'],
      ].map(([value, label]) => ({
        label, short: label, value,
        to: 'diagnosis',
        action: () => { DIAG_SCENARIO = value; },
      })),
    },
  };
})();
