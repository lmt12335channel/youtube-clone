"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { trpc } from "@/trpc/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoriesSectionProps {
  categoryId?: string;
  onSelectCategory: (id?: string) => void;
}

export const CategoriesSection = ({
  categoryId,
  onSelectCategory,
}: CategoriesSectionProps) => {
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = (id?: string) => {
    onSelectCategory(id);
    const params = new URLSearchParams(searchParams);
    if (id) {
      params.set("categoryId", id);
    } else {
      params.delete("categoryId");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        <CarouselItem className="basis-auto">
          <Button
            variant={!categoryId ? "default" : "ghost"}
            onClick={() => handleClick(undefined)}
            className="rounded-full"
          >
            All
          </Button>
        </CarouselItem>
        {categories.map((category) => (
          <CarouselItem key={category.id} className="basis-auto">
            <Button
              variant={categoryId === category.id ? "default" : "ghost"}
              onClick={() => handleClick(category.id)}
              className="rounded-full"
            >
              {category.name}
            </Button>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};