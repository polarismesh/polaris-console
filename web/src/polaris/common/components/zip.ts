/**
 * 保存文件，纯客户端实现
 * 需要IE10+
 * @returns invalid 如果出错，则返回具体消息。否则返回undefined
 */
export function save(fileName: string, zipBlob: Blob) {
  const blob = new Blob([zipBlob], {
    type: 'application/zip',
  })
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, fileName)
  } else {
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.target = '_blank'
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
