import { useMemo, useState } from 'react'
import { useCategoryMutations } from '@/features/admin/hooks'
import { useCategoriesQuery } from '@/features/categories/hooks'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import type { Category } from '@/types/doctor'

const flattenCategories = (tree: Category[] = [], depth = 0): Array<Category & { depth: number }> =>
  tree.flatMap((category) => [
    { ...category, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ])

export const AdminCategoriesPage = () => {
  const { data: categories, isLoading } = useCategoriesQuery()
  const mutation = useCategoryMutations()

  const [name, setName] = useState('')

  const handleCreate = () => {
    if (!name) return
    mutation.mutate(
      { type: 'create', payload: { name } },
      {
        onSuccess: () => {
          setName('')
          toast.success('تم إضافة التصنيف')
        },
      },
    )
  }

  const handleDelete = (id: number) => {
    if (!confirm('هل أنت متأكد من حذف التصنيف؟')) return
    mutation.mutate({ type: 'delete', categoryId: id }, { onSuccess: () => toast.success('تم حذف التصنيف') })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">إضافة تصنيف</h2>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input placeholder="اسم التصنيف" value={name} onChange={(event) => setName(event.target.value)} />
          <Button onClick={handleCreate} disabled={mutation.isPending}>
            إضافة
          </Button>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">التصنيفات الحالية</h3>
        {isLoading ? (
          <p className="text-sm text-slate-500">جارٍ التحميل...</p>
        ) : (
          <CategoryTreeList categories={categories ?? []} onDelete={handleDelete} />
        )}
      </div>
    </div>
  )
}

const CategoryTreeList = ({ categories, onDelete }: { categories: Category[]; onDelete: (id: number) => void }) => {
  const flattened = useMemo(() => flattenCategories(categories), [categories])

  if (flattened.length === 0) {
    return <p className="text-sm text-slate-500">لا توجد تصنيفات بعد.</p>
  }

  return (
    <div className="space-y-2">
      {flattened.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:border-primary-100 hover:bg-white"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-xs font-semibold text-primary-700">
              {category.depth === 0 ? 'أصل' : `فرعي ${category.depth}`}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900" style={{ marginInlineStart: `${category.depth * 12}px` }}>
                {category.name}
              </span>
              <span className="text-xs text-slate-500" style={{ marginInlineStart: `${category.depth * 12}px` }}>
                {category.depth === 0 ? 'تصنيف رئيسي' : 'متفرع من تصنيف أعلى'}
              </span>
            </div>
          </div>
          <button
            className="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
            onClick={() => onDelete(category.id)}
          >
            حذف
          </button>
        </div>
      ))}
    </div>
  )
}

export default AdminCategoriesPage
