import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useResetPasswordMutation } from '@/features/auth/hooks'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z.string().min(8, t('auth.validation.passwordLength')),
      password_confirmation: z.string().min(8, t('auth.validation.passwordLength')),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('auth.validation.passwordsMismatch'),
      path: ['password_confirmation'],
    })

type FormValues = z.infer<ReturnType<typeof buildSchema>>

const ResetPasswordPage = () => {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])
  const mutation = useResetPasswordMutation()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const token = params.get('token') || ''
  const email = params.get('email') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      password_confirmation: '',
    },
  })

  if (!token || !email) {
    return (
      <div className="space-y-3 text-center text-sm text-rose-500">
        <p>{t('auth.reset.missingToken')}</p>
        <Button variant="ghost" onClick={() => navigate('/auth/forgot-password')}>
          {t('auth.reset.requestNew')}
        </Button>
      </div>
    )
  }

  const onSubmit = (values: FormValues) => {
    mutation.mutate(
      {
        token,
        email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      },
      {
        onSuccess: () => {
          toast.success(t('auth.reset.success'))
          navigate('/auth/login')
        },
        onError: () => toast.error(t('auth.reset.error')),
      },
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{t('auth.reset.heading')}</h2>
        <p className="text-sm text-slate-500">{t('auth.reset.description')}</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.reset.password')}</label>
        <Input type="password" {...register('password')} aria-invalid={!!errors.password} />
        {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.reset.confirm')}</label>
        <Input type="password" {...register('password_confirmation')} aria-invalid={!!errors.password_confirmation} />
        {errors.password_confirmation && (
          <p className="text-xs text-rose-500">{errors.password_confirmation.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? t('auth.reset.submitting') : t('auth.reset.submit')}
      </Button>
    </form>
  )
}

export default ResetPasswordPage
