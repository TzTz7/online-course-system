"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface CourseSearchProps {
  defaultValue?: string
}

export function CourseSearch({ defaultValue = "" }: CourseSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [searchValue, setSearchValue] = useState(defaultValue)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.delete('page')
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = (value: string) => {
    setSearchValue(value)
    router.push(`${pathname}?${createQueryString('search', value)}`)
  }

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="搜索课程、教师..."
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 bg-card border-border"
      />
    </div>
  )
}
