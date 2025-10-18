import { HomeNavbar } from "@/modules/home/ui/components/home-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeSidebar } from "@/modules/home/ui/components/home-sidebar";

interface HomeLayoutProps {
  children: React.ReactNode;
};

export const HomeLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <SidebarProvider>
        <div className="w-full">
            <HomeNavbar />
            <div className="flex min-h-screen pt-[1rem]">
                <HomeSidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
        </div>
        </div>
        
    </SidebarProvider>
  );
};