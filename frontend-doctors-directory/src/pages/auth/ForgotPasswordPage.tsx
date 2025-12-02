import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useForgotPasswordMutation } from '@/features/auth/hooks'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const buildSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t('auth.validation.invalidEmail')),
  })

type FormValues = z.infer<ReturnType<typeof buildSchema>>

const ForgotPasswordPage = () => {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])
  const mutation = useForgotPasswordMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values, {
      onSuccess: () => toast.success(t('auth.forgot.success')),
      onError: () => toast.error(t('auth.forgot.error')),
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{t('auth.forgot.heading')}</h2>
        <p className="text-sm text-slate-500">{t('auth.forgot.description')}</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">{t('auth.forgot.email')}</label>
        <Input type="email" placeholder="name@email.com" {...register('email')} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
      </Button>
      <p className="text-center text-sm text-slate-500">
        <Link to="/auth/login" className="text-primary-600">
          {t('auth.forgot.backToLogin')}
        </Link>
      </p>
    </form>
  )
}

export default ForgotPasswordPage
