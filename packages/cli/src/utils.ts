/*
 * @Author: Cphayim
 * @Date: 2022-04-07 01:36:35
 * @Description:
 */
import gs from 'gradient-string'

const DEFAULT_COLORS: Parameters<typeof gs> = [
  { color: '#42d392', pos: 0 },
  { color: '#647eff', pos: 1 },
]

export function gradient(str: string, colors = DEFAULT_COLORS): string {
  return gs(colors)(str)
}
