import { db } from '@/db'; 
import { categories } from '@/db/schema'; 

// Dữ liệu ban đầu bạn muốn chèn
const categoryNames = [
  "Film & Animation",
  "Autos & Vehicles",
  "Music",
  "Pets & Animals",
  "Sports",
  "Travel & Events",
  "Gaming",
  "People & Blogs",
  "Comedy",
  "Entertainment",
  "News & Politics",
  "Howto & Style",
  "Education",
  "Science & Technology",
  "Nonprofits & Activism",
];

async function main() {
  console.log("🌱 Seeding categories...");
  try {
    // Chuẩn bị dữ liệu để chèn. Thêm cả trường 'name'.
    const values = categoryNames.map((name) => ({
      name: name, // Thêm trường name
      description: `A category for topics related to ${name}.`,
    }));

    // Xóa dữ liệu cũ trước khi chèn (tùy chọn nhưng thường được khuyến khích)
    console.log("Deleting existing categories...");
    await db.delete(categories);

    // Chèn dữ liệu mới vào
    console.log("Inserting new categories...");
    await db.insert(categories).values(values);

    console.log("✅ Categories seeded successfully.");

  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    // Thoát tiến trình với mã lỗi để báo hiệu thất bại
    process.exit(1);
  }
}

// Gọi hàm main để bắt đầu thực thi script
main();