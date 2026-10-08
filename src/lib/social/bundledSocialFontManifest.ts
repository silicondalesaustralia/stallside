/**
 * Client-safe manifest of bundled social TTFs (no Node fs).
 * Shared by resvg server render helpers and browser @font-face preview.
 */

import type { SocialFontFamily } from '@/lib/social/socialTextStyle'

export type BundledFontStyleClass = 'sans' | 'serif' | 'display'

export interface BundledSocialFont {
  family: SocialFontFamily
  fileName: string
  styleClass: BundledFontStyleClass
}

/** File names must match files under lib/social/fonts/. */
export const BUNDLED_SOCIAL_FONTS: readonly BundledSocialFont[] = [
  { family: 'Inter',              fileName: 'Inter-Regular.ttf',              styleClass: 'sans' },
  { family: 'Roboto',             fileName: 'Roboto-Regular.ttf',             styleClass: 'sans' },
  { family: 'Montserrat',         fileName: 'Montserrat-Regular.ttf',         styleClass: 'sans' },
  { family: 'Poppins',            fileName: 'Poppins-Regular.ttf',            styleClass: 'sans' },
  { family: 'Oswald',             fileName: 'Oswald-Regular.ttf',             styleClass: 'display' },
  { family: 'Bebas Neue',         fileName: 'BebasNeue-Regular.ttf',          styleClass: 'display' },
  { family: 'Playfair Display',   fileName: 'PlayfairDisplay-Regular.ttf',    styleClass: 'serif' },
  { family: 'Open Sans',          fileName: 'OpenSans-Regular.ttf',           styleClass: 'sans' },
  { family: 'Lato',               fileName: 'Lato-Regular.ttf',               styleClass: 'sans' },
  { family: 'Raleway',            fileName: 'Raleway-Regular.ttf',            styleClass: 'sans' },
  { family: 'Merriweather',       fileName: 'Merriweather-Regular.ttf',       styleClass: 'serif' },
  { family: 'Nunito',             fileName: 'Nunito-Regular.ttf',             styleClass: 'sans' },
  { family: 'Work Sans',          fileName: 'WorkSans-Regular.ttf',           styleClass: 'sans' },
  { family: 'DM Sans',            fileName: 'DMSans-Regular.ttf',             styleClass: 'sans' },
  { family: 'Space Grotesk',      fileName: 'SpaceGrotesk-Regular.ttf',       styleClass: 'sans' },
  { family: 'Archivo',            fileName: 'Archivo-Regular.ttf',            styleClass: 'sans' },
  { family: 'Barlow',             fileName: 'Barlow-Regular.ttf',             styleClass: 'sans' },
  { family: 'Rubik',              fileName: 'Rubik-Regular.ttf',              styleClass: 'sans' },
  { family: 'Karla',              fileName: 'Karla-Regular.ttf',              styleClass: 'sans' },
  { family: 'Josefin Sans',       fileName: 'JosefinSans-Regular.ttf',        styleClass: 'sans' },
  { family: 'Libre Baskerville',  fileName: 'LibreBaskerville-Regular.ttf',   styleClass: 'serif' },
  { family: 'Crimson Text',        fileName: 'CrimsonText-Regular.ttf',        styleClass: 'serif' },
  { family: 'Anton',              fileName: 'Anton-Regular.ttf',              styleClass: 'display' },
  { family: 'Fjalla One',         fileName: 'FjallaOne-Regular.ttf',          styleClass: 'display' },
] as const

export type BundledSocialFontFamily = (typeof BUNDLED_SOCIAL_FONTS)[number]['family']
