/* ── 1. PARTICLES ────────────────────────────────────────── */
function initParticles() {
  if (typeof particlesJS === 'undefined') return;
 
  particlesJS('particles-js', {
    particles: {
      number: { value: 40, density: { enable: true, value_area: 1000 } },
      color:  { value: ['#2e8b57', '#4aae78', '#c8963a', '#7bd389'] },
      shape:  { type: 'circle' },
      opacity: { value: 0.3, random: true },
      size:    { value: 2.5, random: true },
      line_linked: {
        enable: true, distance: 120,
        color: '#2e8b57', opacity: 0.12, width: 1
      },
      move: { enable: true, speed: 0.8, random: true, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, resize: true },
      modes:  { grab: { distance: 120, line_linked: { opacity: 0.4 } } }
    },
    retina_detect: true
  });
}
 
/* ── 2. TYPING ANIMATION ─────────────────────────────────── */
function initTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;
 
  const lines = [
    'Detect misinformation instantly.',
    'Verify news with Machine Learning.',
    'Fight information warfare with AI.',
    'Identify fake stories in seconds.',
    'Truth-check at scale, effortlessly.',
  ];
 
  let li = 0, ci = 0, deleting = false, pause = 0;
 
  (function loop() {
    const text = lines[li];
    if (!deleting) {
      el.textContent = text.slice(0, ++ci);
      if (ci === text.length) { deleting = true; pause = 2200; }
    } else {
      el.textContent = text.slice(0, --ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; pause = 350; }
    }
    setTimeout(loop, pause > 0 ? (pause = 0, (deleting ? 2200 : 350)) : deleting ? 42 : 65);
  })();
}
 
/* ── 3. SCROLL REVEAL ────────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('revealed'), i * 70);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.10 });
 
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
 
/* ── 4. ANIMATED COUNTERS ────────────────────────────────── */
function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseFloat(el.dataset.count);
      const sfx = el.dataset.suffix || '';
      const dur = 1500;
      let   start = 0;
      const tick  = 16;
      const inc   = end / (dur / tick);
 
      const timer = setInterval(() => {
        start += inc;
        if (start >= end) { start = end; clearInterval(timer); }
        el.textContent = Number.isInteger(end)
          ? Math.floor(start).toLocaleString() + sfx
          : start.toFixed(1) + sfx;
      }, tick);
 
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
 
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
}
 
/* ── 5. WORD COUNT ───────────────────────────────────────── */
function initWordCount() {
  const ta = document.getElementById('news-input');
  const wc = document.getElementById('word-count');
  if (!ta || !wc) return;
 
  ta.addEventListener('input', () => {
    const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
    wc.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  });
}
 
/* ── 6. SAMPLE TEXTS ─────────────────────────────────────── */
const SAMPLES = [
  {
    label: 'Real news',
    text: 'NASA scientists have confirmed the discovery of water ice in permanently shadowed craters near the lunar south pole. The findings, published in Nature Astronomy, were confirmed using data from the SOFIA airborne telescope and suggest significant deposits that could support future crewed missions. Researchers from twelve universities independently verified the data across multiple observation sessions.'
  },
  {
    label: 'Fake news',
    text: 'BREAKING: Mainstream media REFUSES to cover bombshell documents proving the government has been secretly poisoning water supplies with mind-control chemicals. A whistleblower from inside the EPA has leaked classified files showing this has been happening since the 1990s. Share this before it gets deleted!!! Big Pharma and globalist elites are suppressing the truth because they don\'t want you to wake up.'
  },
  {
    label: 'Neutral report',
    text: 'The Federal Reserve held its benchmark interest rate steady at its latest policy meeting. Fed Chair indicated in a press conference that officials need more data before considering any policy changes. Markets responded with modest gains, with the S&P 500 rising 0.3% following the announcement. Analysts are divided on the timing of potential future rate adjustments.'
  },
];
 
let sampleIdx = 0;
 
function initSamples() {
  const btn = document.getElementById('sample-btn');
  if (!btn) return;
 
  btn.addEventListener('click', () => {
    const ta = document.getElementById('news-input');
    const s  = SAMPLES[sampleIdx % SAMPLES.length];
    ta.value = s.text;
    ta.dispatchEvent(new Event('input'));
    sampleIdx++;
 
    showToast(`📰 Loaded: ${s.label}`);
    document.getElementById('detector-section')
      .scrollIntoView({ behavior: 'smooth' });
  });
}
 
/* ── 7. SPEECH TO TEXT ───────────────────────────────────── */
function initSpeech() {
  const btn = document.getElementById('speech-btn');
  if (!btn) return;
 
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { btn.style.display = 'none'; return; }
 
  const rec = new SR();
  rec.lang        = 'en-US';
  rec.interimResults = false;
 
  let listening = false;
 
  btn.addEventListener('click', () => {
    if (listening) { rec.stop(); return; }
    rec.start();
    listening = true;
    btn.textContent = '🔴 Stop';
    showToast('🎙️ Listening… speak your news headline.');
  });
 
  rec.onresult = e => {
    const ta = document.getElementById('news-input');
    ta.value += e.results[0][0].transcript + ' ';
    ta.dispatchEvent(new Event('input'));
  };
 
  rec.onend = () => {
    listening = false;
    btn.textContent = '🎙️ Speak';
  };
}
 
/* ── 8. CLEAR ────────────────────────────────────────────── */
function initClear() {
  const btn = document.getElementById('clear-btn');
  if (!btn) return;
 
  btn.addEventListener('click', () => {
    document.getElementById('news-input').value = '';
    document.getElementById('word-count').textContent = '0 words';
    // BUG FIX #1 (clear path): match the single-system display approach
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('news-input').focus();
  });
}
 
/* ── 9. TOAST ───────────────────────────────────────────── */
// BUG FIX #4: Store the timer handle so rapid back-to-back calls cancel the
// previous timeout before it fires — prevents the new toast vanishing instantly.
let _toastTimer = null;
 
function showToast(msg, type = 'info') {
  const t  = document.getElementById('toast');
  const ti = document.getElementById('toast-icon');
  const tm = document.getElementById('toast-msg');
 
  const icons = { info: 'ℹ️', success: '✅', error: '⚠️' };
  ti.textContent = icons[type] || icons.info;
  tm.textContent = msg;
 
  // Cancel any in-flight hide timer before showing again
  if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }
  t.classList.add('show');
  _toastTimer = setTimeout(() => { t.classList.remove('show'); _toastTimer = null; }, 3500);
}
 
/* ── 10. DRAW PIE CHART ──────────────────────────────────── */
function drawPieChart(realPct, fakePct) {
  const canvas = document.getElementById('pie-chart');
  if (!canvas) return;
 
  const ctx = canvas.getContext('2d');
  canvas.width  = 180;
  canvas.height = 180;
 
  const cx = 90, cy = 90, r = 80;
  const realAngle = (realPct / 100) * Math.PI * 2;
 
  // REAL slice
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + realAngle);
  ctx.closePath();
  ctx.fillStyle = '#2e8b57';
  ctx.fill();
 
  // FAKE slice
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, -Math.PI / 2 + realAngle, -Math.PI / 2 + Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = '#c0392b';
  ctx.fill();
 
  // Center hole
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--surface').trim() || '#fff';
  ctx.fill();
 
  // Label
  ctx.fillStyle = '#2e8b57';
  ctx.font = 'bold 18px Playfair Display, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${realPct}%`, cx, cy - 8);
  ctx.fillStyle = '#5a6660';
  ctx.font = '11px Outfit, sans-serif';
  ctx.fillText('REAL', cx, cy + 12);
}
 
/* ── 11. LOAD STATS ──────────────────────────────────────── */
async function loadStats() {
  try {
    const res  = await fetch('/stats');
    const data = await res.json();
 
    if (data.error) return;
 
    const acc = data.accuracy || 0;
 
    // Update stat cards
    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.dataset.count = val;
    };
 
    setEl('stat-accuracy',   acc);
    setEl('stat-pac-acc',    data.pac_accuracy || 0);
    setEl('stat-lr-acc',     data.lr_accuracy  || 0);
    setEl('stat-train-size', data.train_size   || 0);
 
    // Pie chart — show split of dataset in real vs fake
    // (use a balanced 50/50 default, or derive from model_meta if available)
    const realPie = Math.round(acc);
    drawPieChart(50, 50);   // dataset is balanced; override on first prediction
 
    const typeEl = document.getElementById('model-type');
    if (typeEl) typeEl.textContent = data.model_type || 'ML Classifier';
 
  } catch (e) {
    console.warn('Stats load skipped (model not ready):', e.message);
  }
}
 
/* ── 12. MAIN ANALYZER ───────────────────────────────────── */
function initAnalyzer() {
  const form      = document.getElementById('analyze-form');
  const btnAn     = document.getElementById('analyze-btn');
  const loading   = document.getElementById('loading-wrapper');
  const resultSec = document.getElementById('result-section');
 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
 
    const text = document.getElementById('news-input').value.trim();
    if (!text) { showToast('Please paste or type a news article first.', 'error'); return; }
    if (text.length > 10_000) { showToast('Text too long (max 10 000 chars).', 'error'); return; }
 
    // ── BUG FIX #1 (hide path): Drive visibility via style.display only.
    // Previously: classList.remove('show') + style.display='none' — two systems
    // fighting each other left the element in an indeterminate state on run 2+.
    resultSec.style.display = 'none';
    loading.classList.add('show');
    btnAn.disabled = true;
 
    try {
      const res  = await fetch('/predict', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        showToast(data.error || 'Server error. Is Flask running?', 'error');
        return;
      }
 
      renderResult(data);
 
    } catch (err) {
      showToast('Cannot connect to Flask server (port 5000).', 'error');
      console.error(err);
    } finally {
      loading.classList.remove('show');
      btnAn.disabled = false;
    }
  });
}
 
function renderResult(data) {
  const rs   = document.getElementById('result-section');
  const card = document.getElementById('result-card');
  const cls  = data.is_real ? 'real' : 'fake';
 
  // ── BUG FIX #3: Target the <span id="verdict-text"> text node separately
  // from the icon span. Previously, setting textContent on the parent
  // #verdict-badge (which was also id="verdict-text") destroyed the child
  // #verdict-icon element, making getElementById('verdict-icon') return null
  // on the second call and crashing renderResult() silently mid-execution.
  document.getElementById('verdict-icon').textContent = data.is_real ? '✅' : '🚫';
  document.getElementById('verdict-text').textContent = data.prediction;
 
  // Update the badge wrapper's colour class (now correctly on #verdict-badge)
  const badge = document.getElementById('verdict-badge');
  badge.className = `verdict-badge verdict-${cls}`;
 
  document.getElementById('verdict-category').textContent  = `Category: ${data.category}`;
  document.getElementById('confidence-display').textContent = `${data.confidence}%`;
  document.getElementById('confidence-display').className   = `confidence-display conf-${cls}`;
 
  // ── BUG FIX #2: Progress bar animation deadlock on repeat.
  // The original double-rAF trick collapses when the CSS transition from the
  // previous run is still registered. Fix: forcibly remove the transition,
  // snap to 0 synchronously, then re-add the transition before setting the
  // target width — guaranteeing a fresh animation every single time.
  const fillReal  = document.getElementById('meter-fill-real');
  const fillFake  = document.getElementById('meter-fill-fake');
  const activeFill = data.is_real ? fillReal : fillFake;
  const otherFill  = data.is_real ? fillFake : fillReal;
 
  // Snap both bars to 0 with no transition
  [fillReal, fillFake].forEach(el => {
    el.style.transition = 'none';
    el.style.width      = '0%';
  });
 
  // Force a reflow so the browser registers the width:0 before re-enabling transition
  void activeFill.offsetWidth;
 
  // Re-enable transition and animate to the target width
  requestAnimationFrame(() => {
    activeFill.style.transition = 'width 1.1s cubic-bezier(0.4,0,0.2,1)';
    activeFill.style.width      = `${data.confidence}%`;
  });
 
  // Breakdown
  const bd = data.breakdown || {};
  document.getElementById('bd-real-val').textContent = `${bd.REAL ?? 0}%`;
  document.getElementById('bd-fake-val').textContent = `${bd.FAKE ?? 0}%`;
  document.getElementById('bd-words').textContent    = data.word_count;
 
  // Reasoning
  document.getElementById('reasoning-text').textContent = data.reasoning;
 
  // Card colour class
  card.className = `result-card ${cls}`;
 
  // Pie chart update
  drawPieChart(Math.round(bd.REAL ?? 50), Math.round(bd.FAKE ?? 50));
 
  // ── BUG FIX #1 (JS side): Drive visibility exclusively through inline style.
  // Using both style.display and a CSS class (.show) created a specificity race
  // where the hide path (style.display='none') and the show path (classList.add)
  // left the element in an inconsistent state after the first cycle. Now we use
  // only inline style — no .show class toggling — so the state is always explicit.
  rs.style.display = 'block';
  rs.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
 
  showToast(
    data.is_real ? '✅ Analysis complete — REAL news detected.' : '🚫 Analysis complete — FAKE news detected.',
    data.is_real ? 'success' : 'info'
  );
}
 
/* ── 13. SMOOTH SCROLL ───────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}
 
/* ── 14. NAVBAR SCROLL ───────────────────────────────────── */
function initNavScroll() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20
      ? '0 4px 24px rgba(27,94,57,0.12)'
      : 'none';
  }, { passive: true });
}
 
/* ── BOOT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTyping();
  initReveal();
  initCounters();
  initWordCount();
  initSamples();
  initSpeech();
  initClear();
  initAnalyzer();
  initSmoothScroll();
  initNavScroll();
  loadStats();
});