TaskBoard - Frontend (Next.js Trello Clone)

Đây là giao diện người dùng (frontend) cho ứng dụng quản lý công việc TaskBoard, một phiên bản Trello-clone được xây dựng bằng Next.js và TypeScript. Ứng dụng cho phép người dùng và các nhóm cộng tác trên các bảng công việc, theo dõi nhiệm vụ và giám sát tiến độ trong thời gian thực.

# Tính năng chính
Xác thực người dùng:
Đăng ký và Đăng nhập bằng Email/Mật khẩu.
Xác thực hai bước bằng mã OTP gửi qua email.
Đăng nhập nhanh chóng và an toàn thông qua tài khoản GitHub (OAuth2). 
Quản lý Board:
Giao diện dạng lưới hiển thị tất cả các board người dùng tham gia.
Tạo board mới với tên và mô tả.
Tham gia vào một board đã có bằng ID.
Sao chép ID của board để chia sẻ cho người khác.
Quản lý Task và Cột:
Giao diện kéo-thả (Drag-and-Drop) để di chuyển task giữa các cột trạng thái (Backlog, In Progress, Done, etc.). 


Sắp xếp lại thứ tự các task trong cùng một cột. 
Tạo, xem chi tiết, cập nhật và xóa task. 
Gán task cho các thành viên trong board. 
Cộng tác thời gian thực:
Mọi thay đổi trên board (tạo task, cập nhật, di chuyển, xóa) đều được cập nhật ngay lập tức cho tất cả các thành viên đang xem board thông qua WebSocket. 
Tích hợp GitHub:
Liên kết một board với một repository trên GitHub.
Xem danh sách Issues, Pull Requests, và Commits trực tiếp từ repository đã liên kết.
Đính kèm hoặc gỡ bỏ các liên kết GitHub vào một task cụ thể để tiện theo dõi.
🛠️ Công nghệ sử dụng
Framework: Next.js (App Router) 
Ngôn ngữ: TypeScript
UI & Styling: Tailwind CSS & shadcn/ui
Quản lý State: Zustand
Kéo-thả: dnd-kit
Real-time: Socket.IO Client
Gọi API: Axios
Font: Geist (hoặc Inter) 

# Bắt đầu
Yêu cầu tiên quyết
Node.js (khuyến nghị phiên bản 18.x trở lên)
npm
Backend Server phải đang chạy: Frontend này cần kết nối đến backend NestJS để hoạt động. Hãy chắc chắn rằng bạn đã cài đặt và chạy backend trước.

1. Cài đặt
npm install

2. Chạy ứng dụng
Chạy server phát triển (development server):
npm run dev
Mở http://localhost:3000 trên trình duyệt để xem kết quả. Trang sẽ tự động cập nhật mỗi khi bạn chỉnh sửa file. 

📜 Các Scripts có sẵn
npm run dev: Khởi động ứng dụng ở chế độ phát triển.
npm run build: Build ứng dụng cho môi trường production.
npm run start: Chạy ứng dụng đã được build.
npm run lint: Kiểm tra lỗi cú pháp với ESLint.