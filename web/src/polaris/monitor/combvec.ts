export function combineVector<T>(vectorArray: Array<Array<T>>) {
  if (vectorArray.length === 0) return []
  if (vectorArray.length === 1) {
    return vectorArray[0].map(item => [item])
  }
  const needCombineArray = [...vectorArray[0]]
  let retArray = []
  vectorArray.splice(0, 1)
  const combineArray = combineVector(vectorArray)

  needCombineArray.forEach(value => {
    const tempArray = []
    combineArray.forEach(combination => {
      const cloneCombination = [...combination]
      cloneCombination.push(value)
      tempArray.push(cloneCombination)
    })
    retArray = retArray.concat(tempArray)
  })
  return retArray
}
