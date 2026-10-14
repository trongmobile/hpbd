/** Điểm vào: quyết định hiển thị form tạo thiệp hay thiệp được chia sẻ, dựa trên URL. */
import { parseCardUrl } from './url-state.js';
import { mountCard } from './greeting.js';
import { initCreator } from './creator.js';

const root = document.documentElement;
const parsed = parseCardUrl(location.search);

if (parsed.kind === 'card') {
  root.dataset.view = 'greeting';
  const { anim, ...data } = parsed.data;
  mountCard(document.getElementById('greeting-view'), data, {
    animations: anim,
    autofocus: true,
    setTitle: true,
  });
} else {
  root.dataset.view = 'creator';
  if (parsed.kind === 'invalid') history.replaceState(null, '', location.pathname);
  initCreator({ notice: parsed.error });
}
