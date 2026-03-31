import {
  layout,
  walkLineRanges,
  type PreparedTextWithSegments,
} from '@pretext'
import { PRETEXT_LINE_HEIGHT } from './fonts'

export type WrapMetrics = {
  lineCount: number
  height: number
  maxLineWidth: number
}

export function collectWrapMetrics(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number = PRETEXT_LINE_HEIGHT,
): WrapMetrics {
  let maxLineWidth = 0
  const lineCount = walkLineRanges(prepared, maxWidth, (line) => {
    if (line.width > maxLineWidth) maxLineWidth = line.width
  })
  return {
    lineCount,
    height: lineCount * lineHeight,
    maxLineWidth,
  }
}

export function findTightWrapMetrics(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number = PRETEXT_LINE_HEIGHT,
): WrapMetrics {
  const initial = collectWrapMetrics(prepared, maxWidth, lineHeight)
  let lo = 1
  let hi = Math.max(1, Math.ceil(maxWidth))

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const midLineCount = layout(prepared, mid, lineHeight).lineCount
    if (midLineCount <= initial.lineCount) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }

  return collectWrapMetrics(prepared, lo, lineHeight)
}
