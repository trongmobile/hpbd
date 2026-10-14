/**
 * Hiển thị thiệp (màn hình mở đầu + màn hình chúc mừng).
 * Dùng chung cho trang người nhận, xem trước toàn màn hình và live preview.
 * Mọi nội dung người dùng nhập đều đi qua textContent — không dùng innerHTML.
 */
import { getTheme } from './themes.js';
import * as music from './music.js';

const OPEN_MS = 900;
const MAX_CONFETTI = 140;

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function buildGift() {
  const gift = h('div', 'gift');
  const lid = h('div', 'gift-lid');
  lid.append(h('div', 'gift-bow'));
  gift.append(h('div', 'gift-glow'), h('div', 'gift-box'), lid);
  return gift;
}

function buildEnvelope() {
  const env = h('div', 'envelope');
  const letter = h('div', 'env-letter');
  letter.append(h('span', 'line'), h('span', 'line'), h('span', 'line short'));
  env.append(
    h('div', 'gift-glow'),
    h('div', 'env-back'),
    letter,
    h('div', 'env-front'),
    h('div', 'env-flap'),
    h('div', 'env-seal', '♥'),
  );
  return env;
}

/**
 * @param {HTMLElement} host
 * @param {{name:string,message:string,theme:string}} data
 * @param {{animations?:boolean, autofocus?:boolean, setTitle?:boolean, onClose?:Function}} opts
 */
export function mountCard(host, data, opts = {}) {
  let current = { name: '', message: '', theme: '' };
  let animOn = opts.animations ?? !reduceMotion();
  let phase = 'intro'; // intro | opening | reveal
  const timers = new Set();

  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers.clear();
  };

  // ---------- DOM ----------
  const stage = h('div', 'stage');
  const bg = h('div', 'stage-bg');
  bg.append(h('div', 'stage-art'));
  const ambient = h('div', 'ambient');
  const confettiLayer = h('div', 'confetti-layer');

  const intro = h('section', 'intro');
  const introObj = h('div', 'intro-obj');
  introObj.setAttribute('aria-hidden', 'true');
  const introFor = h('p', 'intro-for');
  const introTitle = h('h2', 'intro-title', 'A Special Surprise For You');
  const btnOpen = h('button', 'btn-open', 'Mở món quà');
  btnOpen.type = 'button';
  intro.append(introObj, introFor, introTitle, btnOpen);

  const reveal = h('section', 'reveal');
  const panel = h('div', 'panel');
  const hb = h('p', 'hb step', 'Happy Birthday');
  const recipient = h('h1', 'recipient step');
  recipient.tabIndex = -1;
  const divider = h('div', 'divider step');
  divider.setAttribute('aria-hidden', 'true');
  divider.append(h('span'));
  const wish = h('p', 'wish step');
  const made = h('p', 'made step', 'Made with love ❤️');
  [hb, recipient, divider, wish, made].forEach((el, i) => el.style.setProperty('--i', i));
  panel.append(hb, recipient, divider, wish, made);
  const makeOwn = h('a', 'make-own', 'Tạo thiệp cho người thân của bạn');
  makeOwn.href = './';
  if (opts.hideMakeOwn) makeOwn.hidden = true;
  reveal.append(panel, makeOwn);

  const controls = h('div', 'controls');
  const mkBtn = (cls, icon, label) => {
    const b = h('button', `ctl ${cls}`);
    b.type = 'button';
    b.append(h('span', 'ctl-icon', icon), h('span', 'ctl-label', label));
    return b;
  };
  const btnReplay = mkBtn('ctl-replay', '↻', 'Phát lại');
  const btnAnim = mkBtn('ctl-anim', '✨', 'Hiệu ứng');
  const btnMusic = mkBtn('ctl-music', '♪', 'Nhạc');
  controls.append(btnReplay, btnAnim, btnMusic);

  stage.append(bg, ambient, intro, reveal, controls, confettiLayer);
  host.replaceChildren(stage);

  // ---------- Hiệu ứng ----------
  function renderAmbient() {
    ambient.replaceChildren();
    if (!animOn) return;
    const { chars, count, motion } = getTheme(current.theme).ambient;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = h('span', `amb amb-${motion}`, pick(chars));
      p.style.setProperty('--x', `${rand(2, 96).toFixed(1)}%`);
      p.style.setProperty('--y', `${rand(2, 94).toFixed(1)}%`);
      p.style.setProperty('--sz', `${rand(0.9, 2).toFixed(2)}rem`);
      p.style.setProperty('--dur', `${rand(motion === 'twinkle' ? 2.5 : 9, motion === 'twinkle' ? 6 : 18).toFixed(1)}s`);
      p.style.setProperty('--delay', `${(-rand(0, 14)).toFixed(1)}s`);
      p.style.setProperty('--dx', `${rand(-60, 60).toFixed(0)}px`);
      p.style.setProperty('--rot', `${rand(-40, 40).toFixed(0)}deg`);
      frag.append(p);
    }
    ambient.append(frag);
  }

  function burst(n) {
    if (!animOn) return;
    const { colors, chars, charRatio } = getTheme(current.theme).confetti;
    const room = MAX_CONFETTI - confettiLayer.childElementCount;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < Math.min(n, room); i++) {
      const useChar = chars.length > 0 && Math.random() < charRatio;
      const p = h('span', useChar ? 'cf cf-char' : `cf ${Math.random() < 0.4 ? 'cf-round' : ''}`, useChar ? pick(chars) : null);
      const w = rand(6, 11);
      p.style.setProperty('--x', `${rand(0, 100).toFixed(1)}%`);
      p.style.setProperty('--dx', `${rand(-90, 90).toFixed(0)}px`);
      p.style.setProperty('--rot', `${rand(-720, 720).toFixed(0)}deg`);
      p.style.setProperty('--dur', `${rand(2.6, 4.6).toFixed(2)}s`);
      p.style.setProperty('--delay', `${rand(0, 0.7).toFixed(2)}s`);
      p.style.setProperty('--w', `${w.toFixed(1)}px`);
      p.style.setProperty('--h', `${(w * rand(0.6, 1.6)).toFixed(1)}px`);
      p.style.setProperty('--c', pick(colors));
      p.addEventListener('animationend', () => p.remove(), { once: true });
      frag.append(p);
    }
    confettiLayer.append(frag);
  }

  function playReveal() {
    reveal.classList.remove('play');
    void reveal.offsetWidth; // khởi động lại animation
    reveal.classList.add('play');
    reveal.scrollTop = 0;
    confettiLayer.replaceChildren();
    burst(60);
    later(() => burst(36), 800);
    later(() => burst(28), 1800);
  }

  // ---------- Trạng thái ----------
  function setPhase(next) {
    phase = next;
    stage.dataset.state = next;
  }

  function showIntro() {
    clearTimers();
    confettiLayer.replaceChildren();
    reveal.classList.remove('play');
    setPhase('intro');
  }

  function showReveal() {
    clearTimers();
    setPhase('reveal');
    playReveal();
    if (opts.autofocus) recipient.focus({ preventScroll: true });
  }

  function open() {
    if (phase !== 'intro') return;
    if (!animOn) return showReveal();
    setPhase('opening');
    later(showReveal, OPEN_MS);
  }

  function replay() {
    if (phase === 'reveal') {
      clearTimers();
      playReveal();
    } else if (phase === 'intro') {
      open();
    }
  }

  function setAnimations(on) {
    animOn = on;
    stage.dataset.anim = on ? 'on' : 'off';
    if (!on) confettiLayer.replaceChildren();
    renderAmbient();
    syncControls();
    opts.onAnimationsChange?.(on);
    if (on && phase === 'reveal') playReveal();
    if (!on && phase === 'opening') showReveal();
  }

  function syncControls() {
    btnAnim.setAttribute('aria-pressed', String(animOn));
    btnAnim.querySelector('.ctl-label').textContent = animOn ? 'Hiệu ứng: Bật' : 'Hiệu ứng: Tắt';
    const m = music.isOn();
    btnMusic.setAttribute('aria-pressed', String(m));
    btnMusic.querySelector('.ctl-label').textContent = m ? 'Nhạc: Bật' : 'Nhạc: Tắt';
  }

  // ---------- Dữ liệu ----------
  function update(next) {
    const prevTheme = current.theme;
    current = { ...current, ...next };
    const name = current.name?.trim();
    const msg = current.message;

    recipient.textContent = name || 'Tên người nhận';
    recipient.classList.toggle('is-placeholder', !name);
    wish.textContent = msg?.trim() ? msg : 'Lời chúc của bạn sẽ hiện ở đây…';
    wish.classList.toggle('is-placeholder', !msg?.trim());
    introFor.textContent = name ? `Dành cho ${name}` : 'Dành cho người đặc biệt';

    if (current.theme !== prevTheme) {
      const theme = getTheme(current.theme);
      stage.dataset.theme = theme.id;
      stage.dataset.intro = theme.intro;
      introObj.replaceChildren(theme.intro === 'gift' ? buildGift() : buildEnvelope());
      renderAmbient();
      if (phase === 'reveal') playReveal();
    }
    if (opts.setTitle && name) document.title = `Happy Birthday ${name} 🎂`;
  }

  // ---------- Sự kiện ----------
  btnOpen.addEventListener('click', open);
  btnReplay.addEventListener('click', replay);
  btnAnim.addEventListener('click', () => setAnimations(!animOn));
  btnMusic.addEventListener('click', music.toggle);
  const unsubscribe = music.subscribe(syncControls);

  stage.dataset.anim = animOn ? 'on' : 'off';
  setPhase('intro');
  update(data);
  syncControls();

  return {
    el: stage,
    update,
    open,
    replay,
    showIntro,
    showReveal,
    setAnimations,
    get phase() {
      return phase;
    },
    destroy() {
      clearTimers();
      unsubscribe();
      host.replaceChildren();
    },
  };
}
