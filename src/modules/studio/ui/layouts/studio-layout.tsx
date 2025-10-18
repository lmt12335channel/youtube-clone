import { StudioNavbar } from "@/modules/studio/ui/components/studio-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioSidebar } from "@/modules/studio/ui/components/studio-sidebar";

interface StudioLayoutProps {
  children: React.ReactNode;
};

export const StudioLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <SidebarProvider>
        <div className="w-full">
            <StudioNavbar />
            <div className="flex min-h-screen pt-[1rem]">
                <StudioSidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
        </div>
        </div>
        
    </SidebarProvider>
  );
};