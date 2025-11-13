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

const schema = z
  .object({
    name: z.string().min(3, 'الاسم قصير'),
    email: z.string().email('بريد إلكتروني غير صالح'),
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف'),
    password_confirmation: z.string(),
    type: z.enum(['doctor', 'user']),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['password_confirmation'],
  })

type RegisterForm = z.infer<typeof schema>

export const RegisterPage = () => {
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
    toast.success('تم إنشاء الحساب بنجاح')

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
      onError: () => toast.error('تعذر إنشاء الحساب'),
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">إنشاء حساب</h2>
        <p className="text-sm text-slate-500">اختر نوع الحساب وابدأ برفع بياناتك.</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">الاسم الكامل</label>
        <Input placeholder="الاسم" {...register('name')} />
        {formState.errors.name && <p className="text-xs text-red-500">{formState.errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">البريد الإلكتروني</label>
        <Input type="email" placeholder="name@email.com" {...register('email')} />
        {formState.errors.email && <p className="text-xs text-red-500">{formState.errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">نوع الحساب</label>
        <Select {...register('type')}>
          <option value="doctor">طبيب</option>
          <option value="user">مستخدم</option>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">كلمة المرور</label>
        <Input type="password" {...register('password')} />
        {formState.errors.password && <p className="text-xs text-red-500">{formState.errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500">تأكيد كلمة المرور</label>
        <Input type="password" {...register('password_confirmation')} />
        {formState.errors.password_confirmation && (
          <p className="text-xs text-red-500">{formState.errors.password_confirmation.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'جاري التسجيل...' : 'إنشاء حساب'}
      </Button>
      <GoogleAuthButton type={accountType} onSuccess={handleAuthSuccess} label="أو أنشئ حسابك عبر Google" />
    </form>
  )
}

export default RegisterPage
