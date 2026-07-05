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
  incomeBase: 1,
  incomeGrowth: 2.4,

  // Редкости: шанс из кейса (%) и множитель дохода
  rarities: [
    { id: 'common',    name: 'Обычный',      chance: 70, mult: 1,  color: '#9aa0a6' },
    { id: 'rare',      name: 'Редкий',       chance: 22, mult: 2,  color: '#4d9fff' },
    { id: 'epic',      name: 'Эпический',    chance: 7,  mult: 4,  color: '#b45cff' },
    { id: 'legendary', name: 'ЛЕГЕНДАРНЫЙ',  chance: 1,  mult: 10, color: '#ffb300' },
  ],

  // Бонус соседства: +10% дохода за каждого соседа той же редкости (по горизонтали/вертикали)
  neighborBonus: 0.10,

  // Поле
  gridCols: 3,
  gridRows: 4,

  // Магазин: цена tier-1 зверя = buyBase * buyGrowth^кол-во_купленных
  buyBase: 50,
  buyGrowth: 1.22,

  // Тап: сила = tapBase * tapGrowth^уровень, цена апгрейда = tapCostBase * tapCostGrowth^уровень
  tapBase: 1,
  tapGrowth: 1.7,
  tapCostBase: 100,
  tapCostGrowth: 2.4,

  // Кейсы: цена = caseBase * caseGrowth^открыто
  caseBase: 300,
  caseGrowth: 1.28,
  // Шансы тира из кейса (тир 1..4, режется по прогрессу игрока)
  caseTierWeights: [60, 25, 10, 5],
  // Pity: гарантированная легендарка каждые N кейсов
  pityEvery: 40,

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

  leaderboard: 'mainscore',   // имя лидерборда в консоли ЯИ

  saveKey: 'memebeasts_save_v1',
  autosaveMs: 5000,
};
