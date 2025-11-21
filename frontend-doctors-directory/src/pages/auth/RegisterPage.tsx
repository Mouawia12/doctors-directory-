import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useRegisterMutation } from '@/features/auth/hooks'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import type { AuthSuccessPayload } from '@/features/auth/api'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

const buildSchema = (t: TFunction) =>
  z
    .object({
      name: z.string().min(3, t('auth.validation.nameShort')),
      email: z.string().email(t('auth.validation.invalidEmail')),
      password: z.string().min(8, t('auth.validation.passwordLength')),
      password_confirmation: z.string(),
      type: z.enum(['doctor', 'user']),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('auth.validation.passwordsMismatch'),
      path: ['password_confirmation'],
    })

type RegisterForm = z.infer<ReturnType<typeof buildSchema>>

export const RegisterPage = () => {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])
  const navigate = useNavigate()
  const { register, handleSubmit, formState, watch } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      type: 'doctor',
    },
  })
  const accountType = watch('type')
  const mutation = useRegisterMutation()

  const handleAuthSuccess = (payload: AuthSuccessPayload) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth })
    const roles = payload.user.roles
    toast.success(t('auth.register.success'))

    if (roles.includes('doctor')) {
      const next = payload.user.doctor_profile?.status === 'approved' ? '/doctor/profile' : '/doctor/pending'
      navigate(next, { replace: true })
      return
    }

    if (roles.includes('admin')) {
      navigate('/admin', { replace: true })
      return
    }

    navigate('/', { replace: true })
  }

  const onSubmit = (values: RegisterForm) => {
    mutation.mutate(values, {
      onSuccess: handleAuthSuccess,
      onError: () => toast.error(t('auth.register.error')),
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{t('auth.register.heading')}</h2>
        <p className="text-sm text-slate-500">{t('auth.register.description')}</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.register.name')}</label>
        <Input placeholder={t('auth.register.name')} {...register('name')} />
        {formState.errors.name && <p className="text-xs text-red-500">{formState.errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.register.email')}</label>
        <Input type="email" placeholder="name@email.com" {...register('email')} />
        {formState.errors.email && <p className="text-xs text-red-500">{formState.errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.register.accountType')}</label>
        <Select {...register('type')}>
          <option value="doctor">{t('auth.register.doctor')}</option>
          <option value="user">{t('auth.register.user')}</option>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.register.password')}</label>
        <Input type="password" {...register('password')} />
        {formState.errors.password && <p className="text-xs text-red-500">{formState.errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.register.confirmPassword')}</label>
        <Input type="password" {...register('password_confirmation')} />
        {formState.errors.password_confirmation && (
          <p className="text-xs text-red-500">{formState.errors.password_confirmation.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? t('auth.register.submitting') : t('auth.register.submit')}
      </Button>
      <GoogleAuthButton type={accountType} onSuccess={handleAuthSuccess} label={t('auth.register.google')} />
    </form>
  )
}

export default RegisterPage
