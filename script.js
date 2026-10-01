(function(){
  /* ============ ローディング演出:進捗バーが伸びてからフェードアウト ============ */
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loaderBarFill');
  const percentEl = document.getElementById('loaderPercent');
  if (!loader) return;

  const finish = function(){
    document.body.classList.remove('is-loading');
    loader.classList.add('is-hidden');
    setTimeout(function(){ loader.remove(); }, 2300);
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish();
    return;
  }

  let progress = 0;
  const step = function(){
    // 実際の読み込み状況に関わらず、演出として滑らかに0→100%まで進める
    progress += (100 - progress) * 0.09 + 1.1;
    if (progress >= 100) {
      progress = 100;
      if (fill) fill.style.width = '100%';
      if (percentEl) percentEl.textContent = '100';
      setTimeout(finish, 600);
      return;
    }
    if (fill) fill.style.width = progress + '%';
    if (percentEl) percentEl.textContent = Math.floor(progress);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  // 万一読み込みが長引いても、最大2.5秒でヒーローへ抜ける
  window.addEventListener('load', function(){
    setTimeout(function(){
      if (!loader.classList.contains('is-hidden')) finish();
    }, 400);
  });
  setTimeout(finish, 2500);
})();

(function(){
  /* ============ ヒーロー背景:全作品イメージが順番にクロスフェードで巡回 ============ */
  const heroBg = document.querySelector('.hero-bg');
  const layerA = document.getElementById('heroCycleA');
  const layerB = document.getElementById('heroCycleB');
  if (!layerA || !layerB) return;

  // 最初に表示される.hero-bgの画像(artwork-nori)から始まり、残りの作品画像を順番に巡回する
  const images = [
    'images/artwork-sakai.jpg',
    'images/artwork-saeki.jpg',
    'images/artwork-orihara.jpg',
    'images/artwork-hanna.jpg',
    'images/artwork-nori.jpg'
  ];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // 動きを抑えたい場合は最初の背景のまま固定
  }

  let index = 0;
  let useA = true;

  const showNext = function(){
    const layer = useA ? layerA : layerB;
    const other = useA ? layerB : layerA;
    layer.style.backgroundImage = 'url(' + images[index] + ')';
    layer.classList.add('is-active');
    other.classList.remove('is-active');
    useA = !useA;
    index = (index + 1) % images.length;
  };

  // ヒーローの初回リビール演出(約7秒)が終わってから巡回を開始し、以降は一定間隔で切り替える
  setTimeout(function(){
    // 最初の背景(NORI)を消しておかないと、巡回レイヤーと重なって影のように残って見えるため
    // ※ .hero-bgには forwards指定のリビール演出アニメーションが付いており、
    //   JSでinline opacityを直接書き換えても演出側の値が優先されて消えないため、
    //   !important付きのクラスを付与して確実にフェードアウトさせる
    if (heroBg) heroBg.classList.add('is-cycling-out');
    showNext();
    setInterval(showNext, 5000);
  }, 7200);
})();

(function(){
  /* ============ 固定フッターCTA:ヒーロー内の同内容ボタンと被らないよう出し分け ============ */
  const heroCtaGroup = document.getElementById('heroCtaGroup');
  const fixedCta = document.querySelector('.mobile-fixed-cta');
  if (!heroCtaGroup || !fixedCta) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        fixedCta.classList.toggle('is-hidden', entry.isIntersecting);
      });
    }, { threshold: 0 });
    io.observe(heroCtaGroup);
  }
})();

(function(){
  /* ============ スクロールで残像がぼやけ→鮮明になるリビール ============ */
  if ('IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('is-visible'); });
  }
})();

(function(){
  /* ============ 在庫インジケーター(架空のデモ表示) ============ */
  const fill = document.getElementById('stockBarFill');
  const label = document.getElementById('stockLabel');
  const bar = document.querySelector('.stock-bar');
  if (!fill || !label || !bar) return;
  // 実際の在庫連携は行わず、時間帯に応じた「目安」表示として簡易生成
  const hour = new Date().getHours();
  let pct = 80;
  if (hour >= 12 && hour < 15) pct = 75;
  else if (hour >= 15 && hour < 18) pct = 45;
  else if (hour >= 18) pct = 20;
  if (pct <= 20) { label.textContent = '残りわずか'; label.style.color = 'var(--accent)'; }
  else if (pct <= 50) { label.textContent = '在庫少なめ'; }
  else { label.textContent = '在庫あり'; }

  // ページ読み込み直後ではなく、カードがスクロールで画面に入ったタイミングで
  // 0%→実際の在庫率までバーが伸びるように演出する
  fill.style.width = '0%';
  const fillBar = function(){
    requestAnimationFrame(function(){ fill.style.width = pct + '%'; });
  };
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          fillBar();
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    io.observe(bar);
  } else {
    fill.style.width = pct + '%';
  }
})();

(function(){
  /* =========================================================
     来場予約フォーム:バリデーション + GAS(Google Apps Script)送信
     ========================================================= */
  // ▼▼▼ ここにGASのウェブアプリURLを貼り付けてください ▼▼▼
  const GAS_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbyVGWML_o2OqyFBxAZa_PwEyI9KSwRwFKFd4AviHv9xKD2ENfrANLNqkkr-nVJABnPy/exec";
  // ▲▲▲ ここまで ▲▲▲

  const form = document.getElementById('reservation-form');
  if (!form) return;

  const successBox = document.getElementById('reservation-success');
  const errorSummary = document.getElementById('form-error-summary');
  const submitBtn = document.getElementById('f-submit');

  const PHONE_PATTERN = /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(fieldId, show){
    const errEl = document.getElementById('err-' + fieldId);
    const inputEl = document.getElementById('f-' + fieldId);
    if (errEl) errEl.classList.toggle('hidden', !show);
    if (inputEl) inputEl.style.borderColor = show ? 'var(--accent)' : 'rgba(17,18,22,0.2)';
  }

  function validateField(fieldId){
    const el = document.getElementById('f-' + fieldId);
    if (!el) return true;
    let valid = true;

    switch (fieldId) {
      case 'name':
        valid = el.value.trim().length > 0;
        break;
      case 'email':
        valid = el.value.trim() !== '' && EMAIL_PATTERN.test(el.value.trim());
        break;
      case 'phone':
        valid = PHONE_PATTERN.test(el.value.trim());
        break;
      case 'date':
      case 'time':
        valid = el.value.trim() !== '';
        break;
      case 'agree':
        valid = el.checked;
        break;
      default:
        valid = true;
    }

    showError(fieldId, !valid);
    return valid;
  }

  const fieldIds = ['name', 'email', 'phone', 'date', 'time', 'agree'];

  fieldIds.forEach(function(id){
    const el = document.getElementById('f-' + id);
    if (!el) return;
    const evt = (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'date') ? 'change' : 'input';
    el.addEventListener(evt, function(){ validateField(id); });
    el.addEventListener('blur', function(){ validateField(id); });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();

    let allValid = true;
    let firstInvalidId = null;
    fieldIds.forEach(function(id){
      const ok = validateField(id);
      if (!ok && !firstInvalidId) firstInvalidId = id;
      if (!ok) allValid = false;
    });

    if (!allValid) {
      errorSummary.classList.remove('hidden');
      const firstInvalidEl = document.getElementById('f-' + firstInvalidId);
      if (firstInvalidEl) {
        firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidEl.focus({ preventScroll: true });
      }
      return;
    }

    errorSummary.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中…';

    const payload = {
      name: document.getElementById('f-name').value,
      email: document.getElementById('f-email').value,
      phone: document.getElementById('f-phone').value,
      date: document.getElementById('f-date').value,
      time: document.getElementById('f-time').value,
      companions: document.getElementById('f-companions').value,
      talk: document.getElementById('f-talk').value,
      lineOptIn: document.getElementById('f-line').checked,
      submittedAt: new Date().toISOString()
    };

    if (!GAS_ENDPOINT_URL) {
      console.warn('GAS_ENDPOINT_URL が未設定です。script.js内のGAS_ENDPOINT_URLにデプロイURLを設定してください。');
      console.log('送信予定データ:', payload);
      setTimeout(function(){
        form.classList.add('hidden');
        successBox.classList.remove('hidden');
      }, 400);
      return;
    }

    // GAS Webアプリはクロスオリジン扱いのため no-cors で送信し、
    // fetch自体が例外を投げなければ成功とみなす
    fetch(GAS_ENDPOINT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
    .then(function(){
      form.classList.add('hidden');
      successBox.classList.remove('hidden');
    })
    .catch(function(err){
      console.error('予約送信エラー:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'この内容で予約する';
      alert('送信中にエラーが発生しました。お手数ですが、お電話でもご予約いただけます(03-0000-0000)。');
    });
  });
})();
