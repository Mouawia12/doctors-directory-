import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useUpdatePasswordMutation } from '@/features/auth/hooks'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      current_password: z.string().min(6, t('account.password.validations.current')),
      password: z.string().min(8, t('account.password.validations.length')),
      password_confirmation: z.string().min(8, t('account.password.validations.length')),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('account.password.validations.mismatch'),
      path: ['password_confirmation'],
    })

type FormValues = z.infer<ReturnType<typeof buildSchema>>

export const ChangePasswordForm = () => {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])
  const mutation = useUpdatePasswordMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(t('account.password.success'))
        reset()
      },
      onError: () => toast.error(t('account.password.error')),
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs text-slate-500">{t('account.password.current')}</label>
          <Input type="password" {...register('current_password')} aria-invalid={!!errors.current_password} />
          {errors.current_password && (
            <p className="text-xs text-rose-500">{errors.current_password.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs text-slate-500">{t('account.password.new')}</label>
          <Input type="password" {...register('password')} aria-invalid={!!errors.password} />
          {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
        </div>
      </div>
      <div className="md:w-1/2">
        <label className="text-xs text-slate-500">{t('account.password.confirm')}</label>
        <Input type="password" {...register('password_confirmation')} aria-invalid={!!errors.password_confirmation} />
        {errors.password_confirmation && (
          <p className="text-xs text-rose-500">{errors.password_confirmation.message}</p>
        )}
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? t('account.password.saving') : t('account.password.submit')}
      </Button>
    </form>
  )
}

export default ChangePasswordForm
