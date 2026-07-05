// ============================================================
// БАЛАНС И КОНТЕНТ. Все числа для плейтеста крутим здесь.
// ============================================================
window.CONFIG = {

  // Звери по тирам (1..10). Эмодзи - заглушки до нейро-арта.
  animals: [
    { tier: 1,  name: 'Хомякс',          emoji: '🐹' },
    { tier: 2,  name: 'Жабус Великий',   emoji: '🐸' },
    { tier: 3,  name: 'Котлетто',        emoji: '🐱' },
    { tier: 4,  name: 'Псина Сигма',     emoji: '🐶' },
    { tier: 5,  name: 'Гусь-Барон',      emoji: '🪿' },
    { tier: 6,  name: 'Тюленини',        emoji: '🦭' },
    { tier: 7,  name: 'Слонэйро',        emoji: '🐘' },
    { tier: 8,  name: 'Акулиссимо',      emoji: '🦈' },
    { tier: 9,  name: 'Дракончино',      emoji: '🐲' },
    { tier: 10, name: 'КАПИБАРА УЛЬТРА', emoji: '🦫' },
  ],

  // Доход зверя в сек = incomeBase * incomeGrowth^(tier-1) * множитель редкости
  // 2.2 (было 2.4): кривая площе, за час виден весь контент, но мердж всё ещё >2 -
  // то есть слить двух всегда выгоднее по доходу, число на мердже растёт, ощущается приятно.
  incomeBase: 1,
  incomeGrowth: 2.2,

  // Редкости: шанс из кейса (%) и множитель дохода
  rarities: [
    { id: 'common',    name: 'Обычный',      chance: 70, mult: 1,  color: '#9aa0a6' },
    { id: 'rare',      name: 'Редкий',       chance: 22, mult: 2,  color: '#4d9fff' },
    { id: 'epic',      name: 'Эпический',    chance: 7,  mult: 4,  color: '#b45cff' },
    { id: 'legendary', name: 'ЛЕГЕНДАРНЫЙ',  chance: 1,  mult: 10, color: '#ffb300' },
  ],

  // Бонус соседства: +20% дохода за каждого соседа той же редкости (по горизонтали/вертикали).
  // Усилено с 10% и теперь подсвечивается на поле - держать одноредкостных рядом реально выгодно.
  neighborBonus: 0.20,

  // Поле
  gridCols: 3,
  gridRows: 4,
  // Старт с slotsStart открытых слотов из gridCols*gridRows, остальные открываются за монеты.
  // Цена следующего слота = slotCostBase * slotCostGrowth^(открыто_сверх_старта)
  slotsStart: 6,
  slotCostBase: 600,
  slotCostGrowth: 1.8,

  // Магазин: цена tier-1 зверя = buyBase * buyGrowth^кол-во_купленных
  buyBase: 50,
  buyGrowth: 1.20,

  // Тап: сила = tapBase * tapGrowth^уровень, цена апгрейда = tapCostBase * tapCostGrowth^уровень
  tapBase: 1,
  tapGrowth: 1.7,
  tapCostBase: 100,
  tapCostGrowth: 2.4,

  // Кейсы: цена = caseBase * caseGrowth^открыто
  caseBase: 300,
  caseGrowth: 1.30,
  // Дроп тира кейса привязан к прогрессу: окно из caseDropWindow тиров у потолка игрока,
  // потолок = highestTier - caseDropCeilOffset. Внутри окна ниже тир - вероятнее (вес 0.6^шаг).
  // Так кейс в лейте роняет зверей рядом с твоим уровнем, а не бесполезный тир 1.
  caseDropCeilOffset: 2,
  caseDropWindow: 3,
  // Pity: гарантированная легендарка каждые N кейсов
  pityEvery: 45,

  // Оффлайн-доход: кэп в секундах (2 часа)
  offlineCapSec: 2 * 60 * 60,
  // Показываем окно, только если отсутствовал дольше (сек)
  offlineMinSec: 60,

  // Rewarded-точки
  freeCaseCooldownSec: 300,   // бесплатный кейс за рекламу: раз в 5 минут
  boostDurationSec: 600,      // буст x2 на 10 минут
  boostMult: 2,
  rarityUpChance: 0.5,        // шанс апнуть редкость из кейса за рекламу

  // Interstitial: не чаще раза в 3 мин, не в первые 5 минут игры
  interstitialMinGapSec: 180,
  interstitialGraceSec: 300,

  // Бонус за открытие нового зверя в коллекции = base * 2^tier
  discoveryBonusBase: 25,

  // Ежедневный бонус: доход за N секунд, но не меньше минимума; день 7 стрика - легендарный кейс
  dailyIncomeSec: 600,
  dailyMin: 500,
  dailyCaseEvery: 7,

  // Квесты: последовательные цели с наградой, дают направление и импульсы дохода.
  // metric: bought | merges | tier | cases | collected
  quests: [
    { id: 'buy',     metric: 'bought',    target: 4,  reward: 250,   ru: 'Купи 4 зверей',     en: 'Buy 4 beasts' },
    { id: 'merge',   metric: 'merges',    target: 3,  reward: 500,   ru: 'Слей 3 мерджа',     en: 'Do 3 merges' },
    { id: 'tier5',   metric: 'tier',      target: 5,  reward: 2000,  ru: 'Дорасти до тира 5', en: 'Reach tier 5' },
    { id: 'cases',   metric: 'cases',     target: 5,  reward: 4000,  ru: 'Открой 5 кейсов',   en: 'Open 5 cases' },
    { id: 'collect', metric: 'collected', target: 8,  reward: 12000, ru: 'Открой 8 зверей',   en: 'Discover 8 beasts' },
  ],

  leaderboard: 'mainscore',   // имя лидерборда в консоли ЯИ

  saveKey: 'memebeasts_save_v1',
  autosaveMs: 5000,
};
