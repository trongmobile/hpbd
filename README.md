# HPBD — Thiệp chúc mừng sinh nhật

HPBD là website tĩnh (HTML + CSS + JavaScript thuần) giúp bạn tạo thiệp sinh nhật cá nhân hóa và chia sẻ qua một đường link. Không backend, không database, không đăng nhập.

## Tính năng

- Form tạo thiệp: tên người nhận, lời chúc (tối đa 1.000 ký tự, có bộ đếm), chọn theme, bật/tắt hiệu ứng và nhạc.
- 6 theme khác biệt về bố cục, kiểu chữ, vật thể mở đầu (hộp quà / phong bì) và hiệu ứng: Rose Romance, Midnight Galaxy, Candy Party, Elegant Gold, Cute Pastel, Floral Garden.
- Live preview (điện thoại / máy tính), xem trước toàn màn hình.
- Màn hình mở quà → màn hình chúc mừng hiện từng bước, confetti theo theme, nút phát lại, bật/tắt hiệu ứng, bật/tắt nhạc.
- Sao chép liên kết (có fallback), Web Share API, nút "Tạo thiệp mới".
- Nhạc nền là giai điệu Happy Birthday tạo bằng Web Audio — mặc định tắt, không tự phát.
- Hỗ trợ `prefers-reduced-motion`, bàn phím và trình đọc màn hình ở mức cơ bản.

## Yêu cầu môi trường

Chỉ cần trình duyệt hiện đại (Chrome/Edge/Safari/Firefox bản mới) và một HTTP server tĩnh bất kỳ. Dự án dùng ES modules nên **không mở trực tiếp bằng `file://`**. Google Fonts tải từ CDN (có font dự phòng khi offline).

## Chạy local

```bash
cd hpbd
python3 -m http.server 8000
# hoặc: npx serve .
```

Mở `http://localhost:8000`.

## Triển khai

**GitHub Pages**: đẩy code lên repository → Settings → Pages → Deploy from a branch → chọn `main` / `(root)`. Site chạy tại `https://<user>.github.io/<repo>/`; liên kết thiệp tự dùng đúng đường dẫn này.

**Netlify**: kéo thả thư mục vào Netlify Drop, hoặc kết nối repo với Build command để trống và Publish directory là `.`.

**Vercel**: import repo, Framework Preset "Other", không cần build.

**Domain riêng**: thêm domain trong phần Domain settings của nhà cung cấp, trỏ DNS (CNAME hoặc A/ALIAS) theo hướng dẫn của họ. Code không hardcode domain nên không cần sửa gì.

## Cách thêm theme mới

1. `js/themes.js`: thêm một object vào `THEMES` (`id`, `name`, `description`, `colors`, `intro: 'gift' | 'envelope'`, `ambient`, `confetti`).
2. `css/themes.css`: sao chép một khối `[data-theme="<id>"]` và đổi biến (`--bg`, `--ink`, `--panel-*`, `--font-display`, `--btn-*`, `--gift-*` / `--env-*`, `--emoji`…). Thêm trang trí riêng dưới `.stage[data-theme="<id>"]` nếu muốn.
3. Nếu dùng font mới, thêm vào link Google Fonts trong `index.html`.

`url-state.js` tự chấp nhận id mới vì đọc danh sách từ `themes.js`.

## Cơ chế tạo URL

Dữ liệu nằm hoàn toàn trong query string, tạo và đọc bằng `URLSearchParams` (module `js/url-state.js`):

```
?name=<tên>&message=<lời chúc>&theme=<id>[&anim=0]
```

- Unicode, emoji, `& ? # " '`, xuống dòng đều được mã hóa/giải mã đúng.
- Giới hạn: tên 60 ký tự, lời chúc 1.000 ký tự, theme phải thuộc danh sách có sẵn. Link vi phạm sẽ đưa người dùng về trang tạo thiệp kèm thông báo.
- URL gốc lấy từ `location.href` lúc chạy, không phụ thuộc `localStorage`.
- Nội dung người dùng luôn được gán bằng `textContent`, không dùng `innerHTML`/`eval`.

## Giới hạn của website tĩnh

- Lời chúc dài → URL dài; một số ứng dụng chat có thể cắt link (form cảnh báo khi URL > 1.800 ký tự).
- Bất kỳ ai có link đều xem được nội dung; không thể thu hồi hay chỉnh sửa thiệp đã gửi.
- Open Graph chỉ là mặc định cho toàn site. Meta tag không thể riêng theo từng thiệp, nên Facebook/Zalo/Messenger sẽ không có ảnh xem trước riêng; muốn vậy cần prerender hoặc dịch vụ tạo meta/ảnh. Cũng chưa có `og:image` vì cần URL tuyệt đối của domain bạn — hãy thêm sau khi có domain.
- Chưa có mã QR (tránh phụ thuộc thư viện ngoài).

## Kiểm tra sau khi deploy

1. Mở `/` → thấy form; thử tạo thiệp khi bỏ trống tên/lời chúc → có lỗi dưới từng ô.
2. Nhập tiếng Việt có dấu, emoji, `& ? #`, xuống dòng → "Tạo thiệp sinh nhật" → mở link ở tab ẩn danh/thiết bị khác.
3. Reload trang thiệp vẫn hiển thị đúng; thử `?name=a` và `?name=a&message=b&theme=xxx` → báo lỗi và quay về form.
4. Kiểm tra từng theme, nút phát lại / hiệu ứng / nhạc, và giao diện trên điện thoại.
5. Mở DevTools Console: không có lỗi.
