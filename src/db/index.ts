import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Dòng này quan trọng nhất: Import tất cả mọi thứ từ schema.ts
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

// Khởi tạo client kết nối đến database
const client = postgres(process.env.DATABASE_URL);

// Khởi tạo Drizzle instance và truyền toàn bộ schema vào
// để "dạy" cho db biết về cấu trúc database của bạn
export const db = drizzle(client, { schema });