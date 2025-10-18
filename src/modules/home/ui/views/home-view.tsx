"use client";

import { Suspense, useState } from "react";

import {
  HomeVideosSection,
  HomeVideosSectionSkeleton,
} from "../sections/home-videos-section";
import { CategoriesSection } from "../sections/categories-section";

interface HomeViewProps {
  categoryId?: string;
}

export const HomeView = (props: HomeViewProps) => {
  const [categoryId, setCategoryId] = useState(props.categoryId);

  const handleSelectCategory = (id?: string) => {
    setCategoryId(id);
  };

  return (
    <div className="mx-auto flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
      <CategoriesSection
        categoryId={categoryId}
        onSelectCategory={handleSelectCategory}
      />

      <Suspense
        key={categoryId} // <-- Rất quan trọng: Buộc re-render khi category thay đổi
        fallback={<HomeVideosSectionSkeleton />}
      >
        <HomeVideosSection categoryId={categoryId} />
      </Suspense>
    </div>
  );
};