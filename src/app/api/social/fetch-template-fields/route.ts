import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  buildMarkdownReport,
  buildMigrationSql,
  formatFieldsSummary,
  OrshotFetchError,
  syncAllTemplateFields,
} from '@/lib/social/orshotTemplateFields'
import {
  STYLE_TEMPLATE_CATALOG,
  type StyleTemplateSpec,
  whereClauseForSpec,
} from '@/lib/social/styleTemplateCatalog'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Diagnostic: fetch Orshot field structure for all style templates.
 * GET ?apply=1 - also UPDATE social_style_templates.fields in DB.
 * Default (dry run): returns report + migration SQL only.
 */
export async function GET(req: NextRequest) {
  const apiKey = process.env.ORSHOT_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Orshot is not configured (ORSHOT_API_KEY missing)' },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apply = req.nextUrl.searchParams.get('apply') === '1'
  const templateIdsParam = req.nextUrl.searchParams.get('templateIds')?.trim()

  let catalog: StyleTemplateSpec[] = STYLE_TEMPLATE_CATALOG
  if (templateIdsParam) {
    const filterIds = new Set(
      templateIdsParam.split(',').map((s) => s.trim()).filter(Boolean),
    )
    catalog = STYLE_TEMPLATE_CATALOG.filter((t) => filterIds.has(t.orshot_template_id))
    if (catalog.length === 0) {
      return NextResponse.json(
        { error: 'No matching templates for templateIds param' },
        { status: 400 },
      )
    }
  }

  try {
    console.log('[FetchTemplateFields] Starting sync', {
      templateRows: catalog.length,
      uniqueOrshotIds: new Set(catalog.map((t) => t.orshot_template_id)).size,
      apply,
    })
    const results = await syncAllTemplateFields(apiKey, catalog)
    const summary = results.map((r) => ({
      name:               r.spec.name,
      trade_category:     r.spec.trade_category,
      orshot_template_id: r.spec.orshot_template_id,
      orshot_page:        r.spec.orshot_page,
      fieldCount:         r.fields.length,
      fields:             r.fields,
      fieldsSummary:      formatFieldsSummary(r.fields),
      skippedMods:        r.skippedMods,
    }))

    let applied = 0
    const applyErrors: string[] = []

    if (apply) {
      const db = await createServiceClient()
      for (const r of results) {
        let query = db
          .from('social_style_templates')
          .update({ fields: r.fields })
          .eq('is_active', true)
          .eq('orshot_template_id', r.spec.orshot_template_id)

        query = r.spec.orshot_page != null
          ? query.eq('orshot_page', r.spec.orshot_page)
          : query.is('orshot_page', null)

        const { error } = await query

        if (error) {
          applyErrors.push(`${r.spec.name}: ${error.message}`)
        } else {
          applied++
        }
      }
    }

    return NextResponse.json({
      dryRun:        !apply,
      templateCount: results.length,
      summary,
      migrationSql:  buildMigrationSql(results),
      markdownReport: buildMarkdownReport(results),
      applied:       apply ? applied : undefined,
      applyErrors:   applyErrors.length > 0 ? applyErrors : undefined,
      whereExamples: results.slice(0, 2).map((r) => whereClauseForSpec(r.spec)),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[FetchTemplateFields]', message)
    const status = err instanceof OrshotFetchError && err.status === 429 ? 429 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
