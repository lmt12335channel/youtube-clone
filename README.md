🚀 Tính năng nổi bật

Trải nghiệm người xem

▶️ Trình phát video nâng cao: Điều khiển âm lượng, chuyển đổi chất lượng video và bật/tắt phụ đề.

👍 Tương tác: Thích video, đăng ký kênh và tham gia vào các cuộc thảo luận thông qua một hệ thống bình luận toàn diện.

👤 Cá nhân hóa: Khám phá các kênh thịnh hành, xem hồ sơ người dùng và quản lý các danh sách phát được tạo tự động như "Lịch sử xem" và "Video đã thích".

📱 Thiết kế đáp ứng (Responsive): Trải nghiệm mượt mà trên mọi thiết bị, từ máy tính để bàn đến điện thoại di động.

Creator Studio - Công cụ cho người sáng tạo

🤖 Tích hợp AI: Tự động tạo hình thu nhỏ (thumbnail), tiêu đề và mô tả video hấp dẫn bằng AI dựa trên nội dung bản ghi của video.

⚙️ Quản lý video: Tải lên video mới, theo dõi các giai đoạn xử lý (tạo thumbnail, tối ưu hóa chất lượng, tạo bản ghi) và xuất bản video một cách tự tin.

🖼️ Hệ thống quản lý thumbnail đa năng: Tải lên thumbnail tùy chỉnh, sử dụng AI để tạo hoặc khôi phục các phiên bản trước đó.

🛠️ Công nghệ sử dụng

Dự án này được xây dựng trên một nền tảng công nghệ hiện đại và mạnh mẽ:

Framework: Next.js 15 & React 19

Styling: Tailwind CSS v4 & Shadcn UI

API & Type Safety: tRPC cho type-safety end-to-end

Cơ sở dữ liệu: PostgreSQL

ORM: Drizzle ORM để tối ưu hóa truy vấn SQL

Xác thực: Clerk

🏁 Bắt đầu

Làm theo các bước sau để chạy dự án trên máy của bạn.

Yêu cầu

Node.js (phiên bản 18.18 trở lên)

bun (khuyến nghị)

1. Clone kho lưu trữ

git clone [https://github.com/lmt12335channel/youtube-clones.git](https://github.com/lmt12335channel/youtube-clone.git)
cd youtube-clone-nextjs


2. Cài đặt các gói phụ thuộc

bun install


3. Thiết lập biến môi trường

Tạo một tệp .env.local ở thư mục gốc của dự án và sao chép nội dung từ .env.example (nếu có) hoặc điền các biến cần thiết. Bạn sẽ cần các khóa API từ các dịch vụ như Clerk và cơ sở dữ liệu PostgreSQL.

# PostgreSQL Database URL
DATABASE_URL="postgres://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."


4. Chạy máy chủ phát triển

bun run dev


Mở http://localhost:3000 trên trình duyệt của bạn để xem kết quả.
