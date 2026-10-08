'use client'

import {
  POST_CATEGORIES,
  getSubtypesForCategory,
  type PostCategoryId,
  type PostSubtypeId,
} from '@/lib/social/postTaxonomy'
import { ChoiceButtons } from '@/components/social/ChoiceButtons'
import { CATEGORY_ICONS } from '@/lib/social/socialDesignTokens'

export function ComposeOccasionPicker({
  categoryId,
  subtypeId,
  onCategoryChange,
  onSubtypeChange,
}: {
  categoryId: PostCategoryId
  subtypeId: PostSubtypeId
  onCategoryChange: (id: PostCategoryId) => void
  onSubtypeChange: (id: PostSubtypeId) => void
}) {
  const subtypeOptions = getSubtypesForCategory(categoryId)

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#999]">
          Category
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {POST_CATEGORIES.map((cat) => {
            const selected = categoryId === cat.id
            const Icon = CATEGORY_ICONS[cat.id]
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`group flex items-center gap-2 rounded-2xl border px-2.5 py-2.5 text-left transition-all duration-200 ${
                  selected
                    ? 'border-[#FFD700] bg-[#FFFBEA] shadow-sm ring-2 ring-[#FFD700]/25 scale-[1.02]'
                    : 'border-[#EDEAE2] bg-white hover:border-[#D5D0C8] hover:shadow-sm'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    selected
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-[#F5F3EF] text-[#888] group-hover:bg-[#EFEBE3] group-hover:text-[#555]'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <span
                  className={`text-[11px] font-semibold leading-tight ${
                    selected ? 'text-black' : 'text-[#555]'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#999]">
          Post type
        </p>
        <ChoiceButtons
          options={subtypeOptions.map((s) => ({ id: s.id, label: s.label }))}
          value={subtypeId}
          onChange={onSubtypeChange}
        />
      </div>
    </div>
  )
}
