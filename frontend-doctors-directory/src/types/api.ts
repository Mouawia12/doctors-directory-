export interface ApiPagination {
  page: number
  per_page: number
  total: number
}

export interface ApiListResponse<T> {
  data: {
    items: T
    pagination: ApiPagination
  }
  message: string | null
  errors: Record<string, string[]> | null
}

export interface ApiResponse<T> {
  data: T
  message: string | null
  errors: Record<string, string[]> | null
}
