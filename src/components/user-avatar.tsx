import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva("", {
    variants: {
        size: {
            "default": "w-9 h-9",
            xs: "w-6 h-6",
            sm: "w-8 h-8",
            md: "w-10 h-10",
            lg: "w-12 h-12",
            xl: "w-[160px] h-[160px]",
        }
    },
            defaultVariants: {
                size: "default",
            },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
    imageUrl: string;
    name: string;
    className?: string;
    onClick?: () => void;
}

export const UserAvatar = ({ imageUrl, name, className, onClick, size}: UserAvatarProps) => {
    return (
        <Avatar className={cn(avatarVariants({ size, className }))} onClick={onClick}>
        <AvatarImage
            src={imageUrl}
            alt={name}
        />
        </Avatar>
    )
}