(() => {
  const css = `
  :root{--bg:#070d1a;--side:#0a1426;--panel:#101f38;--panel-2:#142945;--txt:#edf7ff;--muted:#aabbd1;--gold:#f5b942;--green:#42df9a;--red:#ff6d7b;--cyan:#2edcff;--line:rgba(113,211,255,.22)}
  [data-theme=light]{--bg:#eef5fb;--side:#f8fbff;--panel:#ffffff;--panel-2:#e9f3ff;--txt:#10213b;--muted:#526883;--gold:#9b5d00;--green:#087a50;--red:#bc2946;--cyan:#0079a8;--line:rgba(18,77,128,.18)}
  body{background:radial-gradient(circle at 70% -20%,rgba(46,220,255,.15),transparent 35%),var(--bg)}
  .app{background-image:linear-gradient(rgba(46,220,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(46,220,255,.025) 1px,transparent 1px);background-size:32px 32px}
  .side{background:linear-gradient(180deg,var(--side),#07101e);border-right-color:var(--line)}
  .brand{font-family:'IBM Plex Mono',monospace;font-size:1.3rem;letter-spacing:-.08em;color:var(--txt);position:relative}.brand:before{content:'◉';color:var(--cyan);margin-right:8px;font-size:.8em}.brand span{color:var(--gold)}.brand small{color:var(--cyan);letter-spacing:.2em}
  .nav button{border:1px solid transparent;border-radius:7px;transition:.18s ease;letter-spacing:.02em}.nav button.active,.nav button:hover{background:linear-gradient(90deg,rgba(46,220,255,.16),rgba(245,185,66,.08));border-color:rgba(46,220,255,.26);color:var(--txt);box-shadow:inset 3px 0 var(--cyan)}
  .main{max-width:1500px}.top{padding-bottom:18px;border-bottom:1px solid var(--line)}h1,h2,h3{font-family:'IBM Plex Mono',monospace;letter-spacing:-.055em}h1{font-weight:600;max-width:20ch}h1:after{content:'_';color:var(--cyan);animation:pulse 1s step-end infinite}@keyframes pulse{50%{opacity:0}}.eyebrow{color:var(--cyan)}
  .card{background:linear-gradient(145deg,rgba(20,41,69,.98),rgba(11,27,50,.98));border-color:var(--line);border-radius:10px;box-shadow:0 16px 38px rgba(0,0,0,.16);position:relative}.card:before{content:'';position:absolute;top:0;left:22px;right:22px;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);opacity:.55}.card h3{color:var(--txt)}
  input,textarea,select{background:rgba(3,12,27,.55);border-color:rgba(113,211,255,.28);border-radius:7px;color:var(--txt)}input::placeholder,textarea::placeholder{color:#94a9c4}input:focus,textarea:focus,select:focus{outline:2px solid rgba(46,220,255,.45);border-color:var(--cyan)}
  button{background:linear-gradient(135deg,var(--gold),#ffcf66);color:#0d1828;border-radius:6px;box-shadow:0 7px 18px rgba(245,185,66,.13);transition:transform .15s ease,filter .15s ease}button:hover{filter:brightness(1.07);transform:translateY(-1px)}button.alt{color:var(--txt);background:rgba(46,220,255,.05);border-color:rgba(113,211,255,.33);box-shadow:none}.status{color:var(--cyan)}.metric{background:rgba(3,12,27,.42);border:1px solid rgba(113,211,255,.13)}.metric b{color:var(--cyan)}
  .risk{border:1px solid rgba(113,211,255,.16);height:13px}.risk b{box-shadow:0 0 14px rgba(245,185,66,.55)}.sourcebox div,.entry{background:rgba(3,12,27,.26);border-color:rgba(113,211,255,.2)}.sourcebox b{color:var(--cyan)}.verdict{letter-spacing:.04em}.explain{border:1px solid rgba(113,211,255,.13);background:rgba(3,12,27,.42)}
  .home-hero{background:linear-gradient(120deg,rgba(10,35,65,.98),rgba(15,26,56,.98));min-height:268px;padding:38px}.home-hero:after{content:'◌◌\A ◌◌';white-space:pre;right:35px;top:-38px;font:700 145px/0.75 'IBM Plex Mono',monospace;color:rgba(46,220,255,.08)}.home-hero h1{font-family:'IBM Plex Mono',monospace;font-size:clamp(1.9rem,3.4vw,3.45rem);max-width:17ch}.home-hero h1:after{content:'_';color:var(--cyan)}.home-stats{border-color:rgba(113,211,255,.22);background:rgba(46,220,255,.14)}.home-stat{background:var(--panel)}.home-stat b{color:var(--cyan)}.home-step b{color:var(--cyan)}.warning{border-left:3px solid var(--gold);padding:10px 12px;background:rgba(245,185,66,.08);margin-top:16px;color:var(--muted);font-size:.88rem}
  .analyze-grid{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:18px;align-items:start}.analyze-side{display:grid;gap:12px}.scan-card{padding:18px}.scan-card h3{font-size:1rem}.scan-card p{font-size:.86rem;margin:8px 0}.scan-list{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:8px}.scan-list li{font-size:.8rem;color:var(--muted);padding-left:22px;position:relative}.scan-list li:before{content:'✓';position:absolute;left:0;color:var(--green);font-weight:700}.signal-row{display:flex;align-items:center;gap:10px;font:10px 'IBM Plex Mono',monospace;color:var(--muted);margin:8px 0}.signal-dot{width:9px;height:9px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green)}.signal-dot.cyan{background:var(--cyan);box-shadow:0 0 10px var(--cyan)}.signal-dot.gold{background:var(--gold);box-shadow:0 0 10px var(--gold)}
  .site-footer{margin-top:42px;padding:20px 0 6px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:15px;align-items:center;color:var(--muted);font:10px 'IBM Plex Mono',monospace;letter-spacing:.04em}.footer-mark{color:var(--cyan)}
  @media(max-width:980px){.analyze-grid{grid-template-columns:1fr}.analyze-side{grid-template-columns:repeat(3,1fr)}.scan-card{padding:14px}}@media(max-width:780px){.analyze-side{grid-template-columns:1fr}.site-footer{align-items:flex-start;flex-direction:column}.home-hero{padding:25px}}
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  const nav = document.querySelector('#nav');
  const main = document.querySelector('.main');
  const analyze = document.querySelector('#analyze');
  if (!nav || !main || !analyze) return;

  const analyzeButton = nav.querySelector('[data-go="analyze"]');
  analyzeButton.insertAdjacentHTML('beforebegin', '<button data-go="home">⌂ Home</button>');
  main.insertAdjacentHTML('afterbegin', `<section class="page" id="home"><div class="home-hero card"><span class="eyebrow">News intelligence workspace // v1.0</span><h1>VERIFY SIGNAL. REVEAL CONTEXT.</h1><p>A robotics-inspired control center for cautious news analysis, source review, local model training, and explainable AI support.</p><div class="actions"><button data-go="analyze">Start a scan</button><button class="alt" data-go="training">Train your model</button></div></div><div class="home-stats"><div class="home-stat"><b id="homeChecks">0</b><span>Checks saved</span></div><div class="home-stat"><b id="homeFeedback">—</b><span>Feedback quality</span></div><div class="home-stat"><b id="homeModel">Ready</b><span>Model status</span></div><div class="home-stat"><b>04</b><span>Decision layers</span></div></div><div class="grid" style="margin-top:18px"><article class="card"><span class="eyebrow">System flow</span><h3>CLAIM → SIGNAL → REVIEW</h3><div class="home-step"><b>01</b><p>Paste a claim and, when possible, its original source.</p></div><div class="home-step"><b>02</b><p>Inspect risk, confidence, language markers, and credibility signals.</p></div><div class="home-step"><b>03</b><p>Store feedback, export history, and retrain using stronger data.</p></div></article><article class="card"><span class="eyebrow">Operator note</span><h3>HUMAN REVIEW REQUIRED</h3><p>NewsGuard ranks textual risk signals. It does not independently verify whether a claim is true or false.</p><div class="warning">Use original reporting, credible evidence, and independent corroboration before sharing a claim.</div></article></div></section>`);

  const primaryCard = analyze.querySelector('.card.wide');
  primaryCard.parentElement.classList.add('analyze-grid');
  primaryCard.insertAdjacentHTML('afterend', `<aside class="analyze-side" aria-label="Analysis guide"><article class="card scan-card"><span class="eyebrow">Scan protocol</span><h3>HOW TO ANALYZE</h3><ol class="scan-list"><li>Use one specific claim at a time.</li><li>Add the original source URL.</li><li>Read the evidence checklist.</li><li>Record whether the result was useful.</li></ol></article><article class="card scan-card"><span class="eyebrow">Decision layers</span><div class="signal-row"><i class="signal-dot"></i>LOCAL CLASSIFIER</div><div class="signal-row"><i class="signal-dot cyan"></i>SOURCE PROFILE</div><div class="signal-row"><i class="signal-dot gold"></i>HUMAN VERIFICATION</div></article><article class="card scan-card"><span class="eyebrow">Good input</span><p>Include who made the claim, what happened, and when. Avoid posting only a headline or social-media caption.</p></article></aside>`);
  analyze.querySelector('.top p').textContent = 'Run a local model scan, inspect source signals, and verify with independent evidence before sharing.';
  analyze.querySelector('.top').insertAdjacentHTML('beforeend', '<div class="signal-row"><i class="signal-dot"></i> LOCAL MODEL READY <i class="signal-dot cyan"></i> SOURCE REVIEW ENABLED <i class="signal-dot gold"></i> HUMAN CHECK REQUIRED</div>');
  main.insertAdjacentHTML('beforeend', `<footer class="site-footer"><span><span class="footer-mark">◉ NEWSGUARD</span> // VERIFICATION LAB</span><span>LOCAL-FIRST ANALYSIS · RESPONSIBLE AI · 2026</span><span>OUTPUT IS A RISK SIGNAL, NOT A FACT CHECK.</span></footer>`);

  const go = target => {
    document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === target));
    document.querySelectorAll('[data-go]').forEach(button => button.classList.toggle('active', button.dataset.go === target));
    nav.classList.remove('open');
  };
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => go(button.dataset.go)));
  const updateHome = () => {
    let history = [];
    try { history = JSON.parse(localStorage.ngHistory || '[]'); } catch (_) {}
    const feedback = history.filter(item => item.feedback);
    const correct = feedback.filter(item => item.feedback === 'correct').length;
    document.querySelector('#homeChecks').textContent = history.length;
    document.querySelector('#homeFeedback').textContent = feedback.length ? `${Math.round(correct / feedback.length * 100)}%` : '—';
    document.querySelector('#homeModel').textContent = localStorage.ngModel ? 'Trained' : 'Ready';
  };
  updateHome();
  go('home');
})();
