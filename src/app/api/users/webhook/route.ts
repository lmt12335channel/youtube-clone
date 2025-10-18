import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server' // Sử dụng NextResponse để trả về JSON

import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Định nghĩa kiểu dữ liệu cho event data để code rõ ràng hơn
type UserData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
}

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)
    const eventType = evt.type
    const data = evt.data as UserData; // Ép kiểu dữ liệu

    // GHI LOG TOÀN BỘ SỰ KIỆN ĐỂ DEBUG
    // Bạn có thể xem log này trên Vercel hoặc terminal của bạn
    console.log(`[CLERK WEBHOOK] Received event: ${eventType}`);
    console.log('[CLERK WEBHOOK] Event data:', JSON.stringify(data, null, 2));

    if (eventType === 'user.created') {
      // SỬA LỖI Ở ĐÂY: Dùng backtick ` ` thay vì dấu nháy đơn ' '
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();

      await db.insert(users).values({
        clerkId: data.id,
        name: fullName, // Sử dụng tên đã được ghép đúng
        imageUrl: data.image_url,
      });

      console.log(`[DB] Inserted new user with Clerk ID: ${data.id}`);
    }

    if (eventType === 'user.deleted') {
      if (!data.id) {
        console.error('[CLERK WEBHOOK] Error: No user ID provided for user.deleted event.');
        return NextResponse.json({ error: 'No user id' }, { status: 400 });
      } 
      
      await db.delete(users).where(eq(users.clerkId, data.id));
      console.log(`[DB] Deleted user with Clerk ID: ${data.id}`);
    }

    if (eventType === 'user.updated') {
       // SỬA LỖI Ở ĐÂY: Dùng backtick ` ` thay vì dấu nháy đơn ' '
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();

      await db.update(users)
        .set({
          name: fullName, // Sử dụng tên đã được ghép đúng
          imageUrl: data.image_url,
        })
        .where(eq(users.clerkId, data.id));

      console.log(`[DB] Updated user with Clerk ID: ${data.id}`);
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });

  } catch (err: any) { // Thêm kiểu 'any' hoặc 'unknown' cho err
    console.error('Error verifying webhook:', err.message);
    return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 });
  }
}