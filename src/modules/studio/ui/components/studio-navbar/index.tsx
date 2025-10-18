import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { StudioUploadModal } from "@/modules/studio/ui/components/studio-upload-modal";


export const StudioNavbar = () => {
  return (
    <nav className="relative z-50 flex h-16 items-center justify-between gap-4 bg-white px-4 border-b shadow-md">
      
      {/* === KHU VỰC BÊN TRÁI === */}
      <div className="flex flex-shrink-0 items-center">
        <SidebarTrigger />
        <Link href="/studio" className="ml-2">
          <div className="flex items-center gap-2 p-2">
            <Image src="/logo.svg" alt="logo" width={30} height={30} />
            <p className="hidden text-xl font-bold tracking-tight md:block">
              Studio
            </p>
          </div>
        </Link>
      </div>

      {/* === KHU VỰC GIỮA (THANH TÌM KIẾM) === */}
      {/* flex-1 để khu vực này co giãn lấp đầy không gian trống */}
      <div className="flex flex-1 justify-center px-4 lg:px-8">
        <div className="w-full max-w-[720px]">
        </div>
      </div>

      <div className="flex-1" />

      {/* === KHU VỰC BÊN PHẢI === */}
      <div className="flex-shrink-0 items-center flex gap-4">
        <StudioUploadModal />
        <AuthButton />
      </div>
      
    </nav>
  );
};