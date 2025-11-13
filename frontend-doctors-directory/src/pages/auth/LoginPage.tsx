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

const schema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور قصيرة'),
})

type LoginForm = z.infer<typeof schema>

export const LoginPage = () => {
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
    toast.success('تم تسجيل الدخول بنجاح')

    const roles = payload.user.roles
    if (roles.includes('doctor')) {
      const next = payload.user.doctor_profile?.status === 'approved' ? '/doctor/profile' : '/doctor/pending'
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
      onError: () => toast.error('تعذر تسجيل الدخول'),
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">مرحباً بك</h2>
        <p className="text-sm text-slate-500">سجل دخولك لإدارة ملفك الطبي أو لوحة التحكم.</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">البريد الإلكتروني</label>
        <Input type="email" placeholder="name@email.com" {...register('email')} />
        {formState.errors.email && <p className="text-xs text-red-500">{formState.errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">كلمة المرور</label>
        <Input type="password" placeholder="••••••••" {...register('password')} />
        {formState.errors.password && <p className="text-xs text-red-500">{formState.errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'جاري التحقق...' : 'تسجيل الدخول'}
      </Button>
      <GoogleAuthButton onSuccess={handleAuthSuccess} className="pt-1" />
      <p className="text-center text-sm text-slate-500">
        ليس لديك حساب؟{' '}
        <Link to="/auth/register" className="text-primary-600">
          سجّل الآن
        </Link>
      </p>
    </form>
  )
}

export default LoginPage
