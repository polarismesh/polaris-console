/**
 * 对象深复制
 * @param a
 */
export function clone(a) {
  try {
    return JSON.parse(
      JSON.stringify(a, (key, value) => {
        if (typeof value === 'function') {
          return value.toString()
        }
        return value
      }),
    )
  } catch (e) {
    return a
  }
}
