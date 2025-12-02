import { useMemo, useState } from 'react'
import { useCategoryMutations } from '@/features/admin/hooks'
import { useCategoriesQuery } from '@/features/categories/hooks'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { toast } from 'sonner'
import type { Category } from '@/types/doctor'
import { useTranslation } from 'react-i18next'

const flattenCategories = (tree: Category[] = [], depth = 0): Array<Category & { depth: number }> =>
  tree.flatMap((category) => [
    { ...category, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ])

export const AdminCategoriesPage = () => {
  const { data: categories, isLoading } = useCategoriesQuery()
  const mutation = useCategoryMutations()
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [parentMode, setParentMode] = useState<'root' | 'child'>('root')
  const [selectedParent, setSelectedParent] = useState('')
  const flattenedCategories = useMemo(() => flattenCategories(categories ?? []), [categories])

  const handleCreate = () => {
    if (!name) return
    if (parentMode === 'child' && !selectedParent) {
      toast.error(t('adminCategories.parentRequired'))
      return
    }
    mutation.mutate(
      {
        type: 'create',
        payload: {
          name,
          parent_id: parentMode === 'child' ? Number(selectedParent) : null,
        },
      },
      {
        onSuccess: () => {
          setName('')
          setSelectedParent('')
          setParentMode('root')
          toast.success(t('adminCategories.createSuccess'))
        },
      },
    )
  }

  const handleDelete = (id: number) => {
    if (!confirm(t('adminCategories.confirmDelete'))) return
    mutation.mutate({ type: 'delete', categoryId: id }, { onSuccess: () => toast.success(t('adminCategories.deleteSuccess')) })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminCategories.addTitle')}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-slate-500">{t('adminCategories.namePlaceholder')}</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500">{t('adminCategories.typeLabel')}</label>
            <Select value={parentMode} onChange={(event) => setParentMode(event.target.value as 'root' | 'child')}>
              <option value="root">{t('adminCategories.typeOptions.root')}</option>
              <option value="child">{t('adminCategories.typeOptions.child')}</option>
            </Select>
          </div>
          {parentMode === 'child' && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-slate-500">{t('adminCategories.parentLabel')}</label>
              <Select value={selectedParent} onChange={(event) => setSelectedParent(event.target.value)}>
                <option value="">{t('adminCategories.parentPlaceholder')}</option>
                {flattenedCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {'-'.repeat(category.depth)} {category.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="md:col-span-2">
            <Button onClick={handleCreate} disabled={mutation.isPending} className="w-full md:w-auto">
              {t('adminCategories.addAction')}
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">{t('adminCategories.currentTitle')}</h3>
        {isLoading ? (
          <p className="text-sm text-slate-500">{t('adminCategories.loading')}</p>
        ) : (
          <CategoryTreeList categories={categories ?? []} onDelete={handleDelete} />
        )}
      </div>
    </div>
  )
}

const CategoryTreeList = ({ categories, onDelete }: { categories: Category[]; onDelete: (id: number) => void }) => {
  const flattened = useMemo(() => flattenCategories(categories), [categories])
  const { t } = useTranslation()

  if (flattened.length === 0) {
    return <p className="text-sm text-slate-500">{t('adminCategories.empty')}</p>
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
              {category.depth === 0 ? t('adminCategories.tree.root') : t('adminCategories.tree.child', { depth: category.depth })}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900" style={{ marginInlineStart: `${category.depth * 12}px` }}>
                {category.name}
              </span>
              <span className="text-xs text-slate-500" style={{ marginInlineStart: `${category.depth * 12}px` }}>
                {category.depth === 0 ? t('adminCategories.tree.rootLabel') : t('adminCategories.tree.childLabel')}
              </span>
            </div>
          </div>
          <button
            className="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
            onClick={() => onDelete(category.id)}
          >
            {t('adminCategories.delete')}
          </button>
        </div>
      ))}
    </div>
  )
}

export default AdminCategoriesPage
