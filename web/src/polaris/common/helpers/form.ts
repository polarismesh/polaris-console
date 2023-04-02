export function object2FormData(obj: Record<string, any>) {
  const formData = new FormData()

  Object.keys(obj).forEach(key => {
    formData.append(key, obj[key])
  })

  return formData
}
