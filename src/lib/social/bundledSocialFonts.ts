/**
 * Bundled TTF faces for programmatic social text (resvg).
 * Mirrors SOCIAL_FONT_FAMILIES - latin-400 from Fontsource, traced into serverless.
 */

import { existsSync } from 'fs'
import { join } from 'path'
import {
  BUNDLED_SOCIAL_FONTS,
  type BundledFontStyleClass,
  type BundledSocialFont,
  type BundledSocialFontFamily,
} from '@/lib/social/bundledSocialFontManifest'
import { SOCIAL_FONT_FAMILIES } from '@/lib/social/socialTextStyle'

export type { BundledFontStyleClass, BundledSocialFont, BundledSocialFontFamily }
export { BUNDLED_SOCIAL_FONTS }

/** Compile-time / runtime guard: bundle list must match social_text_styles curated list. */
export function bundledFontsMatchCuratedList(): {
  ok: boolean
  missingFromBundle: string[]
  extraInBundle: string[]
} {
  const curated = new Set<string>(SOCIAL_FONT_FAMILIES as readonly string[])
  const bundled = new Set<string>(BUNDLED_SOCIAL_FONTS.map((f) => f.family as string))
  const missingFromBundle = [...curated].filter((f) => !bundled.has(f))
  const extraInBundle = [...bundled].filter((f) => !curated.has(f))
  return {
    ok: missingFromBundle.length === 0 && extraInBundle.length === 0,
    missingFromBundle,
    extraInBundle,
  }
}

export function bundledSocialFontsDir(): string {
  return join(process.cwd(), 'src', 'lib', 'social', 'fonts')
}

export function bundledSocialFontPaths(): string[] {
  const dir = bundledSocialFontsDir()
  return BUNDLED_SOCIAL_FONTS.map((f) => join(dir, f.fileName))
}

export function assertBundledSocialFontsPresent(): {
  ok: boolean
  missing: string[]
  paths: string[]
  totalBytes: number
} {
  const dir = bundledSocialFontsDir()
  const paths = BUNDLED_SOCIAL_FONTS.map((f) => join(dir, f.fileName))
  const missing: string[] = []
  let totalBytes = 0
  for (const p of paths) {
    if (!existsSync(p)) {
      missing.push(p)
      continue
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { statSync } = require('fs') as typeof import('fs')
      totalBytes += statSync(p).size
    } catch {
      /* ignore size */
    }
  }
  return { ok: missing.length === 0, missing, paths, totalBytes }
}

export function styleClassCoverage(): Record<BundledFontStyleClass, string[]> {
  const out: Record<BundledFontStyleClass, string[]> = {
    sans: [],
    serif: [],
    display: [],
  }
  for (const f of BUNDLED_SOCIAL_FONTS) {
    out[f.styleClass].push(f.family)
  }
  return out
}
