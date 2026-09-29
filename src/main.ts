import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createI18n } from './i18n';
import { dict, snippets, terminal } from './lang';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const i18n = createI18n({ dict });
const { t } = i18n;
const fmt = (n: number, digits = 0) =>
  n.toLocaleString(i18n.locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });

/* ---------------- Header & mobile nav ---------------- */
const header = $('.header');
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 10);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const burger = $('.burger');
const setNav = (open: boolean) => {
  document.body.classList.toggle('nav-open', open);
  burger.setAttribute('aria-expanded', String(open));
};
burger.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
$$('.mnav a').forEach((a) => a.addEventListener('click', () => setNav(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && setNav(false));
addEventListener('resize', () => innerWidth > 860 && setNav(false));

/* ---------------- Toast ---------------- */
const toastEl = $('.toast');
let toastTimer: number | undefined;
function toast(msg: string) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
}

/* ---------------- Copy command ---------------- */
const cmd = $<HTMLButtonElement>('.cmd');
cmd.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(cmd.dataset.copy!);
    cmd.classList.add('is-copied');
    setTimeout(() => cmd.classList.remove('is-copied'), 1600);
  } catch {
    toast(t('copy.fail'));
  }
});

/* ---------------- Globe ---------------- */
const globeEl = $('#globe');
// Three.js is loaded lazily so the page itself paints immediately
import('./globe')
  .then(({ createGlobe }) => createGlobe(globeEl, { reduceMotion }))
  .catch(() => {
    // WebGL unavailable — the hero still reads fine without the canvas
    globeEl.closest('.hero__globe')?.classList.add('no-webgl');
  });

/* ---------------- Live numbers ---------------- */
let rps = 1284112;
let blocked = 1204331;
const rpsEl = $('#rps');
const latEl = $('#lat');
const blockedEl = $('#blocked');
const renderLive = () => {
  rpsEl.textContent = fmt(rps);
  blockedEl.textContent = fmt(blocked);
};
if (!reduceMotion) {
  setInterval(() => {
    rps = Math.round(rps + (Math.random() - 0.45) * 24000);
    blocked += Math.round(Math.random() * 40);
    latEl.textContent = String(16 + Math.round(Math.random() * 5));
    renderLive();
  }, 900);
}
renderLive();

/* ---------------- Cursor spotlight on cards ---------------- */
if (finePointer) {
  $$('.spot').forEach((el) =>
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', `${e.clientX - r.left}px`);
      el.style.setProperty('--y', `${e.clientY - r.top}px`);
    })
  );
}

/* ---------------- Latency chart ---------------- */
const W = 400;
const H = 140;
const POINTS = 28;
const toY = (ms: number) => H - 8 - (ms / 120) * (H - 16);
const orbit = Array.from({ length: POINTS }, () => 14 + Math.random() * 10);
const legacy = Array.from({ length: POINTS }, () => 60 + Math.random() * 45);

function linePath(values: number[]) {
  const step = W / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = toY(v);
      if (i === 0) return `M${x},${y}`;
      const px = (i - 1) * step;
      const py = toY(values[i - 1]);
      const cx = (px + x) / 2;
      return `C${cx},${py} ${cx},${y} ${x},${y}`;
    })
    .join(' ');
}

const pathA = $<SVGPathElement>('.chart__a');
const pathB = $<SVGPathElement>('.chart__b');
const fillA = $<SVGPathElement>('.chart__fill');
function drawChart() {
  const a = linePath(orbit);
  pathA.setAttribute('d', a);
  fillA.setAttribute('d', `${a} L${W},${H} L0,${H} Z`);
  pathB.setAttribute('d', linePath(legacy));
}
drawChart();

/* ---------------- Analytics bars ---------------- */
const bars = $('.bars');
bars.innerHTML = Array.from({ length: 24 }, () => '<i></i>').join('');
const barEls = $$('i', bars);
const shuffleBars = () =>
  barEls.forEach((b, i) => (b.style.height = `${20 + Math.abs(Math.sin(i * 0.6 + Date.now() / 1600)) * 60 + Math.random() * 20}%`));
shuffleBars();

/* ---------------- Terminal typing ---------------- */
const termBody = $('.term__body');
let termRun = 0;

async function typeTerminal() {
  const run = ++termRun;
  const lines = terminal[i18n.lang];
  termBody.innerHTML = '';
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  for (const [kind, text] of lines) {
    if (run !== termRun) return;
    const line = document.createElement('div');
    line.className = kind === 'cmd' ? '' : kind;
    termBody.appendChild(line);
    if (kind === 'cmd' && !reduceMotion) {
      for (let i = 1; i <= text.length; i++) {
        if (run !== termRun) return;
        line.innerHTML = `${text.slice(0, i)}<span class="caret"></span>`;
        await sleep(55);
      }
      line.textContent = text;
      await sleep(350);
    } else {
      line.innerHTML = text;
      if (!reduceMotion) await sleep(kind === 'ok' ? 500 : 800);
    }
  }
  if (run !== termRun) return;
  termBody.insertAdjacentHTML('beforeend', '<span class="caret"></span>');
  if (!reduceMotion) setTimeout(() => run === termRun && typeTerminal(), 5000);
}

/* ---------------- Tickers for chart/bars (only while visible) ---------------- */
let tickers: number[] = [];
ScrollTrigger.create({
  trigger: '.bento',
  start: 'top bottom',
  end: 'bottom top',
  onToggle: ({ isActive }) => {
    tickers.forEach(clearInterval);
    tickers = [];
    if (!isActive || reduceMotion) return;
    tickers.push(
      window.setInterval(() => {
        orbit.shift();
        orbit.push(14 + Math.random() * 10);
        legacy.shift();
        legacy.push(60 + Math.random() * 45);
        drawChart();
      }, 900),
      window.setInterval(shuffleBars, 1200)
    );
  },
});
ScrollTrigger.create({ trigger: '.term', start: 'top 90%', once: true, onEnter: () => typeTerminal() });

/* ---------------- How it works (steps + code) ---------------- */
const codeEl = $('.code__body code');
const steps = $$<HTMLButtonElement>('.step');
let stepIndex = 0;
let stepTween: gsap.core.Tween | null = null;

function highlight(src: string) {
  const esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(
    /(\/\/.*$)|('(?:[^'\\]|\\.)*')|\b(import|from|export|default|const|true|false)\b|\b(\d+(?:\.\d+)?)\b|\b([a-zA-Z_]\w*)(?=\()/gm,
    (m, c, s, k, n, f) =>
      c ? `<span class="tk-c">${m}</span>` : s ? `<span class="tk-s">${m}</span>` : k ? `<span class="tk-k">${m}</span>` : n ? `<span class="tk-n">${m}</span>` : f ? `<span class="tk-f">${m}</span>` : m
  );
}

function showStep(i: number, animate = true) {
  stepIndex = i;
  steps.forEach((s, k) => {
    s.classList.toggle('is-active', k === i);
    s.setAttribute('aria-selected', String(k === i));
    gsap.set(s.querySelector('.step__bar i'), { scaleX: 0 });
  });
  codeEl.innerHTML = highlight(snippets[i18n.lang][i])
    .split('\n')
    .map((l) => `<span class="cl">${l || ' '}</span>`)
    .join('\n');
  if (animate && !reduceMotion) {
    gsap.from($$('.cl', codeEl), { opacity: 0, x: -10, duration: 0.4, stagger: 0.035, ease: 'power2.out' });
  }
  stepTween?.kill();
  if (!reduceMotion) {
    stepTween = gsap.to(steps[i].querySelector('.step__bar i'), {
      scaleX: 1,
      duration: 7,
      ease: 'none',
      onComplete: () => showStep((stepIndex + 1) % steps.length),
    });
    stepTween.pause();
    if (howVisible) stepTween.play();
  }
}

let howVisible = false;
ScrollTrigger.create({
  trigger: '.how',
  start: 'top 70%',
  end: 'bottom 20%',
  onToggle: ({ isActive }) => {
    howVisible = isActive;
    isActive ? stepTween?.play() : stepTween?.pause();
  },
});
steps.forEach((s, i) => s.addEventListener('click', () => showStep(i)));
showStep(0, false);

/* ---------------- Pricing ---------------- */
const billingBtns = $$<HTMLButtonElement>('.billing button');
const billingPill = $('.billing__pill');
let billing: 'monthly' | 'yearly' = 'monthly';

function movePill() {
  const active = billingBtns.find((b) => b.dataset.billing === billing)!;
  billingPill.style.width = `${active.offsetWidth}px`;
  billingPill.style.transform = `translateX(${active.offsetLeft - 4}px)`;
}

function renderPrices(animate: boolean) {
  $$('.plan__amount[data-monthly]').forEach((el) => {
    const target = Number(el.dataset[billing]);
    const from = { v: Number(el.dataset.current ?? target) };
    el.dataset.current = String(target);
    if (!animate || reduceMotion) {
      el.textContent = `$${target}`;
      return;
    }
    gsap.to(from, {
      v: target,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = `$${Math.round(from.v)}`),
    });
    gsap.fromTo(el, { y: -6, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.4 });
  });
}

billingBtns.forEach((b) =>
  b.addEventListener('click', () => {
    billing = b.dataset.billing as typeof billing;
    billingBtns.forEach((x) => x.classList.toggle('is-active', x === b));
    movePill();
    renderPrices(true);
  })
);
renderPrices(false);
(document.fonts?.ready ?? Promise.resolve()).then(movePill);
addEventListener('resize', movePill);

/* ---------------- FAQ ---------------- */
$$('.qa').forEach((qa) => {
  const btn = $<HTMLButtonElement>('.qa__q', qa);
  btn.addEventListener('click', () => {
    const open = !qa.classList.contains('is-open');
    $$('.qa.is-open').forEach((o) => {
      o.classList.remove('is-open');
      $('.qa__q', o).setAttribute('aria-expanded', 'false');
    });
    qa.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
});

/* ---------------- Counters ---------------- */
const counters = $$('[data-count]').map((el) => ({
  el,
  target: Number(el.dataset.count),
  dec: Number(el.dataset.decimals ?? 0),
  v: 0,
}));
const writeCounter = (c: (typeof counters)[number]) => (c.el.textContent = fmt(c.v, c.dec));
counters.forEach((c) => {
  if (reduceMotion) {
    c.v = c.target;
    return writeCounter(c);
  }
  ScrollTrigger.create({
    trigger: c.el,
    start: 'top 92%',
    once: true,
    onEnter: () => gsap.to(c, { v: c.target, duration: 2, ease: 'power3.out', onUpdate: () => writeCounter(c) }),
  });
});

/* ---------------- Language change ---------------- */
i18n.onChange(() => {
  renderLive();
  counters.forEach(writeCounter);
  showStep(stepIndex, false);
  movePill();
  renderPrices(false);
  termRun++;
  typeTerminal();
  ScrollTrigger.refresh();
});

/* ---------------- Entrance & scroll reveals ---------------- */
if (!reduceMotion) {
  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .from('.pill', { y: 20, opacity: 0, duration: 1 })
    .from('.hero__title > span', { y: 40, opacity: 0, duration: 1.2, stagger: 0.12 }, '-=0.8')
    .from('.hero__lead, .hero__cta, .hero__trust', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, '-=0.9')
    .from('.hero__globe', { scale: 0.85, opacity: 0, duration: 1.8 }, 0.1)
    .from('.globe__card', { y: 20, opacity: 0, duration: 1, stagger: 0.15 }, 0.8);

  const reveal = (targets: string, stagger = 0.08) =>
    ScrollTrigger.batch(targets, {
      start: 'top 88%',
      once: true,
      onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 1, stagger, ease: 'expo.out' }),
    });
  reveal('.head');
  reveal('.stat');
  reveal('.card', 0.1);
  reveal('.step, .code');
  reveal('.plan', 0.12);
  reveal('.qa', 0.06);
  reveal('.final__card');
}
