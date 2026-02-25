"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CoursePaginationProps {
  page: number
  totalPages: number
}

export function CoursePagination({ page, totalPages }: CoursePaginationProps) {
  const searchParams = useSearchParams()

  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNum.toString())
    return `?${params.toString()}`
  }

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <Button
        variant="outline"
        size="sm"
        asChild={page > 1}
        disabled={page <= 1}
      >
        {page > 1 ? (
          <Link href={createPageUrl(page - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>

      {getPageNumbers().map((pageNum, idx) => (
        pageNum === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
        ) : (
          <Button
            key={pageNum}
            variant={page === pageNum ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={createPageUrl(pageNum as number)}>
              {pageNum}
            </Link>
          </Button>
        )
      ))}

      <Button
        variant="outline"
        size="sm"
        asChild={page < totalPages}
        disabled={page >= totalPages}
      >
        {page < totalPages ? (
          <Link href={createPageUrl(page + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}
