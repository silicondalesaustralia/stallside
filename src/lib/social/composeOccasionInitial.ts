import {
  DEFAULT_POST_CATEGORY_ID,
  DEFAULT_POST_SUBTYPE_ID,
  getCategoryIdForSubtype,
  getPostSubtypeDefinition,
  isPostCategoryId,
  isPostSubtypeId,
  type PostCategoryId,
  type PostSubtypeId,
} from '@/lib/social/postTaxonomy'

export function composeOccasionFromBusinessPrefs(
  lastCategory: string | null | undefined,
  lastSubtype: string | null | undefined,
): { categoryId: PostCategoryId; subtypeId: PostSubtypeId } {
  if (lastSubtype && isPostSubtypeId(lastSubtype)) {
    const def = getPostSubtypeDefinition(lastSubtype)
    let categoryId = def.categoryId
    if (lastCategory && isPostCategoryId(lastCategory)) {
      if (getCategoryIdForSubtype(lastSubtype) === lastCategory) {
        categoryId = lastCategory
      }
    }
    return { categoryId, subtypeId: lastSubtype }
  }
  return {
    categoryId: DEFAULT_POST_CATEGORY_ID,
    subtypeId: DEFAULT_POST_SUBTYPE_ID,
  }
}
