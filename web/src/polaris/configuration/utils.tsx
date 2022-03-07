export const replaceTags = (tagKey, changeValue, tags, optionList, tagAttribute) => {
  //这里只选非input类型的
  const tagIndex = tags.findIndex(item => item.attr.key === tagKey && item.attr.type !== 'input')
  let tag = tags[tagIndex]
  if (tag) {
    if (!changeValue) {
      tags.splice(tagIndex, 1)
      return [...tags]
    }
    const option = optionList.find(item => item.key === changeValue)
    tag.values = [{ ...option }]
    return [...tags]
  } else {
    if (!changeValue) return
    const option = optionList.find(item => item.key === changeValue)
    tag = {
      attr: tagAttribute,
      values: [option],
    }
    return [...tags, tag]
  }
}
