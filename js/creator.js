/** Trang tạo thiệp: form, validate, live preview, tạo & chia sẻ liên kết. */
import { THEMES, DEFAULT_THEME } from './themes.js';
import { LIMITS, validateCard, buildCardUrl } from './url-state.js';
import { mountCard } from './greeting.js';
import * as music from './music.js';

const $ = (sel) => document.querySelector(sel);
const LONG_URL = 1800;

export function initCreator({ notice } = {}) {
  const form = $('#card-form');
  const nameInput = $('#name');
  const msgInput = $('#message');
  const counter = $('#msg-count');
  const grid = $('#theme-grid');
  const optAnim = $('#opt-anim');
  const optMusic = $('#opt-music');
  const result = $('#result');
  const shareUrl = $('#share-url');
  const urlNote = $('#url-note');
  const toast = $('#toast');

  let theme = DEFAULT_THEME;
  let toastTimer = 0;

  // ---------- Thông báo liên kết lỗi ----------
  if (notice) {
    $('#url-alert-text').textContent = notice;
    $('#url-alert').hidden = false;
    $('#url-alert .alert-close').addEventListener('click', () => ($('#url-alert').hidden = true));
  }

  // ---------- Live preview ----------
  const preview = mountCard($('#preview-host'), { name: '', message: '', theme }, { hideMakeOwn: true });
  const getData = () => ({ name: nameInput.value, message: msgInput.value, theme });
  const syncPreview = () => preview.update(getData());

  // ---------- Theme picker ----------
  const cards = THEMES.map((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-card';
    btn.setAttribute('role', 'radio');
    btn.dataset.id = t.id;

    const mini = document.createElement('div');
    mini.className = 'theme-mini';
    mini.dataset.theme = t.id;
    mini.setAttribute('aria-hidden', 'true');
    const sample = document.createElement('span');
    sample.className = 'mini-title';
    sample.textContent = 'Happy Birthday';
    mini.append(sample);

    const meta = document.createElement('div');
    meta.className = 'theme-meta';
    const title = document.createElement('strong');
    title.textContent = t.name;
    const dots = document.createElement('span');
    dots.className = 'dots';
    t.colors.forEach((c) => {
      const d = document.createElement('i');
      d.style.background = c;
      dots.append(d);
    });
    const desc = document.createElement('small');
    desc.textContent = t.description;
    const head = document.createElement('div');
    head.className = 'theme-head';
    head.append(title, dots);
    meta.append(head, desc);

    btn.append(mini, meta);
    btn.addEventListener('click', () => selectTheme(t.id));
    grid.append(btn);
    return btn;
  });

  function selectTheme(id, { focus = false } = {}) {
    theme = id;
    cards.forEach((c) => {
      const on = c.dataset.id === id;
      c.setAttribute('aria-checked', String(on));
      c.tabIndex = on ? 0 : -1;
      if (on && focus) c.focus();
    });
    syncPreview();
    hideResult();
  }
  // Điều hướng bằng phím mũi tên như radio group chuẩn.
  grid.addEventListener('keydown', (e) => {
    const i = THEMES.findIndex((t) => t.id === theme);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    selectTheme(THEMES[(i + step + THEMES.length) % THEMES.length].id, { focus: true });
  });
  selectTheme(theme);

  // ---------- Form ----------
  const fmt = (n) => n.toLocaleString('vi-VN');
  function updateCounter() {
    const n = msgInput.value.length;
    counter.textContent = `${fmt(n)} / ${fmt(LIMITS.message)}`;
    counter.classList.toggle('is-near', n > LIMITS.message * 0.9);
  }
  function setError(field, text) {
    const input = field === 'name' ? nameInput : msgInput;
    $(`#${field}-error`).textContent = text ?? '';
    input.toggleAttribute('aria-invalid', Boolean(text));
  }

  nameInput.addEventListener('input', () => {
    setError('name');
    syncPreview();
    hideResult();
  });
  msgInput.addEventListener('input', () => {
    setError('message');
    updateCounter();
    syncPreview();
    hideResult();
  });
  optAnim.addEventListener('change', () => {
    preview.setAnimations(optAnim.checked);
    hideResult();
  });
  optMusic.addEventListener('change', () => music.setOn(optMusic.checked));
  music.subscribe((on) => (optMusic.checked = on));

  function validate() {
    const { ok, data, errors } = validateCard(getData());
    setError('name', errors.name);
    setError('message', errors.message);
    if (!ok) (errors.name ? nameInput : msgInput).focus();
    return ok ? data : null;
  }

  // ---------- Xem trước toàn màn hình ----------
  const modal = $('#preview-modal');
  const modalHost = $('#modal-host');
  let modalCard = null;
  let opener = null;

  function openModal(data) {
    opener = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalCard = mountCard(modalHost, data, { animations: optAnim.checked, autofocus: false, hideMakeOwn: true });
    $('#modal-close').focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modalCard?.destroy();
    modalCard = null;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    opener?.focus?.();
  }
  $('#btn-preview').addEventListener('click', () => {
    const data = validate();
    if (data) openModal(data);
  });
  $('#modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeModal());

  // ---------- Kích thước & trạng thái preview ----------
  const frame = $('#preview-frame');
  document.querySelectorAll('.seg button').forEach((b) =>
    b.addEventListener('click', () => {
      frame.dataset.size = b.dataset.size;
      document.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }),
  );
  const stageToggle = $('#btn-stage-toggle');
  stageToggle.addEventListener('click', () => {
    if (preview.phase === 'reveal') {
      preview.showIntro();
      stageToggle.textContent = 'Xem màn hình chúc mừng →';
    } else {
      preview.showReveal();
      stageToggle.textContent = '← Về màn hình mở đầu';
    }
  });
  preview.el.querySelector('.btn-open').addEventListener('click', () => {
    stageToggle.textContent = '← Về màn hình mở đầu';
  });

  // ---------- Tạo liên kết ----------
  function hideResult() {
    result.hidden = true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = validate();
    if (!data) return;
    const url = buildCardUrl({ ...data, anim: optAnim.checked });
    shareUrl.value = url;
    $('#btn-open').href = url;
    const long = url.length > LONG_URL;
    urlNote.hidden = !long;
    urlNote.textContent = long
      ? `Liên kết khá dài (${fmt(url.length)} ký tự). Một số ứng dụng có thể cắt ngắn liên kết — hãy rút gọn lời chúc nếu bạn gặp sự cố.`
      : '';
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  shareUrl.addEventListener('focus', () => shareUrl.select());

  $('#btn-copy').addEventListener('click', async () => {
    if (await copyText(shareUrl.value)) showToast('Đã sao chép liên kết!');
    else {
      shareUrl.select();
      showToast('Không thể tự sao chép — hãy nhấn Ctrl/Cmd + C.');
    }
  });

  const btnShare = $('#btn-share');
  if (typeof navigator.share === 'function') {
    btnShare.hidden = false;
    btnShare.addEventListener('click', async () => {
      try {
        await navigator.share({ title: 'Thiệp sinh nhật', text: `Một món quà nhỏ dành cho ${nameInput.value.trim()} 🎁`, url: shareUrl.value });
      } catch (err) {
        if (err?.name !== 'AbortError') showToast('Không thể mở hộp thoại chia sẻ.');
      }
    });
  }

  $('#btn-edit').addEventListener('click', () => {
    hideResult();
    nameInput.focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#btn-new').addEventListener('click', () => {
    form.reset();
    optAnim.checked = true;
    preview.setAnimations(true);
    setError('name');
    setError('message');
    updateCounter();
    selectTheme(DEFAULT_THEME);
    nameInput.focus();
  });

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  updateCounter();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* rơi xuống phương án dự phòng */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.append(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
