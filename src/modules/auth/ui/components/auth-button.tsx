"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserCircleIcon } from "lucide-react"; // Import icon

export const AuthButton = () => {
    return (
        <>
            {/* Sẽ hiển thị khi người dùng CHƯA đăng nhập */}
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant="outline" className="rounded-full">
                        <UserCircleIcon className="mr-2 size-5" />
                        Sign In
                    </Button>
                </SignInButton>
            </SignedOut>

            {/* Sẽ hiển thị khi người dùng ĐÃ đăng nhập */}
            <SignedIn>
                <UserButton afterSignOutUrl="/" />
            </SignedIn>
        </>
    );
};