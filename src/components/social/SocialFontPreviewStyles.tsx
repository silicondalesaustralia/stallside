'use client'

import { useEffect } from 'react'
import { generateSocialFontFaceCss } from '@/lib/social/socialFontWebPreview'

const STYLE_ID = 'social-bundled-font-faces'

/** Injects @font-face for all 24 bundled social fonts (once per document). */
export function SocialFontPreviewStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return

    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = generateSocialFontFaceCss()
    document.head.appendChild(style)
  }, [])

  return null
}
