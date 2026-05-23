# Countdown Page

Trang đếm ngược với hiệu ứng 3D và âm thanh.

## Tính năng

- **Nút 3D kim loại**: Nút bóng bẩy với viền bạc và tâm đỏ cam
- **Hiệu ứng tia sét**: Các tia sét chớp random bên trong nút (không xoay tròn)
- **Đếm ngược 3D CSS**: Từ 5 đến 1 với hiệu ứng kim loại vàng trong suốt 3D
  - Gradient vàng óng ánh với độ trong suốt
  - Nhiều lớp bóng đổ tạo chiều sâu 3D
  - Hiệu ứng phản chiếu ánh sáng (glass reflection)
  - Animation ánh kim loại di chuyển (metallic shine)
- **Âm thanh**:
  - `beep.mp3` - Phát cho mỗi số đếm ngược (5, 4, 3, 2, 1)
  - `explosion.mp3` - Phát sau khi hiển thị số 1 (hiệu ứng bất ngờ)
- **Chuyển hướng**: Tự động chuyển đến `https://daihoidang.cand.vn/` sau âm thanh nổ

## File cần chuẩn bị

Đặt các file sau vào cùng thư mục với `index.html`:

1. **beep.mp3** - Âm thanh beep ngắn cho đếm ngược
2. **explosion.mp3** - Âm thanh nổ "bùm" sau số 1
3. **background.jpg** (tùy chọn) - Ảnh nền tùy chỉnh

## Cách sử dụng

1. Mở `index.html` trong trình duyệt
2. Nhấn nút hoặc phím Enter để bắt đầu đếm ngược
3. Nghe âm thanh beep cho mỗi số (5 → 4 → 3 → 2 → 1)
4. Số 1 hiển thị 1 giây, sau đó phát âm thanh nổ và zoom out
5. Tự động chuyển đến trang đích

## Công nghệ

- HTML5
- CSS3 (animations, gradients, 3D effects)
- Vanilla JavaScript
