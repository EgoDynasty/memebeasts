// ============================================================
// Мемные Звери Мердж - v0.3 (ядро + SDK + реклама + мета)
// Чистый JS без сборки. Баланс - config.js, платформа - platform.js.
// ============================================================
(function () {
  const C = window.CONFIG;
  const P = window.Platform;
  const SLOTS = C.gridCols * C.gridRows;

  // ---------- защита от зума в мобильных браузерах ----------
  // iOS Safari 10+ игнорит user-scalable=no, а touch-action: manipulation гасит
  // двойной-тап-зум не всегда (особенно при быстром долблении маскота). Добиваем руками:
  //  - pinch-жест;
  //  - быстрый повторный тап (кроме кнопок, чтобы не рубить их click).
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
  });
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (e) {
    const n = Date.now();
    if (n - lastTouchEnd <= 320 && !e.target.closest('button, .action-btn')) e.preventDefault();
    lastTouchEnd = n;
  }, { passive: false });

  // ---------- локализация ----------
  const I18N = {
    ru: {
      mascot_name: 'КАПИБАРА', buy_title: 'Купить зверя', tap_title: '💪 Тап +',
      case_title: '📦 Кейс', case_free: '📦 Кейс за 📺', take: 'Забрать!', close: 'Закрыть',
      claim: 'Забрать', claim_x2: 'Забрать x2 📺',
      offline_title: 'Пока тебя не было...', offline_earned: 'Звери заработали',
      daily_title: 'Ежедневный бонус', daily_day: 'День подряд: {n}',
      daily_case: 'Сегодня внутри ЛЕГЕНДАРНЫЙ КЕЙС!',
      collection: 'Коллекция', unknown: '???', quest_label: 'Задание',
      rate_title: 'Залетела игра?', rate_text: 'Оценка помогает зверям пробиться в топ!',
      rate_yes: 'Оценить ⭐', rate_no: 'Позже',
      ad_mock: 'РЕКЛАМА (заглушка, на площадке будет настоящая)',
      up_rarity: '📺 Апнуть редкость (шанс 50%)', up_success: 'АПНУЛОСЬ! 🎉', up_fail: 'Не повезло...',
      new_beast: 'НОВЫЙ ЗВЕРЬ! +{n}🪙',
      per_tap: '+{n} за тап', per_sec: '+{n}/сек',
      hint_full: 'Поле забито! Перетащи зверя на такого же - МЕРДЖ!',
      hint_tap: 'Тапай по капибаре и копи на первого зверя!',
      hint_buy: 'Купи зверя - он приносит монеты сам!',
      hint_merge: 'Перетащи зверя на такого же - получится круче!',
      hint_case: 'Открой первый кейс - сегодня повезёт 😉',
      rarity_common: 'Обычный', rarity_rare: 'Редкий', rarity_epic: 'Эпический', rarity_legendary: 'ЛЕГЕНДАРНЫЙ',
      gear_title: 'Экипировка', gear_total: '+{n}% к доходу', gear_empty_slot: 'пусто',
      gear_inv_label: 'Инвентарь', gear_inv_empty: 'Открывай шмот-кейсы - выпадет экипировка!',
      gear_equip: 'Надеть', gear_equipped: 'Надето', gear_sell: 'Продать {n}🪙',
      gear_unlocked: '🎒 Открыта ЭКИПИРОВКА! Собирай сет на бафф дохода',
      cases_unlocked: '📦 Открыты КЕЙСЫ! Лови редких зверей',
      gear_drop: 'Выпало: {item}', per_slot: '+{n}%', gear_case: '🎁 Шмот-кейс',
    },
    en: {
      mascot_name: 'CAPYBARA', buy_title: 'Buy a beast', tap_title: '💪 Tap +',
      case_title: '📦 Case', case_free: '📦 Case for 📺', take: 'Claim!', close: 'Close',
      claim: 'Claim', claim_x2: 'Claim x2 📺',
      offline_title: 'While you were away...', offline_earned: 'Your beasts earned',
      daily_title: 'Daily bonus', daily_day: 'Day streak: {n}',
      daily_case: 'A LEGENDARY CASE inside today!',
      collection: 'Collection', unknown: '???', quest_label: 'Quest',
      rate_title: 'Enjoying the game?', rate_text: 'Your rating helps the beasts reach the top!',
      rate_yes: 'Rate ⭐', rate_no: 'Later',
      ad_mock: 'AD (mock, real ads on the platform)',
      up_rarity: '📺 Upgrade rarity (50% chance)', up_success: 'UPGRADED! 🎉', up_fail: 'No luck...',
      new_beast: 'NEW BEAST! +{n}🪙',
      per_tap: '+{n} per tap', per_sec: '+{n}/sec',
      hint_full: 'Board is full! Drag a beast onto its twin - MERGE!',
      hint_tap: 'Tap the capybara and save up for your first beast!',
      hint_buy: 'Buy a beast - it earns coins by itself!',
      hint_merge: 'Drag a beast onto its twin - get a cooler one!',
      hint_case: 'Open your first case - you will get lucky 😉',
      rarity_common: 'Common', rarity_rare: 'Rare', rarity_epic: 'Epic', rarity_legendary: 'LEGENDARY',
      gear_title: 'Gear', gear_total: '+{n}% income', gear_empty_slot: 'empty',
      gear_inv_label: 'Inventory', gear_inv_empty: 'Open gear cases to find equipment!',
      gear_equip: 'Equip', gear_equipped: 'Equipped', gear_sell: 'Sell {n}🪙',
      gear_unlocked: '🎒 GEAR unlocked! Build a set to boost income',
      cases_unlocked: '📦 CASES unlocked! Catch rare beasts',
      gear_drop: 'Dropped: {item}', per_slot: '+{n}%', gear_case: '🎁 Gear case',
    },
  };
  let LANG = 'ru';
  function t(key, vars) {
    let s = (I18N[LANG] && I18N[LANG][key]) || I18N.ru[key] || key;
    if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  }
  function applyStaticTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  }

  // ---------- состояние ----------
  let state = {
    coins: 0,
    totalEarned: 0,
    grid: Array(SLOTS).fill(null),   // null | {tier, rarity}
    slots: C.slotsStart,             // сколько слотов открыто (остальные покупаются)
    merges: 0,                       // счётчик мерджей (для квестов)
    quest: 0,                        // индекс текущего квеста
    bought: 0,
    paidCases: 0,                    // для цены кейса (бесплатные не дорожают)
    tapLevel: 0,
    casesOpened: 0,
    sinceLegendary: 0,
    firstCaseDone: false,
    mergedOnce: false,
    highestTier: 1,
    discovered: {},                  // tier -> лучшая редкость
    daily: { last: '', streak: 0 },
    freeCaseAt: 0,                   // timestamp готовности бесплатного кейса
    boostUntil: 0,
    firstPlayAt: 0,
    rated: false,
    muted: false,
    // шмот
    equipped: { helmet: null, chest: null, legs: null, boots: null }, // {slot, rarity} | null
    inventory: [],                 // не надетые предметы: [{slot, rarity}]
    gearCasesOpened: 0,
    // постепенное открытие вкладок (обучение)
    unlocked: { cases: false, gear: false },
    lastSeen: now(),
  };
  let lastInterstitial = 0; // не сохраняем: кэп на сессию

  function now() { return Math.floor(Date.now() / 1000); }
  function today() { return new Date().toISOString().slice(0, 10); }

  // ---------- сохранение ----------
  function save() {
    state.lastSeen = now();
    try { localStorage.setItem(C.saveKey, JSON.stringify(state)); } catch (e) {}
    P.cloudSave(state);
  }
  function loadLocal() {
    try {
      const raw = localStorage.getItem(C.saveKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }
  function adoptSave(data) {
    if (data) state = Object.assign(state, data);
    // страховки для старых сейвов
    if (!state.discovered) state.discovered = {};
    state.grid.forEach(b => { if (b && !state.discovered[b.tier]) state.discovered[b.tier] = b.rarity; });
    state.grid.forEach(b => { if (b && !b.variant) b.variant = 'plain'; }); // страховка под новое поле variant
    if (!state.firstPlayAt) state.firstPlayAt = now();
    if (!state.freeCaseAt) state.freeCaseAt = now() + C.freeCaseCooldownSec;
    // страховки под новые поля (старые сейвы)
    if (state.merges == null) state.merges = state.mergedOnce ? 1 : 0;
    if (state.quest == null) state.quest = 0;
    if (state.slots == null) {
      let lastOcc = -1;
      state.grid.forEach((b, i) => { if (b) lastOcc = i; });
      state.slots = Math.max(C.slotsStart, lastOcc + 1); // не запираем уже занятые слоты
    }
    state.slots = Math.min(state.slots, SLOTS);
    // страховки под шмот и открытие вкладок (старые сейвы)
    if (!state.equipped) state.equipped = { helmet: null, chest: null, legs: null, boots: null };
    if (!Array.isArray(state.inventory)) state.inventory = [];
    if (state.gearCasesOpened == null) state.gearCasesOpened = 0;
    if (!state.unlocked) state.unlocked = { cases: false, gear: false };
    // если игрок уже прошёл вехи - вкладки сразу открыты (не прячем то, чем уже пользовались)
    if (state.mergedOnce || state.casesOpened > 0) state.unlocked.cases = true;
    if (state.highestTier >= C.gear.unlockTier) state.unlocked.gear = true;
  }

  // ---------- экономика ----------
  const rarityById = {};
  C.rarities.forEach(r => rarityById[r.id] = r);
  function rarityName(id) { return t('rarity_' + id); }

  // варианты (модификаторы дохода поверх редкости)
  const variantById = {};
  (C.variants || []).forEach(v => variantById[v.id] = v);
  function variantMult(id) { const v = variantById[id]; return v ? v.mult : 1; }
  function variantName(id) { const v = variantById[id]; return v ? (LANG === 'en' ? v.en : v.ru) : ''; }
  function rollVariant() {
    let roll = Math.random() * 100;
    for (const v of C.variants) { roll -= v.chance; if (roll <= 0) return v.id; }
    return 'plain';
  }
  function betterVariant(a, b) { return variantMult(a) >= variantMult(b) ? a : b; }
  function nextVariant(id) {
    const i = C.variants.findIndex(v => v.id === id);
    return C.variants[Math.min(i + 1, C.variants.length - 1)].id;
  }

  // ---------- шмот (глобальный бафф дохода) ----------
  const gearRarityById = {};
  (C.gear.rarities || []).forEach(r => gearRarityById[r.id] = r);
  const gearSlotById = {};
  (C.gear.slots || []).forEach(s => gearSlotById[s.id] = s);
  function gearRarityName(id) { const r = gearRarityById[id]; return r ? (LANG === 'en' ? r.en : r.ru) : ''; }
  function gearSlotName(id) { const s = gearSlotById[id]; return s ? (LANG === 'en' ? s.en : s.ru) : ''; }
  function gearBonusOf(rarity) { const r = gearRarityById[rarity]; return r ? r.bonus : 0; }
  function gearBonus() { // множитель ко всему доходу поля = 1 + сумма надетых
    let sum = 0;
    for (const s of C.gear.slots) { const it = state.equipped[s.id]; if (it) sum += gearBonusOf(it.rarity); }
    return 1 + sum;
  }
  function gearBonusPct() { return Math.round((gearBonus() - 1) * 100); }
  function rollGearRarity() {
    let roll = Math.random() * 100;
    for (const r of C.gear.rarities) { roll -= r.chance; if (roll <= 0) return r.id; }
    return 'common';
  }
  function gearCaseCost() { return Math.max(C.gear.caseBase, Math.floor(rawIncome() * C.gear.caseSeconds)); }
  function gearSellValue(rarity) {
    const r = gearRarityById[rarity];
    return Math.max(r.sellFloor, Math.floor(rawIncome() * r.sellSec));
  }
  function gearUnlocked() { return state.unlocked && state.unlocked.gear; }
  function hasGearUpgrade() { // в инвентаре лежит предмет сильнее надетого в его слоте
    for (const it of state.inventory) {
      const cur = state.equipped[it.slot];
      if (!cur || gearBonusOf(it.rarity) > gearBonusOf(cur.rarity)) return true;
    }
    return false;
  }

  function boostActive() { return now() < state.boostUntil; }
  function boostFactor() { return boostActive() ? C.boostMult : 1; }

  function beastIncome(idx) {
    const b = state.grid[idx];
    if (!b) return 0;
    const base = C.incomeBase * Math.pow(C.incomeGrowth, b.tier - 1);
    let bonus = 1;
    for (const n of neighbors(idx)) {
      const nb = state.grid[n];
      if (nb && nb.rarity === b.rarity) bonus += C.neighborBonus;
    }
    return base * rarityById[b.rarity].mult * variantMult(b.variant) * bonus;
  }
  function neighbors(idx) {
    const col = idx % C.gridCols, row = Math.floor(idx / C.gridCols), res = [];
    if (col > 0) res.push(idx - 1);
    if (col < C.gridCols - 1) res.push(idx + 1);
    if (row > 0) res.push(idx - C.gridCols);
    if (row < C.gridRows - 1) res.push(idx + C.gridCols);
    return res;
  }
  function rawIncome() {
    let sum = 0;
    for (let i = 0; i < SLOTS; i++) sum += beastIncome(i);
    return sum;
  }
  function incomePerSec() { return rawIncome() * boostFactor() * gearBonus(); }
  function gain(n) { state.coins += n; state.totalEarned += n; }

  // цены привязаны к текущему доходу (без временного буста), но не ниже пола
  function buyCost()  { return Math.max(C.buyBase,      Math.floor(rawIncome() * C.buySeconds)); }
  function tapPower() { return Math.floor(C.tapBase * Math.pow(C.tapGrowth, state.tapLevel)) * boostFactor(); }
  function tapCost()  { return Math.floor(C.tapCostBase * Math.pow(C.tapCostGrowth, state.tapLevel)); }
  function caseCost() { return Math.max(C.caseBase,     Math.floor(rawIncome() * C.caseSeconds)); }
  // покупаемый зверь по нижней границе прогресса, чтобы догонять поле
  function buyTier()  { return Math.max(1, Math.min(state.highestTier - C.buyTierOffset, C.animals.length)); }
  function firstEmpty() {
    for (let i = 0; i < state.slots; i++) if (state.grid[i] === null) return i;
    return -1;
  }
  function canExpand() { return state.slots < SLOTS; }
  function slotCost() { return Math.max(C.slotCostBase, Math.floor(rawIncome() * C.slotSeconds)); }
  function freeCaseReady() { return now() >= state.freeCaseAt; }

  function fmt(n) {
    if (n < 1000) return Math.floor(n).toString();
    const units = ['K', 'M', 'B', 'T'];
    let u = -1;
    while (n >= 1000 && u < units.length - 1) { n /= 1000; u++; }
    return (n >= 100 ? Math.floor(n) : n.toFixed(1)) + units[u];
  }

  // ---------- звук ----------
  let audio = null;
  function beep(freq, dur, type, delay, vol) {
    if (state.muted) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      const tt = audio.currentTime + (delay || 0);
      const osc = audio.createOscillator(), g = audio.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.06, tt);
      g.gain.exponentialRampToValueAtTime(0.001, tt + dur);
      osc.connect(g); g.connect(audio.destination);
      osc.start(tt); osc.stop(tt + dur);
    } catch (e) {}
  }
  const sfx = {
    tap:   () => beep(500 + Math.random() * 150, .07),
    buy:   () => { beep(400, .08); beep(600, .1, 'square', .07); },
    merge: () => { beep(440, .09); beep(660, .09, 'square', .08); beep(880, .14, 'square', .16); },
    fail:  () => beep(160, .18, 'sawtooth'),
    coin:  () => beep(900, .06, 'triangle'),
    reveal:(r) => {
      const steps = { common: 1, rare: 2, epic: 3, legendary: 5 };
      for (let i = 0; i < (steps[r] || 1); i++) beep(520 + i * 130, .12, 'triangle', i * .1, .09);
    },
  };

  // ---------- арт-пайплайн: assets/beast-N.png и assets/mascot.png подхватываются сами ----------
  const art = {}; // tier -> true, 'mascot' -> true
  function probeArt() {
    for (let tier = 1; tier <= C.animals.length; tier++) {
      const img = new Image();
      img.onload = (function (tr) { return function () { art[tr] = true; renderGrid(); }; })(tier);
      img.src = 'assets/beast-' + tier + '.png';
    }
    const m = new Image();
    m.onload = function () {
      art.mascot = true;
      els.mascotFace.innerHTML = '<img src="assets/mascot.png" alt="">';
    };
    m.src = 'assets/mascot.png';
  }
  function beastFace(tier, cls) {
    if (art[tier]) return '<img class="' + (cls || 'b-img') + '" src="assets/beast-' + tier + '.png" alt="">';
    return '<div class="' + (cls === 'big-img' ? 'big-emoji' : 'b-emoji') + '">' + C.animals[tier - 1].emoji + '</div>';
  }

  // ---------- DOM ----------
  const $ = id => document.getElementById(id);
  const els = {
    coins: $('coins'), income: $('income'), hint: $('hint'),
    quest: $('quest'), questText: $('quest-text'), questProg: $('quest-prog'), questClaim: $('quest-claim'),
    grid: $('grid'), mascot: $('mascot'), mascotFace: $('mascot-face'), tapPower: $('tap-power'),
    buyBtn: $('buy-btn'), buyCost: $('buy-cost'),
    caseBtn: $('case-btn'), caseTitle: $('case-title'), caseCost: $('case-cost'),
    tapBtn: $('tap-upgrade-btn'), tapCost: $('tap-cost'),
    muteBtn: $('mute-btn'), boostBtn: $('boost-btn'), collectionBtn: $('collection-btn'),
    caseModal: $('case-modal'), caseAnim: $('case-anim'), caseBox: $('case-box'),
    caseResult: $('case-result'), caseEmoji: $('case-emoji'),
    caseName: $('case-name'), caseRarity: $('case-rarity'),
    caseUpgrade: $('case-upgrade'), caseClose: $('case-close'),
    offlineModal: $('offline-modal'), offlineAmount: $('offline-amount'),
    offlineClaim: $('offline-claim'), offlineDouble: $('offline-double'),
    dailyModal: $('daily-modal'), dailyDay: $('daily-day'), dailyStreak: $('daily-streak'),
    dailyAmount: $('daily-amount'), dailyClaim: $('daily-claim'),
    collectionModal: $('collection-modal'), collectionGrid: $('collection-grid'), collectionClose: $('collection-close'),
    rateModal: $('rate-modal'), rateYes: $('rate-yes'), rateNo: $('rate-no'),
    gearBtn: $('gear-btn'), gearBadge: $('gear-badge'), gearDot: $('gear-dot'),
    gearModal: $('gear-modal'), gearTotal: $('gear-total'),
    gearSlots: $('gear-slots'), gearCaseBtn: $('gear-case-btn'), gearCaseTitle: $('gear-case-title'),
    gearCaseCost: $('gear-case-cost'), gearInvLabel: $('gear-inv-label'), gearInv: $('gear-inv'),
    gearClose: $('gear-close'),
  };

  function floater(text, x, y, color) {
    const el = document.createElement('div');
    el.className = 'floater';
    el.textContent = text;
    if (color) el.style.color = color;
    el.style.left = (x - 20) + 'px';
    el.style.top = (y - 30) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
  function burst(x, y, emoji, count) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'floater';
      el.textContent = emoji;
      el.style.left = (x - 20 + (Math.random() - .5) * 120) + 'px';
      el.style.top = (y - 20 + (Math.random() - .5) * 80) + 'px';
      el.style.animationDelay = (Math.random() * .25) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1300);
    }
  }

  // ---------- interstitial с кэпами ----------
  function maybeInterstitial() {
    const n = now();
    if (n - state.firstPlayAt < C.interstitialGraceSec) return;
    if (n - lastInterstitial < C.interstitialMinGapSec) return;
    lastInterstitial = n;
    P.interstitial();
  }

  // ---------- рендер ----------
  function renderGrid() {
    els.grid.innerHTML = '';
    for (let i = 0; i < SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.idx = i;
      if (i >= state.slots) {
        // закрытый слот: первый закрытый - покупаемый (с ценой), остальные под замком
        slot.classList.add('locked');
        if (i === state.slots) {
          slot.classList.add('buyable');
          slot.innerHTML = '<div class="lock-plus">＋</div><div class="lock-cost">🪙 ' + fmt(slotCost()) + '</div>';
        } else {
          slot.innerHTML = '<div class="lock-ico">🔒</div>';
        }
        els.grid.appendChild(slot);
        continue;
      }
      const b = state.grid[i];
      if (b) {
        const r = rarityById[b.rarity];
        const el = document.createElement('div');
        el.className = 'beast';
        if (hasSameRarityNeighbor(i)) el.classList.add('synergy'); // подсветка бонуса соседства
        el.dataset.idx = i;
        el.dataset.variant = b.variant || 'plain'; // рамка варианта (золотой/радужный и т.д.)
        const vc = variantById[b.variant] && variantById[b.variant].color;
        if (vc && vc !== 'rainbow') el.style.setProperty('--variant', vc);
        el.style.setProperty('--rarity', r.color);
        el.innerHTML =
          '<div class="b-tier">' + b.tier + '</div>' +
          beastFace(b.tier) +
          '<div class="b-income">+' + fmt(beastIncome(i)) + '/с</div>';
        slot.appendChild(el);
      }
      els.grid.appendChild(slot);
    }
  }
  function hasSameRarityNeighbor(idx) {
    const b = state.grid[idx];
    if (!b) return false;
    for (const n of neighbors(idx)) {
      const nb = state.grid[n];
      if (nb && nb.rarity === b.rarity) return true;
    }
    return false;
  }

  // покупка слота: клик по первому закрытому слоту
  els.grid.addEventListener('click', (e) => {
    const slot = e.target.closest('.slot.buyable');
    if (!slot) return;
    if (!canExpand() || state.coins < slotCost()) { sfx.fail(); return; }
    state.coins -= slotCost();
    state.slots++;
    sfx.buy();
    renderGrid(); renderStats(); save();
  });

  // ---------- квесты ----------
  function questMetric(q) {
    switch (q.metric) {
      case 'bought':    return state.bought;
      case 'merges':    return state.merges;
      case 'tier':      return state.highestTier;
      case 'cases':     return state.casesOpened;
      case 'collected': return Object.keys(state.discovered).length;
    }
    return 0;
  }
  function renderQuest() {
    const q = C.quests[state.quest];
    if (!q) { els.quest.classList.add('hidden'); return; }
    els.quest.classList.remove('hidden');
    els.questText.textContent = (LANG === 'en' ? q.en : q.ru) + ' (+' + fmt(q.reward) + '🪙)';
    const val = questMetric(q);
    els.questProg.textContent = Math.min(val, q.target) + '/' + q.target;
    const done = val >= q.target;
    els.questClaim.classList.toggle('hidden', !done);
    els.quest.classList.toggle('ready', done);
  }
  els.questClaim.addEventListener('click', () => {
    const q = C.quests[state.quest];
    if (!q || questMetric(q) < q.target) return;
    gain(q.reward);
    state.quest++;
    sfx.coin();
    floater('+' + fmt(q.reward) + '🪙', innerWidth / 2, 130, '#4cd964');
    renderQuest(); renderStats(); save();
  });

  function renderStats() {
    checkUnlocks();
    els.coins.textContent = fmt(state.coins);
    els.income.textContent = t('per_sec', { n: fmt(incomePerSec()) });
    els.gearBtn.classList.toggle('hidden', !gearUnlocked());
    if (gearUnlocked()) {
      const pct = gearBonusPct();
      els.gearBadge.textContent = '+' + pct + '%';
      els.gearBadge.classList.toggle('hidden', pct <= 0);
      els.gearDot.classList.toggle('hidden', !hasGearUpgrade());
    }
    els.tapPower.textContent = t('per_tap', { n: fmt(tapPower()) });
    els.buyCost.textContent = '🪙 ' + fmt(buyCost());
    els.tapCost.textContent = '🪙 ' + fmt(tapCost());
    els.buyBtn.disabled = state.coins < buyCost() || firstEmpty() === -1;
    els.tapBtn.disabled = state.coins < tapCost();
    els.muteBtn.textContent = state.muted ? '🔇' : '🔊';
    els.collectionBtn.classList.toggle('hidden', Object.keys(state.discovered).length === 0);

    // кейс скрыт до первого мерджа (обучение), потом открывается насовсем
    els.caseBtn.classList.toggle('hidden', !state.unlocked.cases);
    // кейс: бесплатный за рекламу или за монеты
    if (freeCaseReady()) {
      els.caseTitle.textContent = t('case_free');
      els.caseCost.textContent = '0 🪙';
      els.caseBtn.disabled = firstEmpty() === -1;
      els.caseBtn.classList.add('pulse');
    } else {
      els.caseTitle.textContent = t('case_title');
      els.caseCost.textContent = '🪙 ' + fmt(caseCost());
      els.caseBtn.disabled = state.coins < caseCost() || firstEmpty() === -1;
      els.caseBtn.classList.remove('pulse');
    }

    // буст
    if (boostActive()) {
      const left = state.boostUntil - now();
      els.boostBtn.textContent = '⚡' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      els.boostBtn.disabled = true;
    } else {
      els.boostBtn.textContent = '📺 x2';
      els.boostBtn.disabled = false;
    }
    renderHint();
    renderQuest();
  }

  function renderHint() {
    let h = '';
    if (firstEmpty() === -1) h = t('hint_full');
    else if (state.bought === 0 && state.coins < buyCost()) h = t('hint_tap');
    else if (state.bought < 2 && state.coins >= buyCost()) h = t('hint_buy');
    else if (!state.mergedOnce && hasMergePair()) h = t('hint_merge');
    else if (!state.firstCaseDone && (state.coins >= caseCost() || freeCaseReady())) h = t('hint_case');
    els.hint.textContent = h;
  }
  function hasMergePair() {
    const seen = {};
    for (const b of state.grid) {
      if (!b) continue;
      if (seen[b.tier]) return true;
      seen[b.tier] = true;
    }
    return false;
  }

  // ---------- коллекция ----------
  function registerBeast(tier, rarity, x, y) {
    const prev = state.discovered[tier];
    if (!prev) {
      state.discovered[tier] = rarity;
      const bonus = Math.floor(C.discoveryBonusBase * Math.pow(2, tier));
      gain(bonus);
      sfx.coin();
      floater(t('new_beast', { n: fmt(bonus) }), x || innerWidth / 2, y || innerHeight / 2, '#4cd964');
    } else if (rarityById[rarity].mult > rarityById[prev].mult) {
      state.discovered[tier] = rarity;
    }
    state.highestTier = Math.max(state.highestTier, tier);
  }

  function renderCollection() {
    els.collectionGrid.innerHTML = '';
    C.animals.forEach(a => {
      const known = state.discovered[a.tier];
      const cell = document.createElement('div');
      cell.className = 'coll-cell';
      if (known) {
        cell.style.setProperty('--rarity', rarityById[known].color);
        cell.innerHTML = beastFace(a.tier) + '<div class="coll-name">' + a.name + '</div>' +
          '<div class="coll-rarity" style="color:' + rarityById[known].color + '">' + rarityName(known) + '</div>';
      } else {
        cell.innerHTML = '<div class="b-emoji">❓</div><div class="coll-name">' + t('unknown') + '</div>';
        cell.classList.add('unknown');
      }
      els.collectionGrid.appendChild(cell);
    });
  }
  els.collectionBtn.addEventListener('click', () => { renderCollection(); els.collectionModal.classList.remove('hidden'); });
  els.collectionClose.addEventListener('click', () => els.collectionModal.classList.add('hidden'));

  // ---------- тост (открытие вкладок и события) ----------
  function toast(text) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('show'), 20);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 350); }, 2600);
  }

  // ---------- постепенное открытие вкладок (обучение) ----------
  // Кейсы открываются после первого мерджа, рюкзак - на unlockTier. Один раз с тостом.
  function checkUnlocks() {
    if (!state.unlocked.cases && (state.mergedOnce || state.casesOpened > 0)) {
      state.unlocked.cases = true;
      toast(t('cases_unlocked')); sfx.coin(); save();
    }
    if (!state.unlocked.gear && state.highestTier >= C.gear.unlockTier) {
      state.unlocked.gear = true;
      toast(t('gear_unlocked')); sfx.reveal('epic'); save();
    }
  }

  // ---------- ШМОТ: экипировка + инвентарь ----------
  function equip(item) {
    // надеть предмет из инвентаря; предыдущий из слота вернуть в инвентарь
    const i = state.inventory.indexOf(item);
    if (i === -1) return;
    state.inventory.splice(i, 1);
    const prev = state.equipped[item.slot];
    state.equipped[item.slot] = item;
    if (prev) state.inventory.push(prev);
    sfx.buy(); renderGear(); popEl(els.gearTotal); renderStats(); save();
  }
  function unequip(slot) {
    const it = state.equipped[slot];
    if (!it) return;
    state.equipped[slot] = null;
    state.inventory.push(it);
    sfx.tap(); renderGear(); renderStats(); save();
  }
  function sellItem(item) {
    const i = state.inventory.indexOf(item);
    if (i === -1) return;
    const val = gearSellValue(item.rarity);
    state.inventory.splice(i, 1);
    gain(val); sfx.coin();
    floater('+' + fmt(val) + '🪙', innerWidth / 2, innerHeight / 2, '#4cd964');
    renderGear(); renderStats(); save();
  }
  function autoEquipOrStore(item) {
    // авто-надеть, если слот пуст или новый предмет лучше (QoL); иначе в инвентарь
    const cur = state.equipped[item.slot];
    if (!cur || gearBonusOf(item.rarity) > gearBonusOf(cur.rarity)) {
      if (cur) state.inventory.push(cur);
      state.equipped[item.slot] = item;
    } else {
      state.inventory.push(item);
    }
  }

  function openGearCase() {
    let rarity;
    if (C.gear.firstGuaranteedRare && state.gearCasesOpened === 0) {
      rarity = 'rare';
    } else {
      rarity = rollGearRarity();
    }
    state.gearCasesOpened++;
    const slots = C.gear.slots;
    const slot = slots[Math.floor(Math.random() * slots.length)].id;
    const item = { slot, rarity };
    autoEquipOrStore(item);
    sfx.reveal(rarity);
    const label = gearSlotById[slot].emoji + ' ' + gearRarityName(rarity) + ' ' + gearSlotName(slot) +
      ' (' + t('per_slot', { n: Math.round(gearBonusOf(rarity) * 100) }) + ')';
    floater(t('gear_drop', { item: label }), innerWidth / 2, innerHeight / 2.6,
      gearRarityById[rarity].color);
    if (rarity === 'epic' || rarity === 'legendary') {
      burst(innerWidth / 2, innerHeight / 2, rarity === 'legendary' ? '⭐' : '💜', 12);
    }
    renderGear(); popEl(els.gearTotal); renderStats(); save();
  }

  function renderGear() {
    // сумма бонуса
    els.gearTotal.textContent = t('gear_total', { n: gearBonusPct() });
    els.gearTotal.classList.toggle('active', gearBonusPct() > 0);

    // слоты экипировки
    els.gearSlots.innerHTML = '';
    C.gear.slots.forEach(s => {
      const it = state.equipped[s.id];
      const cell = document.createElement('div');
      cell.className = 'gear-slot';
      if (it) {
        const r = gearRarityById[it.rarity];
        cell.style.setProperty('--rarity', r.color);
        cell.classList.add('filled');
        cell.innerHTML = '<div class="gs-emoji">' + s.emoji + '</div>' +
          '<div class="gs-bonus" style="color:' + r.color + '">' + t('per_slot', { n: Math.round(r.bonus * 100) }) + '</div>';
        cell.title = gearRarityName(it.rarity) + ' ' + gearSlotName(s.id);
        cell.onclick = () => unequip(s.id); // тап по надетому - снять
      } else {
        cell.innerHTML = '<div class="gs-emoji dim">' + s.emoji + '</div>' +
          '<div class="gs-bonus dim">' + t('gear_empty_slot') + '</div>';
        cell.onclick = null;
      }
      els.gearSlots.appendChild(cell);
    });

    // цена шмот-кейса
    els.gearCaseTitle.textContent = t('gear_case');
    els.gearCaseCost.textContent = '🪙 ' + fmt(gearCaseCost());
    els.gearCaseBtn.disabled = state.coins < gearCaseCost();

    // инвентарь (не надетые)
    els.gearInvLabel.textContent = t('gear_inv_label') + ' (' + state.inventory.length + ')';
    els.gearInv.innerHTML = '';
    if (state.inventory.length === 0) {
      const em = document.createElement('div');
      em.className = 'gear-inv-empty';
      em.textContent = t('gear_inv_empty');
      els.gearInv.appendChild(em);
    } else {
      // сортируем по слоту, затем по силе (сильные сверху)
      const sorted = state.inventory.slice().sort((a, b) =>
        gearBonusOf(b.rarity) - gearBonusOf(a.rarity));
      sorted.forEach(item => {
        const r = gearRarityById[item.rarity];
        const cur = state.equipped[item.slot];
        const isBetter = !cur || gearBonusOf(item.rarity) > gearBonusOf(cur.rarity);
        const card = document.createElement('div');
        card.className = 'inv-item';
        card.style.setProperty('--rarity', r.color);
        card.innerHTML =
          '<div class="inv-emoji">' + gearSlotById[item.slot].emoji + '</div>' +
          '<div class="inv-info"><div class="inv-name">' + gearSlotName(item.slot) + '</div>' +
          '<div class="inv-rar" style="color:' + r.color + '">' + gearRarityName(item.rarity) +
          ' ' + t('per_slot', { n: Math.round(r.bonus * 100) }) + '</div></div>';
        const acts = document.createElement('div');
        acts.className = 'inv-acts';
        const eq = document.createElement('button');
        eq.className = 'inv-btn equip' + (isBetter ? ' hot' : '');
        eq.textContent = t('gear_equip');
        eq.onclick = () => equip(item);
        const sell = document.createElement('button');
        sell.className = 'inv-btn sell';
        sell.textContent = t('gear_sell', { n: fmt(gearSellValue(item.rarity)) });
        sell.onclick = () => sellItem(item);
        acts.appendChild(eq); acts.appendChild(sell);
        card.appendChild(acts);
        els.gearInv.appendChild(card);
      });
    }
  }

  els.gearBtn.addEventListener('click', () => { renderGear(); els.gearModal.classList.remove('hidden'); });
  els.gearClose.addEventListener('click', () => els.gearModal.classList.add('hidden'));
  els.gearCaseBtn.addEventListener('click', () => {
    if (state.coins < gearCaseCost()) { sfx.fail(); return; }
    state.coins -= gearCaseCost();
    openGearCase();
  });

  // ---------- тап ----------
  els.mascot.addEventListener('pointerdown', (e) => {
    gain(tapPower());
    sfx.tap();
    floater('+' + fmt(tapPower()), e.clientX, e.clientY);
    renderStats();
  });

  // ---------- магазин ----------
  els.buyBtn.addEventListener('click', () => {
    const idx = firstEmpty();
    if (idx === -1 || state.coins < buyCost()) return;
    state.coins -= buyCost();
    state.bought++;
    const bt = buyTier();
    state.grid[idx] = { tier: bt, rarity: 'common', variant: 'plain' };
    registerBeast(bt, 'common');
    sfx.buy();
    renderGrid(); popSlot(idx); renderStats(); save();
  });

  els.tapBtn.addEventListener('click', () => {
    if (state.coins < tapCost()) return;
    state.coins -= tapCost();
    state.tapLevel++;
    sfx.buy();
    renderStats(); save();
  });

  els.muteBtn.addEventListener('click', () => { state.muted = !state.muted; renderStats(); save(); });

  // ---------- буст x2 за рекламу ----------
  els.boostBtn.addEventListener('click', () => {
    if (boostActive()) return;
    P.rewarded(() => {
      state.boostUntil = now() + C.boostDurationSec;
      sfx.reveal('epic');
      renderStats(); save();
    });
  });

  function popSlot(idx) {
    const el = els.grid.querySelector('.beast[data-idx="' + idx + '"]');
    if (el) { el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 400); }
  }
  function popEl(el) {
    if (!el) return;
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    setTimeout(() => el.classList.remove('pop'), 400);
  }

  // ---------- кейсы ----------
  els.caseBtn.addEventListener('click', () => {
    if (firstEmpty() === -1) return;
    if (freeCaseReady()) {
      P.rewarded(() => {
        state.freeCaseAt = now() + C.freeCaseCooldownSec;
        rollAndOpenCase();
      });
    } else {
      if (state.coins < caseCost()) return;
      state.coins -= caseCost();
      state.paidCases++;
      rollAndOpenCase();
    }
  });

  function rollAndOpenCase(forceRarity) {
    state.casesOpened++;
    state.sinceLegendary++;

    let rarity = forceRarity;
    if (!rarity) {
      if (!state.firstCaseDone) rarity = 'rare';
      else if (state.sinceLegendary >= C.pityEvery) rarity = 'legendary';
      else {
        let roll = Math.random() * 100;
        for (const r of C.rarities) { roll -= r.chance; if (roll <= 0) { rarity = r.id; break; } }
        rarity = rarity || 'common';
      }
    }
    state.firstCaseDone = true;
    if (rarity === 'legendary') state.sinceLegendary = 0;

    // дроп из окна тиров у потолка игрока: ниже тир в окне - вероятнее
    const ceil = Math.max(1, state.highestTier - C.caseDropCeilOffset);
    const floor = Math.max(1, ceil - (C.caseDropWindow - 1));
    const weights = [];
    let total = 0;
    for (let tr = floor; tr <= ceil; tr++) { const w = Math.pow(0.6, tr - floor); weights.push({ tr, w }); total += w; }
    let roll = Math.random() * total, tier = ceil;
    for (const o of weights) { roll -= o.w; if (roll <= 0) { tier = o.tr; break; } }

    openCaseAnimation(tier, rarity, rollVariant());
    renderStats(); save();
  }

  function openCaseAnimation(tier, rarity, variant) {
    let pending = { tier: tier, rarity: rarity, variant: variant || 'plain' };
    let upgradeUsed = false;

    els.caseModal.classList.remove('hidden');
    els.caseAnim.classList.remove('hidden');
    els.caseAnim.classList.add('shaking');
    els.caseResult.classList.add('hidden');
    els.caseClose.classList.add('hidden');
    els.caseUpgrade.classList.add('hidden');

    function showResult() {
      const a = C.animals[pending.tier - 1];
      const r = rarityById[pending.rarity];
      els.caseEmoji.innerHTML = beastFace(pending.tier, 'big-img');
      els.caseName.textContent = a.name;
      els.caseRarity.textContent = rarityName(pending.rarity) +
        (pending.variant !== 'plain' ? ' • ' + variantName(pending.variant) : '');
      els.caseRarity.style.color = r.color;
      els.caseBox.style.setProperty('--rarity', r.color);
      els.caseBox.dataset.variant = pending.variant; // рамка варианта на кейсе
      els.caseResult.classList.remove('hidden');
      els.caseClose.classList.remove('hidden');
      sfx.reveal(pending.rarity);
      if (pending.rarity === 'epic' || pending.rarity === 'legendary') {
        burst(innerWidth / 2, innerHeight / 2, pending.rarity === 'legendary' ? '⭐' : '💜', 12);
      }
      if (pending.variant === 'gold' || pending.variant === 'rainbow') {
        burst(innerWidth / 2, innerHeight / 2, pending.variant === 'rainbow' ? '🌈' : '✨', 14);
      }
      // ап редкости за рекламу (один раз на кейс, легендарке некуда расти)
      if (!upgradeUsed && pending.rarity !== 'legendary') {
        els.caseUpgrade.textContent = t('up_rarity');
        els.caseUpgrade.classList.remove('hidden');
      } else {
        els.caseUpgrade.classList.add('hidden');
      }
    }

    setTimeout(() => {
      els.caseAnim.classList.remove('shaking');
      els.caseAnim.classList.add('hidden');
      showResult();
    }, 1100);

    els.caseUpgrade.onclick = () => {
      upgradeUsed = true;
      P.rewarded(() => {
        if (Math.random() < C.rarityUpChance) {
          const order = C.rarities.map(r => r.id);
          pending.rarity = order[Math.min(order.indexOf(pending.rarity) + 1, order.length - 1)];
          if (pending.rarity === 'legendary') state.sinceLegendary = 0;
          floater(t('up_success'), innerWidth / 2, innerHeight / 3, '#ffb300');
        } else {
          sfx.fail();
          floater(t('up_fail'), innerWidth / 2, innerHeight / 3, '#9aa0a6');
        }
        showResult();
      });
    };

    els.caseClose.onclick = () => {
      const idx = firstEmpty();
      if (idx !== -1) {
        state.grid[idx] = { tier: pending.tier, rarity: pending.rarity, variant: pending.variant };
        registerBeast(pending.tier, pending.rarity);
      }
      els.caseModal.classList.add('hidden');
      renderGrid(); if (idx !== -1) popSlot(idx); renderStats(); save();
      if (pending.rarity === 'legendary') maybeAskReview();
      else maybeInterstitial();
    };
  }

  // ---------- оценка после легендарки ----------
  function maybeAskReview() {
    if (state.rated) return;
    state.rated = true;
    save();
    els.rateModal.classList.remove('hidden');
    els.rateYes.onclick = () => { els.rateModal.classList.add('hidden'); P.requestReview(); };
    els.rateNo.onclick = () => els.rateModal.classList.add('hidden');
  }

  // ---------- драг-энд-дроп ----------
  let drag = null;
  els.grid.addEventListener('pointerdown', (e) => {
    const beast = e.target.closest('.beast');
    if (!beast) return;
    e.preventDefault();
    const fromIdx = parseInt(beast.dataset.idx, 10);
    const ghost = beast.cloneNode(true);
    const rect = beast.getBoundingClientRect();
    ghost.classList.add('dragging');
    ghost.style.position = 'fixed';
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.left = (e.clientX - rect.width / 2) + 'px';
    ghost.style.top = (e.clientY - rect.height / 2) + 'px';
    document.body.appendChild(ghost);
    beast.style.opacity = '.25';
    drag = { fromIdx, ghost, source: beast };
  });

  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    e.preventDefault();
    drag.ghost.style.left = (e.clientX - drag.ghost.offsetWidth / 2) + 'px';
    drag.ghost.style.top = (e.clientY - drag.ghost.offsetHeight / 2) + 'px';
    els.grid.querySelectorAll('.slot').forEach(s => s.classList.remove('drop-ok'));
    const slot = slotAt(e.clientX, e.clientY);
    if (slot && canDrop(drag.fromIdx, parseInt(slot.dataset.idx, 10))) slot.classList.add('drop-ok');
  }, { passive: false });

  window.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const slot = slotAt(e.clientX, e.clientY);
    const fromIdx = drag.fromIdx;
    drag.ghost.remove();
    drag.source.style.opacity = '';
    drag = null;

    if (slot) {
      const toIdx = parseInt(slot.dataset.idx, 10);
      if (canDrop(fromIdx, toIdx)) {
        const from = state.grid[fromIdx], to = state.grid[toIdx];
        if (to === null) {
          state.grid[toIdx] = from;
          state.grid[fromIdx] = null;
        } else {
          const newRarity = rarityById[from.rarity].mult >= rarityById[to.rarity].mult ? from.rarity : to.rarity;
          const fv = from.variant || 'plain', tv = to.variant || 'plain';
          // наследуем лучший вариант; если оба одинаковые - шанс апнуть на ступень (чейз внутри мерджа)
          let newVariant = betterVariant(fv, tv);
          if (fv === tv && Math.random() < C.variantMergeUpChance) newVariant = nextVariant(newVariant);
          const newTier = from.tier + 1;
          state.grid[toIdx] = { tier: newTier, rarity: newRarity, variant: newVariant };
          state.grid[fromIdx] = null;
          state.mergedOnce = true;
          state.merges++;
          registerBeast(newTier, newRarity, e.clientX, e.clientY);
          sfx.merge();
          floater(C.animals[newTier - 1].name + '!', e.clientX, e.clientY);
          P.setScore(state.totalEarned);
        }
        renderGrid(); popSlot(toIdx); renderStats(); save();
        return;
      }
      if (state.grid[parseInt(slot.dataset.idx, 10)] && parseInt(slot.dataset.idx, 10) !== fromIdx) sfx.fail();
    }
    renderGrid(); renderStats();
  });

  function slotAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('.slot') : null;
  }
  function canDrop(fromIdx, toIdx) {
    if (fromIdx === toIdx) return false;
    if (toIdx >= state.slots) return false; // нельзя переносить в закрытый слот
    const from = state.grid[fromIdx], to = state.grid[toIdx];
    if (!from) return false;
    if (to === null) return true;
    return to.tier === from.tier && from.tier < C.animals.length;
  }

  // ---------- оффлайн-доход ----------
  function checkOffline(onDone) {
    const away = now() - state.lastSeen;
    const inc = incomePerSec();
    if (away < C.offlineMinSec || inc <= 0) { onDone(); return; }
    const gained = Math.floor(inc * Math.min(away, C.offlineCapSec));
    if (gained < 1) { onDone(); return; }
    els.offlineAmount.textContent = fmt(gained);
    els.offlineModal.classList.remove('hidden');
    els.offlineClaim.onclick = () => {
      gain(gained);
      els.offlineModal.classList.add('hidden');
      renderStats(); save(); maybeInterstitial(); onDone();
    };
    els.offlineDouble.onclick = () => {
      P.rewarded(() => {
        gain(gained * 2);
        els.offlineModal.classList.add('hidden');
        renderStats(); save(); onDone();
      });
    };
  }

  // ---------- ежедневный бонус ----------
  function checkDaily() {
    const d = today();
    if (state.daily.last === d) return;
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    if (state.daily.last === yesterday) state.daily.streak++;
    else state.daily.streak = Math.max(1, state.daily.streak - 1); // мягкий сброс: шаг назад
    state.daily.last = d;

    const isCaseDay = state.daily.streak % C.dailyCaseEvery === 0;
    const amount = Math.max(C.dailyMin, Math.floor(incomePerSec() * C.dailyIncomeSec)) * state.daily.streak;

    els.dailyDay.textContent = t('daily_day', { n: state.daily.streak });
    els.dailyStreak.innerHTML = Array.from({ length: C.dailyCaseEvery }, (_, i) =>
      '<span class="streak-dot' + (i < (state.daily.streak - 1) % C.dailyCaseEvery + 1 ? ' on' : '') + '"></span>').join('');
    els.dailyAmount.textContent = isCaseDay ? t('daily_case') : '+' + fmt(amount) + ' 🪙';
    els.dailyModal.classList.remove('hidden');
    els.dailyClaim.onclick = () => {
      els.dailyModal.classList.add('hidden');
      if (isCaseDay && firstEmpty() !== -1) rollAndOpenCase('legendary');
      else { gain(amount); sfx.coin(); }
      renderStats(); save();
    };
  }

  // ---------- цикл ----------
  setInterval(() => {
    state.coins += incomePerSec() * 0.25;
    state.totalEarned += incomePerSec() * 0.25;
    renderStats();
  }, 250);
  setInterval(save, C.autosaveMs);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('beforeunload', save);

  // ---------- старт ----------
  P.init(function (lang) {
    LANG = lang;
    const local = loadLocal();
    P.cloudLoad(function (cloud) {
      // берём более свежий сейв
      const pick = (cloud && (!local || (cloud.lastSeen || 0) > (local.lastSeen || 0))) ? cloud : local;
      adoptSave(pick);
      applyStaticTexts();
      probeArt();
      renderGrid();
      renderStats();
      P.loadingReady();
      checkOffline(function () { checkDaily(); });
    });
  });
})();
