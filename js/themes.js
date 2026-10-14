/**
 * Cấu hình theme (phần JS). Phần giao diện tương ứng nằm ở css/themes.css
 * trong khối [data-theme="<id>"]. Thêm theme mới: xem README.
 *
 * intro   : 'gift' | 'envelope'  — vật thể ở màn hình mở đầu
 * ambient : hạt trang trí nền  (motion: rise | fall | twinkle | drift)
 * confetti: màu + ký tự dùng cho confetti khi mở thiệp
 */
export const THEMES = [
  {
    id: 'rose',
    name: 'Rose Romance',
    description: 'Hồng pastel, hoa hồng, trái tim và ánh sáng dịu dàng.',
    colors: ['#ffb8cd', '#d62f5c', '#fff5f8'],
    intro: 'envelope',
    ambient: { chars: ['🌹', '💗', '🌸', '✨'], count: 16, motion: 'rise' },
    confetti: { colors: ['#ff7aa2', '#ffc2d4', '#d62f5c', '#fff'], chars: ['💗', '🌹', '🌸'], charRatio: 0.35 },
  },
  {
    id: 'galaxy',
    name: 'Midnight Galaxy',
    description: 'Nền xanh đêm, sao lấp lánh và ánh sáng vũ trụ.',
    colors: ['#0b1030', '#7c6cff', '#7dd3fc'],
    intro: 'gift',
    ambient: { chars: ['✦', '✧', '⋆', '★', '·'], count: 34, motion: 'twinkle' },
    confetti: { colors: ['#7dd3fc', '#c4b5fd', '#f0abfc', '#fde68a'], chars: ['✦', '★'], charRatio: 0.4 },
  },
  {
    id: 'candy',
    name: 'Candy Party',
    description: 'Màu sắc rực rỡ, bóng bay và confetti vui nhộn.',
    colors: ['#ffd23f', '#ff3d81', '#2ec4ff'],
    intro: 'gift',
    ambient: { chars: ['🎈', '🎈', '🍭', '🍬', '⭐'], count: 14, motion: 'rise' },
    confetti: { colors: ['#ff3d81', '#ffd23f', '#2ec4ff', '#7bd957', '#a36bff'], chars: ['🎉', '⭐'], charRatio: 0.12 },
  },
  {
    id: 'gold',
    name: 'Elegant Gold',
    description: 'Đen và vàng gold sang trọng, pháo sáng tinh tế.',
    colors: ['#0d0b08', '#d4af37', '#f6e7b4'],
    intro: 'gift',
    ambient: { chars: ['✦', '✧', '·', '✨'], count: 24, motion: 'twinkle' },
    confetti: { colors: ['#d4af37', '#f6e7b4', '#b8902b', '#fff6d6'], chars: [], charRatio: 0 },
  },
  {
    id: 'pastel',
    name: 'Cute Pastel',
    description: 'Lavender và mint, mây bồng bềnh cùng hình minh họa dễ thương.',
    colors: ['#d9ccff', '#a7ecd5', '#fff'],
    intro: 'envelope',
    ambient: { chars: ['☁️', '⭐', '🌈', '🧸', '💜', '🍬'], count: 12, motion: 'drift' },
    confetti: { colors: ['#c9b6ff', '#a7ecd5', '#ffd6e8', '#fff3a8'], chars: ['⭐', '💜'], charRatio: 0.2 },
  },
  {
    id: 'floral',
    name: 'Floral Garden',
    description: 'Hoa lá xanh mát, những cánh hoa nở nhẹ nhàng.',
    colors: ['#cfe8c8', '#3f7d4e', '#ffe3ea'],
    intro: 'envelope',
    ambient: { chars: ['🌸', '🌼', '🍃', '🌿', '🌷'], count: 16, motion: 'fall' },
    confetti: { colors: ['#8fc58a', '#ffb3c6', '#fff3b0', '#3f7d4e'], chars: ['🌸', '🍃'], charRatio: 0.5 },
  },
];

export const DEFAULT_THEME = THEMES[0].id;
export const THEME_IDS = THEMES.map((t) => t.id);

export const isThemeId = (id) => THEME_IDS.includes(id);
export const getTheme = (id) => THEMES.find((t) => t.id === id) ?? THEMES[0];
