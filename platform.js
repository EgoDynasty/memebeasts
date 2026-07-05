// ============================================================
// Обёртка над Yandex Games SDK v2.
// На витрине Яндекса грузится настоящий /sdk.js, локально -
// заглушки (реклама = фейковое окно 2 сек), игра работает везде.
// ============================================================
window.Platform = (function () {
  let ysdk = null;
  let player = null;

  function init(onReady) {
    const s = document.createElement('script');
    s.src = '/sdk.js';
    s.onload = function () {
      YaGames.init().then(function (sdk) {
        ysdk = sdk;
        const lang = (sdk.environment.i18n.lang || 'ru').startsWith('ru') ? 'ru' : 'en';
        sdk.getPlayer({ scopes: false }).then(function (p) {
          player = p;
          onReady(lang);
        }).catch(function () { onReady(lang); });
      }).catch(function () { onReady(detectLang()); });
    };
    s.onerror = function () { onReady(detectLang()); }; // локальный режим
    document.head.appendChild(s);
  }

  function detectLang() {
    return (navigator.language || 'ru').startsWith('ru') ? 'ru' : 'en';
  }

  // Сообщить площадке, что игра загрузилась (влияет на метрики витрины)
  function loadingReady() {
    try { ysdk && ysdk.features.LoadingAPI && ysdk.features.LoadingAPI.ready(); } catch (e) {}
  }

  // Rewarded: onReward зовём ТОЛЬКО при полном просмотре
  function rewarded(onReward) {
    if (ysdk) {
      let got = false;
      ysdk.adv.showRewardedVideo({
        callbacks: {
          onRewarded: function () { got = true; },
          onClose: function () { if (got) onReward(); },
          onError: function () {},
        }
      });
    } else {
      mockAd(onReward);
    }
  }

  function interstitial() {
    if (ysdk) {
      ysdk.adv.showFullscreenAdv({ callbacks: {} });
    }
    // локально interstitial не имитируем, чтобы не бесить на плейтестах
  }

  // Локальная заглушка rewarded
  function mockAd(onDone) {
    const m = document.getElementById('ad-mock');
    const t = document.getElementById('ad-mock-timer');
    let left = 2;
    t.textContent = left;
    m.classList.remove('hidden');
    const iv = setInterval(function () {
      left--;
      t.textContent = left;
      if (left <= 0) {
        clearInterval(iv);
        m.classList.add('hidden');
        onDone();
      }
    }, 1000);
  }

  // Облачные сейвы (фолбэк - localStorage делает game.js)
  function cloudSave(data) {
    try { player && player.setData({ save: data }, true); } catch (e) {}
  }
  function cloudLoad(cb) {
    if (!player) { cb(null); return; }
    player.getData(['save']).then(function (d) { cb(d && d.save ? d.save : null); })
      .catch(function () { cb(null); });
  }

  function setScore(score) {
    try {
      ysdk && ysdk.getLeaderboards().then(function (lb) {
        lb.setLeaderboardScore(window.CONFIG.leaderboard, Math.floor(score));
      });
    } catch (e) {}
  }

  function requestReview() {
    if (!ysdk) return;
    try {
      ysdk.feedback.canReview().then(function (r) {
        if (r.value) ysdk.feedback.requestReview();
      });
    } catch (e) {}
  }

  return {
    init: init, loadingReady: loadingReady,
    rewarded: rewarded, interstitial: interstitial,
    cloudSave: cloudSave, cloudLoad: cloudLoad,
    setScore: setScore, requestReview: requestReview,
    isYandex: function () { return !!ysdk; },
  };
})();
