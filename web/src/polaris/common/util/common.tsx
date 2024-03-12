import React from 'react'
import { ExternalLink, Text } from 'tea-component'
import router from './router'
import Cookies from 'js-cookie'

// 为node节点或master节点生成id
export function genIdForNode() {
  let d = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

//polyfill closest方法
export function getClosest(element: any, selector: string) {
  const matchesSelector =
    element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector
  if (matchesSelector) {
    while (element) {
      if (matchesSelector.call(element, selector)) {
        break
      }
      element = element.parentElement
    }
    return element
  }
  return null
}

export function isOwner() {
  const uin = getUin()
  const ownerUin = getOwnerUin()
  return uin && ownerUin && getUin() === getOwnerUin()
}

export function getUin() {
  return Cookies.get(LoginUserIdKey) || ''
}
export function getOwnerUin() {
  const ownerId = Cookies.get(LoginUserOwnerIdKey) || ''
  return ownerId
}
export function getLoginName() {
  return Cookies.get(LoginUserNameKey) || ''
}
export const diffAddRemoveArray = (originArray: string[] = [], currentArray: string[] = []) => {
  const addArray = [...currentArray],
    removeArray = []
  originArray.forEach(item => {
    const index = currentArray.indexOf(item)
    if (index < 0) {
      removeArray.push(item)
    } else {
      const spliceIndex = addArray.indexOf(item)
      addArray.splice(spliceIndex, 1)
    }
  })
  return { addArray, removeArray }
}
export const PolarisTokenKey = 'polaris_token'
export const LoginRoleKey = 'login-role'
export const LoginUserIdKey = 'polarisLoginUin'
export const LoginUserOwnerIdKey = 'polarisOwnerUin'
export const LoginUserNameKey = 'polarisLoginName'

export function checkIsUserLogin() {
  return !!window.localStorage.getItem(PolarisTokenKey)
}
export function userLogout() {
  // window.localStorage.setItem(PolarisTokenKey, '')
  // window.localStorage.setItem(LoginUserNameKey, '')
  // window.localStorage.setItem(LoginRoleKey, '')
  // window.localStorage.setItem(LoginUserIdKey, '')
  // window.localStorage.setItem(LoginUserOwnerIdKey, '')
  // router.navigate('/login')
}

export function formatDesc(desc) {
  if (desc) {
    const list = desc.split(/\n/)
    const showList = []
    list.forEach((item, index) => {
      showList.push(
        <span key={index} className='text-overflow' title={item}>
          {item}
        </span>,
      )
      showList.push(<br key={`br-${index}`} />)
    })
    showList.pop()
    return showList
  } else {
    return ''
  }
}

// 处理tip中的外链
export const handleInfo = info => {
  if (!info) return
  const showList = []

  const reg = /\[([^\]<>]+)\]\(([^ \)<>]+)( "[^\(\)\"]+")?\)/g //网页链接的正则表达式
  const links = []
  let result = null
  do {
    result = reg.exec(info)
    if (result) {
      const startIndex = info.indexOf(result[0])
      links.push({
        startIndex,
        endIndex: startIndex + result[0].length,
        content: (
          <ExternalLink key={`${result[1]}-${links.length}`} href={result[2]}>
            {result[1]}
          </ExternalLink>
        ),
      })
    }
  } while (result)
  if (!links?.length) {
    return formatDesc(info)
  }
  links.forEach((d, i) => {
    const before = info.slice(links[i - 1]?.endIndex || 0, d.startIndex)
    showList.push(<Text key={i}>{formatDesc(before)}</Text>)
    showList.push(d.content)
    if (i === links?.length - 1) {
      // 最后一个
      const after = info.slice(d.endIndex, info.length)
      showList.push(<Text key={`after-${i}`}>{formatDesc(after)}</Text>)
    }
  })
  return <Text>{showList}</Text>
}
