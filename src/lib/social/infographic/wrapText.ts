/**
 * Word-wrap for SVG tspans (char-budget heuristic - no canvas measure).
 * Used by infographic layout spike + future hybrid compose.
 */

export function wrapTextToLines(
  text: string,
  maxCharsPerLine: number,
  maxLines: number,
): { lines: string[]; truncated: boolean } {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned || maxLines < 1 || maxCharsPerLine < 8) {
    return { lines: cleaned ? [cleaned.slice(0, maxCharsPerLine)] : [], truncated: false }
  }

  const words = cleaned.split(' ')
  const lines: string[] = []
  let current = ''
  let wordIndex = 0
  let truncated = false

  const flushCurrent = () => {
    if (current) {
      lines.push(current)
      current = ''
    }
  }

  while (wordIndex < words.length) {
    if (lines.length >= maxLines) {
      truncated = true
      break
    }

    const word = words[wordIndex]
    const candidate = current ? `${current} ${word}` : word

    if (candidate.length <= maxCharsPerLine) {
      current = candidate
      wordIndex += 1
      continue
    }

    if (current) {
      flushCurrent()
      if (lines.length >= maxLines) {
        truncated = true
        break
      }
      continue
    }

    if (word.length <= maxCharsPerLine) {
      current = word
      wordIndex += 1
    } else {
      lines.push(`${word.slice(0, maxCharsPerLine - 1)}…`)
      wordIndex += 1
      truncated = true
      if (lines.length >= maxLines) break
    }
  }

  if (!truncated && current && lines.length < maxLines) {
    lines.push(current)
    current = ''
  } else if (current) {
    truncated = true
    if (lines.length < maxLines) {
      const room = maxCharsPerLine - 1
      lines.push(`${current.slice(0, room)}…`)
    } else if (lines.length > 0) {
      const last = lines[lines.length - 1]
      if (!last.endsWith('…')) {
        lines[lines.length - 1] = `${last.slice(0, Math.max(1, maxCharsPerLine - 1))}…`
      }
    }
  }

  if (wordIndex < words.length) truncated = true

  return { lines, truncated }
}

/** Rough latin char width ≈ 0.52× fontSize at regular weight. */
export function charsPerLineForWidth(contentWidthPx: number, fontSize: number): number {
  const avgCharPx = Math.max(6, fontSize * 0.52)
  return Math.max(12, Math.floor(contentWidthPx / avgCharPx))
}
