"use client";

import { useEffect, useState } from "react";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FilterCarouselProps {
    value?: string | null;
    isLoading?: boolean;
    onSelect?: (value: string | null) => void;
    data?: {
        label: string;
        value: string;
    }[];
}

export const FilterCarousel = ({
    value,
    isLoading,
    onSelect,
    data
}: FilterCarouselProps) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    return (
        <div className="relative w-full">
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    dragFree: true,
                }}
                className="w-full"
                >
                <CarouselContent className="-ml-3">
                    {/* Item "All" */}
                    {!isLoading && (
                    <CarouselItem 
                        onClick={() => onSelect?.(null)}
                        className="pl-3 basis-auto">
                        <Badge
                            variant={!value ? "default" : "secondary"}
                            onClick={() => onSelect?.(null)}
                            className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
                        >
                            All
                        </Badge>
                    </CarouselItem>
                    )}
                        {isLoading && Array.from({ length: 15 }).map((_, i) => (
                            <CarouselItem key={i} className="pl-3 basis-auto">
                                <Skeleton className="rounded-lg px-3 py-1 h-8 text-sm w-[100px] font-semibold">
                                &nbsp;
                                </Skeleton>
                            </CarouselItem>
                        ))
                    }    

                    {/* Các item khác */}
                    {!isLoading && data?.map((item) => (
                        <CarouselItem 
                            key={item.value} className="pl-3 basis-auto" 
                            onClick={() => onSelect?.(item.value)}>
                            <Badge
                                variant={value === item.value ? "default" : "secondary"}
                                onClick={() => onSelect?.(item.value)}
                                className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
                            >
                                {item.label}
                            </Badge>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none",
                        { "hidden": current === 1 || !api }
                    )}
                />
                <div
                    className={cn(
                        "absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none",
                        { "hidden": current === count || !api }
                    )}
                />
                <CarouselPrevious className="left-0 z-20" />
                <CarouselNext className="right-0 z-20" />
            </Carousel>
        </div>
    );
};