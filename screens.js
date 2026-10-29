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
    unplug: 'Your router couldn’t get an Internet connection (IP address) from the modem. Many cable modems, common in the US, stay locked to the first device they were connected to. Restarting the modem clears that so it can work with your new ASUS router.',
    waitOff: 'The modem needs a few minutes without power to fully reset and forget the device it was locked to. Plugging it in too soon may keep the old connection.',
    plug: 'Powering the modem back on lets it reconnect to your Internet provider and get ready to pair with your new router.',
    waitStart: 'Starting up and reconnecting to your Internet provider takes a few minutes. Once it finishes, your router can get an Internet address from it.',
  };

  function modemWhy(key) {
    return MODEM_FLOW === 'wan' ? `<p class="modem-why">${MODEM_WHY[key]}</p>` : '';
  }

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
  function modemIllust(state) {
    const on = state === 'on';
    // Each page plays one move once and stays there: 1_033 pulls the plug out, 1_036 pushes it in.
    // An arrow first fades in and nudges the way to go, then the plug moves. SMIL so the cable can bend with it.
    // IN sits over the outlet face so plug and outlet overlap like it is really plugged in
    const IN = { x: 324, y: 168, r: 0, cable: 'M150 280 C170 334 252 330 252 244 C252 194 262 168 288 168' };
    const OUT = { x: 236, y: 182, r: -10, cable: 'M150 280 C170 334 200 326 196 258 C193 214 186 184 200 182' };
    const [from, to] = on ? [OUT, IN] : [IN, OUT];
    const MOVE = 'begin="1.9s" dur="1.1s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.2 1"';
    const LED_ON = '#34d86f', LED_OFF = '#4a525d';

    const leds = ['POWER', 'DS', 'US', 'ONLINE'].map((name, i) => {
      const y = 156 + i * 24;
      // Right after the move, lights quickly go off one by one (1_033), or come on and keep
      // blinking like a modem starting up (1_036), each with a glow; each light blinks at its own pace
      const begin = `begin="${(3.0 + i * 0.12).toFixed(2)}s"`;
      const off = `${begin} dur="0.2s" fill="freeze"`;
      const blink = `${begin} dur="${(0.7 + i * 0.16).toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;0.55"`;
      return `
        <text x="112" y="${y + 3}" text-anchor="end" class="modem-led-label">${name}</text>
        <circle cx="127" cy="${y}" r="9.5" fill="${LED_ON}" opacity="${on ? 0 : 0.28}">
          <animate attributeName="opacity" ${on ? `${blink} values="0.28;0"` : `${off} values="0.28;0"`}/>
        </circle>
        <circle cx="127" cy="${y}" r="5" fill="${on ? LED_OFF : LED_ON}">
          <animate attributeName="fill" ${on ? `${blink} values="${LED_ON};${LED_OFF}"` : `${off} values="${LED_ON};${LED_OFF}"`}/>
        </circle>`;
    }).join('');

    return `
      <svg class="modem-svg" viewBox="0 0 400 330" width="400" height="330" aria-hidden="true">
        <defs>
          <radialGradient id="modem-halo-${state}">
            <stop offset="0" stop-color="#d6e6fb"/>
            <stop offset="0.65" stop-color="#e9f1fc"/>
            <stop offset="1" stop-color="#f4f8fe" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="120" cy="196" r="118" fill="url(#modem-halo-${state})"/>
        <ellipse cx="120" cy="290" rx="100" ry="9" fill="#eceef2"/>

        <!-- Dark modem body so it reads as a modem, not a power strip -->
        <rect x="78" y="90" width="84" height="198" rx="16" fill="#2b323b"/>
        <rect x="80" y="92" width="80" height="6" rx="3" fill="#3a434e"/>
        <rect x="90" y="104" width="60" height="172" rx="10" fill="#353d47"/>
        <rect x="98" y="112" width="1.5" height="156" rx="0.75" fill="#424b56"/>
        <text x="120" y="128" text-anchor="middle" class="modem-name">MODEM</text>
        ${leds}

        <rect x="292" y="118" width="88" height="100" rx="14" fill="#fff" stroke="#d5dae1" stroke-width="2"/>
        <circle cx="336" cy="168" r="30" fill="#f0f3f7"/>
        <rect x="326" y="155" width="4" height="17" rx="2" fill="#5b6573"/>
        <rect x="342" y="155" width="4" height="17" rx="2" fill="#5b6573"/>
        <circle cx="336" cy="183" r="2.6" fill="#5b6573"/>

        <path fill="none" stroke="#6f7780" stroke-width="6" stroke-linecap="round" d="${from.cable}">
          <animate attributeName="d" ${MOVE} values="${from.cable};${to.cable}"/>
        </path>
        <g transform="translate(${from.x} ${from.y})">
          <animateTransform attributeName="transform" type="translate" ${MOVE} values="${from.x} ${from.y};${to.x} ${to.y}"/>
          <g transform="rotate(${from.r})">
            <animateTransform attributeName="transform" type="rotate" ${MOVE} values="${from.r};${to.r}"/>
            <rect x="-36" y="-11" width="30" height="22" rx="5" fill="#3a4452"/>
            <rect x="-8" y="-8" width="8" height="16" rx="2" fill="#5b6573"/>
            <rect x="0" y="-6" width="14" height="3.2" rx="1.2" fill="#a3abb5"/>
            <rect x="0" y="2.8" width="14" height="3.2" rx="1.2" fill="#a3abb5"/>
          </g>
        </g>
        <g opacity="0">
          <animate attributeName="opacity" begin="0.4s" dur="0.3s" fill="freeze" values="0;1"/>
          <animate attributeName="opacity" begin="1.9s" dur="0.25s" fill="freeze" values="1;0"/>
          <g class="modem-arrow ${on ? 'is-right' : 'is-left'}">
            <path transform="${on ? 'translate(270 242)' : 'translate(318 242) scale(-1 1)'}"
              d="M-30 -6 H4 V-16 L30 0 L4 16 V6 H-30 Z" fill="var(--brand)" stroke="var(--brand)" stroke-width="5" stroke-linejoin="round"/>
          </g>
        </g>
        ${on ? '' : `
          <g stroke="var(--brand)" stroke-width="3.5" stroke-linecap="round" opacity="0">
            <animate attributeName="opacity" begin="2.8s" dur="0.3s" fill="freeze" values="0;1"/>
            <path d="M262 112 L265 132"/><path d="M272 146 L286 132"/><path d="M280 160 L298 155"/>
          </g>
        `}

        <text x="120" y="322" text-anchor="middle" class="modem-caption">${on ? 'CABLE MODEM' : 'ALL LIGHTS OFF'}</text>
        <text x="336" y="322" text-anchor="middle" class="modem-caption modem-caption-brand">${on ? 'POWER' : 'POWER PLUG'}</text>
      </svg>`;
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
          <button class="text-link" data-go="feedback">問題回報</button>
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
      name: '拔掉數據機電源',
      description: '重新啟動數據機（1/2）：只拔數據機的電源線，等所有燈都熄滅，不要按 Reset',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">Setup Guide</h1>
          <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
        </header>

        <div class="guide-body">
          <div class="guide-illust modem-illust">
            <p class="modem-hint">Unplug the power cable only</p>
            ${modemIllust('off')}
          </div>
          <h2 class="guide-title">Unplug the modem’s power.</h2>
          <p class="guide-desc">Wait until all lights are off.</p>
          <p class="modem-note"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><rect x="11" y="10" width="2" height="7" rx="1" fill="#fff"/><circle cx="12" cy="7" r="1.3" fill="#fff"/></svg>Do not press the Reset button.</p>
          ${modemWhy('unplug')}
          <button class="btn-brand" data-go="${MODEM_FLOW === 'wan' ? 'modem-wait-off' : 'modem-plug'}" data-label="All modem lights are off">All modem lights are off</button>
        </div>
      `,
    },
    {
      id: 'modem-plug',
      get back() { return MODEM_FLOW === 'wan' ? 'modem-wait-off' : 'modem-unplug'; },
      code: '1_036',
      name: '插回數據機電源',
      description: '重新啟動數據機（2/2）：把電源線插回數據機，燈號重新亮起後再繼續',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">Setup Guide</h1>
          <button class="navbar-btn navbar-btn-right" data-go="help" data-label="說明" aria-label="說明">${ICON.helpOutline}</button>
        </header>

        <div class="guide-body">
          <div class="guide-illust modem-illust">
            <p class="modem-hint">Reconnect the power cable</p>
            ${modemIllust('on')}
          </div>
          <h2 class="guide-title">Plug the modem back in.</h2>
          ${modemWhy('plug')}
          <button class="btn-brand" data-go="${MODEM_FLOW === 'wan' ? 'modem-wait-start' : 'led-check'}" data-label="Modem is plugged in">Modem is plugged in</button>
        </div>
      `,
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
      render: () => `
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
            <button class="btn-primary" data-go="qr-intro">Next</button>
            <button class="text-link" data-go="led-not-blue">It is not solid blue light.</button>
          </div>
        </div>
      `,
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
    ...[
      {
        code: '1_051',
        title: 'What we’ll need',
        desc: 'Find these in your ASUS router’s packaging. You’ll only need one router for now if you have more than one device. More can be set up later.',
        summary: '準備物品：數據機、路由器、電源線、網路線',
        illust: `
          <ul class="sg-need">
            ${[['modem', 'Modem'], ['router', 'Router'], ['power', 'Power cord'], ['ethernet', 'Ethernet cord']].map(([k, label]) => `
              <li><img src="assets/sg-need-${k}.jpg" alt="" width="148" height="148"><span>${label}</span></li>`).join('')}
          </ul>`,
      },
      {
        code: '1_052',
        title: 'Unplug Modem and Older Router from Power',
        desc: 'Unplug your cable/DSL modem. If it has a battery backup, remove the battery.<br>If you have other wireless equipment connected to your modem, please unplug it as well.',
        summary: '拔掉數據機和舊路由器的電源',
        illust: '<img src="assets/sg-unplug.jpg" alt="" width="318" height="318" style="margin-top:24px">',
      },
      {
        code: '1_053',
        title: 'Plug in Your Devices',
        desc: 'Connect your modem’s LAN port to WAN port on router and power them both on.',
        summary: '接上裝置：數據機 LAN 埠接到路由器 WAN 埠，兩台都開機',
        illust: '<img src="assets/sg-plug.jpg" alt="" width="318" height="318" style="margin-top:24px">',
      },
      {
        code: '1_054',
        title: 'Prepare Another Node',
        desc: '1. Place your node(s) and router within a proper distance.<br><br>2. Power node(s) on and wait until you see a static blue light. Your node(s) will automatically connect to your router afterwards.',
        summary: '準備節點：放在適當距離內，開機等恆亮藍燈',
        illust: '<img src="assets/sg-nodes.jpg" alt="" width="293" height="246" style="margin-top:70px">',
      },
      {
        code: '1_055',
        title: 'Check LED Lights',
        desc: 'Wait for one minute until you see a static blue light on the router and node(s).',
        summary: '確認燈號：等一分鐘，路由器和節點都亮恆亮藍燈',
        illust: '<img src="assets/sg-nodes.jpg" alt="" width="293" height="246" style="margin-top:70px">',
        button: 'I’m ready',
      },
    ].map((g, i, all) => ({
      id: i === 0 ? 'setup-guide' : `setup-guide-${i + 1}`,
      back: i === 0 ? 'qr-intro' : i === 1 ? 'setup-guide' : `setup-guide-${i}`,
      code: g.code,
      name: `Setup Guide ${i + 1}/${all.length}`,
      description: `1_050 的 ? → Setup Guide ${i + 1}/${all.length}：${g.summary}`,
      figmaNode: '1891:1333',
      theme: 'light',
      render: () => `
        <header class="navbar navbar-guide">
          <button class="navbar-btn" data-go="back" aria-label="返回">${ICON.back}</button>
          <h1 class="navbar-title">Setup Guide</h1>
        </header>

        <div class="guide-body">
          <div class="guide-illust">${g.illust}</div>
          <h2 class="guide-title">${g.title}</h2>
          <p class="guide-desc">${g.desc}</p>
          <button class="btn-brand sg-next" data-go="${i + 1 < all.length ? `setup-guide-${i + 2}` : 'qr-intro'}">${g.button || 'Next'}</button>
          <div class="sg-dots" aria-hidden="true">${all.map((_, j) => `<span${j === i ? ' class="is-on"' : ''}></span>`).join('')}</div>
        </div>
      `,
    })),
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
          <button class="feedback-card" data-go="feedback" data-label="Feedback">
            ${FEEDBACK_ICON}
            <span><b>Feedback</b><small>提供問題資訊，協助我們了解您的連線狀況</small></span>
          </button>
          <button class="noinet-done" data-go="home-offline">完成設定</button>
        </div>
      `,
    },
    {
      id: 'feedback',
      back: 'no-internet',
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
      `,
      mount: el => {
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
        return () => el.removeEventListener('click', onSend, true);
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
