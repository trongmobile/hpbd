/**
 * Toàn bộ dữ liệu thiệp nằm trong query string. Module này là nơi DUY NHẤT
 * đọc/ghi query string: dùng URLSearchParams, không ghép chuỗi thủ công.
 */
import { isThemeId } from './themes.js';

export const LIMITS = Object.freeze({ name: 60, message: 1000 });

// Ký tự điều khiển (trừ \n và \t) không có nghĩa trong lời chúc.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const cleanName = (s) => String(s ?? '').replace(/[\r\n\t]+/g, ' ').replace(CONTROL_CHARS, '').trim();
export const cleanMessage = (s) => String(s ?? '').replace(/\r\n?/g, '\n').replace(CONTROL_CHARS, '').trim();

/** Kiểm tra dữ liệu. Trả về { ok, data, errors } — errors có khóa name/message/theme. */
export function validateCard({ name, message, theme }) {
  const data = { name: cleanName(name), message: cleanMessage(message), theme: String(theme ?? '') };
  const errors = {};

  if (!data.name) errors.name = 'Hãy nhập tên người nhận nhé.';
  else if (data.name.length > LIMITS.name) errors.name = `Tên tối đa ${LIMITS.name} ký tự.`;

  if (!data.message) errors.message = 'Hãy viết một lời chúc thật đặc biệt nhé.';
  else if (data.message.length > LIMITS.message) errors.message = `Lời chúc tối đa ${LIMITS.message.toLocaleString('vi-VN')} ký tự.`;

  if (!isThemeId(data.theme)) errors.theme = 'Theme không được hỗ trợ.';

  return { ok: Object.keys(errors).length === 0, data, errors };
}

/**
 * Đọc trạng thái từ location.search.
 *  - kind 'creator': không có tham số thiệp  → hiển thị form
 *  - kind 'card'   : hợp lệ                  → hiển thị thiệp (data gồm anim: boolean|undefined)
 *  - kind 'invalid': có tham số nhưng sai    → error là câu thông báo thân thiện
 */
export function parseCardUrl(search) {
  const params = new URLSearchParams(search);
  if (!['name', 'message', 'theme'].some((k) => params.has(k))) return { kind: 'creator' };

  const missing = ['name', 'message', 'theme'].filter((k) => !params.get(k)?.trim());
  if (missing.length) return { kind: 'invalid', error: 'Liên kết thiệp bị thiếu thông tin. Có thể liên kết đã bị cắt ngắn khi gửi.' };

  const { ok, data, errors } = validateCard({
    name: params.get('name'),
    message: params.get('message'),
    theme: params.get('theme'),
  });
  if (!ok) {
    const reason = errors.theme ?? errors.name ?? errors.message;
    return { kind: 'invalid', error: `Liên kết thiệp không hợp lệ. ${reason}` };
  }

  const anim = params.get('anim');
  return { kind: 'card', data: { ...data, anim: anim === '0' ? false : undefined } };
}

/** Tạo URL chia sẻ từ dữ liệu đã hợp lệ. `base` mặc định là trang hiện tại (không hardcode domain). */
export function buildCardUrl({ name, message, theme, anim = true }, base = globalThis.location.href) {
  const url = new URL(base);
  const params = new URLSearchParams({ name, message, theme });
  if (!anim) params.set('anim', '0');
  url.hash = '';
  // URLSearchParams mã hóa khoảng trắng thành '+'; %20 được các ứng dụng chat xử lý ổn định hơn.
  // '+' thật trong dữ liệu đã được mã hóa thành %2B nên phép thay này an toàn.
  url.search = params.toString().replace(/\+/g, '%20');
  return url.toString();
}
