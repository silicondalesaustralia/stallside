/**
 * Canonical list of all active style templates (post migration 076).
 * Used by the Orshot field-sync script and diagnostic API route.
 */

export interface StyleTemplateSpec {
  name:               string
  trade_category:     string
  orshot_template_id: string
  orshot_page:        number | null
  sort_order:         number
}

/** All active templates - 11 construction + 5 home_service + 10 plumbing + 2 electrical + 6 hvac + 3 pest_control + 6 cleaning + 4 contractor. */
export const STYLE_TEMPLATE_CATALOG: StyleTemplateSpec[] = [
  // Construction
  { name: 'Construction - Style 01', trade_category: 'construction', orshot_template_id: '14294', orshot_page: null, sort_order: 10 },
  { name: 'Construction - Style 02', trade_category: 'construction', orshot_template_id: '14298', orshot_page: null, sort_order: 11 },
  { name: 'Construction - Style 03', trade_category: 'construction', orshot_template_id: '14297', orshot_page: null, sort_order: 12 },
  { name: 'Construction - Style 04', trade_category: 'construction', orshot_template_id: '14299', orshot_page: null, sort_order: 13 },
  { name: 'Construction - Style 05', trade_category: 'construction', orshot_template_id: '14300', orshot_page: null, sort_order: 14 },
  { name: 'Construction - Style 06', trade_category: 'construction', orshot_template_id: '14306', orshot_page: null, sort_order: 15 },
  { name: 'Construction - Style 07', trade_category: 'construction', orshot_template_id: '14303', orshot_page: null, sort_order: 16 },
  { name: 'Construction - Style 08', trade_category: 'construction', orshot_template_id: '14301', orshot_page: null, sort_order: 17 },
  { name: 'Construction - Style 09', trade_category: 'construction', orshot_template_id: '14305', orshot_page: null, sort_order: 18 },
  { name: 'Construction - Style 10', trade_category: 'construction', orshot_template_id: '14304', orshot_page: null, sort_order: 19 },
  { name: 'Construction - Style 11', trade_category: 'construction', orshot_template_id: '14302', orshot_page: null, sort_order: 20 },
  // Home Service
  { name: 'Home Service - Style 01', trade_category: 'home_service', orshot_template_id: '14310', orshot_page: null, sort_order: 21 },
  { name: 'Home Service - Style 02', trade_category: 'home_service', orshot_template_id: '14307', orshot_page: null, sort_order: 22 },
  { name: 'Home Service - Style 03', trade_category: 'home_service', orshot_template_id: '14312', orshot_page: null, sort_order: 23 },
  { name: 'Home Service - Style 04', trade_category: 'home_service', orshot_template_id: '14311', orshot_page: null, sort_order: 24 },
  { name: 'Home Service - Style 05', trade_category: 'home_service', orshot_template_id: '14309', orshot_page: null, sort_order: 25 },
  // Plumbing (01-06 = pages on multipage template 14328)
  { name: 'Plumbing - Style 01', trade_category: 'plumbing', orshot_template_id: '14328', orshot_page: 1, sort_order: 26 },
  { name: 'Plumbing - Style 02', trade_category: 'plumbing', orshot_template_id: '14328', orshot_page: 2, sort_order: 27 },
  { name: 'Plumbing - Style 03', trade_category: 'plumbing', orshot_template_id: '14328', orshot_page: 3, sort_order: 28 },
  { name: 'Plumbing - Style 04', trade_category: 'plumbing', orshot_template_id: '14328', orshot_page: 4, sort_order: 29 },
  { name: 'Plumbing - Style 05', trade_category: 'plumbing', orshot_template_id: '14328', orshot_page: 5, sort_order: 30 },
  { name: 'Plumbing - Style 06', trade_category: 'plumbing', orshot_template_id: '14328', orshot_page: 6, sort_order: 31 },
  { name: 'Plumbing - Style 07', trade_category: 'plumbing', orshot_template_id: '14324', orshot_page: null, sort_order: 32 },
  { name: 'Plumbing - Style 08', trade_category: 'plumbing', orshot_template_id: '14325', orshot_page: null, sort_order: 35 },
  { name: 'Plumbing - Style 09', trade_category: 'plumbing', orshot_template_id: '14326', orshot_page: null, sort_order: 36 },
  { name: 'Plumbing - Style 10', trade_category: 'plumbing', orshot_template_id: '14327', orshot_page: null, sort_order: 37 },
  // Electrical
  { name: 'Electrical - Style 01', trade_category: 'electrical', orshot_template_id: '14313', orshot_page: null, sort_order: 33 },
  { name: 'Electrical - Style 02', trade_category: 'electrical', orshot_template_id: '14314', orshot_page: null, sort_order: 34 },
  // HVAC
  { name: 'HVAC - Style 01', trade_category: 'hvac', orshot_template_id: '14329', orshot_page: null, sort_order: 38 },
  { name: 'HVAC - Style 02', trade_category: 'hvac', orshot_template_id: '14334', orshot_page: null, sort_order: 39 },
  { name: 'HVAC - Style 03', trade_category: 'hvac', orshot_template_id: '14335', orshot_page: null, sort_order: 40 },
  { name: 'HVAC - Style 04', trade_category: 'hvac', orshot_template_id: '14336', orshot_page: null, sort_order: 41 },
  { name: 'HVAC - Style 05', trade_category: 'hvac', orshot_template_id: '14337', orshot_page: null, sort_order: 42 },
  { name: 'HVAC - Style 06', trade_category: 'hvac', orshot_template_id: '14341', orshot_page: null, sort_order: 43 },
  // Pest Control
  { name: 'Pest Control - Style 01', trade_category: 'pest_control', orshot_template_id: '14365', orshot_page: null, sort_order: 44 },
  { name: 'Pest Control - Style 02', trade_category: 'pest_control', orshot_template_id: '14366', orshot_page: null, sort_order: 45 },
  { name: 'Pest Control - Style 03', trade_category: 'pest_control', orshot_template_id: '14367', orshot_page: null, sort_order: 46 },
  // Cleaning
  { name: 'Cleaning - Style 01', trade_category: 'cleaning', orshot_template_id: '14369', orshot_page: null, sort_order: 47 },
  { name: 'Cleaning - Style 02', trade_category: 'cleaning', orshot_template_id: '14370', orshot_page: null, sort_order: 48 },
  { name: 'Cleaning - Style 03', trade_category: 'cleaning', orshot_template_id: '14374', orshot_page: null, sort_order: 49 },
  { name: 'Cleaning - Style 04', trade_category: 'cleaning', orshot_template_id: '14375', orshot_page: null, sort_order: 50 },
  { name: 'Cleaning - Style 05', trade_category: 'cleaning', orshot_template_id: '14376', orshot_page: null, sort_order: 51 },
  { name: 'Cleaning - Style 06', trade_category: 'cleaning', orshot_template_id: '14377', orshot_page: null, sort_order: 52 },
  // Contractor
  { name: 'Contractor - Style 01', trade_category: 'contractor', orshot_template_id: '14380', orshot_page: null, sort_order: 53 },
  { name: 'Contractor - Style 02', trade_category: 'contractor', orshot_template_id: '14381', orshot_page: null, sort_order: 54 },
  { name: 'Contractor - Style 03', trade_category: 'contractor', orshot_template_id: '14382', orshot_page: null, sort_order: 55 },
  { name: 'Contractor - Style 04', trade_category: 'contractor', orshot_template_id: '14383', orshot_page: null, sort_order: 56 },
]

export function uniqueOrshotTemplateIds(catalog = STYLE_TEMPLATE_CATALOG): string[] {
  return [...new Set(catalog.map((t) => t.orshot_template_id))].sort()
}

export function whereClauseForSpec(spec: StyleTemplateSpec): string {
  if (spec.orshot_page != null) {
    return `orshot_template_id = '${spec.orshot_template_id}' AND orshot_page = ${spec.orshot_page}`
  }
  return `orshot_template_id = '${spec.orshot_template_id}' AND orshot_page IS NULL`
}
