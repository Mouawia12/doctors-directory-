export const queryKeys = {
  auth: ['auth', 'me'] as const,
  doctors: (filters: Record<string, unknown>) => ['doctors', filters] as const,
  doctor: (id: number | string) => ['doctor', id] as const,
  favorites: ['favorites'] as const,
  doctorProfile: ['doctor-profile'] as const,
  categories: ['categories'] as const,
  adminDoctors: (filters?: Record<string, unknown>) => ['admin-doctors', filters ?? {}] as const,
  adminDoctor: (id: number | string) => ['admin-doctor', id] as const,
  adminUsers: (filters?: Record<string, unknown>) => ['admin-users', filters ?? {}] as const,
  notifications: ['notifications'] as const,
}
