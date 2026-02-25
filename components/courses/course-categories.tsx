"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { Category } from "@/lib/definitions"

interface CourseCategoriesProps {
  categories: Category[]
}

export function CourseCategories({ categories }: CourseCategoriesProps) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category") || ""

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
      <Link
        href="?"
        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
          !activeCategory
            ? "bg-primary text-primary-foreground"
            : "bg-card text-muted-foreground hover:text-foreground border border-border"
        }`}
      >
        全部
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`?category=${category.id}`}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategory === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  )
}
