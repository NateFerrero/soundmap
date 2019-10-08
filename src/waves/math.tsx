export const wrap = (range: number, value: number) =>
  value >= 0 ? value % range : ((value % range) + range) % range

export const mapCircular = (
  [fromLow, fromHigh]: [number, number],
  value: number,
  [toLow, toHigh]: [number, number]
) =>
  value === fromHigh
    ? toHigh
    : scale(wrap(1, fraction([fromLow, fromHigh], value)), [toLow, toHigh])

export const mapRange = (
  [fromLow, fromHigh]: [number, number],
  value: number,
  [toLow, toHigh]: [number, number]
) =>
  value === fromHigh
    ? toHigh
    : scale(fraction([fromLow, fromHigh], value), [toLow, toHigh])

export const fraction = ([low, high]: [number, number], value: number) =>
  (value - low) / (high - low)

export const scale = (fraction: number, [toLow, toHigh]: [number, number]) =>
  Math.min(toHigh, Math.max(toLow, toLow + fraction * (toHigh - toLow)))
