import { useMutation, useQuery } from '@tanstack/react-query'
import {
  deleteDoctorMedia,
  fetchDoctorProfile,
  saveDoctorProfile,
  uploadDoctorMedia,
} from '@/features/doctor/api'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import type { Doctor } from '@/types/doctor'

export const useDoctorProfileQuery = () =>
  useQuery<Doctor | null>({
    queryKey: queryKeys.doctorProfile,
    queryFn: fetchDoctorProfile,
  })

export const useSaveDoctorProfile = () =>
  useMutation({
    mutationFn: (payload: Record<string, unknown>) => saveDoctorProfile(payload),
    onSuccess: (doctor) => {
      queryClient.setQueryData(queryKeys.doctorProfile, doctor)
    },
  })

export const useDoctorMediaUpload = () =>
  useMutation({
    mutationFn: (formData: FormData) => uploadDoctorMedia(formData),
    onSuccess: (doctor) => {
      queryClient.setQueryData(queryKeys.doctorProfile, doctor)
    },
  })

export const useDoctorMediaDelete = () =>
  useMutation({
    mutationFn: (mediaId: number) => deleteDoctorMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctorProfile })
    },
  })
