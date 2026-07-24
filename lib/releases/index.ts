import { Release } from './types'
import { v0_5_0 } from './v0_5_0'
import { v0_5_7 } from './v0_5_7'
import { v0_6_0 } from './v0_6_0'
import { v0_6_6 } from './v0_6_6'
import { v0_7_0 } from './v0_7_0'
import { v0_7_2 } from './v0_7_2'
import { v0_7_7 } from './v0_7_7'
import { v0_8_3 } from './v0_8_3'
import { v0_8_9 } from './v0_8_9'
import { v0_9_3 } from './v0_9_3'
import { v0_9_5 } from './v0_9_5'

export * from './types'

// Register every release here. Order does not matter — the list is sorted by
// date (newest first) below.
const ALL_RELEASES: Release[] = [v0_5_0, v0_5_7, v0_6_0, v0_6_6, v0_7_0, v0_7_2, v0_7_7, v0_8_3, v0_8_9, v0_9_3, v0_9_5]

export const releases: Release[] = [...ALL_RELEASES].sort((a, b) =>
  b.date.localeCompare(a.date)
)
