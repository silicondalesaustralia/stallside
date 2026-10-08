'use client'

import { SceneContentFields } from '@/components/social/SceneContentFields'
import {
  QuoteCardContentFields,
  type QuoteCardFormContent,
} from '@/components/social/QuoteCardContentFields'
import type { ContentFormat, InfographicPreset } from '@/lib/social/composeModel'
import {
  parseSceneContent,
  type SceneContent,
} from '@/lib/social/sceneContent'
import { parseQuoteCardContent } from '@/lib/social/quoteCardContent'
import type {
  BeforeAfterComparisonContent,
  ChecklistContent,
  DidYouKnowContent,
  ProcessStepsContent,
} from '@/lib/social/infographicContent'

function textField(
  label: string,
  value: string,
  onChange: (next: string) => void,
  max: number,
) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#666]">{label}</label>
      <input
        type="text"
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
      />
    </div>
  )
}

function linesField(
  label: string,
  lines: string[],
  onChange: (next: string[]) => void,
) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#666]">{label}</label>
      <textarea
        value={lines.join('\n')}
        rows={Math.max(3, lines.length)}
        onChange={(e) =>
          onChange(
            e.target.value
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
      />
    </div>
  )
}

export function InspirationContentEditor({
  format,
  preset,
  content,
  onChange,
}: {
  format: ContentFormat
  preset?: InfographicPreset
  content: unknown
  onChange: (next: unknown) => void
}) {
  if (format === 'scene') {
    let scene: SceneContent
    try {
      scene = parseSceneContent(content)
    } catch {
      return <p className="text-xs text-red-600">Could not load headline fields.</p>
    }
    return <SceneContentFields content={scene} onChange={onChange} />
  }

  if (format === 'quote_card') {
    let quote: QuoteCardFormContent
    try {
      const parsed = parseQuoteCardContent(content)
      quote = {
        quoteText: parsed.quoteText,
        customerName: parsed.customerName,
        starRating: parsed.starRating,
        introLine: parsed.introLine ?? '',
        ctaLine: parsed.ctaLine ?? '',
      }
    } catch {
      return <p className="text-xs text-red-600">Could not load quote fields.</p>
    }
    return (
      <QuoteCardContentFields
        content={quote}
        onChange={(next) =>
          onChange({
            ...next,
            introLine: next.introLine || undefined,
            ctaLine: next.ctaLine || undefined,
          })
        }
      />
    )
  }

  if (preset === 'checklist') {
    const row = content as ChecklistContent
    return (
      <div className="space-y-3">
        {textField('Title', row.title ?? '', (title) => onChange({ ...row, title }), 80)}
        {linesField('List items', row.items ?? [], (items) => onChange({ ...row, items }))}
        {textField(
          'Footer CTA',
          row.footerCta ?? '',
          (footerCta) => onChange({ ...row, footerCta }),
          80,
        )}
      </div>
    )
  }

  if (preset === 'did_you_know') {
    const row = content as DidYouKnowContent
    return (
      <div className="space-y-3">
        {textField('Headline', row.headline ?? '', (headline) => onChange({ ...row, headline }), 60)}
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#666]">Fact</label>
          <textarea
            value={row.fact ?? ''}
            maxLength={220}
            rows={3}
            onChange={(e) => onChange({ ...row, fact: e.target.value })}
            className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
          />
        </div>
        {textField('Stat', row.stat ?? '', (stat) => onChange({ ...row, stat }), 24)}
      </div>
    )
  }

  if (preset === 'process_steps') {
    const row = content as ProcessStepsContent
    const steps = row.steps ?? []
    return (
      <div className="space-y-3">
        {textField('Title', row.title ?? '', (title) => onChange({ ...row, title }), 80)}
        {steps.map((step, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-2">
            {textField(
              `Step ${i + 1} label`,
              step.label,
              (label) => {
                const next = [...steps]
                next[i] = { ...step, label }
                onChange({ ...row, steps: next })
              },
              48,
            )}
            {textField(
              `Step ${i + 1} detail`,
              step.detail,
              (detail) => {
                const next = [...steps]
                next[i] = { ...step, detail }
                onChange({ ...row, steps: next })
              },
              120,
            )}
          </div>
        ))}
      </div>
    )
  }

  if (preset === 'before_after_comparison') {
    const row = content as BeforeAfterComparisonContent
    return (
      <div className="space-y-3">
        {textField('Title', row.title ?? '', (title) => onChange({ ...row, title }), 80)}
        {textField(
          'Before heading',
          row.beforeTitle ?? '',
          (beforeTitle) => onChange({ ...row, beforeTitle }),
          40,
        )}
        {linesField('Before points', row.beforePoints ?? [], (beforePoints) =>
          onChange({ ...row, beforePoints }),
        )}
        {textField(
          'After heading',
          row.afterTitle ?? '',
          (afterTitle) => onChange({ ...row, afterTitle }),
          40,
        )}
        {linesField('After points', row.afterPoints ?? [], (afterPoints) =>
          onChange({ ...row, afterPoints }),
        )}
      </div>
    )
  }

  return <p className="text-xs text-[#888]">Edit the words on this variant, then refresh the preview.</p>
}
