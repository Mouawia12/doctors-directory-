import { useMutation, useQuery } from '@tanstack/react-query'
import {
  deleteDoctorMedia,
  fetchDoctorProfile,
  joinDoctorProgram,
  saveDoctorProfile,
  uploadDoctorMedia,
} from '@/features/doctor/api'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import type { Doctor } from '@/types/doctor'
import type { User } from '@/types/user'

export const useDoctorProfileQuery = () =>
  useQuery<Doctor | null>({
    queryKey: queryKeys.doctorProfile,
    queryFn: fetchDoctorProfile,
  })

export const useSaveDoctorProfile = () =>
  useMutation({
    mutationFn: (payload: Record<string, unknown>) => saveDoctorProfile(payload),
    onSuccess: (doctor) => {
      queryClient.setQueryData<Doctor | null>(queryKeys.doctorProfile, (previous) => {
        if (!previous) return doctor
        return {
          ...previous,
          ...doctor,
          media: doctor.media ?? previous.media,
        }
      })
    },
  })

export const useDoctorMediaUpload = () =>
  useMutation({
    mutationFn: (formData: FormData) => uploadDoctorMedia(formData),
    onSuccess: (doctor) => {
      queryClient.setQueryData<Doctor | null>(queryKeys.doctorProfile, (previous) => {
        if (!previous) return doctor
        return {
          ...previous,
          ...doctor,
        }
      })
    },
  })

export const useDoctorMediaDelete = () =>
  useMutation({
    mutationFn: (mediaId: number) => deleteDoctorMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctorProfile })
    },
  })

export const useJoinDoctorMutation = () =>
  useMutation({
    mutationFn: () => joinDoctorProgram(),
    onSuccess: (doctor) => {
      queryClient.setQueryData<Doctor | null>(queryKeys.doctorProfile, doctor)
      queryClient.setQueryData<User | null>(queryKeys.auth, (prev) => {
        if (!prev) return prev
        const nextRoles = prev.roles.includes('doctor') ? prev.roles : [...prev.roles, 'doctor']
        return { ...prev, roles: nextRoles, doctor_profile: doctor }
      })
    },
  })
