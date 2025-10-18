"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get("query") ?? "";
  const [value, setValue] = useState(defaultQuery);

  // Đồng bộ state với URL params khi người dùng điều hướng (ví dụ: back/forward)
  useEffect(() => {
    setValue(searchParams.get("query") ?? "");
  }, [searchParams]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newQuery = value.trim();
    if (!newQuery) return;

    const currentCategory = searchParams.get("categoryId");

    const url = new URL(window.location.origin + "/search");
    url.searchParams.set("query", newQuery);

    if (currentCategory) {
      url.searchParams.set("categoryId", currentCategory);
    }
    
    router.push(url.toString());
  };

  return (
    <form
      onSubmit={handleSearch}
      className="hidden w-full max-w-[600px] flex-1 items-center md:flex"
    >
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-r-none pl-4 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setValue("")}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
          >
            <XIcon className="size-4 text-muted-foreground" />
          </Button>
        )}
      </div>
      <Button
        type="submit"
        disabled={!value.trim()}
        className="rounded-l-none border-l-0"
      >
        <SearchIcon className="size-5" />
      </Button>
    </form>
  );
};