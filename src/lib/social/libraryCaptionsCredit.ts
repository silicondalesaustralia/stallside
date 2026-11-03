/** One clip credit per Library captions transcription, refunded if the job fails. */
export const LIBRARY_CAPTIONS_CREDIT_COST = 1

export function libraryCaptionsCreditActionId(captionJobId: string): string {
  return `library-captions:${captionJobId}`
}
