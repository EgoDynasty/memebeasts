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

  // Варианты (модификаторы) зверя: второй чейз поверх редкости, множитель к доходу.
  // Катятся только из кейсов; при мердже наследуется лучший, с шансом апнуться на ступень.
  // Множители умеренные специально: слоёв уже много (тир*редкость*сосед*вариант), нельзя чтобы взрывалось.
  variants: [
    { id: 'plain',   mult: 1.0,  chance: 82,  ru: '',           en: '',        color: '' },
    { id: 'bronze',  mult: 1.15, chance: 12,  ru: 'Бронзовый',  en: 'Bronze',  color: '#cd7f32' },
    { id: 'silver',  mult: 1.35, chance: 4.5, ru: 'Серебряный', en: 'Silver',  color: '#cfd4d8' },
    { id: 'gold',    mult: 1.7,  chance: 1.3, ru: 'Золотой',    en: 'Gold',    color: '#ffcf33' },
    { id: 'rainbow', mult: 2.5,  chance: 0.2, ru: 'Радужный',   en: 'Rainbow', color: 'rainbow' },
  ],
  variantMergeUpChance: 0.10,

  // Бонус соседства: +20% дохода за каждого соседа той же редкости (по горизонтали/вертикали).
  // Усилено с 10% и теперь подсвечивается на поле - держать одноредкостных рядом реально выгодно.
  neighborBonus: 0.20,

  // Поле
  gridCols: 3,
  gridRows: 4,
  // Старт с slotsStart открытых слотов, остальные открываются за монеты.
  slotsStart: 6,

  // ЦЕНЫ ПРИВЯЗАНЫ К ДОХОДУ, а не к счётчику покупок. Раньше цена росла как growth^кол-во,
  // а зверь давал всегда как тир-1 - на 20-й минуте покупки обгоняли доход и оставался
  // только оффлайн-фарм. Теперь: цена = N секунд текущего дохода, но не ниже пола. Всегда
  // есть на что тратить (макс простой ~N сек), поле живое, копить в пустоту не надо.
  buyBase: 50,        // пол цены зверя
  buySeconds: 15,     // зверь стоит ~15 сек дохода (симуляция: простой макс ~14 сек)
  slotCostBase: 600,  // пол цены слота
  slotSeconds: 60,    // слот ~60 сек дохода
  // Кнопка «Купить» даёт не бесполезный тир-1, а зверя по нижней границе прогресса:
  // buyTier = clamp(1, highestTier - buyTierOffset). Offset 5: ранняя игра не меняется
  // (пока highestTier<6 покупка = тир-1), а в мид/лейте покупка догоняет поле и не даёт
  // застоя. Симуляция: топ-тир у идеального бота ~41 мин, у живого игрока дольше.
  buyTierOffset: 5,

  // Тап: сила = tapBase * tapGrowth^уровень, цена апгрейда = tapCostBase * tapCostGrowth^уровень
  tapBase: 1,
  tapGrowth: 1.7,
  tapCostBase: 100,
  tapCostGrowth: 2.4,

  // Кейсы: цена привязана к доходу (см. блок цен выше), не к счётчику.
  caseBase: 300,      // пол цены кейса
  caseSeconds: 35,    // кейс ~35 сек дохода
  // Дроп тира кейса привязан к прогрессу: окно из caseDropWindow тиров у потолка игрока,
  // потолок = highestTier - caseDropCeilOffset. Внутри окна ниже тир - вероятнее (вес 0.6^шаг).
  // Так кейс в лейте роняет зверей рядом с твоим уровнем, а не бесполезный тир 1.
  caseDropCeilOffset: 2,
  caseDropWindow: 3,
  // Pity: гарантированная легендарка каждые N кейсов
  pityEvery: 45,

  // ---------- ШМОТ + ИНВЕНТАРЬ (второй фарм-луп, живёт в рюкзаке) ----------
  // 4 слота экипировки, каждый предмет даёт +% КО ВСЕМУ доходу поля (глобальный множитель).
  // Открывается на unlockTier, чтобы не грузить новичка. Отдельный шмот-кейс, та же валюта.
  gear: {
    unlockTier: 4,        // на этом тире открывается рюкзак
    caseBase: 800,        // пол цены шмот-кейса
    caseSeconds: 40,      // цена ~40 сек дохода
    firstGuaranteedRare: true, // первый шмот-кейс минимум редкий (приятный старт)
    slots: [
      { id: 'helmet', ru: 'Шлем',      en: 'Helmet', emoji: '🪖' },
      { id: 'chest',  ru: 'Нагрудник', en: 'Chest',  emoji: '🛡️' },
      { id: 'legs',   ru: 'Штаны',     en: 'Legs',   emoji: '👖' },
      { id: 'boots',  ru: 'Сапоги',    en: 'Boots',  emoji: '🥾' },
    ],
    // bonus - прибавка к доходу за слот; chance - шанс из шмот-кейса; sellSec/sellFloor - продажа дубля.
    rarities: [
      { id: 'common',    ru: 'Обычный',     en: 'Common',    bonus: 0.05, chance: 60, color: '#9aa0a6', sellSec: 3,  sellFloor: 150 },
      { id: 'rare',      ru: 'Редкий',      en: 'Rare',      bonus: 0.12, chance: 27, color: '#4d9fff', sellSec: 8,  sellFloor: 600 },
      { id: 'epic',      ru: 'Эпический',   en: 'Epic',      bonus: 0.25, chance: 11, color: '#b45cff', sellSec: 20, sellFloor: 3000 },
      { id: 'legendary', ru: 'Легендарный', en: 'Legendary', bonus: 0.60, chance: 2,  color: '#ffb300', sellSec: 60, sellFloor: 20000 },
    ],
  },

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
