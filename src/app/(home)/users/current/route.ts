import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { appURL } from "@/constants";

export async function GET() {
  // Lấy thông tin session từ Clerk ở phía server
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang sign-in
    return NextResponse.redirect(new URL("/sign-in", appURL));
  }

  // Tìm user trong database bằng clerkId
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId));

  if (!user) {
    // Trường hợp user đã đăng nhập Clerk nhưng chưa được đồng bộ vào DB,
    // chuyển hướng về trang chủ.
    return NextResponse.redirect(new URL("/", appURL));
  }

  // Chuyển hướng đến trang cá nhân với ID (UUID) từ database
  return NextResponse.redirect(new URL(`/users/${user.id}`, appURL));
}