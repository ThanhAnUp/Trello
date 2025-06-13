Backend TaskBoard (Trello Clone)
Đây là phần backend cho ứng dụng quản lý công việc theo phong cách Trello, được xây dựng bằng NestJS. Hệ thống cung cấp các API RESTful và kết nối WebSocket real-time để quản lý board, task, thành viên và tích hợp sâu với GitHub.

# Tính năng nổi bật
Xác thực người dùng: Đăng ký, đăng nhập bằng Email/Mật khẩu, OTP qua email, và đăng nhập qua tài khoản GitHub (OAuth2).
Quản lý Board: Tạo, xem, xóa, tham gia board và liên kết board với một repository GitHub.
Quản lý Task: CRUD (Tạo, Đọc, Cập nhật, Xóa) cho các task trong một board.
Thao tác thời gian thực: Tất cả các hành động liên quan đến task (tạo, cập nhật, xóa, sắp xếp lại) đều được đồng bộ hóa real-time đến tất cả các thành viên trong board thông qua WebSocket (Socket.IO).
Tích hợp GitHub:
Lấy thông tin chi tiết (branches, issues, pull requests, commits) từ repository đã liên kết.
Đính kèm/gỡ bỏ các Issue, Pull Request, Commit của GitHub vào một task cụ thể.
🛠️ Công nghệ sử dụng
Framework: NestJS
Cơ sở dữ liệu: Cloud Firestore (Google Firebase)
Xác thực: Passport.js (JWT Strategy), OAuth2
Real-time: Socket.IO
Giao tiếp API GitHub: Octokit.js
Gửi Email: Nodemailer
Ngôn ngữ: TypeScript

# Bắt đầu
Yêu cầu tiên quyết
Node.js (khuyến nghị phiên bản 18.x trở lên)

- npm install
- npm start