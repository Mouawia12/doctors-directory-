import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchDoctor, fetchDoctors, type DoctorFilters } from '@/features/doctors/api'
import { queryKeys } from '@/lib/queryKeys'
import type { ApiPagination } from '@/types/api'
import type { Doctor } from '@/types/doctor'

export const useDoctorsQuery = (filters: DoctorFilters) => {
  return useQuery<{ items: Doctor[]; pagination: ApiPagination }>({
    queryKey: queryKeys.doctors(filters as Record<string, unknown>),
    queryFn: () => fetchDoctors(filters),
    placeholderData: keepPreviousData,
  })
}

export const useDoctorQuery = (id: string | number) => {
  return useQuery<Doctor>({
    queryKey: queryKeys.doctor(id),
    queryFn: () => fetchDoctor(id),
  })
}
