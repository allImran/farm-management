import type { TONE_CLASSES } from '~/constants/ui'

/** Colour family for badges and icon tiles. */
export type Tone = keyof typeof TONE_CLASSES

/** One option of `BaseTabs`. */
export interface Tab<T extends string = string> {
  value: T
  label: string
}
