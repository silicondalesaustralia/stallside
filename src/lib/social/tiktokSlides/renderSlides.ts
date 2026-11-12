import { Resvg } from '@resvg/resvg-js'
import { assertBundledSocialFontsPresent, bundledSocialFontPaths } from '@/lib/social/bundledSocialFonts'

export function svgToPng(svg: string): Buffer {
  const fonts = assertBundledSocialFontsPresent()
  if (!fonts.ok) throw new Error(`Missing bundled fonts: ${fonts.missing.join(', ')}`)
  const resvg = new Resvg(svg, {
    font: { fontFiles: bundledSocialFontPaths(), loadSystemFonts: false, defaultFontFamily: 'Inter' },
  })
  return Buffer.from(resvg.render().asPng())
}
