import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLoginMutation } from '@/features/auth/hooks'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import { toast } from 'sonner'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import type { AuthSuccessPayload } from '@/features/auth/api'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { getDoctorPortalPath } from '@/features/doctor/utils'

const buildSchema = (t: TFunction) =>
  z.object({
    email: z.string().email(t('auth.validation.invalidEmail')),
    password: z.string().min(6, t('auth.validation.shortPassword')),
  })

type LoginForm = z.infer<ReturnType<typeof buildSchema>>

export const LoginPage = () => {
  const { t } = useTranslation()
  const schema = useMemo(
    () => buildSchema(t),
    [t],
  )
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string })?.from
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const mutation = useLoginMutation()

  const handleAuthSuccess = (payload: AuthSuccessPayload) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth })
    toast.success(t('auth.login.success'))

    const roles = payload.user.roles
    if (roles.includes('doctor')) {
      const doctorStatus = payload.user.doctor_profile?.status
      const next = doctorStatus === 'approved' ? '/doctor' : getDoctorPortalPath()
      navigate(next, { replace: true })
      return
    }

    if (roles.includes('admin')) {
      navigate('/admin', { replace: true })
      return
    }

    navigate(redirectTo || '/', { replace: true })
  }

  const onSubmit = (values: LoginForm) => {
    mutation.mutate(values, {
      onSuccess: handleAuthSuccess,
      onError: () => toast.error(t('auth.login.error')),
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{t('auth.login.heading')}</h2>
        <p className="text-sm text-slate-500">{t('auth.login.description')}</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.login.email')}</label>
        <Input type="email" placeholder="name@email.com" {...register('email')} />
        {formState.errors.email && <p className="text-xs text-red-500">{formState.errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.login.password')}</label>
        <Input type="password" placeholder="••••••••" {...register('password')} />
        {formState.errors.password && <p className="text-xs text-red-500">{formState.errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? t('auth.login.submitting') : t('auth.login.submit')}
      </Button>
      <GoogleAuthButton onSuccess={handleAuthSuccess} className="pt-1" label={t('googleAuth.defaultLabel')} />
      <p className="text-center text-sm text-slate-500">
        {t('auth.login.noAccount')}{' '}
        <Link to="/auth/register" className="text-primary-600">
          {t('auth.login.register')}
        </Link>
      </p>
    </form>
  )
}

export default LoginPage
